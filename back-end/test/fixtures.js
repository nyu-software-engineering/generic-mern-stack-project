export function mockData() {
  return {
    users: [
      { id: "owner-1", name: "Item owner" },
      { id: "student-2", name: "Item borrower" },
    ],
    listings: [{
      id: 1, ownerId: "owner-1", title: "Desk lamp", category: "Study supplies",
      description: "Adjustable lamp.", price: 5, rentalTerms: "Return clean.", status: "published",
    }],
    rentals: [{
      id: 101, listingId: 1, ownerId: "owner-1", borrowerId: "student-2",
      startDate: "2026-11-01", endDate: "2026-11-03", status: "completed", totalPrice: 10,
      terms: { pricePerDay: 5, rentalTerms: "Return clean." }, extensionRequest: null,
    }],
    conversations: [{
      id: 1, listingId: 1, participantIds: ["owner-1", "student-2"],
      messages: [{ id: 1, senderId: "owner-1", type: "text", text: "It is available.", sentAt: "2026-11-01T09:00:00Z" }],
    }],
    reviews: [{
      id: 1, bookingId: 101, reviewerId: "student-2", reviewedUserId: "owner-1",
      communicationRating: 5, itemCareRating: 4, overallRating: 5,
      comment: "Easy pickup.", createdAt: "2026-11-04",
    }],
    itemRequests: [{
      id: 1, requesterId: "student-2", itemName: "Desk lamp", neededBy: "2026-11-01",
      neededUntil: "2026-11-03", approximateArea: "Library", targetPrice: null,
      details: "For studying.", status: "open", createdAt: "2026-10-30T09:00:00Z",
      responses: [{ responderId: "owner-1", conversationId: 1, messageIds: [1] }],
    }],
    quickBorrowRequests: [{
      id: 1, requesterId: "student-2", itemName: "Charger", neededBy: "2026-11-05",
      approximateArea: "Library", details: "Mine broke.", createdAt: "2026-11-04T09:00:00Z",
    }],
  };
}
