import { createHash, createHmac, randomBytes, randomInt, scryptSync, timingSafeEqual } from "node:crypto";
import { setImmediate } from "node:timers/promises";

const minute = 60_000;
const hour = 60 * minute;
const codeLifetime = 15 * minute;
const grantLifetime = 5 * minute;
const admissionLifetime = 25_000;
const confirmation = "If an account exists for this email, password reset instructions will be sent.";
const updated = "Password updated. Sign in with your new password.";
const codeKey = randomBytes(32);
const emptyDigest = Buffer.alloc(32);

export class RecoveryError extends Error {
  constructor(status, message, retryAfter) {
    super(message);
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

const unavailable = () => new RecoveryError(503, "Password recovery is temporarily unavailable. Try again later.");
const invalidCode = () => new RecoveryError(400, "This recovery code is invalid or has expired.");
const invalidGrant = () => new RecoveryError(400, "This password reset permission is invalid or has expired.");
const emailOf = (value) => typeof value === "string" ? value.trim().toLowerCase() : "";
const validEmail = (email) => /^[^\s@]+@nyu\.edu$/.test(email);
const digestOf = (value) => createHash("sha256").update(value).digest("hex");
const codeDigestOf = (email, code) => createHmac("sha256", codeKey).update(email).update("\0").update(code).digest();

function issueCode(entry, email, requestedAt, time) {
  // Skip repeats so a superseded message cannot prove a newer request.
  const recent = (entry.recentCodes ?? []).filter((item) => item.requestedAt > time - hour);
  let code;
  let digest;
  do {
    code = randomInt(100_000_000).toString().padStart(8, "0");
    digest = codeDigestOf(email, code);
  } while (recent.some((item) => item.digest.equals(digest)));
  recent.push({ digest, requestedAt });
  entry.recentCodes = recent;
  return { code, digest };
}

function rollingAttempts({ limit, windowMs, capacity, spacingMs = 0, entries = new Map(), onExpire }) {
  return (key, time) => {
    const threshold = time - windowMs;
    // Accepted attempts move their entries to the end, keeping expiry in order.
    for (const [oldKey, entry] of entries) {
      if (entry.times.at(-1) > threshold) break;
      entries.delete(oldKey);
      onExpire?.(entry);
    }

    const existing = entries.get(key);
    if (!existing && entries.size >= capacity) throw unavailable();

    const entry = existing ?? { times: [] };
    const times = entry.times.filter((previous) => previous > threshold);
    const spacingEnds = (times.at(-1) ?? -Infinity) + spacingMs;
    const windowEnds = times.length >= limit ? times[0] + windowMs : -Infinity;
    const retryAt = Math.max(spacingEnds, windowEnds);
    if (retryAt > time) return { retryAfter: Math.ceil((retryAt - time) / 1000) };

    times.push(time);
    entry.times = times;
    entries.delete(key);
    entries.set(key, entry);
    return { entry };
  };
}

function enforceLimit({ retryAfter }) {
  if (retryAfter) throw new RecoveryError(429, "Too many attempts. Try again later.", retryAfter);
}

export function createRecovery({ auth, store, deliver, now = Date.now, policy = {} }) {
  const {
    metadataCapacity = 10_000,
    deliveryCapacity = 20,
    resetWindowMs = 15 * minute,
  } = policy;
  const addresses = new Map();
  const grants = new Map();
  const jobs = new Set();
  const admissions = [];
  let lastTime = -Infinity;

  function clock() {
    lastTime = Math.max(lastTime, now());
    return lastTime;
  }

  function clearActive(entry) {
    if (entry.active?.kind === "grant") grants.delete(entry.active.digest);
    entry.active = undefined;
  }

  function activeFor(entry, kind, time) {
    const active = entry?.active;
    if (!active) return undefined;
    if (time >= active.expiresAt) {
      clearActive(entry);
      return undefined;
    }
    if (active.kind === kind) return active;
  }

  function accountFor(users, entry, active, time) {
    const { email, userId, credentials, passwordRevision, expiresAt } = active;
    if (entry.active !== active || entry.passwordRevision !== passwordRevision ||
        auth.credentials.get(email) !== credentials || time >= expiresAt) return undefined;
    return users.find((user) => user.id === userId && emailOf(user.email) === email);
  }

  const requestIPs = rollingAttempts({ limit: 20, windowMs: hour, capacity: metadataCapacity });
  const requestAddresses = rollingAttempts({
    limit: 5, windowMs: hour, capacity: metadataCapacity, spacingMs: minute, entries: addresses, onExpire: clearActive,
  });
  const verificationAndResetIPs = rollingAttempts({ limit: 10, windowMs: resetWindowMs, capacity: metadataCapacity });

  function ensureConfigured() {
    if (typeof deliver !== "function") throw unavailable();
  }

  function hasAdmissionCapacity(time) {
    while (admissions.length && admissions[0] <= time) admissions.shift();
    return admissions.length < deliveryCapacity;
  }

  function reserveAdmission(time) {
    // The public slot lasts through the normal store and provider deadlines.
    // Releasing it when work finishes would expose account and delivery status.
    admissions.push(time + admissionLifetime);
  }

  function schedule(work, failureCategory) {
    if (jobs.size >= deliveryCapacity) {
      console.warn(failureCategory);
      return;
    }
    const job = setImmediate()
      .then(work)
      .catch(() => { console.warn(failureCategory); })
      .finally(() => { jobs.delete(job); });
    jobs.add(job);
  }

  async function requestReset({ email: input, ip }) {
    const email = emailOf(input);
    if (!validEmail(email)) throw new RecoveryError(400, "Enter a valid NYU email.");

    const time = clock();
    enforceLimit(requestIPs(ip, time));
    ensureConfigured();
    if (!hasAdmissionCapacity(time)) throw unavailable();

    const { entry } = requestAddresses(digestOf(email), time);
    if (!entry) return { message: confirmation };
    reserveAdmission(time);

    // Reserve the revision before lookup so store and provider completion order
    // cannot make an older request appear newer.
    const requestRevision = Symbol();
    entry.requestRevision = requestRevision;
    entry.passwordRevision ??= Symbol();
    const { passwordRevision } = entry;
    const expiresAt = time + codeLifetime;

    schedule(async () => {
      const { users } = await store.load();
      const credentials = auth.credentials.get(email);
      const user = users.find((item) => emailOf(item.email) === email);
      const startedAt = clock();
      if (!credentials || !user || entry.requestRevision !== requestRevision ||
          entry.passwordRevision !== passwordRevision || startedAt >= expiresAt) return;

      const { id: userId, email: to } = user;
      const { code, digest } = issueCode(entry, email, time, startedAt);
      await deliver({ kind: "password-reset", to, code, expiresAt });

      if (entry.requestRevision !== requestRevision || entry.passwordRevision !== passwordRevision ||
          auth.credentials.get(email) !== credentials || user.id !== userId || user.email !== to ||
          clock() >= expiresAt) return;

      clearActive(entry);
      entry.active = { kind: "code", digest, email, userId, credentials, expiresAt, passwordRevision, wrong: 0 };
    }, "Password reset delivery failed.");

    return { message: confirmation };
  }

  async function verifyCode({ email: input, code, ip }) {
    const time = clock();
    enforceLimit(verificationAndResetIPs(ip, time));
    ensureConfigured();

    const email = emailOf(input);
    if (!validEmail(email)) throw invalidCode();

    const entry = addresses.get(digestOf(email));
    const active = activeFor(entry, "code", time);
    const wellFormed = typeof code === "string" && /^[0-9]{8}$/.test(code);
    const matches = wellFormed && timingSafeEqual(codeDigestOf(email, code), active?.digest ?? emptyDigest);
    if (!active) throw invalidCode();
    if (!matches) {
      active.wrong += 1;
      if (active.wrong >= 5) clearActive(entry);
      throw invalidCode();
    }

    const { users } = await store.load();
    const verifiedAt = clock();
    if (!accountFor(users, entry, active, verifiedAt)) throw invalidCode();

    const resetToken = randomBytes(32).toString("hex");
    const digest = digestOf(resetToken);
    const { userId, credentials, passwordRevision } = active;
    // Replace the code and fence deliveries that were pending at proof time.
    entry.requestRevision = undefined;
    entry.active = {
      kind: "grant", digest, email, userId, credentials, passwordRevision, expiresAt: verifiedAt + grantLifetime,
    };
    grants.set(digest, entry);
    return { resetToken, expiresIn: grantLifetime / 1000 };
  }

  async function resetPassword({ resetToken, password, ip }) {
    const time = clock();
    enforceLimit(verificationAndResetIPs(ip, time));
    ensureConfigured();

    if (typeof resetToken !== "string" || !/^[a-f0-9]{64}$/.test(resetToken)) throw invalidGrant();
    const entry = grants.get(digestOf(resetToken));
    const active = activeFor(entry, "grant", time);
    if (!active) throw invalidGrant();
    if (typeof password !== "string" || password.length < 8 || password.length > 128) {
      throw new RecoveryError(400, "Enter a password between 8 and 128 characters.");
    }

    const { users } = await store.load();
    const loadedAt = clock();
    const user = accountFor(users, entry, active, loadedAt);
    if (!user) throw invalidGrant();

    const { email, userId, credentials, expiresAt } = active;
    const to = user.email;
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(password, salt, 32);
    const resetAt = clock();
    if (resetAt >= expiresAt) throw invalidGrant();

    // Change the credential, consume the grant and fence pending requests together.
    clearActive(entry);
    entry.passwordRevision = Symbol();
    entry.requestRevision = undefined;
    auth.credentials.set(email, { ...credentials, salt, hash });
    for (const [session, ownerId] of auth.sessions) {
      if (ownerId === userId) auth.sessions.delete(session);
    }
    const noticeFailure = "Password change notice failed.";
    if (hasAdmissionCapacity(resetAt)) {
      reserveAdmission(resetAt);
      schedule(() => deliver({ kind: "password-changed", to }), noticeFailure);
    } else {
      console.warn(noticeFailure);
    }
    return { message: updated };
  }

  async function idle() {
    while (jobs.size) await Promise.all(jobs);
  }

  return { requestReset, verifyCode, resetPassword, idle };
}
