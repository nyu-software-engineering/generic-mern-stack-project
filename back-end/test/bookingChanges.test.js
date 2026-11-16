import { afterEach, beforeEach, describe, it } from "mocha";
import { expect } from "chai";
import { createApp } from "../app.js";
import { earliestToday } from "../routes/bookings.js";
import { validateMockData } from "../../shared/validateMockData.mjs";
import { mockData } from "./fixtures.js";
import { startTestServer } from "./helpers/server.js";

const shift = (isoDate, days) =>
  new Date(Date.parse(`${isoDate}T00:00:00Z`) + days * 86400000).toISOString().slice(0, 10);

// The current user is always owner-1 (#88). Rentals 3xx are owner-1's listing (owner side);
// rentals 4xx are another owner's listing that owner-1 borrows (borrower side).
describe("Extension (#95) and cancellation (#99) routes", () => {
  let data;
  let server;
  const rental = (id) => data.rentals.find((item) => item.id === id);

  beforeEach(async () => {
    data = mockData();
    const [lamp] = data.listings;
    data.users.push({ id: "owner-2", name: "Other owner" });
    data.listings.push({ ...lamp, id: 2, ownerId: "owner-2", title: "Kettle", price: 1.5 });

    const base = { ...data.rentals[0], extensionRequest: null };
    const asOwner = { ...base, listingId: 1, ownerId: "owner-1", borrowerId: "student-2" };
    const asBorrower = {
      ...base, listingId: 2, ownerId: "owner-2", borrowerId: "owner-1",
      terms: { pricePerDay: 1.5, rentalTerms: "Return clean." },
    };
    data.rentals.push(
      { ...asOwner, id: 301, startDate: "2030-01-01", endDate: "2030-01-05", status: "requested", totalPrice: 20 },
      { ...asOwner, id: 302, startDate: "2030-01-01", endDate: "2030-01-05", status: "confirmed", totalPrice: 20 },
      {
        ...asOwner, id: 303, startDate: "2030-01-01", endDate: "2030-01-05", status: "extension_requested",
        totalPrice: 20, extensionRequest: { newEndDate: "2030-01-08", status: "pending" },
      },
      { ...asOwner, id: 304, startDate: "2030-01-01", endDate: "2030-01-05", status: "active", totalPrice: 20 },
      { ...asBorrower, id: 401, startDate: "2030-02-01", endDate: "2030-02-03", status: "active", totalPrice: 3 },
      { ...asBorrower, id: 402, startDate: "2030-02-01", endDate: "2030-02-03", status: "requested", totalPrice: 3 },
      { ...asBorrower, id: 403, startDate: "2030-02-01", endDate: "2030-02-03", status: "confirmed", totalPrice: 3 },
      { ...asBorrower, id: 404, startDate: "2030-02-01", endDate: "2030-02-03", status: "completed", totalPrice: 3 },
      {
        ...base, id: 501, listingId: 2, ownerId: "owner-2", borrowerId: "student-2",
        startDate: "2030-03-01", endDate: "2030-03-02", status: "confirmed", totalPrice: 1.5,
      },
    );
    server = await startTestServer(createApp({ store: { load: async () => data } }));
  });

  afterEach(async () => { await server?.close(); });

  async function api(method, path, body) {
    const response = await fetch(`${server.baseUrl}/api/bookings${path}`, {
      method,
      headers: { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: response.status, body: await response.json() };
  }

  describe("GET /api/bookings/extension-requests", () => {
    it("lists pending extensions waiting on the current owner", async () => {
      const { status, body } = await api("GET", "/extension-requests");
      expect(status).to.equal(200);
      expect(body.map((item) => item.id)).to.deep.equal([303]);
    });
  });

  describe("POST /api/bookings/:id/extensions", () => {
    it("lets the borrower request a later return date for an active rental", async () => {
      const { status, body } = await api("POST", "/401/extensions", { newEndDate: "2030-02-06" });
      expect(status).to.equal(201);
      expect(body).to.include({ status: "extension_requested", endDate: "2030-02-03", totalPrice: 3 });
      expect(body.extensionRequest).to.deep.equal({ newEndDate: "2030-02-06", status: "pending" });
      expect(rental(401).status).to.equal("extension_requested");
    });

    it("only lets the borrower ask", async () => {
      expect((await api("POST", "/304/extensions", { newEndDate: "2030-01-09" })).status).to.equal(403);
      expect((await api("POST", "/501/extensions", { newEndDate: "2030-03-09" })).status).to.equal(403);
      expect(rental(304).status).to.equal("active");
    });

    it("only extends active rentals", async () => {
      for (const id of [402, 403, 404]) {
        const { status } = await api("POST", `/${id}/extensions`, { newEndDate: "2030-02-06" });
        expect(status, `rental ${id}`).to.equal(409);
      }
    });

    it("refuses a second request while one is pending", async () => {
      await api("POST", "/401/extensions", { newEndDate: "2030-02-06" });
      expect((await api("POST", "/401/extensions", { newEndDate: "2030-02-09" })).status).to.equal(409);
      expect(rental(401).extensionRequest.newEndDate).to.equal("2030-02-06");
    });

    it("rejects missing, invalid, same-day or earlier return dates", async () => {
      for (const newEndDate of [undefined, 20300206, "2030-02-30", "02/06/2030", "2030-02-03", "2030-02-02"]) {
        const { status } = await api("POST", "/401/extensions", { newEndDate });
        expect(status, String(newEndDate)).to.equal(400);
      }
      expect(rental(401).status).to.equal("active");
    });

    it("rejects a return date that is already past for an overdue rental", async () => {
      const today = earliestToday();
      rental(401).endDate = shift(today, -5);
      const past = await api("POST", "/401/extensions", { newEndDate: shift(today, -1) });
      expect(past.status).to.equal(400);
      expect(past.body.error).to.equal("newEndDate cannot be in the past.");
      expect((await api("POST", "/401/extensions", { newEndDate: shift(today, 2) })).status).to.equal(201);
    });

    it("returns 404 for an unknown booking", async () => {
      expect((await api("POST", "/999/extensions", { newEndDate: "2030-02-06" })).status).to.equal(404);
    });
  });

  describe("PATCH /api/bookings/:id/extensions", () => {
    it("approves: moves the return date and adds the extra days to the total", async () => {
      const { status, body } = await api("PATCH", "/303/extensions", { approve: true });
      expect(status).to.equal(200);
      expect(body).to.include({ status: "active", endDate: "2030-01-08", totalPrice: 35 });
      expect(body.extensionRequest).to.deep.equal({ newEndDate: "2030-01-08", status: "approved" });
    });

    it("declines: keeps the dates and total", async () => {
      const { body } = await api("PATCH", "/303/extensions", { approve: false });
      expect(body).to.include({ status: "active", endDate: "2030-01-05", totalPrice: 20 });
      expect(body.extensionRequest.status).to.equal("declined");
    });

    it("requires a true or false answer", async () => {
      for (const approve of [undefined, "yes", 1, null]) {
        expect((await api("PATCH", "/303/extensions", { approve })).status, String(approve)).to.equal(400);
      }
      expect(rental(303).status).to.equal("extension_requested");
    });

    it("only lets the owner respond", async () => {
      await api("POST", "/401/extensions", { newEndDate: "2030-02-06" });
      expect((await api("PATCH", "/401/extensions", { approve: true })).status).to.equal(403);
      expect(rental(401).endDate).to.equal("2030-02-03");
    });

    it("needs a pending request", async () => {
      expect((await api("PATCH", "/304/extensions", { approve: true })).status).to.equal(409);
      await api("PATCH", "/303/extensions", { approve: true });
      expect((await api("PATCH", "/303/extensions", { approve: true })).status).to.equal(409);
      expect(rental(303).totalPrice).to.equal(35);
    });

    it("falls back to the listing price when the booking has no stored daily rate", async () => {
      const { pricePerDay, ...termsWithoutRate } = rental(303).terms;
      expect(pricePerDay).to.equal(5);
      rental(303).terms = termsWithoutRate;
      data.listings[0].price = 4;

      const { status, body } = await api("PATCH", "/303/extensions", { approve: true });
      expect(status).to.equal(200);
      expect(body).to.include({ endDate: "2030-01-08", totalPrice: 32 });
      expect(() => validateMockData(data)).not.to.throw();
    });

    it("treats an unusable stored rate as missing", async () => {
      data.listings[0].price = 4;
      for (const badRate of ["5", -1, null]) {
        Object.assign(rental(303), {
          terms: { ...rental(303).terms, pricePerDay: badRate },
          status: "extension_requested", endDate: "2030-01-05", totalPrice: 20,
        });
        const { body } = await api("PATCH", "/303/extensions", { approve: true });
        expect(body.totalPrice, String(badRate)).to.equal(32);
      }
    });

    it("keeps the agreed rate even if the listing price changed", async () => {
      data.listings[0].price = 100;
      const { body } = await api("PATCH", "/303/extensions", { approve: true });
      expect(body.totalPrice).to.equal(35);
    });

    it("refuses to approve when there is no usable rate, without changing the rental", async () => {
      const { pricePerDay: _unused, ...termsWithoutRate } = rental(303).terms;
      rental(303).terms = termsWithoutRate;
      data.listings[0].price = Number.NaN;

      const { status, body } = await api("PATCH", "/303/extensions", { approve: true });
      expect(status).to.equal(409);
      expect(body.error).to.equal("This booking has no usable daily rate.");
      expect(rental(303)).to.include({ status: "extension_requested", endDate: "2030-01-05", totalPrice: 20 });

      const declined = await api("PATCH", "/303/extensions", { approve: false });
      expect(declined.body.extensionRequest.status).to.equal("declined");
    });

    it("rejects an overflowing total without changing the rental", async () => {
      rental(303).terms = { ...rental(303).terms, pricePerDay: 1e308 };
      const { status } = await api("PATCH", "/303/extensions", { approve: true });
      expect(status).to.equal(400);
      expect(rental(303)).to.include({ status: "extension_requested", endDate: "2030-01-05", totalPrice: 20 });
      expect(() => validateMockData(data)).not.to.throw();
    });
  });

  describe("POST /api/bookings/:id/cancel", () => {
    it("lets the borrower withdraw a request", async () => {
      const { status, body } = await api("POST", "/402/cancel");
      expect(status).to.equal(200);
      expect(body.status).to.equal("cancelled");
      expect(rental(402).status).to.equal("cancelled");
    });

    it("lets either person cancel a confirmed booking", async () => {
      expect((await api("POST", "/403/cancel")).body.status).to.equal("cancelled");
      expect((await api("POST", "/302/cancel")).body.status).to.equal("cancelled");
    });

    it("makes owners decline requests instead of cancelling", async () => {
      const { status, body } = await api("POST", "/301/cancel");
      expect(status).to.equal(409);
      expect(body.error).to.equal("Owners decline requests instead of cancelling them.");
      expect(rental(301).status).to.equal("requested");
    });

    it("refuses bookings that were already picked up, finished or cancelled", async () => {
      await api("POST", "/402/cancel");
      for (const id of [401, 404, 303, 402]) {
        expect((await api("POST", `/${id}/cancel`)).status, `rental ${id}`).to.equal(409);
      }
    });

    it("refuses people outside the booking", async () => {
      expect((await api("POST", "/501/cancel")).status).to.equal(403);
      expect(rental(501).status).to.equal("confirmed");
    });

    it("returns 404 for an unknown booking", async () => {
      expect((await api("POST", "/999/cancel")).status).to.equal(404);
    });
  });

  it("keeps the shared data valid after every change", async () => {
    await api("POST", "/401/extensions", { newEndDate: "2030-02-06" });
    await api("PATCH", "/303/extensions", { approve: true });
    await api("POST", "/402/cancel");
    await api("POST", "/302/cancel");
    expect(() => validateMockData(data)).not.to.throw();
  });
});
