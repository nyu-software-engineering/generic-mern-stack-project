import { afterEach, beforeEach, describe, it } from "mocha";
import { expect } from "chai";
import { createApp } from "../app.js";
import { maxDescriptionLength } from "../routes/reports.js";
import { createMockDataStore } from "../services/mockData.js";
import { mockData } from "./fixtures.js";
import { startTestServer } from "./helpers/server.js";

const details = () => ({ reason: "Damage", description: "  Cracked screen.  ", rentalId: 101 });

describe("Reporting routes (#118)", () => {
  let server;
  let data;

  beforeEach(async () => {
    const store = createMockDataStore({ apiKey: "test-key", fetchImpl: async () => Response.json(mockData()) });
    data = await store.load();
    server = await startTestServer(createApp({ store }));
  });

  afterEach(async () => { await server?.close(); });

  async function api(method, path, body) {
    const response = await fetch(`${server.baseUrl}/api${path}`, {
      method,
      headers: { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return { status: response.status, body: await response.json() };
  }

  describe("POST /api/reports", () => {
    it("creates a report, trims the text and links the rental's listing", async () => {
      const response = await api("POST", "/reports", details());
      expect(response.status).to.equal(201);
      expect(response.body).to.include({
        id: "DS-101", reporterId: "owner-1", rentalId: "101", listingId: "1",
        conversationId: "", reason: "Damage", description: "Cracked screen.",
        status: "awaiting moderator review",
      });
      expect(response.body.createdAt).to.be.a("string");
      expect(data.reports).to.have.length(1);
    });

    it("gives each report its own id", async () => {
      await api("POST", "/reports", details());
      const second = await api("POST", "/reports", details());
      expect(second.body.id).to.equal("DS-102");
    });

    it("links a conversation and takes the listing from it", async () => {
      const response = await api("POST", "/reports", { reason: "Unsafe listing", description: "Odd.", conversationId: 1 });
      expect(response.status).to.equal(201);
      expect(response.body).to.include({ conversationId: "1", rentalId: "", listingId: "1" });
    });

    it("links a listing reported directly", async () => {
      const response = await api("POST", "/reports", { reason: "Other", description: "Odd.", listingId: 1 });
      expect(response.status).to.equal(201);
      expect(response.body).to.include({ rentalId: "", conversationId: "", listingId: "1" });
    });

    it("rejects a request with no body", async () => {
      const response = await fetch(`${server.baseUrl}/api/reports`, { method: "POST" });
      expect(response.status).to.equal(400);
      expect(await response.json()).to.deep.equal({ error: "Invalid report details." });
    });

    it("leaves every link blank when none are given", async () => {
      const response = await api("POST", "/reports", { reason: "Other", description: "Odd." });
      expect(response.body).to.include({ rentalId: "", conversationId: "", listingId: "" });
    });

    it("rejects ids that match no record", async () => {
      for (const body of [{ rentalId: 999 }, { conversationId: 999 }, { listingId: 999 }]) {
        const response = await api("POST", "/reports", { reason: "Other", description: "Odd.", ...body });
        expect(response.status).to.equal(400);
      }
      expect(data.reports ?? []).to.have.length(0);
    });

    describe("records the reporter is not part of (#132)", () => {
      beforeEach(() => {
        data.users.push({ id: "other-3", name: "Other" }, { id: "other-4", name: "Other 2" });
        data.listings.push(
          { ...data.listings[0], id: 2, ownerId: "other-3" },
          { ...data.listings[0], id: 3, ownerId: "other-3", status: "draft" },
        );
        data.rentals.push({ ...data.rentals[0], id: 202, listingId: 2, ownerId: "other-3", borrowerId: "other-4" });
        data.conversations.push({ id: 2, listingId: 2, participantIds: ["other-3", "other-4"], messages: [] });
      });

      it("rejects another pair's rental", async () => {
        const response = await api("POST", "/reports", { reason: "Other", description: "Odd.", rentalId: 202 });
        expect(response.status).to.equal(400);
        expect(data.reports ?? []).to.have.length(0);
      });

      it("rejects another pair's conversation", async () => {
        const response = await api("POST", "/reports", { reason: "Other", description: "Odd.", conversationId: 2 });
        expect(response.status).to.equal(400);
        expect(data.reports ?? []).to.have.length(0);
      });

      it("rejects the pair's records even when the reporter's own are also sent", async () => {
        const response = await api("POST", "/reports", {
          reason: "Other", description: "Odd.", rentalId: 101, conversationId: 2,
        });
        expect(response.status).to.equal(400);
      });

      it("treats another pair's records like unknown ones", async () => {
        const others = await api("POST", "/reports", { reason: "Other", description: "Odd.", rentalId: 202 });
        const unknown = await api("POST", "/reports", { reason: "Other", description: "Odd.", rentalId: 999 });
        expect(others).to.deep.equal(unknown);
      });

      it("allows reporting another owner's published listing directly", async () => {
        const response = await api("POST", "/reports", { reason: "Unsafe listing", description: "Odd.", listingId: 2 });
        expect(response.status).to.equal(201);
        expect(response.body.listingId).to.equal("2");
      });

      it("rejects another owner's unpublished listing", async () => {
        const response = await api("POST", "/reports", { reason: "Other", description: "Odd.", listingId: 3 });
        expect(response.status).to.equal(400);
      });

      it("still links a listing that was paused after the reporter's own rental", async () => {
        data.listings[0].status = "paused";
        const response = await api("POST", "/reports", { reason: "Damage", description: "Odd.", rentalId: 101 });
        expect(response.status).to.equal(201);
        expect(response.body.listingId).to.equal("1");
      });
    });

    describe("conflicting references", () => {
      beforeEach(() => {
        data.listings.push({ ...data.listings[0], id: 2, ownerId: "student-2" });
        // The reporter is in a conversation about listing 2 and a rental for listing 1.
        data.conversations.push({ id: 2, listingId: 2, participantIds: ["owner-1", "student-2"], messages: [] });
      });

      const send = (body) => api("POST", "/reports", { reason: "Damage", description: "Odd.", ...body });

      it("rejects a rental and a conversation about different listings", async () => {
        const response = await send({ rentalId: 101, conversationId: 2 });
        expect(response.status).to.equal(400);
        expect(response.body).to.deep.equal({ error: "Invalid report details." });
        expect(data.reports ?? []).to.have.length(0);
      });

      it("rejects a direct listing that differs from the rental's", async () => {
        expect((await send({ rentalId: 101, listingId: 2 })).status).to.equal(400);
      });

      it("rejects a direct listing that differs from the conversation's", async () => {
        expect((await send({ conversationId: 1, listingId: 2 })).status).to.equal(400);
      });

      it("accepts references that all agree, with ids as text or numbers", async () => {
        const response = await send({ rentalId: 101, conversationId: 1, listingId: "1" });
        expect(response.status).to.equal(201);
        expect(response.body).to.include({ rentalId: "101", conversationId: "1", listingId: "1" });
      });
    });

    describe("description and image name limits", () => {
      const send = (body) => api("POST", "/reports", { reason: "Other", description: "Odd.", ...body });

      it("accepts a description of exactly the maximum length and rejects one longer", async () => {
        expect((await send({ description: "a".repeat(maxDescriptionLength) })).status).to.equal(201);
        expect((await send({ description: "a".repeat(maxDescriptionLength + 1) })).status).to.equal(400);
      });

      it("measures the description after trimming", async () => {
        const response = await send({ description: ` ${"a".repeat(maxDescriptionLength)} ` });
        expect(response.status).to.equal(201);
      });

      for (const name of ["photo.jpg", "my photo (1).png", "café’s.jpeg", "", "a".repeat(255)]) {
        it(`accepts the image name "${name.slice(0, 20)}"`, async () => {
          expect((await send({ imageName: name })).status).to.equal(201);
        });
      }

      for (const [label, name] of [
        ["a parent folder path", "../../etc/passwd"],
        ["a Windows path", "C:\\photos\\a.png"],
        ["a folder", "photos/a.png"],
        ["angle brackets", "<script>alert(1)</script>.png"],
        ["a control character", "a\u0000.png"],
        ["a newline", "a\n.png"],
        ["a right-to-left override", "photo\u202egpj.exe"],
        ["a zero-width space", "a\u200b.png"],
        ["a dot name", ".."],
        ["more than 255 characters", "a".repeat(256)],
      ]) {
        it(`rejects an image name with ${label}`, async () => {
          expect((await send({ imageName: name })).status).to.equal(400);
        });
      }
    });

    describe("malformed ids (#132)", () => {
      for (const [name, value] of [
        ["object with a null toString", { toString: null }],
        ["array", [1]],
        ["boolean", true],
        ["fraction", 1.5],
        ["nested object", { id: 1 }],
      ]) {
        for (const field of ["rentalId", "conversationId", "listingId"]) {
          it(`rejects ${name} as ${field} with 400`, async () => {
            const response = await api("POST", "/reports", { reason: "Other", description: "Odd.", [field]: value });
            expect(response.status).to.equal(400);
            expect(response.body).to.deep.equal({ error: "Invalid report details." });
          });
        }
      }

      it("accepts ids sent as text or left empty", async () => {
        const text = await api("POST", "/reports", { reason: "Other", description: "Odd.", rentalId: "101" });
        expect(text.status).to.equal(201);
        const empty = await api("POST", "/reports", { reason: "Other", description: "Odd.", rentalId: "", listingId: null });
        expect(empty.status).to.equal(201);
        expect(empty.body).to.include({ rentalId: "", listingId: "" });
      });
    });

    for (const [name, change] of [
      ["missing reason", { reason: undefined }],
      ["unknown reason", { reason: "Spam" }],
      ["missing description", { description: undefined }],
      ["blank description", { description: "   " }],
      ["non-string description", { description: 5 }],
      ["non-string image name", { imageName: 5 }],
    ]) {
      it(`rejects ${name}`, async () => {
        const response = await api("POST", "/reports", { ...details(), ...change });
        expect(response.status).to.equal(400);
        expect(response.body).to.deep.equal({ error: "Invalid report details." });
        expect(data.reports ?? []).to.have.length(0);
      });
    }
  });

  describe("GET /api/reports/:id", () => {
    it("returns a report the current user filed", async () => {
      const created = await api("POST", "/reports", details());
      const response = await api("GET", "/reports/DS-101");
      expect(response.status).to.equal(200);
      expect(response.body).to.deep.equal(created.body);
    });

    it("returns 404 for an unknown id", async () => {
      const response = await api("GET", "/reports/DS-999");
      expect(response.status).to.equal(404);
      expect(response.body).to.deep.equal({ error: "Report not found." });
    });

    it("returns 404 for another user's report", async () => {
      data.reports = [{ id: "DS-500", reporterId: "student-2", reason: "Other", description: "x" }];
      const response = await api("GET", "/reports/DS-500");
      expect(response.status).to.equal(404);
    });
  });

  describe("GET /api/community-rules", () => {
    it("returns the rules as a list", async () => {
      const response = await api("GET", "/community-rules");
      expect(response.status).to.equal(200);
      expect(response.body.map((rule) => rule.id)).to.deep.equal(["suitable-items", "prohibited-items", "sharing-rules"]);
      for (const rule of response.body) expect(rule.title && rule.body).to.be.a("string");
    });
  });
});
