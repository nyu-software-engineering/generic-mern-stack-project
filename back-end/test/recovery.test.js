import { describe, it } from "mocha";
import { expect } from "chai";
import { createApp } from "../app.js";
import { mockData } from "./fixtures.js";
import { startTestServer } from "./helpers/server.js";

const confirmation = "If an account exists for this email, password reset instructions will be sent.";
const updated = "Password updated. Sign in with your new password.";
const badLink = "This reset link is invalid or has expired.";
const unavailable = "Password recovery is temporarily unavailable. Try again later.";
const origin = "http://127.0.0.1:5173";
const minute = 60_000;
const details = {
  fullName: "Recovery Student",
  email: "recovery@nyu.edu",
  password: "Original password",
};
const newPassword = "Replacement password";

async function withServer(test, options = {}) {
  const data = mockData();
  const messages = [];
  let time = Date.UTC(2026, 10, 21);
  const recovery = {
    deliver: async (message) => { messages.push(message); },
    now: () => time,
    publicOrigin: origin,
    ...options.recovery,
  };
  const app = createApp({
    store: options.store?.(data) ?? { load: async () => data },
    recovery,
  });
  const server = await startTestServer(app);

  async function api(path, body, headers = {}) {
    const response = await fetch(`${server.baseUrl}/api${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: { "content-type": "application/json", ...headers },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return {
      status: response.status,
      body: await response.json(),
      retryAfter: response.headers.get("retry-after"),
    };
  }

  const login = (account = details, password = account.password) =>
    api("/auth/login", { email: account.email, password });

  async function signup(account = details, verify = true) {
    const { status, body } = await api("/auth/signup", account);
    expect(status).to.equal(201);
    if (verify) {
      const result = await api("/auth/verify", { email: account.email, code: body.demoCode });
      expect(result.status).to.equal(200);
    }
    return body.user;
  }

  const forgot = (email = details.email, headers) => api("/auth/forgot-password", { email }, headers);
  const reset = (token, password = newPassword, headers) =>
    api("/auth/reset-password", { token, password }, headers);
  const advance = (duration) => { time += duration; };
  const idle = () => app.locals.recovery.idle();

  try {
    await test({ app, data, messages, api, login, signup, forgot, reset, advance, idle });
  } finally {
    await server.close();
  }
}

function tokenOf(message) {
  expect(message?.kind).to.equal("password-reset");
  expect(URL.canParse(message.resetUrl)).to.equal(true);
  const url = new URL(message.resetUrl);
  expect(url.origin === origin).to.equal(true);
  expect(url.pathname === "/reset-password").to.equal(true);
  expect(url.search === "").to.equal(true);
  expect(/^#token=[a-f0-9]{64}$/.test(url.hash)).to.equal(true);
  return url.hash.slice("#token=".length);
}

function expectResponse(result, status, body) {
  expect(result.status).to.equal(status);
  expect(JSON.stringify(result.body) === JSON.stringify(body)).to.equal(true);
}

function deliveryGate() {
  let settle;
  let capture;
  const result = new Promise((resolve) => { settle = resolve; });
  const received = new Promise((resolve) => { capture = resolve; });
  return {
    received,
    complete: () => settle(true),
    fail: () => settle(false),
    async deliver(message) {
      capture(message);
      if (!(await result)) throw new Error(message.resetUrl);
    },
  };
}

describe("Password recovery API (#139)", () => {
  it("changes the existing password with a privately captured link", () => withServer(
    async ({ messages, login, signup, forgot, reset, idle }) => {
      const user = await signup();
      expectResponse(await forgot(" RECOVERY@NYU.EDU "), 202, { message: confirmation });
      await idle();

      expect(messages.length).to.equal(1);
      expect(messages[0].to).to.equal(details.email);
      expect(messages[0].expiresAt).to.equal(Date.UTC(2026, 10, 21) + 15 * minute);
      const token = tokenOf(messages[0]);
      expectResponse(await reset(token), 200, { message: updated });
      expect((await login()).status).to.equal(401);
      const signedIn = await login(details, newPassword);
      expect(signedIn.status).to.equal(200);
      expect(signedIn.body.user.id).to.equal(user.id);
    },
  ));

  it("keeps confirmation generic and protects both accounts' privacy", () => withServer(
    async ({ app, api, data, messages, signup, login, forgot, reset, idle }) => {
      const another = { ...details, email: "other@nyu.edu" };
      const user = await signup();
      await signup(another);
      const firstToken = (await login()).body.token;
      const secondToken = (await login()).body.token;
      const otherToken = (await login(another)).body.token;
      const stale = { authorization: "Bearer stale", "x-forwarded-host": "elsewhere.test" };

      expectResponse(await forgot(details.email, stale), 202, { message: confirmation });
      expectResponse(await forgot("unknown@nyu.edu", stale), 202, { message: confirmation });
      expectResponse(await forgot(), 202, { message: confirmation });
      expect((await api("/auth/forgot-password", undefined, stale)).status).to.equal(401);
      expect((await api("/auth/recovery/idle", {})).status).to.equal(404);
      await idle();
      expect(messages.length).to.equal(1);
      const token = tokenOf(messages[0]);
      expectResponse(await reset(token, newPassword, stale), 200, { message: updated });
      await idle();
      expect(JSON.stringify(messages[1]) === JSON.stringify({
        kind: "password-changed", to: details.email,
      })).to.equal(true);
      expectResponse(await reset(token), 400, { error: badLink });

      for (const revoked of [firstToken, secondToken]) {
        expect((await api("/users/me", undefined, { authorization: `Bearer ${revoked}` })).status)
          .to.equal(401);
      }
      expect((await api("/users/me", undefined, { authorization: `Bearer ${otherToken}` })).status)
        .to.equal(200);
      expect(app.locals.auth.sessions.size).to.equal(1);
      expect(data.users.some((entry) => entry.id === user.id)).to.equal(true);
      const publicData = await api("/mock-data");
      for (const record of [data, publicData.body]) {
        expect(JSON.stringify(record).includes(token)).to.equal(false);
        expect(JSON.stringify(record).includes(newPassword)).to.equal(false);
      }
    },
  ));

  it("preserves unverified accounts and the original verification code", () => withServer(
    async ({ app, api, messages, signup, login, forgot, reset, idle }) => {
      const user = await signup(details, false);
      const previous = app.locals.auth.credentials.get(details.email);
      await forgot();
      await idle();
      expectResponse(await reset(tokenOf(messages[0])), 200, { message: updated });
      const current = app.locals.auth.credentials.get(details.email);
      expect(current.salt !== previous.salt).to.equal(true);
      expect(current.code === previous.code).to.equal(true);
      expect((await login()).status).to.equal(401);
      expect((await login(details, newPassword)).status).to.equal(403);
      const verified = await api("/auth/verify", { email: details.email, code: previous.code });
      expect(verified.status).to.equal(200);
      expect(verified.body.user.id).to.equal(user.id);
    },
  ));

  it("checks password length without consuming the link and claims the link once", () => withServer(
    async ({ api, messages, signup, forgot, reset, idle }) => {
      await signup();
      await forgot();
      await idle();
      const token = tokenOf(messages[0]);
      for (const password of [undefined, 12345678, "1234567", "x".repeat(129)]) {
        expectResponse(await api("/auth/reset-password", { token, password }), 400, {
          error: "Enter a password between 8 and 128 characters.",
        });
      }
      const results = await Promise.all([reset(token, "12345678"), reset(token, "x".repeat(128))]);
      expect(results.map((result) => result.status).sort()).to.deep.equal([200, 400]);
      expectResponse(results.find((result) => result.status === 400), 400, { error: badLink });
      await idle();
      expect(messages.filter(({ kind }) => kind === "password-changed").length).to.equal(1);
    },
  ));

  it("expires links at 15 minutes from request admission", () => withServer(
    async ({ messages, signup, forgot, reset, advance, idle }) => {
      await signup();
      await forgot();
      await idle();
      advance(15 * minute);
      expectResponse(await reset(tokenOf(messages[0])), 400, { error: badLink });
    },
  ));

  for (const newerCompletesFirst of [false, true]) {
    it(`keeps the newest link when the ${newerCompletesFirst ? "newer" : "older"} delivery finishes first`, async () => {
      const first = deliveryGate();
      const second = deliveryGate();
      const gates = [first, second];
      const deliver = async (message) => {
        if (message.kind === "password-reset") await gates.shift().deliver(message);
      };

      await withServer(async ({ signup, forgot, reset, advance, idle }) => {
        await signup();
        expectResponse(await forgot(), 202, { message: confirmation });
        const older = tokenOf(await first.received);
        advance(minute);
        expectResponse(await forgot(), 202, { message: confirmation });
        const newer = tokenOf(await second.received);

        const [early, late] = newerCompletesFirst ? [second, first] : [first, second];
        early.complete();
        expectResponse(await reset(older), 400, { error: badLink });
        late.complete();
        await idle();
        expectResponse(await reset(older), 400, { error: badLink });
        expectResponse(await reset(newer), 200, { message: updated });
      }, { recovery: { deliver } });
    });
  }

  it("keeps the last active link when the latest delivery fails", async () => {
    const first = deliveryGate();
    const second = deliveryGate();
    const messages = [];
    const deliver = async (message) => {
      if (message.kind === "password-changed") throw new Error(newPassword);
      messages.push(message);
      if (messages.length === 2) await first.deliver(message);
      else if (messages.length === 3) await second.deliver(message);
    };

    const warnings = [];
    const warn = console.warn;
    console.warn = (...args) => { warnings.push(args); };
    try {
      await withServer(async ({ signup, login, forgot, reset, advance, idle }) => {
        await signup();
        await forgot();
        await idle();
        const active = tokenOf(messages[0]);
        advance(minute);
        await forgot();
        const olderPending = tokenOf(await first.received);
        advance(minute);
        await forgot();
        const newest = tokenOf(await second.received);
        second.fail();
        first.complete();
        await idle();
        expectResponse(await reset(olderPending), 400, { error: badLink });
        expectResponse(await reset(newest), 400, { error: badLink });
        expectResponse(await reset(active), 200, { message: updated });
        await idle();
        expect((await login(details, newPassword)).status).to.equal(200);
      }, { recovery: { deliver } });
    } finally {
      console.warn = warn;
    }
    expect(JSON.stringify(warnings) === JSON.stringify([
      ["Password reset delivery failed."], ["Password change notice failed."],
    ])).to.equal(true);
  });

  it("fences a pending delivery across a reset and a subsequent recovery request", async () => {
    const pending = deliveryGate();
    const messages = [];
    const deliver = async (message) => {
      messages.push(message);
      if (messages.length === 2) await pending.deliver(message);
    };

    await withServer(async ({ signup, forgot, reset, advance, idle }) => {
      await signup();
      await forgot();
      await idle();
      const active = tokenOf(messages[0]);
      advance(minute);
      await forgot();
      const superseded = tokenOf(await pending.received);
      expectResponse(await reset(active), 200, { message: updated });
      advance(minute);
      await forgot();
      pending.complete();
      await idle();
      expectResponse(await reset(superseded), 400, { error: badLink });
      expectResponse(await reset(tokenOf(messages[3])), 200, { message: updated });
    }, { recovery: { deliver } });
  });

  it("does not activate a link that expires while delivery is pending", async () => {
    const pending = deliveryGate();
    await withServer(async ({ signup, forgot, reset, advance, idle }) => {
      await signup();
      await forgot();
      const token = tokenOf(await pending.received);
      advance(15 * minute);
      pending.complete();
      await idle();
      expectResponse(await reset(token), 400, { error: badLink });
    }, { recovery: { deliver: pending.deliver } });
  });

  it("does not issue a pending link to a replacement account identity", async () => {
    const pending = deliveryGate();
    await withServer(async ({ data, signup, forgot, reset, idle }) => {
      const original = await signup();
      expectResponse(await forgot(), 202, { message: confirmation });
      const token = tokenOf(await pending.received);
      data.users.find((user) => user.id === original.id).id = "account-replacement";
      pending.complete();
      await idle();
      expectResponse(await reset(token), 400, { error: badLink });
    }, { recovery: { deliver: pending.deliver } });
  });

  it("rechecks token ownership after the reset's store load completes", async () => {
    const pending = deliveryGate();
    const messages = [];
    let holdNextLoad;
    const store = (data) => ({
      async load() {
        const hold = holdNextLoad;
        holdNextLoad = undefined;
        if (hold) await hold();
        return data;
      },
    });
    const deliver = async (message) => {
      messages.push(message);
      if (messages.length === 2) await pending.deliver(message);
    };

    await withServer(async ({ signup, forgot, reset, advance, idle }) => {
      await signup();
      await forgot();
      await idle();
      const older = tokenOf(messages[0]);
      advance(minute);
      await forgot();
      const newer = tokenOf(await pending.received);

      let release;
      const loadStarted = new Promise((start) => {
        holdNextLoad = () => new Promise((resolve) => {
          release = resolve;
          start();
        });
      });
      const resetting = reset(older);
      await loadStarted;
      pending.complete();
      await idle();
      release();
      expectResponse(await resetting, 400, { error: badLink });
      expectResponse(await reset(newer), 200, { message: updated });
      await idle();
    }, { recovery: { deliver }, store });
  });

  it("enforces address spacing and the five-attempt rolling window", () => withServer(
    async ({ messages, signup, forgot, advance, idle }) => {
      await signup();
      await forgot();
      advance(minute - 1);
      expectResponse(await forgot("RECOVERY@NYU.EDU"), 202, { message: confirmation });
      await idle();
      expect(messages.length).to.equal(1);
      advance(1);
      for (let index = 0; index < 4; index += 1) {
        await forgot();
        advance(minute);
      }
      expectResponse(await forgot(), 202, { message: confirmation });
      advance(55 * minute - 1);
      expectResponse(await forgot(), 202, { message: confirmation });
      await idle();
      expect(messages.length).to.equal(5);
      advance(1);
      await forgot();
      await idle();
      expect(messages.length).to.equal(6);
    },
  ));

  it("counts unknown and suppressed requests by direct connection IP", () => withServer(
    async ({ messages, forgot, advance, idle }) => {
      const forwarded = (index) => ({ "x-forwarded-for": `192.0.2.${index}` });
      expect((await forgot("invalid@testing.org")).status).to.equal(400);
      expect((await forgot(null)).status).to.equal(400);
      for (let index = 1; index <= 20; index += 1) {
        expectResponse(await forgot("unknown@nyu.edu", forwarded(index)), 202, { message: confirmation });
      }
      advance(60 * minute - 1);
      const limited = await forgot("different@nyu.edu", forwarded(21));
      expect(limited.status).to.equal(429);
      expect(limited.retryAfter).to.equal("1");
      advance(1);
      expectResponse(await forgot("different@nyu.edu"), 202, { message: confirmation });
      await idle();
      expect(messages.length).to.equal(0);
    },
  ));

  it("counts malformed reset payloads before accepting more attempts from one IP", () => withServer(
    async ({ api, reset, advance }) => {
      for (let index = 0; index < 10; index += 1) {
        expectResponse(await api("/auth/reset-password", {}), 400, { error: badLink });
      }
      const limited = await reset("bad", newPassword, { "x-forwarded-for": "192.0.2.10" });
      expect(limited.status).to.equal(429);
      expect(limited.retryAfter).to.equal("900");
      advance(15 * minute);
      expectResponse(await reset("bad"), 400, { error: badLink });
    },
  ));

  it("limits the same token digest across IPs and keeps an active token intact", () => withServer(
    async ({ app, messages, signup, forgot, advance, idle }) => {
      await signup();
      await forgot();
      await idle();
      const token = tokenOf(messages[0]);
      const recovery = app.locals.recovery;
      for (let index = 1; index <= 10; index += 1) {
        await expectFailure(
          recovery.resetPassword({ token, password: "weak", ip: `192.0.2.${index}` }), 400,
        );
      }
      const limited = await expectFailure(
        recovery.resetPassword({ token: token.toUpperCase(), password: newPassword, ip: "192.0.2.11" }), 429,
      );
      expect(limited.retryAfter).to.equal(840);
      // Move past the shorter test limiter window while the link is still valid.
      advance(14 * minute);
      const result = await recovery.resetPassword({ token, password: newPassword, ip: "192.0.2.11" });
      expect(result).to.deep.equal({ message: updated });
    }, { recovery: { policy: { resetWindowMs: 14 * minute } } },
  ));

  it("fails closed at limiter capacity and reuses an expired entry's space", () => withServer(
    async ({ app, signup, advance, idle }) => {
      await signup();
      const { requestReset, resetPassword } = app.locals.recovery;
      await requestReset({ email: "unknown@nyu.edu", ip: "192.0.2.1" });
      const full = await expectFailure(requestReset({ email: details.email, ip: "192.0.2.1" }), 503);
      expect(full.message).to.equal(unavailable);
      await expectFailure(requestReset({ email: "unknown@nyu.edu", ip: "192.0.2.2" }), 503);
      expect(await requestReset({ email: "UNKNOWN@NYU.EDU", ip: "192.0.2.1" }))
        .to.deep.equal({ message: confirmation });
      await idle();
      advance(60 * minute);
      expect(await requestReset({ email: details.email, ip: "192.0.2.2" }))
        .to.deep.equal({ message: confirmation });

      const attempt = { token: "a".repeat(64), password: newPassword, ip: "192.0.2.1" };
      await expectFailure(resetPassword(attempt), 400);
      await expectFailure(resetPassword({ ...attempt, token: "b".repeat(64) }), 503);
      await expectFailure(resetPassword({ ...attempt, ip: "192.0.2.2" }), 503);
      advance(15 * minute);
      await expectFailure(resetPassword({ ...attempt, token: "b".repeat(64), ip: "192.0.2.2" }), 400);
      await idle();
    }, { recovery: { policy: { metadataCapacity: 1 } } },
  ));

  it("rejects both known and unknown addresses while the delivery pool is full", async () => {
    const pending = deliveryGate();
    await withServer(async ({ signup, forgot, reset, advance, idle }) => {
      await signup();
      await forgot();
      const token = tokenOf(await pending.received);
      advance(minute);
      expectResponse(await forgot(), 503, { error: unavailable });
      expectResponse(await forgot("unknown@nyu.edu"), 503, { error: unavailable });
      expectResponse(await reset(token), 503, { error: unavailable });
      pending.complete();
      await idle();
      expectResponse(await reset(token), 200, { message: updated });
      await idle();
    }, { recovery: { deliver: pending.deliver, policy: { deliveryCapacity: 1 } } });
  });

  it("keeps accounts working without valid recovery configuration", () => withServer(
    async ({ signup, login, forgot, reset }) => {
      await signup();
      expect((await login()).status).to.equal(200);
      expectResponse(await forgot(), 503, { error: unavailable });
      expectResponse(await forgot("unknown@nyu.edu"), 503, { error: unavailable });
      expectResponse(await reset("a".repeat(64)), 503, { error: unavailable });
    }, { recovery: { publicOrigin: undefined } },
  ));
});

async function expectFailure(attempt, status) {
  let failure;
  try {
    await attempt;
  } catch (error) {
    failure = error;
  }
  expect(failure?.status).to.equal(status);
  return failure;
}
