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
});
