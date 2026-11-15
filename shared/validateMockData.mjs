import {
  itemRequestStatuses, listingCategories, listingStatuses, offerStatuses, rentalStatuses,
} from './options.mjs'

export function validateMockData(data) {
  // TODO: make quickBorrowRequests required once the live Mockaroo schema includes it.
  const { users, listings, rentals, conversations, reviews, itemRequests, quickBorrowRequests = [] } = data ?? {}
  if (![users, listings, rentals, conversations, reviews, itemRequests, quickBorrowRequests].every(Array.isArray)) {
    throw new Error('Mockaroo returned invalid data.')
  }

  const userIds = new Set(users.map((user) => user?.id))
  const listingIds = new Set(listings.map((listing) => listing?.id))
  const rentalIds = new Set(rentals.map((rental) => rental?.id))

  const validUsers = users.every((user) =>
    typeof user?.id === 'string' && user.id.trim() &&
    typeof user.name === 'string' && user.name.trim() &&
    (user.completedRentals == null || (Number.isSafeInteger(user.completedRentals) && user.completedRentals >= 0)),
  )

  const validListings = listings.every((listing) =>
    Number.isSafeInteger(listing?.id) && listing.id > 0 &&
    userIds.has(listing.ownerId) && listingCategories.includes(listing.category) &&
    listingStatuses.includes(listing.status) &&
    [listing.title, listing.description, listing.rentalTerms].every((value) => typeof value === 'string' && value.trim()) &&
    Number.isFinite(listing.price) && listing.price >= 0,
  )

  const validRentals = validListings && rentals.every((rental) =>
    Number.isSafeInteger(rental?.id) && rental.id > 0 &&
    listingIds.has(rental.listingId) && userIds.has(rental.borrowerId) &&
    listings.find((listing) => listing.id === rental.listingId)?.ownerId === rental.ownerId &&
    rentalStatuses.includes(rental.status) &&
    Number.isFinite(rental.totalPrice) && rental.totalPrice >= 0 &&
    [rental.terms?.message, rental.terms?.rentalTerms].every((value) => value == null || typeof value === 'string') &&
    typeof rental.startDate === 'string' && typeof rental.endDate === 'string',
  )

  const validConversations = conversations.every((conversation) =>
    Number.isSafeInteger(conversation?.id) && listingIds.has(conversation.listingId) &&
    Array.isArray(conversation.participantIds) && conversation.participantIds.length === 2 &&
    conversation.participantIds.every((id) => userIds.has(id)) &&
    Array.isArray(conversation.messages) &&
    conversation.messages.every((message) =>
      Number.isSafeInteger(message?.id) &&
      conversation.participantIds.includes(message.senderId) &&
      typeof message.sentAt === 'string' &&
      (message.type === 'text'
        ? typeof message.text === 'string'
        : message.type === 'offer' && Number.isFinite(message.totalPrice) &&
          typeof message.startDate === 'string' && typeof message.endDate === 'string' &&
          offerStatuses.includes(message.status)),
    ),
  )

  const reviewPairs = new Set()
  const validReviews = reviews.every((review) => {
    if (!Number.isSafeInteger(review?.id) || review.id < 1 ||
        !Number.isSafeInteger(review.bookingId) || !rentalIds.has(review.bookingId)) return false

    const rental = rentals.find((item) => item.id === review.bookingId)
    const participants = [rental.ownerId, rental.borrowerId]
    const pairKey = `${review.bookingId}:${review.reviewerId}`

    if (reviewPairs.has(pairKey)) return false
    reviewPairs.add(pairKey)

    return rental.status === 'completed' &&
      review.reviewerId !== review.reviewedUserId &&
      participants.includes(review.reviewerId) &&
      participants.includes(review.reviewedUserId) &&
      [review.communicationRating, review.itemCareRating, review.overallRating].every(
        (rating) => Number.isInteger(rating) && rating >= 1 && rating <= 5,
      ) &&
      typeof review.comment === 'string' && review.comment.length <= 500 &&
      typeof review.createdAt === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(review.createdAt)
  })

  const validItemRequests = itemRequests.every((request) =>
    Number.isSafeInteger(request?.id) && request.id > 0 &&
    userIds.has(request.requesterId) &&
    [request.itemName, request.approximateArea].every((value) => typeof value === 'string' && value.trim()) &&
    [request.neededBy, request.neededUntil, request.createdAt].every((value) => typeof value === 'string') &&
    (request.targetPrice == null || (Number.isFinite(request.targetPrice) && request.targetPrice >= 0)) &&
    typeof request.details === 'string' &&
    itemRequestStatuses.includes(request.status) &&
    Array.isArray(request.responses) &&
    request.responses.every((response) => {
      const conversation = conversations.find((item) => item.id === response?.conversationId)
      return userIds.has(response?.responderId) && conversation &&
        Array.isArray(response.messageIds) &&
        response.messageIds.every((id) =>
          conversation.messages.find((message) => message.id === id)?.senderId === response.responderId,
        )
    }),
  )

  const validQuickBorrowRequests = quickBorrowRequests.every((request) =>
    Number.isSafeInteger(request?.id) && request.id > 0 && userIds.has(request.requesterId) &&
    [request.itemName, request.approximateArea, request.details].every((value) => typeof value === 'string' && value.trim()) &&
    typeof request.neededBy === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(request.neededBy) &&
    typeof request.createdAt === 'string',
  )

  if (!validUsers || !validListings || !validRentals || !validConversations || !validReviews ||
    !validItemRequests || !validQuickBorrowRequests ||
    userIds.size !== users.length || listingIds.size !== listings.length ||
    rentalIds.size !== rentals.length ||
    new Set(reviews.map((review) => review?.id)).size !== reviews.length ||
    new Set(itemRequests.map((request) => request?.id)).size !== itemRequests.length ||
    new Set(quickBorrowRequests.map((request) => request?.id)).size !== quickBorrowRequests.length) {
    throw new Error('Mockaroo returned invalid data.')
  }
}

