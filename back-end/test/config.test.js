import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "mocha";
import { createApp } from "../app.js";
import { loadEnvironment, recoveryConfiguration } from "../config.js";
import { mockData } from "./fixtures.js";
import { startTestServer } from "./helpers/server.js";

const senderEnv = {
  BREVO_API_KEY: "fixture-api-key",
  RECOVERY_FROM: "recovery@example.test",
  RECOVERY_FROM_NAME: "DormShare",
};
const account = {
  fullName: "Recovery Student",
  email: "recovery-config@nyu.edu",
  password: "Original password",
};

async function withEnvironmentDirectory(test) {
  const directory = await mkdtemp(join(tmpdir(), "dormshare-config-"));
  try {
    await test(directory);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

async function withConfiguredApp(env, test, deliveryFetch) {
  const localFetch = globalThis.fetch;
  globalThis.fetch = deliveryFetch ?? (() => { throw new Error("Unexpected delivery"); });
  try {
    const data = mockData();
    const app = createApp({
      store: { load: async () => data },
      recovery: recoveryConfiguration(env),
    });
    const server = await startTestServer(app);
    async function post(route, body) {
      const response = await localFetch(`${server.baseUrl}/api/auth/${route}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      return { status: response.status, body: await response.json() };
    }

    try {
      await test(post, app.locals.recovery.idle);
    } finally {
      await server.close();
    }
  } finally {
    globalThis.fetch = localFetch;
  }
}

describe("Backend environment configuration", () => {
  it("preserves exported values, then prefers .env.local to .env", () => withEnvironmentDirectory(
    async (directory) => {
      await writeFile(join(directory, ".env.local"), [
        "BREVO_API_KEY=local-fixture-key",
        "RECOVERY_FROM=local@example.test",
        "MOCKAROO_API_KEY=local-mock-fixture-key",
      ].join("\n"));
      await writeFile(join(directory, ".env"), [
        "BREVO_API_KEY=base-fixture-key",
        "RECOVERY_FROM=base@example.test",
        'RECOVERY_FROM_NAME="DormShare Support"',
        "MOCKAROO_API_KEY=base-mock-fixture-key",
      ].join("\n"));
      const env = { BREVO_API_KEY: "exported-fixture-key", MOCKAROO_API_KEY: "" };

      loadEnvironment({ directory, env });

      assert.deepEqual(env, {
        BREVO_API_KEY: "exported-fixture-key",
        RECOVERY_FROM: "local@example.test",
        RECOVERY_FROM_NAME: "DormShare Support",
        MOCKAROO_API_KEY: "",
      });
    },
  ));

  it("allows the environment files to be absent", () => withEnvironmentDirectory((directory) => {
    const env = { PORT: "4000" };
    loadEnvironment({ directory, env });
    assert.deepEqual(env, { PORT: "4000" });
  }));

  it("enables recovery from the three sender settings alone", () => {
    const config = recoveryConfiguration(senderEnv);
    assert.deepEqual(Object.keys(config), ["deliver"]);
    assert.equal(typeof config.deliver, "function");
  });

  it("omits delivery for incomplete or invalid sender settings", () => {
    for (const missing of Object.keys(senderEnv)) {
      const env = { ...senderEnv };
      delete env[missing];
      assert.equal(recoveryConfiguration(env), undefined);
    }
    assert.equal(recoveryConfiguration({ ...senderEnv, RECOVERY_FROM: "invalid address" }), undefined);
  });

  it("uses configured delivery for private recovery messages", async () => {
    const requests = [];
    await withConfiguredApp(senderEnv, async (post, idle) => {
      assert.equal((await post("signup", account)).status, 201);
      const result = await post("forgot-password", { email: account.email });
      assert.deepEqual(result, {
        status: 202,
        body: { message: "If an account exists for this email, password reset instructions will be sent." },
      });
      await idle();
      assert.equal(requests.length, 1);
      assert.deepEqual(requests[0].to, [{ email: account.email }]);

      const [code] = requests[0].textContent.match(/\b\d{8}\b/);
      const verified = await post("verify-reset-code", { email: account.email, code });
      assert.equal(verified.status, 200);
      const reset = await post("reset-password", {
        resetToken: verified.body.resetToken,
        password: "Replacement password",
      });
      assert.equal(reset.status, 200);
      await idle();
      assert.equal(requests.length, 2);
      assert.match(requests[1].subject, /password.*changed/i);
      const notice = JSON.stringify(requests[1]);
      assert.equal(notice.includes(code), false);
      assert.equal(notice.includes(verified.body.resetToken), false);
      assert.equal(notice.includes("Replacement password"), false);
    }, async (url, options) => {
      assert.equal(url, "https://api.brevo.com/v3/smtp/email");
      requests.push(JSON.parse(options.body));
      return new Response('{"messageId":"fixture-message"}', { status: 201 });
    });
  });

  it("keeps signup and login available when recovery settings are absent", () => withConfiguredApp(
    {},
    async (post) => {
      const signup = await post("signup", account);
      assert.equal(signup.status, 201);
      assert.equal((await post("verify", { email: account.email, code: signup.body.demoCode })).status, 200);
      assert.deepEqual(await post("forgot-password", { email: account.email }), {
        status: 503,
        body: { error: "Password recovery is temporarily unavailable. Try again later." },
      });
      const login = await post("login", { email: account.email, password: account.password });
      assert.equal(login.status, 200);
      assert.equal(login.body.user.id, signup.body.user.id);
    },
  ));
});
