// Chat helpers shared by the conversation routes (#102) and item request responses
// (#105), so both add messages and offers to the shared store the same way.

export const roundCents = (amount) => Math.round(amount * 100) / 100;

// Message IDs are unique across all conversations, matching the frontend.
export const nextMessageId = (conversations) =>
  Math.max(0, ...conversations.flatMap((conversation) => conversation.messages.map((message) => message.id))) + 1;

export function addTextMessage(data, conversation, senderId, text) {
  const message = {
    id: nextMessageId(data.conversations),
    senderId,
    type: "text",
    text,
    sentAt: new Date().toISOString(),
  };
  conversation.messages.push(message);
  return message;
}

// A new offer replaces any offer that is still waiting for an answer.
export function addOffer(data, conversation, senderId, { totalPrice, startDate, endDate }) {
  for (const message of conversation.messages) {
    if (message.type === "offer" && message.status === "pending") message.status = "countered";
  }
  const offer = {
    id: nextMessageId(data.conversations),
    senderId,
    type: "offer",
    totalPrice,
    startDate,
    endDate,
    status: "pending",
    sentAt: new Date().toISOString(),
  };
  conversation.messages.push(offer);
  return offer;
}
