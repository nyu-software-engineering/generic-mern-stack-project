# Leverage

Leverage is a mobile web app that helps renters make better decisions when renting an apartment or negotiating their rent.

## Product Vision Statement

For renters in expensive cities, especially students, recent graduates and international renters with limited credit history, who struggle to tell whether a rent is fair and to prove they are reliable tenants, Leverage is a mobile web app that compares an apartment's rent with similar apartments nearby, tracks where local rents are heading, and turns a renter's payment history into a verified Reliability Report they can share privately. Unlike rental listing sites that only show asking prices, Leverage gives renters real evidence they can use when applying for an apartment or negotiating a rent increase.

## Team

| Name    | GitHub |
| ------- | ------ |
| Hamza   | [@muhammadhamza206](https://github.com/muhammadhamza206) |
| Kashish | [@kashu0604](https://github.com/kashu0604) |
| Izen    | [@izzennn](https://github.com/izzennn) |
| Noor    | [@noor-kh](https://github.com/noor-kh) |
| Rania   | [@raniaaamer999](https://github.com/raniaaamer999) |
| Hashim  | [@Motabagani](https://github.com/Motabagani) |

## How the project came to be

Leverage started as a project proposal for the Agile Software Development and DevOps course at NYU. Several of us have dealt with renting in New York City ourselves, and kept running into the same two problems: not knowing whether an asking rent was fair, and being asked for a guarantor despite always paying rent on time. The team chose this proposal because it solves a real problem that we, our friends and many other students face, and because we can easily reach real users to test it.

## What and why?

When looking for an apartment, renters usually only see the asking price. They often do not know if that price is actually fair compared to similar apartments nearby, or how much rents in the area have been changing. This makes it difficult to know whether they are getting a good deal.

Renters can also have trouble proving that they are reliable tenants. This is especially true for people with limited credit history, such as international students, recent immigrants, or people renting for the first time. Someone might have years of rental history and always pay on time but still be asked for a guarantor because they do not have enough credit history.

Leverage brings these two problems together. It helps renters understand **what an apartment should cost, where the area is heading, and how they can prove that they are a reliable tenant.**

The goal is to give renters information they can actually use when applying for an apartment or negotiating a rent increase.

## For whom?

Our main users are renters in expensive cities.

This especially includes:

* International students and recent immigrants with limited US credit history
* Students and recent graduates renting for the first time
* Long-term renters dealing with a rent increase or renewal
* Anyone who wants to know whether an apartment is fairly priced

These are real users that we can reach through our own university community, friends, and other renters. We can also talk to housing offices and tenant organizations to better understand the problems renters face.

Small landlords could also benefit from the app. A renter could choose to share a Reliability Report showing their history of paying rent on time, giving landlords useful information without giving them access to the renter's private financial transactions.

## How?

Leverage has four main parts.

### 1. Check an apartment

A renter enters an apartment's address and asking rent. Leverage compares it with similar apartments nearby and available public housing data.

For example, it could show:

> **$2,650/month**
> Similar apartments nearby: $2,400 to $2,500
> This apartment is about 8% above the local average.

The app also shows how rents in the area have changed and other information that helps the renter understand where the neighborhood may be heading during their lease.

### 2. Create a Reliability Report

Renters can connect their bank account or upload statements to verify their rental payment history.

Leverage creates a simple report showing information such as:

* Number of months of verified rent payments
* On-time payment history
* Income stability
* Rent compared to income

The renter controls what they share. A landlord sees the summary and verification, not the renter's private transactions.

### 3. Help negotiate

When applying for an apartment or receiving a rent increase, Leverage helps the renter understand their position.

It shows comparable rents and the renter's own payment history, then helps them create a short message to send to their landlord.

For example:

> Similar two-bedroom apartments nearby are renting for around $2,450. Based on the local market and my history of paying rent on time, I would like to discuss the proposed rent increase.

The renter can then record what happened, such as whether the landlord lowered the rent or accepted their application.

### 4. Keep watching

After checking an apartment, users can continue to follow the area. Leverage notifies them when there are major changes in local rents or other neighborhood information.

This makes the app useful after someone has already signed a lease, especially when their renewal comes up.

## Scope

The first version focuses on NYC instead of trying to support every location. We use publicly available housing and neighborhood data and focus on making that information easy for renters to understand.

The main parts of the project are:

* A mobile interface for checking apartments
* Collecting and organizing rental and neighborhood data
* Comparing apartments with nearby rentals
* Creating a Reliability Report
* Allowing renters to privately share their report
* A negotiation flow for applications and rent increases
* A way for users to track changes in an area

We are not building apartment listings, payment processing, a native mobile app, or a nationwide system. These features could be considered in the future, but they are not necessary for the first version.

The goal for the semester is to build a working version that real renters can test and use, rather than a complete rental platform.

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for our team norms, git workflow, rules for contributing, and how to set up the local development environment.

## Building and testing

### Requirements

- [Node.js](https://nodejs.org/) 22.22 or newer (check with `node -v`)
- [git](https://git-scm.com/)

### Run the front-end locally

```bash
git clone https://github.com/agile-students-fall2026/generic-mern-stack-project-leverage.git
cd generic-mern-stack-project-leverage/front-end
npm install
npm run dev
```

Then open http://localhost:5173 in your browser. Leverage is a mobile web app, so it is best viewed at phone size (in Chrome: DevTools → Toggle device toolbar).

Useful pages to start from:

- Renter flow: http://localhost:5173/signup or http://localhost:5173/
- Landlord flow: http://localhost:5173/landlord
- A shared report opened from a link, without an account: http://localhost:5173/r/rpt-104
- Forgot password: http://localhost:5173/forgot-password

### Other commands (run inside `front-end/`)

- `npm run lint` checks the code for problems
- `npm run build` makes a production build in `front-end/dist/`

### Code style

The team's style is defined in `.prettierrc` at the root of the repository (single quotes, no semicolons, 2-space indentation), and ESLint's rules are in `front-end/eslint.config.js`.

To set up Visual Studio Code:

1. Install the **ESLint** and **Prettier - Code formatter** extensions.
2. Open Settings, search for **Format on Save** and turn it on.
3. Set **Prettier - Code formatter** as the default formatter (search Settings for **Default Formatter**).

Before opening a pull request, run `npm run lint` inside `front-end/` and fix any problems it reports.

### Data

During Sprint 1 the app uses mock data from `front-end/public/mock/`, loaded through `front-end/src/data/api.js`. No `.env` file or account is needed to run it. The back-end in `back-end/` will replace the mock data in Sprint 2.

Share links, followed areas, negotiation outcomes and the bank connection are saved in your browser. To start fresh, clear the site's local storage (DevTools → Application → Local storage).

## Additional documents

* [UX-DESIGN.md](./UX-DESIGN.md): app map, wireframes and clickable prototype
* [CONTRIBUTING.md](./CONTRIBUTING.md): how to contribute to this project
* [Project board](https://github.com/orgs/agile-students-fall2026/projects/69): Product Backlog, Sprint Backlogs and Task Boards

