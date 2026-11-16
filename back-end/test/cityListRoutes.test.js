const { expect } = require("chai");
const { request } = require("chai-http");
const app = require("../app");
const { votes } = require("../data/demoData");

describe("City list routes", () => {
  it("returns the current user's lists with the same header as the city page", async () => {
    const home = await request.execute(app).get("/api/lists");
    const city = await request.execute(app).get("/api/cities/c_paris");

    expect(home.status).to.equal(200);
    expect(city.status).to.equal(200);
    expect(home.body).to.deep.equal([city.body]);
    expect(city.body).to.include({ id: "c_paris", name: "Paris", placeCount: 3 });
    expect(city.body.members.map(({ id }) => id)).to.deep.equal(["u_1", "u_2", "u_4"]);
    for (const member of city.body.members) {
      expect(member).to.have.all.keys("id", "name", "photoUrl");
    }
  });

  for (const suffix of ["", "/places"]) {
    it(`returns the same 404 for an unaccepted invite and a missing city (${suffix || "header"})`, async () => {
      const invited = await request.execute(app).get(`/api/cities/c_nyc${suffix}`);
      const missing = await request.execute(app).get(`/api/cities/unknown${suffix}`);
      expect(invited.status).to.equal(404);
      expect(missing.status).to.equal(404);
      expect(invited.body).to.deep.equal({ error: "City list not found" });
      expect(missing.body).to.deep.equal(invited.body);
    });
  }

  it("ranks saved places by members' must-go votes and then by name", async () => {
    const extraVotes = [
      { savedPlaceId: "sp_7", userId: "u_3", value: "must-go" }, // Outside the Paris list
      { savedPlaceId: "sp_7", userId: "u_1", value: "must-go" }, // Ties Merci
    ];
    votes.push(...extraVotes);
    try {
      const response = await request.execute(app).get("/api/cities/c_paris/places");
      expect(response.status).to.equal(200);
      expect(response.body.map(({ savedPlaceId }) => savedPlaceId)).to.deep.equal(["sp_6", "sp_7", "sp_8"]);
      expect(response.body[1]).to.include({ id: "p_7", categoryId: "food", categoryLabel: "Food" });
      expect(response.body[1].tally).to.deep.equal({ "must-go": 1, down: 1, pass: 0 });
    } finally {
      for (const vote of extraVotes) votes.splice(votes.indexOf(vote), 1);
    }
  });

  it("filters saved places by category and returns an empty list for no matches", async () => {
    const food = await request.execute(app).get("/api/cities/c_paris/places?category=food");
    const empty = await request.execute(app).get("/api/cities/c_paris/places?category=nightlife");
    expect(food.status).to.equal(200);
    expect(food.body.map(({ savedPlaceId }) => savedPlaceId)).to.deep.equal(["sp_7"]);
    expect(empty.status).to.equal(200);
    expect(empty.body).to.deep.equal([]);
  });
});
