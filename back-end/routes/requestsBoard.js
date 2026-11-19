// Requests board route (#114). One list of Quick Borrow and item requests for the board tabs.
// Same rules as the front-end getBoardRequests(): "mine" shows only the current user's
// requests, every other tab shows only other people's. Each request gets type "quick" or "item".
import { Router } from "express";
import { getOpenItemRequests } from "../services/itemRequests.js";

export const requestsBoardRouter = Router();

const TYPES = ["all", "quick", "item", "mine"];

requestsBoardRouter.get("/", async (request, response) => {
  const { type = "all" } = request.query;
  if (!TYPES.includes(type)) {
    return response.status(400).json({ error: `type must be one of: ${TYPES.join(", ")}.` });
  }

  const data = await request.app.locals.mockDataStore.load();
  const requests = [
    ...data.quickBorrowRequests.map((item) => ({ ...item, type: "quick" })),
    ...getOpenItemRequests(data).map((item) => ({ ...item, type: "item" })),
  ];
  const isMine = (item) => String(item.requesterId) === String(request.currentUserId);

  response.json(
    requests
      .filter((item) => (type === "mine" ? isMine(item) : !isMine(item) && (type === "all" || item.type === type)))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  );
});
