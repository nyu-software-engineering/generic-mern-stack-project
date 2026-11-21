const { expect } = require("chai");
const { request } = require("chai-http");
const app = require("../app");
const { lists, savedPlaces } = require("../data/demoData");

function savePlace(body) {
  return request.execute(app).post("/api/saved-places").send(body);
}

describe("POST /api/saved-places", function () {
  it("saves a new place onto the list the user already has", async function () {
    // p_10 Septime is in Paris. u_1 already has Paris list l_2.
    const response = await savePlace({ placeId: "p_10" });

    expect(response.status).to.equal(200);
    expect(response.body).to.include({
      ok: true,
      placeId: "p_10",
      placeName: "Septime",
      cityId: "c_paris",
      cityName: "Paris",
      listId: "l_2",
    });
    expect(response.body.savedPlaceId).to.be.a("string");
  });

  it("creates a city list when the user does not have one yet", async function () {
    // p_9 Katz's is in New York. u_1 is not on the New York list.
    const response = await savePlace({
      placeId: "p_9",
      lookup: {
        platform: "TikTok",
        url: "https://www.tiktok.com/@nyceats/video/7301",
        thumbnailUrl: "https://picsum.photos/seed/lk1/600",
      },
    });

    expect(response.status).to.equal(200);
    expect(response.body).to.include({
      ok: true,
      placeId: "p_9",
      placeName: "Katz's Delicatessen",
      cityId: "c_nyc",
      cityName: "New York",
      listId: "l_u_1_c_nyc",
    });

    const list = lists.find((item) => item.id === "l_u_1_c_nyc");
    expect(list.ownerId).to.equal("u_1");
    expect(list.memberIds).to.deep.equal(["u_1"]);

    const saved = savedPlaces.find((item) => item.id === response.body.savedPlaceId);
    expect(saved.sourcePlatform).to.equal("TikTok");
    expect(saved.thumbnailUrl).to.equal("https://picsum.photos/seed/lk1/600");
  });

  it("returns a duplicate flag and does not add the place again", async function () {
    // p_8 Merci is already saved by u_1 on the Paris list.
    const before = savedPlaces.length;
    const response = await savePlace({ placeId: "p_8" });

    expect(response.status).to.equal(409);
    expect(response.body).to.deep.equal({
      ok: false,
      reason: "duplicate",
      savedPlaceId: "sp_8",
      placeId: "p_8",
      duplicate: true,
      error: "This place is already on your list.",
    });
    expect(savedPlaces.length).to.equal(before);
  });

  it("returns 404 for an unknown place", async function () {
    const response = await savePlace({ placeId: "p_missing" });

    expect(response.status).to.equal(404);
    expect(response.body).to.deep.equal({ error: "Place not found" });
  });

  it("returns 400 when placeId is missing or the lookup is invalid", async function () {
    const missing = await savePlace({});
    const badLookup = await savePlace({ placeId: "p_12", lookup: "TikTok" });
    const badPlatform = await savePlace({
      placeId: "p_12",
      lookup: { platform: "YouTube" },
    });

    expect(missing.status).to.equal(400);
    expect(badLookup.status).to.equal(400);
    expect(badPlatform.status).to.equal(400);
    expect(missing.body.error).to.be.a("string");
    expect(savedPlaces.some((item) => item.placeId === "p_12")).to.equal(false);
  });
});
