import { afterEach, beforeEach, describe, it } from "mocha";
import { expect } from "chai";
import { createApp } from "../app.js";
import { earliestToday } from "../routes/bookings.js";
import { mockData } from "./fixtures.js";
import { startTestServer } from "./helpers/server.js";

// The current user is always owner-1 (#88), so the fixture puts owner-1 on both sides:
// owner of listing 1 (rental 201 waits on them) and borrower on listing 2 (rental 202).
describe("Booking routes (#91)", () => {
  let data;
  let server;

  beforeEach(async () => {
    data = mockData();
    const [lamp] = data.listings;
    data.users.push({ id: "owner-2", name: "Other owner" });
    data.listings.push(
      { ...lamp, id: 2, ownerId: "owner-2", title: "Kettle", price: 1.5 },
      { ...lamp, id: 3, ownerId: "owner-2", title: "Fan", status: "draft" },
      { ...lamp, id: 4, ownerId: "owner-2", title: "Printer", status: "paused" },
    );
    data.rentals.push(
      {
        ...data.rentals[0], id: 201, listingId: 1, ownerId: "owner-1", borrowerId: "student-2",
        startDate: "2026-11-20", endDate: "2026-11-23", status: "requested", totalPrice: 15,
      },
      {
        ...data.rentals[0], id: 202, listingId: 2, ownerId: "owner-2", borrowerId: "owner-1",
        startDate: "2026-11-20", endDate: "2026-11-22", status: "requested", totalPrice: 3,
      },
      {
        ...data.rentals[0], id: 203, listingId: 2, ownerId: "owner-2", borrowerId: "student-2",
        startDate: "2026-11-25", endDate: "2026-11-26", status: "confirmed", totalPrice: 1.5,
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

  describe("POST /api/bookings", () => {
    it("creates a requested booking in the shared data and prices it from the listing", async () => {
      const { status, body } = await api("POST", "", {
        listingId: 2, startDate: "2030-12-01", endDate: "2030-12-04", message: "Hi!",
      });

      expect(status).to.equal(201);
      expect(body).to.include({ listingId: 2, ownerId: "owner-2", borrowerId: "owner-1", status: "requested" });
      expect(body.id).to.equal(204);
      expect(body.totalPrice).to.equal(4.5);
      expect(body.terms).to.deep.equal({ pricePerDay: 1.5, rentalTerms: "Return clean.", message: "Hi!" });
      expect(data.rentals.at(-1)).to.deep.equal(body);
    });

    it("rejects a missing or non-integer listingId", async () => {
      expect((await api("POST", "", { startDate: "2030-12-01", endDate: "2030-12-04" })).status).to.equal(400);
      expect((await api("POST", "", { listingId: "2", startDate: "2030-12-01", endDate: "2030-12-04" })).status)
        .to.equal(400);
    });

    it("returns 404 for unknown, draft or paused listings", async () => {
      for (const listingId of [999, 3, 4]) {
        const { status } = await api("POST", "", { listingId, startDate: "2030-12-01", endDate: "2030-12-04" });
        expect(status, `listing ${listingId}`).to.equal(404);
      }
    });

    it("rejects missing, malformed or backwards dates", async () => {
      for (const dates of [{}, { startDate: "12/01/2030", endDate: "2030-12-04" },
        { startDate: "2030-12-04", endDate: "2030-12-01" }, { startDate: "2030-12-04", endDate: "2030-12-04" }]) {
        expect((await api("POST", "", { listingId: 2, ...dates })).status).to.equal(400);
      }
    });

    it("rejects dates that do not exist on the calendar", async () => {
      for (const badDate of ["2030-13-01", "2030-00-10", "2030-04-31", "2030-02-30", "2030-02-29", "2100-02-29"]) {
        const asStart = await api("POST", "", { listingId: 2, startDate: badDate, endDate: "2101-01-01" });
        const asEnd = await api("POST", "", { listingId: 2, startDate: "2029-12-01", endDate: badDate });
        expect(asStart.status, `start ${badDate}`).to.equal(400);
        expect(asEnd.status, `end ${badDate}`).to.equal(400);
      }
      expect(data.rentals).to.have.length(4);
    });

    it("accepts February 29 in leap years and prices across it", async () => {
      const { status, body } = await api("POST", "", {
        listingId: 2, startDate: "2028-02-28", endDate: "2028-03-01",
      });
      expect(status).to.equal(201);
      expect(body.totalPrice).to.equal(3);

      const leapDay = await api("POST", "", { listingId: 2, startDate: "2028-02-29", endDate: "2028-03-02" });
      expect(leapDay.status).to.equal(201);
      expect(leapDay.body.totalPrice).to.equal(3);
    });

    it("prices across month and year boundaries", async () => {
      const { body } = await api("POST", "", { listingId: 2, startDate: "2030-12-30", endDate: "2031-01-02" });
      expect(body.totalPrice).to.equal(4.5);
    });

    it("rejects start dates that are already past everywhere, and allows today and later", async () => {
      const shift = (isoDate, days) =>
        new Date(Date.parse(`${isoDate}T00:00:00Z`) + days * 86400000).toISOString().slice(0, 10);
      const today = earliestToday();

      const yesterday = await api("POST", "", { listingId: 2, startDate: shift(today, -1), endDate: shift(today, 2) });
      expect(yesterday.status).to.equal(400);
      expect(yesterday.body.error).to.equal("startDate cannot be in the past.");
      expect((await api("POST", "", { listingId: 2, startDate: "2020-01-01", endDate: "2020-01-02" })).status)
        .to.equal(400);

      expect((await api("POST", "", { listingId: 2, startDate: today, endDate: shift(today, 1) })).status).to.equal(201);
      expect((await api("POST", "", { listingId: 2, startDate: shift(today, 30), endDate: shift(today, 33) })).status)
        .to.equal(201);
    });

    it("treats today as the earliest calendar day anywhere (UTC-12)", () => {
      expect(earliestToday(new Date("2026-11-15T11:59:00Z"))).to.equal("2026-11-14");
      expect(earliestToday(new Date("2026-11-15T12:00:00Z"))).to.equal("2026-11-15");
    });

    it("rejects a total that overflows without changing the shared rentals", async () => {
      data.listings.push({ ...data.listings[1], id: 5, title: "Gold kettle", price: 1e307 });
      const { status, body } = await api("POST", "", { listingId: 5, startDate: "2030-12-01", endDate: "2030-12-04" });
      expect(status).to.equal(400);
      expect(body.error).to.equal("Booking total is too large.");
      expect(data.rentals).to.have.length(4);
    });

    it("accepts a text message, defaults a missing one, and rejects other types", async () => {
      const dates = { listingId: 2, startDate: "2030-12-01", endDate: "2030-12-04" };
      expect((await api("POST", "", dates)).body.terms.message).to.equal("");
      for (const message of [{ toString: null }, ["hi"], 5, null, true]) {
        const { status, body } = await api("POST", "", { ...dates, message });
        expect(status, JSON.stringify(message)).to.equal(400);
        expect(body.error).to.equal("message must be text.");
      }
      expect(data.rentals).to.have.length(5);
    });

    it("does not let an owner book their own listing", async () => {
      const { status } = await api("POST", "", { listingId: 1, startDate: "2030-12-01", endDate: "2030-12-04" });
      expect(status).to.equal(400);
    });
  });

  describe("GET /api/bookings/requests", () => {
    it("lists only requested bookings waiting on the current owner", async () => {
      const { status, body } = await api("GET", "/requests");
      expect(status).to.equal(200);
      expect(body.map((rental) => rental.id)).to.deep.equal([201]);
    });
  });

  describe("GET /api/bookings/:id", () => {
    it("returns a booking to its owner or borrower", async () => {
      expect((await api("GET", "/201")).body).to.include({ id: 201, ownerId: "owner-1" });
      expect((await api("GET", "/202")).body).to.include({ id: 202, borrowerId: "owner-1" });
    });

    it("hides other people's bookings", async () => {
      expect((await api("GET", "/203")).status).to.equal(403);
    });

    it("returns 404 for an unknown booking", async () => {
      const { status, body } = await api("GET", "/999");
      expect(status).to.equal(404);
      expect(body).to.have.property("error");
    });
  });

  describe("PATCH /api/bookings/:id/status", () => {
    it("lets the owner confirm a request", async () => {
      const { status, body } = await api("PATCH", "/201/status", { status: "confirmed" });
      expect(status).to.equal(200);
      expect(body.status).to.equal("confirmed");
      expect(data.rentals.find((rental) => rental.id === 201).status).to.equal("confirmed");
    });

    it("lets the owner decline a request", async () => {
      expect((await api("PATCH", "/201/status", { status: "declined" })).body.status).to.equal("declined");
    });

    it("rejects any other status", async () => {
      expect((await api("PATCH", "/201/status", { status: "completed" })).status).to.equal(400);
    });

    it("only lets the owner respond", async () => {
      const { status } = await api("PATCH", "/202/status", { status: "confirmed" });
      expect(status).to.equal(403);
      expect(data.rentals.find((rental) => rental.id === 202).status).to.equal("requested");
    });

    it("refuses a booking that was already answered", async () => {
      await api("PATCH", "/201/status", { status: "confirmed" });
      expect((await api("PATCH", "/201/status", { status: "declined" })).status).to.equal(409);
    });
  });

  it("makes new bookings visible to other routes through the shared store", async () => {
    const created = await api("POST", "", { listingId: 2, startDate: "2030-12-01", endDate: "2030-12-04" });
    const mine = await fetch(`${server.baseUrl}/api/rentals/mine`).then((response) => response.json());
    expect(JSON.stringify(mine)).to.include(`"id":${created.body.id}`);
  });
});
