import { Router } from "express";

export const conversationsRouter = Router();

const lastSentAt = (conversation) => Date.parse(conversation.messages.at(-1)?.sentAt) || 0;

// Message IDs are unique across all conversations, matching the frontend.
const nextMessageId = (conversations) =>
  Math.max(0, ...conversations.flatMap((conversation) => conversation.messages.map((message) => message.id))) + 1;

conversationsRouter.param("id", async (request, response, next, id) => {
  const data = await request.app.locals.mockDataStore.load();
  const conversation = data.conversations.find((item) => String(item.id) === id);
  if (!conversation) return response.status(404).json({ error: "Conversation not found." });
  if (!conversation.participantIds.includes(request.currentUserId)) {
    return response.status(403).json({ error: "You can only open your own conversations." });
  }
  request.conversation = conversation;
  next();
});

// Inbox: the current user's conversations, newest message first.
conversationsRouter.get("/", async (request, response) => {
  const data = await request.app.locals.mockDataStore.load();
  response.json(data.conversations
    .filter((conversation) => conversation.participantIds.includes(request.currentUserId))
    .sort((a, b) => lastSentAt(b) - lastSentAt(a)));
});

conversationsRouter.get("/:id", (request, response) => {
  response.json(request.conversation);
});

// The server sets the ID, sender, and time. Other submitted fields are ignored.
conversationsRouter.post("/:id/messages", async (request, response) => {
  const text = request.body?.text;
  if (typeof text !== "string" || !text.trim()) {
    return response.status(400).json({ error: "Message text is required." });
  }

  const data = await request.app.locals.mockDataStore.load();
  const message = {
    id: nextMessageId(data.conversations),
    senderId: request.currentUserId,
    type: "text",
    text: text.trim(),
    sentAt: new Date().toISOString(),
  };
  request.conversation.messages.push(message);
  response.status(201).json(message);
});
