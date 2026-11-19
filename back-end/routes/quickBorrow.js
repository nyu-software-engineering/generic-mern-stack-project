// Quick Borrow routes (#114). Read and add requests in the shared mock data store (#88);
// nothing is saved to a database yet.
//
// A Quick Borrow request looks like:
//   { id, requesterId, itemName, neededBy, neededTime, borrowDuration,
//     approximateArea, details, status: "open", createdAt }
import { Router } from "express";

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
