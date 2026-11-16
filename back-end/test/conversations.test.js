import { afterEach, beforeEach, describe, it } from "mocha";
import { expect } from "chai";
import { createApp } from "../app.js";
import { mockData } from "./fixtures.js";
import { startTestServer } from "./helpers/server.js";

describe("Conversation and message routes (#102)", () => {
  let data;
  let server;

  beforeEach(async () => {
    data = mockData();
    data.users.push({ id: "student-3", name: "Another student" });
    data.conversations.push(
      {
        id: 2, listingId: 1, participantIds: ["student-2", "owner-1"],
        messages: [{ id: 2, senderId: "student-2", type: "text", text: "Still free?", sentAt: "2026-11-05T09:00:00Z" }],
      },
      {
        id: 3, listingId: 1, participantIds: ["student-2", "student-3"],
        messages: [{ id: 7, senderId: "student-3", type: "text", text: "Private.", sentAt: "2026-11-06T09:00:00Z" }],
      },
    );
    server = await startTestServer(createApp({ store: { load: async () => data } }));
  });

  afterEach(async () => { await server?.close(); });

  // The current user is always owner-1. The identity header checks that it is ignored.
  async function request(method, path, body) {
    const response = await fetch(`${server.baseUrl}/api/conversations${path}`, {
      method,
      headers: { "content-type": "application/json", "x-user-id": "student-3" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: response.status, body: await response.json() };
  }

  describe("GET /api/conversations", () => {
    it("returns only the current user's conversations, newest message first", async () => {
      const { status, body } = await request("GET", "");
      expect(status).to.equal(200);
      expect(body.map((conversation) => conversation.id)).to.deep.equal([2, 1]);
      expect(body[0]).to.deep.equal(data.conversations[1]);
    });

    it("moves a conversation to the top after a new message", async () => {
      await request("POST", "/1/messages", { text: "Yes, it is." });
      const { body } = await request("GET", "");
      expect(body.map((conversation) => conversation.id)).to.deep.equal([1, 2]);
    });
  });

  describe("GET /api/conversations/:id", () => {
    it("returns a conversation the current user is part of", async () => {
      const { status, body } = await request("GET", "/1");
      expect(status).to.equal(200);
      expect(body).to.deep.equal(data.conversations[0]);
    });

    it("returns 403 for another student's conversation", async () => {
      const { status, body } = await request("GET", "/3");
      expect(status).to.equal(403);
      expect(body).to.deep.equal({ error: "You can only open your own conversations." });
    });

    it("returns 404 for an unknown conversation", async () => {
      for (const id of ["999", "abc"]) {
        const { status, body } = await request("GET", `/${id}`);
        expect(status).to.equal(404);
        expect(body).to.deep.equal({ error: "Conversation not found." });
      }
    });
  });

  describe("POST /api/conversations/:id/messages", () => {
    it("adds a trimmed text message from the current user", async () => {
      const { status, body } = await request("POST", "/1/messages", { text: "  On my way.  " });
      expect(status).to.equal(201);
      expect(body).to.include({ senderId: "owner-1", type: "text", text: "On my way." });
      expect(new Date(body.sentAt).toISOString()).to.equal(body.sentAt);
      expect(data.conversations[0].messages.at(-1)).to.deep.equal(body);
      expect((await request("GET", "/1")).body.messages.at(-1)).to.deep.equal(body);
    });

    it("gives message IDs that are unique across all conversations", async () => {
      const first = await request("POST", "/1/messages", { text: "One" });
      const second = await request("POST", "/2/messages", { text: "Two" });
      expect([first.body.id, second.body.id]).to.deep.equal([8, 9]);
    });

    it("ignores a submitted sender, ID, type, or time", async () => {
      const { body } = await request("POST", "/1/messages", {
        text: "Hello", senderId: "student-2", id: 1, type: "offer", sentAt: "2000-01-01T00:00:00Z",
      });
      expect(body).to.include({ senderId: "owner-1", type: "text", id: 8 });
      expect(body.sentAt).to.not.equal("2000-01-01T00:00:00Z");
    });

    for (const [name, body] of [
      ["a missing body", undefined],
      ["missing text", {}],
      ["empty text", { text: "" }],
      ["spaces-only text", { text: "   " }],
      ["non-string text", { text: 5 }],
      ["an array body", ["Hello"]],
    ]) {
      it(`rejects ${name} without saving anything`, async () => {
        const { status, body: error } = await request("POST", "/1/messages", body);
        expect(status).to.equal(400);
        expect(error).to.deep.equal({ error: "Message text is required." });
        expect(data.conversations[0].messages).to.have.length(1);
      });
    }

    it("returns 403 for another student's conversation without saving", async () => {
      const { status } = await request("POST", "/3/messages", { text: "Hi" });
      expect(status).to.equal(403);
      expect(data.conversations[2].messages).to.have.length(1);
    });

    it("returns 404 for an unknown conversation", async () => {
      const { status, body } = await request("POST", "/999/messages", { text: "Hi" });
      expect(status).to.equal(404);
      expect(body).to.deep.equal({ error: "Conversation not found." });
    });
  });

  const offerDetails = () => ({ totalPrice: 12.345, startDate: "2099-01-10", endDate: "2099-01-12" });

  describe("POST /api/conversations/:id/offers", () => {
    it("adds a pending offer from the current user with the total rounded to cents", async () => {
      const { status, body } = await request("POST", "/1/offers", offerDetails());
      expect(status).to.equal(201);
      expect(body).to.include({
        id: 8, senderId: "owner-1", type: "offer", totalPrice: 12.35,
        startDate: "2099-01-10", endDate: "2099-01-12", status: "pending",
      });
      expect(data.conversations[0].messages.at(-1)).to.deep.equal(body);
    });

    it("marks the previous pending offer as countered", async () => {
      const first = await request("POST", "/1/offers", offerDetails());
      const second = await request("POST", "/1/offers", { ...offerDetails(), totalPrice: 10 });
      const messages = data.conversations[0].messages;
      expect(messages.find((message) => message.id === first.body.id).status).to.equal("countered");
      expect(messages.find((message) => message.id === second.body.id).status).to.equal("pending");
    });

    it("ignores a submitted sender, ID, or status", async () => {
      const { body } = await request("POST", "/1/offers", {
        ...offerDetails(), senderId: "student-2", id: 1, status: "accepted",
      });
      expect(body).to.include({ senderId: "owner-1", id: 8, status: "pending" });
    });

    for (const [name, changes] of [
      ["a missing total", { totalPrice: undefined }],
      ["a negative total", { totalPrice: -1 }],
      ["a string total", { totalPrice: "12" }],
      ["a missing start date", { startDate: undefined }],
      ["an impossible date", { startDate: "2099-02-30" }],
      ["a wrongly formatted date", { endDate: "12/01/2099" }],
      ["an end date before the start", { endDate: "2099-01-09" }],
      ["an end date equal to the start", { endDate: "2099-01-10" }],
      ["a start date in the past", { startDate: "2000-01-01", endDate: "2000-01-03" }],
    ]) {
      it(`rejects ${name} without saving anything`, async () => {
        const { status } = await request("POST", "/1/offers", { ...offerDetails(), ...changes });
        expect(status).to.equal(400);
        expect(data.conversations[0].messages).to.have.length(1);
      });
    }

    it("rejects a missing body", async () => {
      expect((await request("POST", "/1/offers")).status).to.equal(400);
    });

    it("returns 403 for another student's conversation and 404 for an unknown one", async () => {
      expect((await request("POST", "/3/offers", offerDetails())).status).to.equal(403);
      expect((await request("POST", "/999/offers", offerDetails())).status).to.equal(404);
      expect(data.conversations[2].messages).to.have.length(1);
    });
  });

  describe("accepting and declining offers", () => {
    // student-2 offers owner-1 their own Desk lamp in conversation 2.
    let offer;

    beforeEach(() => {
      offer = {
        id: 20, senderId: "student-2", type: "offer", totalPrice: 9,
        startDate: "2099-01-10", endDate: "2099-01-12", status: "pending", sentAt: "2026-11-05T10:00:00Z",
      };
      data.conversations[1].messages.push(offer);
    });

    it("accepts the other student's offer as a confirmed booking", async () => {
      const { status, body } = await request("POST", "/2/offers/20/accept");
      expect(status).to.equal(201);
      expect(body.booking).to.deep.equal({
        id: 102, listingId: 1, ownerId: "owner-1", borrowerId: "student-2",
        startDate: "2099-01-10", endDate: "2099-01-12", status: "confirmed",
        terms: { pricePerDay: 5, rentalTerms: "Return clean.", message: "Terms agreed in chat." },
        totalPrice: 9, createdAt: body.booking.createdAt, extensionRequest: null,
      });
      expect(body.booking.createdAt).to.match(/^\d{4}-\d{2}-\d{2}$/);
      expect(body.offer).to.include({ id: 20, status: "accepted", bookingId: 102 });
      expect(data.rentals.at(-1)).to.deep.equal(body.booking);
      expect(offer).to.deep.equal(body.offer);
    });

    it("declines the other student's offer without creating a booking", async () => {
      const { status, body } = await request("POST", "/2/offers/20/decline");
      expect(status).to.equal(200);
      expect(body).to.include({ id: 20, status: "declined" });
      expect(data.rentals).to.have.length(1);
    });

    for (const action of ["accept", "decline"]) {
      it(`returns 403 when you ${action} your own offer`, async () => {
        offer.senderId = "owner-1";
        const { status, body } = await request("POST", `/2/offers/20/${action}`);
        expect(status).to.equal(403);
        expect(body).to.deep.equal({ error: "You cannot answer your own offer." });
        expect(offer.status).to.equal("pending");
      });

      it(`returns 409 when you ${action} an offer that was already answered`, async () => {
        offer.status = "countered";
        const { status, body } = await request("POST", `/2/offers/20/${action}`);
        expect(status).to.equal(409);
        expect(body).to.deep.equal({ error: "Offer is already countered." });
        expect(data.rentals).to.have.length(1);
      });

      it(`returns 404 when you ${action} a text message or unknown offer`, async () => {
        for (const messageId of ["2", "999", "abc"]) {
          const { status, body } = await request("POST", `/2/offers/${messageId}/${action}`);
          expect(status).to.equal(404);
          expect(body).to.deep.equal({ error: "Offer not found." });
        }
      });

      it(`returns 403 when you ${action} in another student's conversation`, async () => {
        expect((await request("POST", `/3/offers/7/${action}`)).status).to.equal(403);
      });
    }

    it("cannot accept the same offer twice", async () => {
      expect((await request("POST", "/2/offers/20/accept")).status).to.equal(201);
      expect((await request("POST", "/2/offers/20/accept")).status).to.equal(409);
      expect(data.rentals).to.have.length(2);
    });

    it("returns 409 when the offer's dates have passed", async () => {
      Object.assign(offer, { startDate: "2000-01-01", endDate: "2000-01-03" });
      const { status, body } = await request("POST", "/2/offers/20/accept");
      expect(status).to.equal(409);
      expect(body).to.deep.equal({ error: "This offer's dates have already passed." });
      expect(offer.status).to.equal("pending");
    });

    it("returns 409 when the listing is no longer published", async () => {
      data.listings[0].status = "paused";
      const { status, body } = await request("POST", "/2/offers/20/accept");
      expect(status).to.equal(409);
      expect(body).to.deep.equal({ error: "This listing is no longer available." });
      expect(offer.status).to.equal("pending");
      expect(data.rentals).to.have.length(1);
    });
  });
});
