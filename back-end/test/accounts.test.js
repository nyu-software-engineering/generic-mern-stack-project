
import { afterEach, beforeEach, describe, it } from "mocha";
import { expect } from "chai";
import { createApp } from "../app.js";
import { mockData } from "./fixtures.js";
import { startTestServer } from "./helpers/server.js";
import { validateMockData } from "../../shared/validateMockData.mjs";

describe("Account and sign-in API (#92)", () => {
  let server;
  let data;
  let app;

  const details = {
    fullName: "Test Student",
    email: "student@nyu.edu",
    password: "securePassword123",
  };

  beforeEach(async () => {
    data = mockData();
    app = createApp({ store: { load: async () => data } });
    server = await startTestServer(app);
  });

  afterEach(async () => {
    await server?.close();
  });

  async function api(method, path, body, token) {
    const response = await fetch(`${server.baseUrl}/api${path}`, {
      method,
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    return { status: response.status, body: await response.json() };
  }

  const signup = () => api("POST", "/auth/signup", details);

  it("creates an NYU account without exposing credentials", async () => {
    const { status, body } = await signup();

    expect(status).to.equal(201);
    expect(body.user).to.include({
      email: details.email,
      displayName: details.fullName,
      emailVerified: false,
    });
    expect(body).not.to.have.property("token");
    expect(body.demoCode).to.match(/^\d{6}$/);
    expect(data.users).to.have.length(3);
    expect(JSON.stringify(data.users)).not.to.include(details.password);
    expect(JSON.stringify(body)).not.to.include(details.password);
    expect(() => validateMockData(data)).not.to.throw();
  });

  it("rejects invalid signup details and duplicate emails", async () => {
    for (const changes of [
      { fullName: "" },
      { email: "student@gmail.com" },
      { email: "student@nyu.edu.fake" },
      { password: "short" },
    ]) {
      const result = await api("POST", "/auth/signup", { ...details, ...changes });
      expect(result.status).to.equal(400);
    }

    expect((await signup()).status).to.equal(201);
    expect((await signup()).status).to.equal(409);
    expect(data.users).to.have.length(3);
  });

  it("verifies only the correct code and prevents reuse", async () => {
    const { body: created } = await signup();
    const verify = (code) => api("POST", "/auth/verify", {
      email: details.email, code,
    });

    expect((await verify("000000")).status).to.equal(400);

    const result = await verify(created.demoCode);
    expect(result.status).to.equal(200);
    expect(result.body.user.emailVerified).to.equal(true);

    expect((await verify(created.demoCode)).status).to.equal(400);
  });

  it("requires verification before login and creates a session", async () => {
    const { body: created } = await signup();

    expect((await api("POST", "/auth/login", {
      email: details.email, password: "wrongPassword",
    })).status).to.equal(401);

    expect((await api("POST", "/auth/login", {
      email: "missing@nyu.edu", password: details.password,
    })).status).to.equal(401);

    expect((await api("POST", "/auth/login", details)).status).to.equal(403);

    expect((await api("POST", "/auth/verify", {
      email: details.email, code: created.demoCode,
    })).status).to.equal(200);

    const login = await api("POST", "/auth/login", details);
    expect(login.status).to.equal(200);
    expect(login.body.user.email).to.equal(details.email);

    const current = await api("GET", "/users/me", undefined, login.body.token);
    expect(current.status).to.equal(200);
    expect(current.body.user.id).to.equal(login.body.user.id);
  });

  it("protects and updates only the signed-in user's profile", async () => {
    const { body: created } = await signup();

    expect((await api("GET", "/users/me")).status).to.equal(401);
    expect((await api("PUT", "/users/me", {
      displayName: "Someone", campusArea: "Brooklyn",
    })).status).to.equal(401);

    await api("POST", "/auth/verify", {
      email: details.email, code: created.demoCode,
    });

    const { body: login } = await api("POST", "/auth/login", details);

    expect((await api("PUT", "/users/me", {
      displayName: "", campusArea: "Brooklyn",
    }, login.token)).status).to.equal(400);

    const updated = await api("PUT", "/users/me", {
      displayName: "Updated Student",
      campusArea: "Washington Square",
      emailVerified: false,
      id: "fake-id",
    }, login.token);

    expect(updated.status).to.equal(200);
    expect(updated.body.user).to.include({
      id: created.user.id,
      email: details.email,
      displayName: "Updated Student",
      campusArea: "Washington Square",
      emailVerified: true,
    });

    expect(data.users.find((user) => user.id === created.user.id).name)
      .to.equal("Updated Student");
    expect(data.users[0].name).to.equal("Item owner");
    expect(() => validateMockData(data)).not.to.throw();
  });

  it("rejects stale tokens on existing data routes", async () => {
    const { body: created } = await signup();

    await api("POST", "/auth/verify", {
      email: details.email, code: created.demoCode,
    });

    const { body: login } = await api("POST", "/auth/login", details);

    app.locals.auth.sessions.clear();

    const malformed = await api("PATCH", "/listings/1/status", {
      status: "paused",
    }, "not-a-token");

    expect(malformed.status).to.equal(401);

    const result = await api("PATCH", "/listings/1/status", {
      status: "paused",
    }, login.token);

    expect(result.status).to.equal(401);
    expect(data.listings[0].status).to.equal("published");
  });

  it("keeps private account details out of public mock data", async () => {
    const { body: created } = await signup();

    await api("POST", "/auth/verify", {
      email: details.email, code: created.demoCode,
    });

    const { body: login } = await api("POST", "/auth/login", details);

    expect((await api("PUT", "/users/me", {
      displayName: "Private Updated Name",
      campusArea: "Washington Square",
    }, login.token)).status).to.equal(200);

    const { body: publicData } = await api("GET", "/mock-data");
    const account = publicData.users.find((user) => user.id === created.user.id);

    expect(account).to.deep.equal({
      id: created.user.id,
      name: "DormShare student",
    });

    const serialized = JSON.stringify(publicData);
    for (const value of [
      details.fullName,
      details.email,
      "Private Updated Name",
      "Washington Square",
    ]) {
      expect(serialized).not.to.include(value);
    }
  });
});
