
const conversationsMockData = [
    {
        conversationId: 1,
        userOne: "user1",
        userTwo: "user2",
        messages: [
            {sender: "userOne", date: new Date("November 14, 2026 03:24:00"), content: "hello", userOneRead: false, userTwoRead: false},
            {sender: "userTwo", date: new Date("November 14, 2026 03:25:00"), content: "hi!", userOneRead: false, userTwoRead: false},
        ]
    },

    {
        conversationId: 2,
        userOne: "user1",
        userTwo: "user3",
        messages: [
            {sender: "userOne", date: new Date("November 14, 2026 03:24:00"), content: "how are you", userOneRead: false, userTwoRead: false},
            {sender: "userTwo", date: new Date("November 14, 2026 03:25:00"), content: "hi user!", userOneRead: false, userTwoRead: false},
        ]
    },

]
export default conversationsMockData