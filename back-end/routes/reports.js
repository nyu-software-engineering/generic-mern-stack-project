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
const sameId = (first, second) => first === second || String(first) === String(second);

// A record id sent by the client: absent, text, or a whole number. Anything else
// (objects, arrays, booleans, floats) is rejected before any lookup runs.
const isIdInput = (value) =>
  value === undefined || value === null || typeof value === "string" || Number.isSafeInteger(value);
const hasId = (value) => value !== undefined && value !== null && value !== "";

export const maxDescriptionLength = 2000;
const maxImageNameLength = 255;
// A plain file name: no folders, angle brackets, control characters or invisible
// text-direction marks (which can disguise an extension, as in "photo\u202egpj.exe").
const isImageName = (value) =>
  value.length <= maxImageNameLength && ![".", ".."].includes(value) &&
  !/[\\/<>\u0000-\u001f\u007f\u200b-\u200f\u2028-\u202e\u2066-\u2069\ufeff]/.test(value);

reportsRouter.post("/", async (request, response) => {
  const { reason, description, imageName = "", rentalId, listingId, conversationId } = request.body ?? {};
  const trimmed = text(description);
  if (!reportReasons.includes(reason) || !trimmed || trimmed.length > maxDescriptionLength ||
      typeof imageName !== "string" || !isImageName(imageName.trim()) ||
      ![rentalId, listingId, conversationId].every(isIdInput)) {
    return response.status(400).json({ error: "Invalid report details." });
  }

  const data = await request.app.locals.mockDataStore.load();
  const { currentUserId } = request;
  // A report can only point at records the reporter is part of. Unknown records and
  // other people's records get the same answer, so ids can't be probed.
  const rental = hasId(rentalId)
    ? data.rentals.find((item) => sameId(item.id, rentalId) &&
        (sameId(item.ownerId, currentUserId) || sameId(item.borrowerId, currentUserId)))
    : undefined;
  const conversation = hasId(conversationId)
    ? data.conversations.find((item) => sameId(item.id, conversationId) &&
        item.participantIds.some((id) => sameId(id, currentUserId)))
    : undefined;
  if ((hasId(rentalId) && !rental) || (hasId(conversationId) && !conversation)) {
    return response.status(400).json({ error: "Invalid report details." });
  }

  // Every reference must agree on one listing, so a moderator sees a consistent report.
  const linkedListingIds = [rental?.listingId, conversation?.listingId, hasId(listingId) ? listingId : undefined]
    .filter((id) => id !== undefined);
  if (!linkedListingIds.every((id) => sameId(id, linkedListingIds[0]))) {
    return response.status(400).json({ error: "Invalid report details." });
  }

  // A listing reached through the reporter's own rental or conversation is always
  // allowed. One reported directly must be published or the reporter's own.
  const viaRecord = rental?.listingId ?? conversation?.listingId;
  const listing = viaRecord !== undefined
    ? data.listings.find((item) => sameId(item.id, viaRecord))
    : hasId(listingId)
      ? data.listings.find((item) => sameId(item.id, listingId) &&
          (item.status === "published" || sameId(item.ownerId, currentUserId)))
      : undefined;
  if (viaRecord === undefined && hasId(listingId) && !listing) {
    return response.status(400).json({ error: "Invalid report details." });
  }

  data.reports ??= [];
  const report = {
    id: `DS-${data.reports.length + 101}`,
    reporterId: currentUserId,
    rentalId: rental ? String(rental.id) : "",
    conversationId: conversation ? String(conversation.id) : "",
    listingId: listing ? String(listing.id) : "",
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
