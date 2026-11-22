// mock "stays" collection: hotels users have stayed at (shown on the Profile page)
// userId links each stay to a user; the route only returns stays for the logged-in user
// hotelId must match an id in hotelList.js
const stayedHotels = [
    { id: 's1', userId: '1', hotelId: '28', date: '2026-10-15' }, // Waldorf Astoria DC
    { id: 's2', userId: '1', hotelId: '29', date: '2024-02-20' }, // Ritz Carlton Half Moon Bay
    { id: 's3', userId: '1', hotelId: '30', date: '2025-03-10' }, // Park Hyatt Tokyo
    // belongs to a different user, should never be returned for the mock user
    { id: 's4', userId: '2', hotelId: '31', date: '2025-07-04' }, // The Savoy
];

export default stayedHotels;
