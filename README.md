# SplitLease: The Communal Living Ledger

## What and why?
SplitLease is a communal financial and physical asset ledger designed for shared apartments.

While existing apps like Splitwise are great for splitting a single dinner bill, they are not able to address the complex reality of long term shared living. When roommates move into an unfurnished apartment, they purchase communal assets such as couches, routers, televisions, and more. When a lease ends or one roommate moves out, it becomes complicated as to who owns what and how much those used items are currently worth becomes a massive source of friction and arguments.

SplitLease solves this by acting as a household equity tracker. It not only tracks recurring utility bills but also logs physical purchases, automatically applies standard depreciation to those items, and generates a fair, mathematically objective "buyout" price when the household splits up.

## For whom?
This software is built for off campus college students and young professionals living in shared apartments with high roommate turnover.

Our initial, real world end-users will be our own peers navigating the off campus housing market in New York City. Because student leases often involve constant rotation due to people studying abroad, graduating, or subletting for the summer, these users experience the exact problems SplitLease is designed to solve. We can immediately test our beta with student friend groups who are currently figuring out how to divide their apartment's assets at the end of the semester.

## How?
From an end-user's perspective, the system will provide a seamless way to manage household finances from move in data to move out using the following:

**Household Onboarding:** A user creates a "Household" and generates an invite link to bring their roommates into the digital space. They can set custom rent splits if rooms are different sizes.

**The Asset Ledger:** When a roommate buys a communal item (e.g., a $400 TV), they log it in the app, attach a receipt, and tag who chipped in. The system visually tracks these assets in a household inventory.

**Recurring Expenses:** Users can log standard recurring bills (Wi-Fi, electricity, communal groceries) which are added to a running monthly tab.

**The Move Out Protocol:** When a user initiates a move out, the system calculates the current depreciated value of all communal assets. If a departing roommate bought the couch but the remaining roommates want to keep it, SplitLease automatically calculates exactly what the remaining roommates owe to buy out the departing roommate's "share" of the couch, netting this against any outstanding utility debts.

**Dashboard & Settlement:** Users view a clean dashboard showing their current net standing in the apartment ("You are owed $50") and can mark balances as settled once they pay each other via their preferred external platform (such as Zelle or Venmo).

## Scope
This project is perfectly scoped for a team of 5 developers over one semester.

This project requires complex decisions but avoids the challenging scope of trying to handle actual payment processing. The technical complexity comes from the relational data model (users, households, assets, transaction histories) and the accounting logic required to ensure balances always net to zero.

Dividing the work among 5 people is ideal. The frontend requires designing a clean, responsive dashboard and state management for the ledger. The backend requires building RESTful APIs, implementing the depreciation math, handling secure user authentication, and creating a complex relational database that can handle multi user interactions safely.

## Collaboration
[Victor Derani](https://github.com/VictorDerani04)
[Haelyn Ryoo](https://github.com/haelynr)
[Jamie Stuart](https://github.com/jamiestuartv)
[Adam Mekrami](https://github.com/adammekrami)
[Yazid Alhamed](https://github.com/Dizay-53)
