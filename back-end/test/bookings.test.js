import { after, before, beforeEach, describe, it } from "mocha";
import { expect } from "chai";
import { app } from "../app.js";
import { resetBookingsData } from "../data/bookingsMockData.js";

describe("Booking routes (#91)", () => {
  let server;
  let baseUrl;

  before(async () => {
    server = app.listen(0, "127.0.0.1");
    await new Promise((resolve) => server.once("listening", resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    if (!server?.listening) return;
    await new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  beforeEach(resetBookingsData);

  // Send a JSON request as the given user and return { status, body }.
  async function api(method, path, { body, user = "owner-1" } = {}) {
    const response = await fetch(`${baseUrl}/api/bookings${path}`, {
      method,
      headers: { "content-type": "application/json", "x-user-id": user },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: response.status, body: await response.json() };
  }

  describe("POST /api/bookings", () => {
    it("creates a requested booking and prices it from the listing", async () => {
      const { status, body } = await api("POST", "", {
        user: "student-3",
        body: { listingId: 1, startDate: "2026-12-01", endDate: "2026-12-04", message: "Hi!" },
      });

      expect(status).to.equal(201);
      expect(body).to.include({ listingId: 1, ownerId: "owner-1", borrowerId: "student-3", status: "requested" });
      expect(body.totalPrice).to.equal(12);
      expect(body.terms).to.deep.equal({ pricePerDay: 4, rentalTerms: "Return clean and empty.", message: "Hi!" });

      const saved = await api("GET", `/${body.id}`);
      expect(saved.body).to.deep.equal(body);
    });

    it("rounds decimal prices to cents", async () => {
      const { body } = await api("POST", "", {
        body: { listingId: 2, startDate: "2026-12-01", endDate: "2026-12-04" },
      });
      expect(body.totalPrice).to.equal(4.5);
    });

    it("returns 404 for an unknown listing", async () => {
      const { status } = await api("POST", "", {
        body: { listingId: 999, startDate: "2026-12-01", endDate: "2026-12-04" },
      });
      expect(status).to.equal(404);
    });

    it("rejects missing or backwards dates", async () => {
      const missing = await api("POST", "", { body: { listingId: 2 } });
      const backwards = await api("POST", "", {
        body: { listingId: 2, startDate: "2026-12-04", endDate: "2026-12-01" },
      });
      expect(missing.status).to.equal(400);
      expect(backwards.status).to.equal(400);
    });

    it("does not let an owner book their own listing", async () => {
      const { status } = await api("POST", "", {
        body: { listingId: 1, startDate: "2026-12-01", endDate: "2026-12-04" },
      });
      expect(status).to.equal(400);
    });
  });

  describe("GET /api/bookings/requests", () => {
    it("lists only requested bookings for the current owner", async () => {
      const { status, body } = await api("GET", "/requests");
      expect(status).to.equal(200);
      expect(body.map((rental) => rental.id)).to.deep.equal([1]);
    });

    it("returns an empty list when nothing is waiting", async () => {
      const { body } = await api("GET", "/requests", { user: "owner-2" });
      expect(body).to.deep.equal([]);
    });
  });

  describe("GET /api/bookings/:id", () => {
    it("returns the booking", async () => {
      const { status, body } = await api("GET", "/2");
      expect(status).to.equal(200);
      expect(body).to.include({ id: 2, status: "confirmed" });
    });

    it("returns 404 for an unknown booking", async () => {
      const { status, body } = await api("GET", "/999");
      expect(status).to.equal(404);
      expect(body).to.have.property("error");
    });
  });

  describe("PATCH /api/bookings/:id/status", () => {
    it("lets the owner confirm a request", async () => {
      const { status, body } = await api("PATCH", "/1/status", { body: { status: "confirmed" } });
      expect(status).to.equal(200);
      expect(body.status).to.equal("confirmed");
    });

    it("lets the owner decline a request", async () => {
      const { body } = await api("PATCH", "/1/status", { body: { status: "declined" } });
      expect(body.status).to.equal("declined");
    });

    it("rejects any other status", async () => {
      const { status } = await api("PATCH", "/1/status", { body: { status: "completed" } });
      expect(status).to.equal(400);
    });

    it("only lets the owner respond", async () => {
      const { status } = await api("PATCH", "/1/status", { user: "student-1", body: { status: "confirmed" } });
      expect(status).to.equal(403);
    });

    it("refuses a booking that was already answered", async () => {
      const { status } = await api("PATCH", "/2/status", { user: "owner-2", body: { status: "declined" } });
      expect(status).to.equal(409);
    });
  });
});
