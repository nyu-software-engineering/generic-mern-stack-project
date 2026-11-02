# DormShare

**Need it? Rent it. Have it? Earn from it.**

DormShare is a peer-to-peer marketplace built for the NYU student community. It allows verified students to lend, borrow, and rent everyday items from one another, making it easier to access things that are only needed temporarily while helping students make better use of items they already own.

## Product Vision

For NYU students who occasionally need access to items they do not own, DormShare provides a trusted campus marketplace where students can discover, borrow, lend, and rent items from other members of the university community.

Unlike general-purpose online marketplaces, DormShare is designed around temporary access rather than permanent ownership. It combines a verified student community with rental-specific features such as agreed booking terms, communication between participants, pickup and return records, and reputation profiles.

Our goal is to make borrowing within the NYU community safer, simpler, and more convenient while reducing unnecessary purchases and allowing students to earn from belongings they are not currently using.

## Project History

DormShare began as the team's proposal for helping NYU students access everyday items temporarily instead of buying something they only need for a short time. The team is shaping that idea into a verified campus marketplace. Sprint 0 is focused on defining the user flows, preparing the prototype, and setting up shared development practices.

## The Problem

Students frequently need items for a short period of time: tools, electronics, household equipment, event supplies, sports equipment, and other everyday products. Buying these items can be expensive and wasteful when they may only be needed once or for a few days.

At the same time, many students already own these items and leave them unused for long periods.

Existing marketplaces are primarily designed for buying and selling and do not provide a structured experience for temporary rentals between students.

## Our Solution

DormShare creates a student-focused sharing marketplace where members of the NYU community can:

- list items they are willing to lend or rent
- search for available items
- view item details and availability
- communicate privately with other students
- make and respond to rental requests and offers
- confirm shared rental terms
- record item pickup and return
- request rental extensions when necessary
- maintain rental histories and dashboards
- review other participants after completed exchanges
- build reputation within the community
- report problematic listings or exchanges

DormShare also explores alternative ways of finding items through **Item Requests**, where students can ask the community for something that is not currently listed, and **Quick Borrow**, designed for short-term access to lower-value everyday items.

Payments, where applicable, are arranged between participants rather than processed directly by DormShare.

## Core User Journey

A typical DormShare rental follows this flow:

1. A verified NYU student browses or searches for an item.
2. The student views the listing and submits a rental request or offer.
3. The renter and owner communicate and agree on the rental terms.
4. Both participants can view a shared booking summary.
5. The participants complete and record the item handoff.
6. The rental remains visible in their dashboards while active.
7. The item is returned and the return is recorded.
8. Both participants can review one another and contribute to their reputation profiles.

## Team

DormShare is being developed by:

- [Hassan Raza](https://github.com/hassanraza04) — `hassanraza04`
- [Muhammad Sheharyar Ullah Khan](https://github.com/SherryKhanW) — `SherryKhanW`
- [Omer Hayat](https://github.com/OmerNYU) — `OmerNYU`
- [Samuel Evan](https://github.com/Samuel-Evan-s) — `Samuel-Evan-s`
- [Aayan Ebrahim](https://github.com/aayan801) — `aayan801`
- [Yutong Tang](https://github.com/yutong-tang) — `yutong-tang`

All team members participate as developers. Product Owner and Scrum Master responsibilities rotate between team members across sprints.

## Project Status

DormShare is currently in **Sprint 0**, focused on product definition, user experience design, prototyping, project setup, and sprint planning.

Current Sprint 0 work includes:

- defining the product backlog and MVP
- developing the application map and mobile-first wireframes
- building a clickable prototype
- establishing team development and contribution practices
- preparing the repository for implementation

Application development begins in Sprint 1.

## UX Design

The application's user experience documentation, including the app map, wireframes, screen descriptions, and prototype information, is available in:

[UX-DESIGN.md](./UX-DESIGN.md)

## Contributing

Development practices, team norms, local setup instructions, Git workflow, and contribution requirements are documented in:

[CONTRIBUTING.md](./CONTRIBUTING.md)

All development work follows a feature-branch workflow. Changes are developed on separate branches, reviewed through pull requests, and merged into `master` after review.

## Planned Technology Stack

The project will be developed as a full-stack JavaScript web application using:

- **React** for the front end
- **Express.js** for the back end
- **MongoDB Atlas** for persistent application data
- **Mongoose** for database integration
- **JSON Web Tokens (JWT)** for application authentication where required

Additional development and deployment tooling will be documented as the project progresses.

## Development Setup

The repository includes a basic React front end and an Express backend health check for local setup. Product features are planned for later sprints. To run both development servers:

```bash
git clone https://github.com/agile-students-fall2026/dormshare.git
cd dormshare
```

In one terminal:

```bash
cd front-end
npm install
npm run dev
```

In a second terminal from the repository root:

```bash
cd back-end
npm install
npm run dev
```

Open `/listings` to create, edit, preview, publish, or pause items. Open `/owner-dashboard` for rental counts, recorded income, and filters. These pages use the shared mock records in `src/data/`. Changes stay in memory and reset on reload.

From `front-end`, run `npm test`, `npm run lint`, and `npm run build` to check changes.

The front end prints its local address. The backend health check is at <http://127.0.0.1:3001/api/health> and returns `{"status":"ok"}`. Read [CONTRIBUTING.md](./CONTRIBUTING.md) for prerequisites, test commands, and troubleshooting before beginning work.

## Repository Structure

```text
dormshare/
├── front-end/       # React front-end application
├── back-end/        # Express back-end application
├── ux-design/       # App map, wireframes, and UX design assets
├── README.md
├── CONTRIBUTING.md
└── UX-DESIGN.md
```

The repository also contains course and instructor automation files. These should not be modified unless specifically required.

## License

This project is distributed under the terms contained in [LICENSE.md](./LICENSE.md).
