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
});
