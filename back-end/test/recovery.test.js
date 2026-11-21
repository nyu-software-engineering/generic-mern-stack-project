import crypto from "node:crypto";
import { syncBuiltinESMExports } from "node:module";
import { describe, it } from "mocha";
import { expect } from "chai";
import { createApp } from "../app.js";
import { mockData } from "./fixtures.js";
import { startTestServer } from "./helpers/server.js";

const confirmation = "If an account exists for this email, password reset instructions will be sent.";
const updated = "Password updated. Sign in with your new password.";
const badCode = "This recovery code is invalid or has expired.";
const badGrant = "This password reset permission is invalid or has expired.";
const unavailable = "Password recovery is temporarily unavailable. Try again later.";
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
      cacheControl: response.headers.get("cache-control"),
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
  const verifyCode = (code, email = details.email, headers) =>
    api("/auth/verify-reset-code", { email, code }, headers);
  const reset = (resetToken, password = newPassword, headers) =>
    api("/auth/reset-password", { resetToken, password }, headers);
  const advance = (duration) => { time += duration; };
  const idle = () => app.locals.recovery.idle();

  try {
    await test({ app, data, messages, api, login, signup, forgot, verifyCode, reset, advance, idle });
  } finally {
    await server.close();
  }
}

function codeOf(message) {
  expect(message?.kind).to.equal("password-reset");
  expect(typeof message.code === "string" && /^[0-9]{8}$/.test(message.code)).to.equal(true);
  expect(Object.keys(message).sort()).to.deep.equal(["code", "expiresAt", "kind", "to"]);
  return message.code;
}

function grantOf(result) {
  expect(result.status).to.equal(200);
  expect(Object.keys(result.body).sort()).to.deep.equal(["expiresIn", "resetToken"]);
  expect(result.body.expiresIn).to.equal(300);
  expect(/^[a-f0-9]{64}$/.test(result.body.resetToken)).to.equal(true);
  expect(result.cacheControl).to.equal("no-store");
  return result.body.resetToken;
}

async function withRandomCodes(values, callback) {
  const randomInt = crypto.randomInt;
  crypto.randomInt = (maximum, ...args) =>
    maximum === 100_000_000 ? values.shift() : randomInt(maximum, ...args);
  syncBuiltinESMExports();
  try {
    await callback();
  } finally {
    crypto.randomInt = randomInt;
    syncBuiltinESMExports();
  }
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
      if (!(await result)) throw new Error(message.code);
    },
  };
}

