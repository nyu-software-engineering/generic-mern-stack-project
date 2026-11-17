
import { expect, use } from "chai";
import chaiHttp, { request } from "chai-http";
import app from "../app.js";

use(chaiHttp);

describe("Saved Listings API", () => {
    beforeEach(async () => {
        await request.execute(app).delete("/api/saved/1");
    });

    it("should return saved listings as an array", async () => {
        const res = await request.execute(app).get("/api/saved");

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
    });

    it("should save a listing", async () => {
        const res = await request.execute(app).post("/api/saved/1");

        expect(res).to.have.status(200);

        const saved = await request.execute(app).get("/api/saved");

        expect(saved.body.some((listing) => listing.id === 1)).to.equal(true);
    });

    it("should remove a saved listing", async () => {
        await request.execute(app).post("/api/saved/1");

        const res = await request.execute(app).delete("/api/saved/1");

        expect(res).to.have.status(200);

        const saved = await request.execute(app).get("/api/saved");

        expect(saved.body.some((listing) => listing.id === 1)).to.equal(false);
    });
});
