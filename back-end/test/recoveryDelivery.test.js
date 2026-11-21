import assert from "node:assert/strict";
import { describe, it } from "mocha";
import { createBrevoDelivery } from "../services/recoveryDelivery.js";

const sender = {
  apiKey: "fixture-api-key",
  from: "recovery@example.test",
  fromName: "DormShare",
};
const reset = {
  kind: "password-reset",
  to: "student@nyu.edu",
  code: "00123456",
  expiresAt: Date.UTC(2026, 10, 21, 20, 15),
};

function captureDelivery() {
  const requests = [];
  const deliver = createBrevoDelivery({
    ...sender,
    async fetchImpl(url, options) {
      requests.push({ url, ...options, body: JSON.parse(options.body) });
      return new Response('{"messageId":"fixture-message"}', { status: 201 });
    },
  });
  return { deliver, requests };
}

function assertSafeRejection(result, message) {
  return assert.rejects(result, (error) => {
    assert.equal(error.message, message);
    assert.equal(Object.hasOwn(error, "cause"), false);
    return true;
  });
}

describe("Brevo recovery delivery", () => {
  it("submits a plain text recovery code and its expiry over HTTPS", async () => {
    const { deliver, requests } = captureDelivery();
    await deliver(reset);

    assert.equal(requests.length, 1);
    const [{ url, method, headers, redirect, body }] = requests;
    assert.equal(url, "https://api.brevo.com/v3/smtp/email");
    assert.equal(method, "POST");
    assert.equal(redirect, "error");
    const requestHeaders = new Headers(headers);
    assert.equal(requestHeaders.get("api-key"), sender.apiKey);
    assert.equal(requestHeaders.get("content-type"), "application/json");
    assert.deepEqual(Object.keys(body).sort(), ["sender", "subject", "textContent", "to"]);
    assert.deepEqual(body.sender, { email: sender.from, name: sender.fromName });
    assert.deepEqual(body.to, [{ email: reset.to }]);
    assert.match(body.subject, /DormShare.*reset/i);
    assert.doesNotMatch(body.subject, /00123456/);
    assert.match(body.textContent, /\b00123456\b/);
    assert.ok(body.textContent.includes(new Date(reset.expiresAt).toUTCString()));
    assert.doesNotMatch(JSON.stringify(body), /fixture-api-key|https?:\/\//);
  });

  it("submits a separate password-change notice with no recovery credentials", async () => {
    const { deliver, requests } = captureDelivery();
    await deliver({ ...reset, kind: "password-changed", resetToken: "fixture-permission" });

    assert.equal(requests.length, 1);
    const { body } = requests[0];
    assert.deepEqual(Object.keys(body).sort(), ["sender", "subject", "textContent", "to"]);
    assert.deepEqual(body.to, [{ email: reset.to }]);
    assert.match(body.subject, /password.*changed/i);
    assert.doesNotMatch(JSON.stringify(body), /00123456|fixture-api-key|fixture-permission/);
  });

  it("rejects non-success responses without displaying provider details or retrying", async () => {
    for (const status of [302, 400, 401, 429, 503]) {
      let attempts = 0;
      const deliver = createBrevoDelivery({
        ...sender,
        async fetchImpl() {
          attempts += 1;
          return new Response("private provider message with fixture-api-key and 00123456", { status });
        },
      });
      await assertSafeRejection(deliver(reset), "Brevo delivery rejected.");
      assert.equal(attempts, 1);
    }
  });

  it("suppresses raw transport errors", async () => {
    const deliver = createBrevoDelivery({
      ...sender,
      async fetchImpl() {
        throw new Error("private transport error with fixture-api-key and 00123456");
      },
    });
    await assertSafeRejection(deliver(reset), "Brevo delivery request failed.");
  });

  it("aborts after the configured ten-second timeout", async () => {
    const timeout = AbortSignal.timeout;
    const controller = new AbortController();
    const deadlines = [];
    AbortSignal.timeout = (milliseconds) => {
      deadlines.push(milliseconds);
      queueMicrotask(() => controller.abort(new Error("private timeout details")));
      return controller.signal;
    };

    try {
      const deliver = createBrevoDelivery({
        ...sender,
        fetchImpl(_url, { signal }) {
          assert.equal(signal, controller.signal);
          return new Promise((_resolve, reject) => {
            signal.addEventListener("abort", () => reject(signal.reason), { once: true });
          });
        },
      });
      await assertSafeRejection(deliver(reset), "Brevo delivery timed out.");
      assert.deepEqual(deadlines, [10_000]);
    } finally {
      AbortSignal.timeout = timeout;
    }
  });

  it("rejects invalid sender settings without exposing their values", () => {
    const overrides = [
      { apiKey: undefined },
      { apiKey: " " },
      { apiKey: "fixture\r\ninvalid" },
      { from: "DormShare <recovery@example.test>" },
      { from: "recovery@-example.test" },
      { from: "recovery..mail@example.test" },
      { fromName: " " },
      { fromName: "DormShare\ninvalid" },
    ];
    for (const invalid of overrides) {
      assert.throws(() => createBrevoDelivery({ ...sender, ...invalid }), {
        name: "TypeError",
        message: "Invalid Brevo sender configuration.",
      });
    }
  });
});
