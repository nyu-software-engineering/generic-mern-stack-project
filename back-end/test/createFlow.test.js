const { expect } = require("chai");
const { request } = require("chai-http");
const app = require("../app");

describe("POST /api/links/lookup", function () {
  it("returns the found place, and adds candidates plus cityId", async function () {
    const response = await request
      .execute(app)
      .post("/api/links/lookup")
      .send({ url: "https://www.tiktok.com/@nyceats/video/7301" });

    expect(response.status).to.equal(200);
    // Outer status "ok" means the URL is in the demo list.
    expect(response.body.status).to.equal("ok");
    // Nested status "found" means there is one place.
    expect(response.body.lookup.status).to.equal("found");
    expect(response.body.lookup.placeId).to.equal("p_9");
    expect(response.body.candidates).to.deep.equal([]);
    expect(response.body.cityId).to.equal("c_nyc");
  });

  it("returns ambiguous candidates and the city for Suggested Matches", async function () {
    const response = await request
      .execute(app)
      .post("/api/links/lookup")
      .send({ url: "https://www.instagram.com/reel/paris-croissant" });

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal("ok");
    expect(response.body.lookup.status).to.equal("ambiguous");
    expect(response.body.cityId).to.equal("c_paris");
    expect(response.body.candidates[0]).to.include({
      placeId: "p_11",
      name: "Boulangerie Utopie",
      bestMatch: true,
    });
  });

  it("keeps a demo link with no place at HTTP 200, with nested not_found", async function () {
    const response = await request
      .execute(app)
      .post("/api/links/lookup")
      .send({ url: "https://www.tiktok.com/@random/video/0000" });

    expect(response.status).to.equal(200);
    expect(response.body.status).to.equal("ok");
    expect(response.body.lookup.status).to.equal("not_found");
    expect(response.body.cityId).to.equal(null);
  });

  it("returns the small empty and not_found objects for a blank or unknown link", async function () {
    const blank = await request.execute(app).post("/api/links/lookup").send({ url: "   " });
    const unknown = await request.execute(app).post("/api/links/lookup").send({ url: "https://example.com/nope" });

    expect(blank.status).to.equal(200);
    expect(blank.body).to.deep.equal({ status: "empty" });
    expect(unknown.status).to.equal(200);
    expect(unknown.body).to.deep.equal({ status: "not_found" });
  });

  it("returns 400 when the body has no url string", async function () {
    const response = await request.execute(app).post("/api/links/lookup").send({});

    expect(response.status).to.equal(400);
    expect(response.body.error).to.be.a("string");
  });
});

describe("GET /api/places/:id/card", function () {
  it("returns the card, a null duplicate, and the sharing message", async function () {
    const response = await request.execute(app).get("/api/places/p_10/card");

    expect(response.status).to.equal(200);
    expect(response.body).to.include({
      placeId: "p_10",
      name: "Septime",
      subtitle: "Food - Bastille",
      cityId: "c_paris",
      cityName: "Paris",
      sourceTag: null,
      duplicate: null,
      sharingMessage: "Goes into your Paris list. Samantha and Tiffany will see it.",
    });
  });

  it("uses the link photo and platform when lookupId is sent", async function () {
    const response = await request.execute(app).get("/api/places/p_9/card?lookupId=lk_1");

    expect(response.status).to.equal(200);
    expect(response.body.thumbnailUrl).to.equal("https://picsum.photos/seed/lk1/600");
    expect(response.body.sourceTag).to.equal("From TikTok");
    expect(response.body.sharingMessage).to.equal("Goes into your New York list.");
  });

  it("includes the saved row when the current user already saved the place", async function () {
    const response = await request.execute(app).get("/api/places/p_8/card");

    expect(response.status).to.equal(200);
    expect(response.body.duplicate.id).to.equal("sp_8");
    expect(response.body.duplicate.placeId).to.equal("p_8");
  });

  it("returns 404 for an unknown place", async function () {
    const response = await request.execute(app).get("/api/places/p_missing/card");

    expect(response.status).to.equal(404);
    expect(response.body).to.deep.equal({ error: "Place not found" });
  });
});

describe("GET /api/cities/:id/search", function () {
  it("returns matching places in that city", async function () {
    const response = await request.execute(app).get("/api/cities/c_paris/search?q=septime");

    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal([
      {
        placeId: "p_10",
        name: "Septime",
        subtitle: "Food - Bastille",
        photoUrl: "https://picsum.photos/seed/p10/400",
        bestMatch: false,
      },
    ]);
  });

  it("returns an empty list when the text matches nothing", async function () {
    const response = await request.execute(app).get("/api/cities/c_paris/search?q=zzzz");

    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal([]);
  });

  it("returns 404 for an unknown city", async function () {
    const response = await request.execute(app).get("/api/cities/c_missing/search?q=food");

    expect(response.status).to.equal(404);
    expect(response.body).to.deep.equal({ error: "City not found" });
  });
});
