
import { expect, use } from "chai";
import chaiHttp, { request } from "chai-http";
import app from "../app.js";

use(chaiHttp);

describe("Listings API", () => {
    it("should return an array of listings", async () => {
        const res = await request.execute(app).get("/api/listings");

        expect(res).to.have.status(200);
        expect(res.body).to.be.an("array");
    });

    it("should return listings with the required fields", async () => {
        const res = await request.execute(app).get("/api/listings");

        expect(res.body).to.not.be.empty;

        for (const listing of res.body) {
            expect(listing).to.have.property("id");
            expect(listing).to.have.property("title");
            expect(listing).to.have.property("location");
            expect(listing).to.have.property("price");
        }
    });
});
