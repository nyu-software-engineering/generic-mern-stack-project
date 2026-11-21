import { createHash, randomBytes, scryptSync } from "node:crypto";
import { setImmediate } from "node:timers/promises";

const minute = 60_000;
const hour = 60 * minute;
const lifetime = 15 * minute;
const confirmation = "If an account exists for this email, password reset instructions will be sent.";
const updated = "Password updated. Sign in with your new password.";

export class RecoveryError extends Error {
  constructor(status, message, retryAfter) {
    super(message);
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

const unavailable = () => new RecoveryError(503, "Password recovery is temporarily unavailable. Try again later.");
const invalidLink = () => new RecoveryError(400, "This reset link is invalid or has expired.");
const emailOf = (value) => typeof value === "string" ? value.trim().toLowerCase() : "";
const digestOf = (value) => createHash("sha256").update(value).digest("hex");

function trustedOrigin(value) {
  if (typeof value !== "string" || !URL.canParse(value)) return undefined;
  const url = new URL(value);
  if (url.origin !== value) return undefined;
  const loopback = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (url.protocol === "https:" || (url.protocol === "http:" && loopback)) return value;
}

function rollingAttempts({ limit, windowMs, capacity, spacingMs = 0, onExpire }) {
  const entries = new Map();

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

export function createRecovery({ auth, store, deliver, now = Date.now, publicOrigin, policy = {} }) {
  const {
    metadataCapacity = 10_000,
    deliveryCapacity = 20,
    resetWindowMs = 15 * minute,
  } = policy;
  const origin = trustedOrigin(publicOrigin);
  const activeTokens = new Map();
  const jobs = new Set();
  let lastTime = -Infinity;

  function clock() {
    lastTime = Math.max(lastTime, now());
    return lastTime;
  }

  function clearActive(entry) {
    if (!entry.active) return;
    activeTokens.delete(entry.active.digest);
    entry.active = undefined;
  }

  const requestIPs = rollingAttempts({ limit: 20, windowMs: hour, capacity: metadataCapacity });
  const requestAddresses = rollingAttempts({
    limit: 5, windowMs: hour, capacity: metadataCapacity, spacingMs: minute, onExpire: clearActive,
  });
  const resetLimits = { limit: 10, windowMs: resetWindowMs, capacity: metadataCapacity };
  const resetIPs = rollingAttempts(resetLimits);
  const resetTokens = rollingAttempts(resetLimits);

  function ensureAvailable() {
    if (!origin || typeof deliver !== "function" || jobs.size >= deliveryCapacity) throw unavailable();
  }

  function schedule(work, failureCategory) {
    const job = setImmediate()
      .then(work)
      .catch(() => { console.warn(failureCategory); })
      .finally(() => { jobs.delete(job); });
    jobs.add(job);
  }

  async function requestReset({ email: input, ip }) {
    const email = emailOf(input);
    if (!/^[^\s@]+@nyu\.edu$/.test(email)) throw new RecoveryError(400, "Enter a valid NYU email.");

    const time = clock();
    enforceLimit(requestIPs(ip, time));
    ensureAvailable();

    const { entry } = requestAddresses(digestOf(email), time);
    if (!entry) return { message: confirmation };

    // Reserve the revision before lookup so store and provider completion order
    // cannot make an older request appear newer.
    const requestRevision = Symbol();
    entry.requestRevision = requestRevision;
    entry.passwordRevision ??= Symbol();
    const { passwordRevision } = entry;
    const expiresAt = time + lifetime;

    schedule(async () => {
      const { users } = await store.load();
      const credentials = auth.credentials.get(email);
      const user = users.find((item) => emailOf(item.email) === email);
      if (!credentials || !user || entry.passwordRevision !== passwordRevision || clock() >= expiresAt) return;

      const { id: userId, email: to } = user;
      const token = randomBytes(32).toString("hex");
      const digest = digestOf(token);
      await deliver({
        kind: "password-reset", to, resetUrl: `${origin}/reset-password#token=${token}`, expiresAt,
      });

      if (entry.requestRevision !== requestRevision || entry.passwordRevision !== passwordRevision ||
          auth.credentials.get(email) !== credentials || user.id !== userId || user.email !== to ||
          clock() >= expiresAt) return;

      clearActive(entry);
      const active = { digest, email, userId, credentials, expiresAt, passwordRevision, entry };
      activeTokens.set(digest, active);
      entry.active = active;
    }, "Password reset delivery failed.");

    return { message: confirmation };
  }

  async function resetPassword({ token, password, ip }) {
    const time = clock();
    enforceLimit(resetIPs(ip, time));
    const digest = typeof token === "string" && /^[a-f0-9]{64}$/i.test(token)
      ? digestOf(token.toLowerCase()) : undefined;
    if (digest) enforceLimit(resetTokens(digest, time));
    ensureAvailable();

    const active = activeTokens.get(digest);
    if (!active) throw invalidLink();
    const { entry, email, userId, credentials, expiresAt, passwordRevision } = active;
    if (time >= expiresAt) {
      clearActive(entry);
      throw invalidLink();
    }
    if (typeof password !== "string" || password.length < 8 || password.length > 128) {
      throw new RecoveryError(400, "Enter a password between 8 and 128 characters.");
    }

    const { users } = await store.load();
    ensureAvailable();
    const user = users.find((item) => item.id === userId && emailOf(item.email) === email);
    if (!user || activeTokens.get(digest) !== active || entry.passwordRevision !== passwordRevision ||
        auth.credentials.get(email) !== credentials || clock() >= expiresAt) throw invalidLink();

    const to = user.email;
    const salt = randomBytes(16).toString("hex");
    const hash = scryptSync(password, salt, 32);
    if (clock() >= expiresAt) throw invalidLink();

    // Change the credential, claim the link and fence pending requests together.
    clearActive(entry);
    entry.passwordRevision = Symbol();
    entry.requestRevision = undefined;
    auth.credentials.set(email, { ...credentials, salt, hash });
    for (const [session, ownerId] of auth.sessions) {
      if (ownerId === userId) auth.sessions.delete(session);
    }
    schedule(() => deliver({ kind: "password-changed", to }), "Password change notice failed.");
    return { message: updated };
  }

  async function idle() {
    while (jobs.size) await Promise.all(jobs);
  }

  return { requestReset, resetPassword, idle };
}
