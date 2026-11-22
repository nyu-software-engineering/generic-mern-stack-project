import { afterEach, beforeEach, describe, it } from "mocha";
import { expect } from "chai";
import { validateMockData } from "../../shared/validateMockData.mjs";
import { createApp } from "../app.js";
import { mockData } from "./fixtures.js";
import { startTestServer } from "./helpers/server.js";

describe("Item request routes (#105)", () => {
  let data;
  let server;

  // The current user is owner-1. Request 1 is from student-2 and already has a reply in
  // conversation 1 about owner-1's Desk lamp. Request 2 is owner-1's own, request 3 is closed.
  beforeEach(async () => {
    data = mockData();
    Object.assign(data.itemRequests[0], { neededBy: "2099-01-10", neededUntil: "2099-01-12" });
    data.itemRequests.push(
      { ...data.itemRequests[0], id: 2, requesterId: "owner-1", itemName: "HDMI cable",
        createdAt: "2026-11-02T09:00:00Z", responses: [] },
      { ...data.itemRequests[0], id: 3, itemName: "Kettle", status: "closed",
        createdAt: "2026-11-03T09:00:00Z", responses: [] },
    );
    const [lamp] = data.listings;
    data.listings.push(
      { ...lamp, id: 2, title: "Old lamp", status: "paused" },
      { ...lamp, id: 3, ownerId: "student-2", title: "Their projector" },
      { ...lamp, id: 4, title: "Projector" },
    );
    server = await startTestServer(createApp({ store: { load: async () => data } }));
  });

  afterEach(async () => { await server?.close(); });

  async function request(method, path, body) {
    const response = await fetch(`${server.baseUrl}/api/item-requests${path}`, {
      method,
      headers: { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: response.status, body: await response.json() };
  }

  const details = () => ({
    itemName: "  Rice cooker  ", neededBy: "2099-02-01", neededUntil: "2099-02-03",
    approximateArea: "  Library  ", targetPrice: 12.345, details: "  Small one is fine.  ",
  });

  describe("GET /api/item-requests", () => {
    it("returns open requests, newest first", async () => {
      const { status, body } = await request("GET", "");
      expect(status).to.equal(200);
      expect(body.map((item) => item.id)).to.deep.equal([2, 1]);
    });
  });

  describe("who can see responses", () => {
    const otherReply = { responderId: "student-3", conversationId: 99, messageIds: [5] };

    it("hides other students' responses on someone else's request", async () => {
      data.itemRequests[0].responses.push(otherReply);
      const own = { responderId: "owner-1", conversationId: 1, messageIds: [1] };
      expect((await request("GET", "/1")).body.responses).to.deep.equal([own]);
      expect((await request("GET", "")).body.find((item) => item.id === 1).responses).to.deep.equal([own]);
      expect(data.itemRequests[0].responses).to.have.length(2);
    });

    it("shows every response to the requester", async () => {
      data.itemRequests[1].responses.push(otherReply);
      expect((await request("GET", "/2")).body.responses).to.deep.equal([otherReply]);
    });

    it("returns only your own responses after you respond", async () => {
      data.itemRequests[0].responses.push(otherReply);
      const { body } = await request("POST", "/1/responses", { listingId: 4, message: "Hi" });
      expect(body.request.responses.map((item) => item.responderId)).to.deep.equal(["owner-1", "owner-1"]);
      expect(data.itemRequests[0].responses).to.have.length(3);
    });
  });

  describe("GET /api/item-requests/:id", () => {
    it("returns one request, including a closed one", async () => {
      expect((await request("GET", "/3")).body).to.deep.equal(data.itemRequests[2]);
    });

    it("returns 404 for an unknown request", async () => {
      for (const id of ["999", "abc"]) {
        const { status, body } = await request("GET", `/${id}`);
        expect(status).to.equal(404);
        expect(body).to.deep.equal({ error: "Item request not found." });
      }
    });
  });

  describe("POST /api/item-requests", () => {
    it("creates an open request from the current user with trimmed text", async () => {
      const { status, body } = await request("POST", "", details());
      expect(status).to.equal(201);
      expect(body).to.deep.equal({
        id: 4, requesterId: "owner-1", itemName: "Rice cooker", neededBy: "2099-02-01",
        neededUntil: "2099-02-03", approximateArea: "Library", targetPrice: 12.35,
        details: "Small one is fine.", status: "open", responses: [], createdAt: body.createdAt,
      });
      expect(new Date(body.createdAt).toISOString()).to.equal(body.createdAt);
      expect((await request("GET", "")).body[0]).to.deep.equal(body);
    });

    it("allows a missing target price and details", async () => {
      const { targetPrice, details: _details, ...rest } = details();
      const { status, body } = await request("POST", "", rest);
      expect(status).to.equal(201);
      expect(body).to.include({ targetPrice: null, details: "" });
    });

    it("ignores a submitted ID, requester, status, or responses", async () => {
      const { body } = await request("POST", "", {
        ...details(), id: 1, requesterId: "student-2", status: "closed", responses: [{ conversationId: 1 }],
      });
      expect(body).to.include({ id: 4, requesterId: "owner-1", status: "open" });
      expect(body.responses).to.deep.equal([]);
    });

    for (const [name, changes, field, message] of [
      ["a missing item name", { itemName: undefined }, "itemName", "Say what you need."],
      ["a blank item name", { itemName: "   " }, "itemName", "Say what you need."],
      ["an impossible start date", { neededBy: "2099-02-30" }, "neededBy", "Pick the date you need it from."],
      ["a past start date", { neededBy: "2000-01-01", neededUntil: "2000-01-03" }, "neededBy", "This date cannot be in the past."],
      ["a missing end date", { neededUntil: undefined }, "neededUntil", "Pick the date you need it until."],
      ["an end date before the start", { neededUntil: "2099-01-31" }, "neededUntil", "Must be after the start date."],
      ["a blank area", { approximateArea: " " }, "approximateArea", "Add an approximate area."],
      ["a negative target price", { targetPrice: -1 }, "targetPrice", "Enter $0 or more, or leave it blank."],
      ["a string target price", { targetPrice: "12" }, "targetPrice", "Enter $0 or more, or leave it blank."],
      ["a target price that rounds to Infinity", { targetPrice: 1e307 }, "targetPrice", "Enter $0 or more, or leave it blank."],
      ["non-string details", { details: 5 }, "details", "Details must be text."],
      ["an item name over 100 characters", { itemName: "x".repeat(101) }, "itemName", "Keep it under 100 characters."],
      ["an area over 100 characters", { approximateArea: "x".repeat(101) }, "approximateArea", "Keep it under 100 characters."],
      ["details over 1000 characters", { details: "x".repeat(1001) }, "details", "Keep it under 1000 characters."],
    ]) {
      it(`rejects ${name} with a field error and saves nothing`, async () => {
        const { status, body } = await request("POST", "", { ...details(), ...changes });
        expect(status).to.equal(400);
        expect(body.error).to.equal("Invalid item request.");
        expect(body.errors).to.deep.equal({ [field]: message });
        expect(data.itemRequests).to.have.length(3);
      });
    }

    it("accepts text exactly at the limits, measured after trimming", async () => {
      const { status, body } = await request("POST", "", {
        ...details(), itemName: `  ${"x".repeat(100)}  `, approximateArea: "y".repeat(100), details: "z".repeat(1000),
      });
      expect(status).to.equal(201);
      expect(body.itemName).to.have.length(100);
    });

    it("lists every missing field for an empty or non-object body", async () => {
      for (const body of [undefined, {}, ["Rice cooker"]]) {
        const { status, body: error } = await request("POST", "", body);
        expect(status).to.equal(400);
        expect(Object.keys(error.errors)).to.have.members(["itemName", "neededBy", "neededUntil", "approximateArea"]);
      }
    });
  });

  describe("POST /api/item-requests/:id/responses", () => {
    it("starts a new conversation with the requester about another of your listings", async () => {
      const { status, body } = await request("POST", "/1/responses", { listingId: 4, message: "  I have one.  " });
      expect(status).to.equal(201);
      expect(body.conversation).to.deep.include({ id: 2, listingId: 4, participantIds: ["owner-1", "student-2"] });
      expect(body.conversation.messages).to.have.length(1);
      expect(body.conversation.messages[0]).to.include({ id: 2, senderId: "owner-1", type: "text", text: "I have one." });
      expect(body.request.responses.at(-1)).to.deep.equal({ responderId: "owner-1", conversationId: 2, messageIds: [2] });
      expect(data.conversations.at(-1)).to.deep.equal(body.conversation);
    });

    it("continues an existing conversation and adds to the earlier response", async () => {
      const { body } = await request("POST", "/1/responses", { listingId: 1, message: "Still available." });
      expect(body.conversation.id).to.equal(1);
      expect(data.conversations).to.have.length(1);
      expect(data.itemRequests[0].responses).to.deep.equal([
        { responderId: "owner-1", conversationId: 1, messageIds: [1, 2] },
      ]);
    });

    it("sends a message and an offer for the requested dates", async () => {
      const { body } = await request("POST", "/1/responses", { listingId: 4, message: "Here:", totalPrice: 9.999 });
      const [text, offer] = body.conversation.messages;
      expect(text).to.include({ id: 2, type: "text" });
      expect(offer).to.include({
        id: 3, senderId: "owner-1", type: "offer", totalPrice: 10,
        startDate: "2099-01-10", endDate: "2099-01-12", status: "pending",
      });
      expect(body.request.responses.at(-1).messageIds).to.deep.equal([2, 3]);
    });

    it("sends an offer on its own and counters an earlier pending offer", async () => {
      await request("POST", "/1/responses", { listingId: 4, totalPrice: 15 });
      const { body } = await request("POST", "/1/responses", { listingId: 4, totalPrice: 12 });
      expect(body.conversation.messages.map((message) => message.status)).to.deep.equal(["countered", "pending"]);
    });

    it("keeps the shared mock data valid after responding and posting", async () => {
      await request("POST", "/1/responses", { listingId: 4, message: "Hi", totalPrice: 5 });
      await request("POST", "/1/responses", { listingId: 1, message: "Also this one" });
      await request("POST", "", details());
      expect(() => validateMockData(data)).to.not.throw();
    });

    it("returns 403 for your own request and 409 for a closed one", async () => {
      const own = await request("POST", "/2/responses", { listingId: 4, message: "Hi" });
      expect(own.status).to.equal(403);
      expect(own.body).to.deep.equal({ error: "You cannot respond to your own request." });
      const closed = await request("POST", "/3/responses", { listingId: 4, message: "Hi" });
      expect(closed.status).to.equal(409);
      expect(closed.body).to.deep.equal({ error: "This request is closed." });
      expect(data.conversations).to.have.length(1);
    });

    it("returns 404 for an unknown request", async () => {
      expect((await request("POST", "/999/responses", { listingId: 4, message: "Hi" })).status).to.equal(404);
    });

    for (const [name, body, error] of [
      ["neither a message nor an offer", { listingId: 4, message: "   " }, "Send a message, an offer, or both."],
      ["a missing body", undefined, "Send a message, an offer, or both."],
      ["a non-string message", { listingId: 4, message: 5 }, "message must be text."],
      ["a message over 1000 characters", { listingId: 4, message: "x".repeat(1001) }, "message must be 1000 characters or fewer."],
      ["a negative offer", { listingId: 4, totalPrice: -1 }, "totalPrice must be a number of 0 or more."],
      ["a string offer", { listingId: 4, totalPrice: "9" }, "totalPrice must be a number of 0 or more."],
      ["an offer that rounds to Infinity", { listingId: 4, totalPrice: 1e307 }, "Offer total is too large."],
      ["a missing listing", { message: "Hi" }, "A positive integer listingId is required."],
      ["a string listing ID", { listingId: "4", message: "Hi" }, "A positive integer listingId is required."],
      ["another student's listing", { listingId: 3, message: "Hi" }, "Choose one of your published listings."],
      ["a paused listing", { listingId: 2, message: "Hi" }, "Choose one of your published listings."],
      ["an unknown listing", { listingId: 999, message: "Hi" }, "Choose one of your published listings."],
    ]) {
      it(`rejects ${name} without changing anything`, async () => {
        const { status, body: response } = await request("POST", "/1/responses", body);
        expect(status).to.equal(400);
        expect(response).to.deep.equal({ error });
        expect(data.conversations).to.have.length(1);
        expect(data.itemRequests[0].responses).to.have.length(1);
      });
    }

    it("rejects an offer once the request's dates have passed, but still allows a message", async () => {
      Object.assign(data.itemRequests[0], { neededBy: "2000-01-01", neededUntil: "2000-01-03" });
      const offer = await request("POST", "/1/responses", { listingId: 4, totalPrice: 5 });
      expect(offer.status).to.equal(409);
      expect(offer.body).to.deep.equal({ error: "This request's dates have already passed." });
      expect((await request("POST", "/1/responses", { listingId: 4, message: "Hi" })).status).to.equal(201);
    });
  });

  describe("PATCH /api/item-requests/:id/close", () => {
    it("closes your own request and removes it from the open list", async () => {
      const { status, body } = await request("PATCH", "/2/close");
      expect(status).to.equal(200);
      expect(body).to.include({ id: 2, status: "closed" });
      expect((await request("GET", "")).body.map((item) => item.id)).to.deep.equal([1]);
    });

    it("returns 409 for a request that is already closed", async () => {
      await request("PATCH", "/2/close");
      const { status, body } = await request("PATCH", "/2/close");
      expect(status).to.equal(409);
      expect(body).to.deep.equal({ error: "This request is already closed." });
    });

    it("returns 403 for someone else's request and 404 for an unknown one", async () => {
      const other = await request("PATCH", "/1/close");
      expect(other.status).to.equal(403);
      expect(other.body).to.deep.equal({ error: "Only the requester can close this request." });
      expect(data.itemRequests[0].status).to.equal("open");
      expect((await request("PATCH", "/999/close")).status).to.equal(404);
    });
  });
});
