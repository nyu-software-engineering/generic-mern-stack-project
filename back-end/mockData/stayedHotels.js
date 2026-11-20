// mock data for hotels users have stayed at (shown on the Profile page)
// userId links each stay to a user; the route only returns stays for the logged-in user
const stayedHotels = [
    {
        id: '1',
        userId: '1',
        hotel: 'Waldorf Astoria DC',
        city: 'Washington D.C., USA',
        date: '2026-10-15',
    },
    {
        id: '2',
        userId: '1',
        hotel: 'Ritz Carlton Half Moon Bay',
        city: 'Half Moon Bay, USA',
        date: '2024-02-20',
    },
    {
        id: '3',
        userId: '1',
        hotel: 'Park Hyatt Tokyo',
        city: 'Tokyo, Japan',
        date: '2025-03-10',
    },
    {
        // belongs to a different user, should never be returned for the mock user
        id: '4',
        userId: '2',
        hotel: 'The Savoy',
        city: 'London, UK',
        date: '2025-07-04',
    },
];

export default stayedHotels;