describe("Password recovery API (#139)", () => {
  it("changes the existing password after privately captured code proof", () => withServer(
    async ({ messages, login, signup, forgot, verifyCode, reset, idle }) => {
      const user = await signup();
      expectResponse(await forgot(" RECOVERY@NYU.EDU "), 202, { message: confirmation });
      await idle();

      expect(messages.length).to.equal(1);
      expect(messages[0].to).to.equal(details.email);
      expect(messages[0].expiresAt).to.equal(Date.UTC(2026, 10, 21) + 15 * minute);
      const resetToken = grantOf(await verifyCode(codeOf(messages[0]), " RECOVERY@NYU.EDU "));
      expectResponse(await reset(resetToken), 200, { message: updated });
      expect((await login()).status).to.equal(401);
      const signedIn = await login(details, newPassword);
      expect(signedIn.status).to.equal(200);
      expect(signedIn.body.user.id).to.equal(user.id);
    },
  ));

  it("keeps confirmation generic and protects both accounts' privacy", () => withServer(
    async ({ app, api, data, messages, signup, login, forgot, verifyCode, reset, idle }) => {
      const another = { ...details, email: "other@nyu.edu" };
      const user = await signup();
      await signup(another);
      const firstToken = (await login()).body.token;
      const secondToken = (await login()).body.token;
      const otherToken = (await login(another)).body.token;
      const stale = { authorization: `Bearer ${"a".repeat(64)}` };

      expectResponse(await forgot(details.email, stale), 202, { message: confirmation });
      expectResponse(await forgot("unknown@nyu.edu", stale), 202, { message: confirmation });
      expectResponse(await forgot(), 202, { message: confirmation });
      expect((await api("/auth/forgot-password", undefined, stale)).status).to.equal(401);
      expect((await api("/auth/recovery/idle", {})).status).to.equal(404);
      await idle();
      expect(messages.length).to.equal(1);
      const code = codeOf(messages[0]);
      expectResponse(await verifyCode(code, "unknown@nyu.edu"), 400, { error: badCode });
      const resetToken = grantOf(await verifyCode(code, details.email, stale));
      expect((await api("/users/me", undefined, { authorization: `Bearer ${resetToken}` })).status)
        .to.equal(401);
      expectResponse(await reset(resetToken, newPassword, stale), 200, { message: updated });
      await idle();
      expect(JSON.stringify(messages[1]) === JSON.stringify({
        kind: "password-changed", to: details.email,
      })).to.equal(true);
      expectResponse(await reset(resetToken), 400, { error: badGrant });

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
        expect(JSON.stringify(record).includes(code)).to.equal(false);
        expect(JSON.stringify(record).includes(resetToken)).to.equal(false);
        expect(JSON.stringify(record).includes(newPassword)).to.equal(false);
      }
    },
  ));

  it("preserves unverified accounts and the original verification code", () => withServer(
    async ({ app, api, messages, signup, login, forgot, verifyCode, reset, idle }) => {
      const user = await signup(details, false);
      const previous = app.locals.auth.credentials.get(details.email);
      await forgot();
      await idle();
      const resetToken = grantOf(await verifyCode(codeOf(messages[0])));
      expectResponse(await reset(resetToken), 200, { message: updated });
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

  it("checks password length without consuming the grant and claims the grant once", () => withServer(
    async ({ api, messages, signup, forgot, verifyCode, reset, idle }) => {
      await signup();
      await forgot();
      await idle();
      const resetToken = grantOf(await verifyCode(codeOf(messages[0])));
      for (const password of [undefined, 12345678, "1234567", "x".repeat(129)]) {
        expectResponse(await api("/auth/reset-password", { resetToken, password }), 400, {
          error: "Enter a password between 8 and 128 characters.",
        });
      }
      const results = await Promise.all([reset(resetToken, "12345678"), reset(resetToken, "x".repeat(128))]);
      expect(results.map((result) => result.status).sort()).to.deep.equal([200, 400]);
      expectResponse(results.find((result) => result.status === 400), 400, { error: badGrant });
      await idle();
      expect(messages.filter(({ kind }) => kind === "password-changed").length).to.equal(1);
    },
  ));

  it("expires codes at 15 minutes from request admission", () => withServer(
    async ({ messages, signup, forgot, verifyCode, advance, idle }) => {
      await signup();
      await forgot();
      await idle();
      advance(15 * minute);
      expectResponse(await verifyCode(codeOf(messages[0])), 400, { error: badCode });
    },
  ));

  it("preserves leading zeroes and allows only one concurrent proof", () => withServer(
    async ({ app, messages, signup, forgot, verifyCode, idle }) => {
      await signup();
      await withRandomCodes([1234], async () => {
        expectResponse(await forgot(), 202, { message: confirmation });
        await idle();
      });

      expect(codeOf(messages[0]) === "00001234").to.equal(true);
      expectResponse(await verifyCode(1234), 400, { error: badCode });
      const results = await Promise.all([verifyCode("00001234"), verifyCode("00001234")]);
      expect(results.map((result) => result.status).sort()).to.deep.equal([200, 400]);
      grantOf(results.find((result) => result.status === 200));
      expectResponse(results.find((result) => result.status === 400), 400, { error: badCode });
      expectResponse(await verifyCode("00001234"), 400, { error: badCode });
      expect(app.locals.auth.sessions.size).to.equal(0);
    },
  ));

  it("does not reissue a recently delivered code when the generator repeats it", () => withServer(
    async ({ messages, signup, forgot, verifyCode, advance, idle }) => {
      await signup();
      await withRandomCodes([1234, 1234, 5678], async () => {
        expectResponse(await forgot(), 202, { message: confirmation });
        await idle();
        advance(minute);
        expectResponse(await forgot(), 202, { message: confirmation });
        await idle();
      });
      const older = codeOf(messages[0]);
      const newer = codeOf(messages[1]);
      expect(older !== newer).to.equal(true);
      expectResponse(await verifyCode(older), 400, { error: badCode });
      grantOf(await verifyCode(newer));
    },
  ));

  it("expires a reset grant five minutes after proof near the code's expiry", () => withServer(
    async ({ messages, signup, forgot, verifyCode, reset, advance, idle }) => {
      await signup();
      expectResponse(await forgot(), 202, { message: confirmation });
      await idle();
      advance(15 * minute - 1);
      const resetToken = grantOf(await verifyCode(codeOf(messages[0])));
      advance(5 * minute - 1);
      expectResponse(await reset(resetToken, "weak"), 400, {
        error: "Enter a password between 8 and 128 characters.",
      });
      advance(1);
      expectResponse(await reset(resetToken), 400, { error: badGrant });
    },
  ));

  for (const newerCompletesFirst of [false, true]) {
    it(`keeps the newest code when the ${newerCompletesFirst ? "newer" : "older"} delivery finishes first`, async () => {
      const first = deliveryGate();
      const second = deliveryGate();
      const gates = [first, second];
      const deliver = async (message) => {
        if (message.kind === "password-reset") await gates.shift().deliver(message);
      };

      await withServer(async ({ signup, forgot, verifyCode, reset, advance, idle }) => {
        await signup();
        expectResponse(await forgot(), 202, { message: confirmation });
        const older = codeOf(await first.received);
        advance(minute);
        expectResponse(await forgot(), 202, { message: confirmation });
        const newer = codeOf(await second.received);

        const [early, late] = newerCompletesFirst ? [second, first] : [first, second];
        early.complete();
        expectResponse(await verifyCode(older), 400, { error: badCode });
        late.complete();
        await idle();
        expectResponse(await verifyCode(older), 400, { error: badCode });
        expectResponse(await reset(grantOf(await verifyCode(newer))), 200, { message: updated });
      }, { recovery: { deliver } });
    });
  }

  it("keeps the last active code when the latest delivery fails", async () => {
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
      await withServer(async ({ signup, login, forgot, verifyCode, reset, advance, idle }) => {
        await signup();
        await forgot();
        await idle();
        const active = codeOf(messages[0]);
        advance(minute);
        await forgot();
        const olderPending = codeOf(await first.received);
        advance(minute);
        await forgot();
        const newest = codeOf(await second.received);
        second.fail();
        first.complete();
        await idle();
        expectResponse(await verifyCode(olderPending), 400, { error: badCode });
        expectResponse(await verifyCode(newest), 400, { error: badCode });
        expectResponse(await reset(grantOf(await verifyCode(active))), 200, { message: updated });
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

    await withServer(async ({ signup, forgot, verifyCode, reset, advance, idle }) => {
      await signup();
      await forgot();
      await idle();
      const resetToken = grantOf(await verifyCode(codeOf(messages[0])));
      advance(minute);
      await forgot();
      const superseded = codeOf(await pending.received);
      expectResponse(await reset(resetToken), 200, { message: updated });
      advance(minute);
      await forgot();
      pending.complete();
      await idle();
      expectResponse(await verifyCode(superseded), 400, { error: badCode });
      expectResponse(await reset(grantOf(await verifyCode(codeOf(messages[3])))), 200, { message: updated });
    }, { recovery: { deliver } });
  });

  it("fences pending mail on code proof and keeps the new grant usable", async () => {
    const pending = deliveryGate();
    const messages = [];
    const deliver = async (message) => {
      messages.push(message);
      if (messages.length === 2) await pending.deliver(message);
    };

    await withServer(async ({ signup, forgot, verifyCode, reset, advance, idle }) => {
      await signup();
      expectResponse(await forgot(), 202, { message: confirmation });
      await idle();
      advance(minute);
      expectResponse(await forgot(), 202, { message: confirmation });
      const superseded = codeOf(await pending.received);
      const resetToken = grantOf(await verifyCode(codeOf(messages[0])));
      pending.complete();
      await idle();
      expectResponse(await verifyCode(superseded), 400, { error: badCode });
      expectResponse(await reset(resetToken), 200, { message: updated });
      await idle();
    }, { recovery: { deliver } });
  });

  it("does not activate a code that expires while delivery is pending", async () => {
    const pending = deliveryGate();
    await withServer(async ({ signup, forgot, verifyCode, advance, idle }) => {
      await signup();
      await forgot();
      const code = codeOf(await pending.received);
      advance(15 * minute);
      pending.complete();
      await idle();
      expectResponse(await verifyCode(code), 400, { error: badCode });
    }, { recovery: { deliver: pending.deliver } });
  });

  it("does not issue a pending code to a replacement account identity", async () => {
    const pending = deliveryGate();
    await withServer(async ({ data, signup, forgot, verifyCode, idle }) => {
      const original = await signup();
      expectResponse(await forgot(), 202, { message: confirmation });
      const code = codeOf(await pending.received);
      data.users.find((user) => user.id === original.id).id = "account-replacement";
      pending.complete();
      await idle();
      expectResponse(await verifyCode(code), 400, { error: badCode });
    }, { recovery: { deliver: pending.deliver } });
  });

  it("rechecks grant ownership after the reset's store load completes", async () => {
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

    await withServer(async ({ signup, forgot, verifyCode, reset, advance, idle }) => {
      await signup();
      await forgot();
      await idle();
      const older = grantOf(await verifyCode(codeOf(messages[0])));
      advance(minute);
      await forgot();
      const newer = codeOf(await pending.received);

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
      expectResponse(await resetting, 400, { error: badGrant });
      expectResponse(await reset(grantOf(await verifyCode(newer))), 200, { message: updated });
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

  it("shares one direct IP limit across malformed verification and reset payloads", () => withServer(
    async ({ api, reset, advance }) => {
      for (let index = 0; index < 5; index += 1) {
        expectResponse(await api("/auth/verify-reset-code", {}), 400, { error: badCode });
        expectResponse(await api("/auth/reset-password", {}), 400, { error: badGrant });
      }
      const limited = await reset("bad", newPassword, { "x-forwarded-for": "192.0.2.10" });
      expect(limited.status).to.equal(429);
      expect(limited.retryAfter).to.equal("900");
      advance(15 * minute);
      expectResponse(await reset("bad"), 400, { error: badGrant });
    },
  ));

  it("exhausts an issued code on the fifth wrong attempt across IPs and keeps the account usable", () => withServer(
    async ({ app, messages, signup, login, forgot, verifyCode, advance, idle }) => {
      await signup();
      expectResponse(await forgot(), 202, { message: confirmation });
      await idle();
      const recovery = app.locals.recovery;
      const code = codeOf(messages[0]);
      const wrong = code === "00000000" ? "00000001" : "00000000";
      for (let index = 1; index <= 5; index += 1) {
        const failure = await expectFailure(recovery.verifyCode({
          code: wrong, email: details.email, ip: `192.0.2.${index}`,
        }), 400);
        expect(failure.message).to.equal(badCode);
      }
      expectResponse(await verifyCode(code), 400, { error: badCode });
      expect((await login()).status).to.equal(200);
      advance(minute);
      expectResponse(await forgot(), 202, { message: confirmation });
      await idle();
      const replacement = codeOf(messages[1]);
      const otherWrong = replacement === wrong ? "00000002" : wrong;
      for (let index = 1; index <= 4; index += 1) {
        await expectFailure(recovery.verifyCode({
          code: otherWrong, email: details.email, ip: `192.0.2.${index}`,
        }), 400);
      }
      grantOf(await verifyCode(replacement));
    },
  ));

  it("fails closed at limiter capacity and reuses an expired entry's space", () => withServer(
    async ({ app, signup, advance, idle }) => {
      await signup();
      const { requestReset, resetPassword, verifyCode } = app.locals.recovery;
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

      const attempt = { resetToken: "a".repeat(64), password: newPassword, ip: "192.0.2.1" };
      await expectFailure(resetPassword(attempt), 400);
      await expectFailure(verifyCode({ email: details.email, code: "00000000", ip: "192.0.2.2" }), 503);
      advance(15 * minute);
      await expectFailure(resetPassword({ ...attempt, ip: "192.0.2.2" }), 400);
      await idle();
    }, { recovery: { policy: { metadataCapacity: 1 } } },
  ));

  it("rejects both known and unknown addresses while the delivery pool is full", async () => {
    const pending = deliveryGate();
    await withServer(async ({ signup, forgot, verifyCode, reset, advance, idle }) => {
      await signup();
      await forgot();
      const code = codeOf(await pending.received);
      advance(minute);
      expectResponse(await forgot(), 503, { error: unavailable });
      expectResponse(await forgot("unknown@nyu.edu"), 503, { error: unavailable });
      expectResponse(await verifyCode(code), 503, { error: unavailable });
      expectResponse(await reset("a".repeat(64)), 503, { error: unavailable });
      pending.complete();
      await idle();
      expectResponse(await reset(grantOf(await verifyCode(code))), 200, { message: updated });
      await idle();
    }, { recovery: { deliver: pending.deliver, policy: { deliveryCapacity: 1 } } });
  });

  it("keeps accounts working without valid recovery configuration", () => withServer(
    async ({ signup, login, forgot, verifyCode, reset }) => {
      await signup();
      expect((await login()).status).to.equal(200);
      expectResponse(await forgot(), 503, { error: unavailable });
      expectResponse(await forgot("unknown@nyu.edu"), 503, { error: unavailable });
      expectResponse(await verifyCode("00000000"), 503, { error: unavailable });
      expectResponse(await reset("a".repeat(64)), 503, { error: unavailable });
    }, { recovery: { deliver: undefined } },
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
