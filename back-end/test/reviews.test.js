
import { afterEach, beforeEach, describe, it } from "mocha";
import { expect } from "chai";
import { createApp } from "../app.js";
import { mockData } from "./fixtures.js";
import { startTestServer } from "./helpers/server.js";
import { validateMockData } from "../../shared/validateMockData.mjs";

describe("Reviews and reputation API (#96)", () => {
  let app;
  let data;
  let server;

  const studentToken = "a".repeat(64);
  const outsiderToken = "b".repeat(64);

  const details = () => ({
    bookingId: 101,
    communicationRating: 5,
    itemCareRating: 4,
    overallRating: 5,
    comment: "  Great exchange.  ",
  });

  beforeEach(async () => {
    data = mockData();
    data.users.push({ id: "student-3", name: "Outside student" });

    app = createApp({ store: { load: async () => data } });
    app.locals.auth.sessions.set(studentToken, "student-2");
    app.locals.auth.sessions.set(outsiderToken, "student-3");

    server = await startTestServer(app);
  });

  afterEach(async () => {
    await server?.close();
  });

  async function api(method, path, body, token) {
    const response = await fetch(`${server.baseUrl}/api${path}`, {
      method,
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    return { status: response.status, body: await response.json() };
  }

  describe("GET /api/users/:id/reputation", () => {
    it("returns a user's existing reputation", async () => {
      const result = await api("GET", "/users/owner-1/reputation");

      expect(result.status).to.equal(200);
      expect(result.body.user).to.deep.equal({
        id: "owner-1",
        name: "Item owner",
      });
      expect(result.body.reviews).to.have.length(1);
      expect(result.body.reviews[0].id).to.equal(1);
      expect(result.body.averageRating).to.equal(5);
    });

    it("returns null average when no reviews exist", async () => {
      const result = await api("GET", "/users/student-3/reputation");

      expect(result.status).to.equal(200);
      expect(result.body.reviews).to.deep.equal([]);
      expect(result.body.averageRating).to.equal(null);
    });

    it("sorts reviews newest first and computes the average", async () => {
      data.rentals.push({
        ...data.rentals[0],
        id: 102,
        borrowerId: "student-3",
      });

      data.reviews.push({
        ...data.reviews[0],
        id: 9,
        bookingId: 102,
        reviewerId: "student-3",
        overallRating: 3,
      });

      const result = await api("GET", "/users/owner-1/reputation");

      expect(result.body.reviews.map((review) => review.id))
        .to.deep.equal([9, 1]);
      expect(result.body.averageRating).to.equal(4);
    });

    it("returns 404 for an unknown user", async () => {
      const result = await api("GET", "/users/missing/reputation");

      expect(result.status).to.equal(404);
      expect(result.body.error).to.equal("User not found.");
    });

    it("does not expose private registered-account data", async () => {
      data.users.push({
        id: "account-test123",
        name: "Private Student",
        displayName: "Private Student",
        email: "private@nyu.edu",
        campusArea: "Private residence",
        emailVerified: true,
      });

      const result = await api("GET", "/users/account-test123/reputation");

      expect(result.status).to.equal(200);
      expect(result.body.user).to.deep.equal({
        id: "account-test123",
        name: "DormShare student",
      });
      expect(JSON.stringify(result.body)).not.to.include("private@nyu.edu");
      expect(JSON.stringify(result.body)).not.to.include("Private residence");
      expect(JSON.stringify(result.body)).not.to.include("Private Student");
    });
  });

  describe("GET /api/bookings/:id/review", () => {
    it("returns the current user's submitted review", async () => {
      const result = await api("GET", "/bookings/101/review", undefined, studentToken);

      expect(result.status).to.equal(200);
      expect(result.body).to.include({
        id: 1,
        reviewerId: "student-2",
        reviewedUserId: "owner-1",
      });
    });

    it("returns null when the current user has not reviewed", async () => {
      const result = await api("GET", "/bookings/101/review");

      expect(result.status).to.equal(200);
      expect(result.body).to.equal(null);
    });

    it("returns 404 for a missing booking", async () => {
      const result = await api("GET", "/bookings/999/review");

      expect(result.status).to.equal(404);
    });

    it("prevents outsiders from accessing a booking's review", async () => {
      const result = await api("GET", "/bookings/101/review", undefined, outsiderToken);

      expect(result.status).to.equal(403);
    });
  });

  describe("POST /api/reviews", () => {
    it("creates a review with server-assigned identity and timestamp", async () => {
      const result = await api("POST", "/reviews", details());

      expect(result.status).to.equal(201);
      expect(result.body).to.include({
        id: 2,
        bookingId: 101,
        reviewerId: "owner-1",
        reviewedUserId: "student-2",
        communicationRating: 5,
        itemCareRating: 4,
        overallRating: 5,
        comment: "Great exchange.",
      });
      expect(result.body.createdAt).to.match(/^\d{4}-\d{2}-\d{2}$/);
      expect(data.reviews).to.have.length(2);
      expect(() => validateMockData(data)).not.to.throw();
    });

    it("makes the new review available through both GET endpoints", async () => {
      await api("POST", "/reviews", details());

      const ownReview = await api("GET", "/bookings/101/review");
      const reputation = await api("GET", "/users/student-2/reputation");

      expect(ownReview.body.id).to.equal(2);
      expect(reputation.body.reviews[0].id).to.equal(2);
      expect(reputation.body.averageRating).to.equal(5);
    });

    it("rejects a second review by the same participant", async () => {
      await api("POST", "/reviews", details());

      const result = await api("POST", "/reviews", details());

      expect(result.status).to.equal(409);
      expect(data.reviews).to.have.length(2);
    });

    it("rejects a participant who already reviewed the booking", async () => {
      const result = await api("POST", "/reviews", details(), studentToken);

      expect(result.status).to.equal(409);
      expect(data.reviews).to.have.length(1);
    });

    it("rejects reviews for bookings that are not completed", async () => {
      data.rentals.push({
        ...data.rentals[0],
        id: 102,
        status: "active",
      });

      const result = await api("POST", "/reviews", {
        ...details(),
        bookingId: 102,
      });

      expect(result.status).to.equal(409);
      expect(data.reviews).to.have.length(1);
    });

    it("rejects reviews submitted by nonparticipants", async () => {
      const result = await api("POST", "/reviews", details(), outsiderToken);

      expect(result.status).to.equal(403);
      expect(data.reviews).to.have.length(1);
    });

    it("returns 404 for an unknown booking", async () => {
      const result = await api("POST", "/reviews", {
        ...details(),
        bookingId: 999,
      });

      expect(result.status).to.equal(404);
    });

    it("rejects invalid ratings", async () => {
      for (const rating of [0, 6, 1.5, "5", null, undefined]) {
        const result = await api("POST", "/reviews", {
          ...details(),
          communicationRating: rating,
        });

        expect(result.status).to.equal(400);
      }

      expect(data.reviews).to.have.length(1);
    });

    it("rejects missing and invalid rating categories", async () => {
      const missing = await api("POST", "/reviews", {
        ...details(),
        overallRating: undefined,
      });

      const invalid = await api("POST", "/reviews", {
        ...details(),
        itemCareRating: 7,
      });

      expect(missing.status).to.equal(400);
      expect(invalid.status).to.equal(400);
    });

    it("rejects comments longer than 500 characters or non-text comments", async () => {
      for (const comment of ["a".repeat(501), 123, null]) {
        const result = await api("POST", "/reviews", {
          ...details(),
          comment,
        });

        expect(result.status).to.equal(400);
      }

      expect(data.reviews).to.have.length(1);
    });

    it("accepts a valid string booking ID", async () => {
      const result = await api("POST", "/reviews", {
        ...details(),
        bookingId: "101",
      });

      expect(result.status).to.equal(201);
      expect(result.body.bookingId).to.equal(101);
    });

    it("rejects malformed booking IDs", async () => {
      for (const bookingId of [0, -1, 1.5, "abc", "01", {}, null]) {
        const result = await api("POST", "/reviews", {
          ...details(),
          bookingId,
        });

        expect(result.status).to.equal(400);
      }
    });

    it("rejects a request with no body", async () => {
      const result = await api("POST", "/reviews");

      expect(result.status).to.equal(400);
    });

    it("ignores client-supplied identity and metadata", async () => {
      const result = await api("POST", "/reviews", {
        ...details(),
        id: 999,
        reviewerId: "student-2",
        reviewedUserId: "owner-1",
        createdAt: "2000-01-01",
      });

      expect(result.status).to.equal(201);
      expect(result.body.id).to.equal(2);
      expect(result.body.reviewerId).to.equal("owner-1");
      expect(result.body.reviewedUserId).to.equal("student-2");
      expect(result.body.createdAt).not.to.equal("2000-01-01");
    });

    it("rejects an invalid bearer session without creating a review", async () => {
      const result = await api("POST", "/reviews", details(), "c".repeat(64));

      expect(result.status).to.equal(401);
      expect(data.reviews).to.have.length(1);
    });

    it("attributes reviews to the authenticated account, not the demo user", async () => {
      const accountId = "account-newstudent";
      const token = "d".repeat(64);

      data.users.push({
        id: accountId,
        name: "New Student",
      });

      data.rentals.push({
        ...data.rentals[0],
        id: 202,
        borrowerId: accountId,
      });

      app.locals.auth.sessions.set(token, accountId);

      const result = await api("POST", "/reviews", {
        ...details(),
        bookingId: 202,
      }, token);

      expect(result.status).to.equal(201);
      expect(result.body).to.include({
        bookingId: 202,
        reviewerId: accountId,
        reviewedUserId: "owner-1",
      });
      expect(data.reviews).to.have.length(2);
      expect(() => validateMockData(data)).not.to.throw();
    });
  });
});