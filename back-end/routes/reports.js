import { Router } from "express";
import { reportReasons } from "../../shared/options.mjs";

export const reportsRouter = Router();
export const communityRulesRouter = Router();

export const communityRules = [
  {
    id: "suitable-items",
    title: "Suitable items",
    body: "Electronics, supplies, tools, sports gear, games and appropriate household items.",
  },
  {
    id: "prohibited-items",
    title: "Prohibited items",
    body: "Unsafe, illegal, age-restricted, controlled, medical, stolen or inappropriate goods.",
  },
  {
    id: "sharing-rules",
    title: "Simple sharing rules",
    body: "Meet in shared spaces. Agree on terms. Return items on time in the agreed condition. Report problems through DormShare.",
  },
];

const text = (value) => (typeof value === "string" ? value.trim() : "");
const sameId = (first, second) => String(first) === String(second);

// Returns the id as a string if it matches a record, otherwise an empty string.
const knownId = (records, id) => {
  const record = id === undefined ? undefined : records.find((item) => sameId(item.id, id));
  return record ? String(record.id) : "";
};

reportsRouter.post("/", async (request, response) => {
  const { reason, description, imageName = "", rentalId, listingId, conversationId } = request.body ?? {};
  const trimmed = text(description);
  if (!reportReasons.includes(reason) || !trimmed || typeof imageName !== "string") {
    return response.status(400).json({ error: "Invalid report details." });
  }

  const data = await request.app.locals.mockDataStore.load();
  data.reports ??= [];
  const rental = data.rentals.find((item) => sameId(item.id, rentalId));
  const conversation = data.conversations.find((item) => sameId(item.id, conversationId));
  const report = {
    id: `DS-${data.reports.length + 101}`,
    reporterId: request.currentUserId,
    rentalId: rental ? String(rental.id) : "",
    conversationId: conversation ? String(conversation.id) : "",
    // Unknown ids are dropped, so a report can only point at real records.
    listingId: knownId(data.listings, rental?.listingId ?? conversation?.listingId ?? listingId),
    reason,
    description: trimmed,
    imageName: imageName.trim(),
    status: "awaiting moderator review",
    createdAt: new Date().toISOString(),
  };
  data.reports.push(report);
  response.status(201).json(report);
});

reportsRouter.get("/:id", async (request, response) => {
  const data = await request.app.locals.mockDataStore.load();
  const report = (data.reports ?? []).find((item) => item.id === request.params.id);
  // Other users get the same 404, so report ids can't be probed.
  if (!report || report.reporterId !== request.currentUserId) {
    return response.status(404).json({ error: "Report not found." });
  }
  response.json(report);
});

communityRulesRouter.get("/", (_request, response) => {
  response.json(communityRules);
});
