// Shared mock conversations for chat and offers (#53).
// participantIds match users.js and listingId matches listings.js.
// An offer's status is pending | accepted | declined | countered (replaced by a newer offer).
const conversations = [
  {
    id: 1,
    listingId: 5,
    participantIds: ['owner-1', 'student-2'],
    messages: [
      {
        id: 1,
        senderId: 'owner-1',
        type: 'text',
        text: 'Hi! Is the projector free the weekend of Nov 20?',
        sentAt: '2026-11-02T14:55:00',
      },
      {
        id: 2,
        senderId: 'student-2',
        type: 'text',
        text: 'Yes! The charger, HDMI cable and case are included.',
        sentAt: '2026-11-02T15:02:00',
      },
      {
        id: 3,
        senderId: 'student-2',
        type: 'offer',
        totalPrice: 18,
        startDate: '2026-11-20',
        endDate: '2026-11-22',
        status: 'pending',
        sentAt: '2026-11-02T15:03:00',
      },
    ],
  },
  {
    id: 2,
    listingId: 1,
    participantIds: ['owner-1', 'student-3'],
    messages: [
      {
        id: 4,
        senderId: 'student-3',
        type: 'text',
        text: 'Could I borrow the mini fridge for a few days?',
        sentAt: '2026-11-01T10:15:00',
      },
      {
        id: 5,
        senderId: 'owner-1',
        type: 'text',
        text: 'Sure, it is $15 a day.',
        sentAt: '2026-11-01T10:20:00',
      },
      {
        id: 6,
        senderId: 'student-3',
        type: 'offer',
        totalPrice: 35,
        startDate: '2026-11-05',
        endDate: '2026-11-08',
        status: 'pending',
        sentAt: '2026-11-01T10:22:00',
      },
    ],
  },
  {
    id: 3,
    listingId: 2,
    participantIds: ['owner-1', 'student-4'],
    messages: [
      {
        id: 7,
        senderId: 'student-4',
        type: 'text',
        text: 'Is the desk lamp still available next week?',
        sentAt: '2026-10-31T18:40:00',
      },
      {
        id: 8,
        senderId: 'owner-1',
        type: 'text',
        text: 'Yes, send me an offer when you know your dates.',
        sentAt: '2026-10-31T18:45:00',
      },
    ],
  },
]

export default conversations
