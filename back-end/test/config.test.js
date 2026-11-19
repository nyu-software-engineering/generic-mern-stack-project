const { expect } = require("chai");
const { request } = require("chai-http");
const app = require("../app");

describe("GET /api/config", function () {
  it("returns the categories, vote options and source platforms used by the front end", async function () {
    // Pass the app directly so chai-http opens and closes a temporary server for this request.
    const response = await request.execute(app).get("/api/config");

    expect(response.status).to.equal(200);
    expect(response.type).to.equal("application/json");

    // Check examples of the values the UI consumes without fixing the whole list or its order.
    const { categories, voteOptions, sourcePlatforms } = response.body;
    expect(categories).to.deep.include({ id: "food", label: "Food" });
    expect(voteOptions).to.deep.include({ value: "must-go", label: "Must-go" });
    expect(sourcePlatforms).to.include("TikTok");
  });
});
