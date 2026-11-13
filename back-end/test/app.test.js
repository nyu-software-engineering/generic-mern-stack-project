import { after, before, describe, it } from "mocha";
import { expect } from "chai";
import { app } from "../app.js";
import { startTestServer } from "./helpers/server.js";

describe("GET /api/health", () => {
  let server;
  before(async () => {
    server = await startTestServer(app);
  });

  after(async () => {
    await server?.close();
  });

  it("returns an OK status as JSON", async () => {
    const response = await fetch(`${server.baseUrl}/api/health`);

    expect(response.status).to.equal(200);
    expect(response.headers.get("content-type")).to.contain("application/json");
    expect(await response.json()).to.deep.equal({ status: "ok" });
  });
});
