// Quick Borrow routes (#114). Read and add requests in the shared mock data store (#88);
// nothing is saved to a database yet.
//
// A Quick Borrow request looks like:
//   { id, requesterId, itemName, neededBy, neededTime, borrowDuration,
//     approximateArea, details, status: "open", createdAt }
import { Router } from "express";
import { isDate } from "./bookings.js";

export const quickBorrowRouter = Router();

// Load the shared data before every quick borrow route.
quickBorrowRouter.use(async (request, _response, next) => {
  request.data = await request.app.locals.mockDataStore.load();
  next();
});

// Every open request, newest first.
quickBorrowRouter.get("/", (request, response) => {
  const requests = [...request.data.quickBorrowRequests].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
  response.json(requests);
});

const REQUIRED_TEXT = ["itemName", "borrowDuration", "approximateArea", "details"];

// Add a request from the current user. neededTime is optional, the rest are required.
quickBorrowRouter.post("/", (request, response) => {
  const { data, currentUserId } = request;
  const body = request.body ?? {};
  const { neededBy, neededTime = "" } = body;

  if (REQUIRED_TEXT.some((field) => typeof body[field] !== "string" || !body[field].trim())) {
    return response.status(400).json({ error: `${REQUIRED_TEXT.join(", ")} must be non-empty text.` });
  }
  if (!isDate(neededBy)) {
    return response.status(400).json({ error: "neededBy must be a date in YYYY-MM-DD form." });
  }
  if (typeof neededTime !== "string") {
    return response.status(400).json({ error: "neededTime must be text." });
  }

  const quickBorrowRequest = {
    id: Math.max(0, ...data.quickBorrowRequests.map((item) => item.id)) + 1,
    requesterId: currentUserId,
    itemName: body.itemName.trim(),
    borrowDuration: body.borrowDuration.trim(),
    approximateArea: body.approximateArea.trim(),
    details: body.details.trim(),
    neededBy,
    neededTime,
    status: "open",
    createdAt: new Date().toISOString(),
  };
  data.quickBorrowRequests.push(quickBorrowRequest);
  response.status(201).json(quickBorrowRequest);
});
