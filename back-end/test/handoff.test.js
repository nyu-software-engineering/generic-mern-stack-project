import { afterEach, beforeEach, describe, it } from "mocha";
import { expect } from "chai";
import { createApp } from "../app.js";
import { mockData } from "./fixtures.js";
import { startTestServer } from "./helpers/server.js";

// The current user is always owner-1 (#88). Rentals 6xx are owner-1's listing (owner side);
// rentals 7xx are another owner's listing that owner-1 borrows (borrower side).
describe("Handoff routes (#113)", () => {
  let data;
  let server;
  const rental = (id) => data.rentals.find((item) => item.id === id);

  beforeEach(async () => {
    data = mockData();
    const base = { ...data.rentals[0], startDate: "2030-01-01", endDate: "2030-01-05", totalPrice: 20 };
    const asOwner = { ...base, ownerId: "owner-1", borrowerId: "student-2" };
    const asBorrower = { ...base, ownerId: "owner-2", borrowerId: "owner-1" };
    data.rentals.push(
      { ...asOwner, id: 601, status: "confirmed" },
      { ...asOwner, id: 602, status: "active" },
      { ...asBorrower, id: 701, status: "confirmed" },
      { ...asBorrower, id: 702, status: "active" },
      { ...base, id: 801, ownerId: "owner-2", borrowerId: "student-2", status: "confirmed" },
    );
    server = await startTestServer(createApp({ store: { load: async () => data } }));
  });

  afterEach(async () => { await server?.close(); });

  async function api(method, path, body) {
    const response = await fetch(`${server.baseUrl}/api/handoff${path}`, {
      method,
      headers: { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: response.status, body: await response.json() };
  }

  describe("GET /api/handoff/:rentalId", () => {
    it("returns the rental to its owner", async () => {
      const { status, body } = await api("GET", "/601");

      expect(status).to.equal(200);
      expect(body).to.include({ id: 601, status: "confirmed", ownerId: "owner-1", borrowerId: "student-2" });
    });

    it("returns the rental to its borrower", async () => {
      const { status, body } = await api("GET", "/701");

      expect(status).to.equal(200);
      expect(body).to.include({ id: 701, borrowerId: "owner-1" });
    });

    it("includes the pickup check once it exists", async () => {
      const pickupCheck = { condition: "As described", accessoriesComplete: true, notes: "", confirmedBy: "student-2" };
      rental(602).pickupCheck = pickupCheck;

      const { body } = await api("GET", "/602");

      expect(body.pickupCheck).to.deep.equal(pickupCheck);
    });

    it("returns 404 for an unknown rental", async () => {
      const { status, body } = await api("GET", "/999");

      expect(status).to.equal(404);
      expect(body.error).to.equal("Booking not found.");
    });

    it("returns 403 for someone outside the rental", async () => {
      const { status } = await api("GET", "/801");

      expect(status).to.equal(403);
    });
  });

  describe("POST /api/handoff/:rentalId/pickup", () => {
    const check = { condition: "Minor wear", accessoriesComplete: true, notes: "  Small scratch.  " };

    it("lets the borrower confirm pickup, recording the check", async () => {
      const { status, body } = await api("POST", "/701/pickup", check);

      expect(status).to.equal(200);
      expect(body.status).to.equal("active");
      expect(body.pickupCheck).to.include({
        condition: "Minor wear", accessoriesComplete: true, notes: "Small scratch.", confirmedBy: "owner-1",
      });
      expect(body.pickupCheck.confirmedAt).to.be.a("string");
      expect(rental(701).status).to.equal("active");
    });

    it("defaults accessoriesComplete to false and notes to empty", async () => {
      const { status, body } = await api("POST", "/701/pickup", { condition: "As described" });

      expect(status).to.equal(200);
      expect(body.pickupCheck).to.include({ accessoriesComplete: false, notes: "" });
    });

    it("rejects an unknown or missing condition with 400", async () => {
      for (const condition of ["Brand new", undefined]) {
        const { status, body } = await api("POST", "/701/pickup", { ...check, condition });

        expect(status).to.equal(400);
        expect(body.error).to.include("condition");
      }
      expect(rental(701).status).to.equal("confirmed");
    });

    it("rejects non-boolean accessoriesComplete and non-text notes with 400", async () => {
      expect((await api("POST", "/701/pickup", { ...check, accessoriesComplete: "yes" })).status).to.equal(400);
      expect((await api("POST", "/701/pickup", { ...check, notes: 5 })).status).to.equal(400);
      expect(rental(701).pickupCheck).to.equal(undefined);
    });

    it("rejects a request with no body with 400", async () => {
      expect((await api("POST", "/701/pickup")).status).to.equal(400);
    });

    it("returns 403 when the owner tries to confirm pickup", async () => {
      const { status } = await api("POST", "/601/pickup", check);

      expect(status).to.equal(403);
      expect(rental(601).status).to.equal("confirmed");
    });

    it("returns 403 for someone outside the rental", async () => {
      expect((await api("POST", "/801/pickup", check)).status).to.equal(403);
    });

    it("returns 409 unless the rental is confirmed", async () => {
      const { status, body } = await api("POST", "/702/pickup", check);

      expect(status).to.equal(409);
      expect(body.error).to.include("active");
      expect(rental(702).pickupCheck).to.equal(undefined);
    });

    it("returns 409 when pickup is confirmed twice", async () => {
      await api("POST", "/701/pickup", check);

      expect((await api("POST", "/701/pickup", check)).status).to.equal(409);
    });

    it("returns 404 for an unknown rental", async () => {
      expect((await api("POST", "/999/pickup", check)).status).to.equal(404);
    });
  });

  describe("POST /api/handoff/:rentalId/return", () => {
    const check = { condition: "Damaged", accessoriesComplete: false, notes: "  Missing the bulb.  " };

    it("lets the owner confirm the return, completing the rental", async () => {
      const { status, body } = await api("POST", "/602/return", check);

      expect(status).to.equal(200);
      expect(body.status).to.equal("completed");
      expect(body.returnCheck).to.include({
        condition: "Damaged", accessoriesComplete: false, notes: "Missing the bulb.", confirmedBy: "owner-1",
      });
      expect(body.returnCheck.confirmedAt).to.be.a("string");
      expect(rental(602).status).to.equal("completed");
    });

    it("keeps the pickup check when the return is confirmed", async () => {
      const pickupCheck = { condition: "As described", accessoriesComplete: true, notes: "", confirmedBy: "student-2" };
      rental(602).pickupCheck = pickupCheck;

      const { body } = await api("POST", "/602/return", check);

      expect(body.pickupCheck).to.deep.equal(pickupCheck);
    });

    it("rejects an unknown or missing condition with 400", async () => {
      for (const condition of ["Brand new", undefined]) {
        const { status, body } = await api("POST", "/602/return", { ...check, condition });

        expect(status).to.equal(400);
        expect(body.error).to.include("condition");
      }
      expect(rental(602).status).to.equal("active");
    });

    it("rejects non-boolean accessoriesComplete and non-text notes with 400", async () => {
      expect((await api("POST", "/602/return", { ...check, accessoriesComplete: "no" })).status).to.equal(400);
      expect((await api("POST", "/602/return", { ...check, notes: 5 })).status).to.equal(400);
      expect(rental(602).returnCheck).to.equal(undefined);
    });

    it("rejects a request with no body with 400", async () => {
      expect((await api("POST", "/602/return")).status).to.equal(400);
    });

    it("returns 403 when the borrower tries to confirm the return", async () => {
      const { status } = await api("POST", "/702/return", check);

      expect(status).to.equal(403);
      expect(rental(702).status).to.equal("active");
    });

    it("returns 403 for someone outside the rental", async () => {
      expect((await api("POST", "/801/return", check)).status).to.equal(403);
    });

    it("returns 409 unless the rental is active", async () => {
      const { status, body } = await api("POST", "/601/return", check);

      expect(status).to.equal(409);
      expect(body.error).to.include("confirmed");
      expect(rental(601).returnCheck).to.equal(undefined);
    });

    it("returns 409 when the return is confirmed twice", async () => {
      await api("POST", "/602/return", check);

      expect((await api("POST", "/602/return", check)).status).to.equal(409);
    });

    it("returns 404 for an unknown rental", async () => {
      expect((await api("POST", "/999/return", check)).status).to.equal(404);
    });
  });
});
