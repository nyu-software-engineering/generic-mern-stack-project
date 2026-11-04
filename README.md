# ApplyTrack

ApplyTrack is a mobile-first web application that helps college students organize and manage their internship and job applications in one place.

> **Status:** In development. This README is updated as the project moves through each sprint.

---

## Product Vision Statement

**For** college students actively applying to internships and full-time jobs, **who** struggle to keep track of dozens of applications spread across emails, company portals, spreadsheets, and notes, **ApplyTrack** is a mobile-first web application **that** gives them one central place to record every application, follow its status, remember important deadlines, and see how their recruiting season is going. **Unlike** spreadsheets or general-purpose note-taking apps, **ApplyTrack** is built specifically for the recruiting process, with a status pipeline, reminders, and recruiting statistics designed around how students actually apply.

---

## What and Why?

Students applying to internships often send out dozens of applications at the same time. After a while, it becomes difficult to remember which companies they applied to, when they applied, and what stage each application is currently in. Important information can be spread across emails, company application portals, spreadsheets, and personal notes. This can make an already stressful recruiting process even harder to manage.

ApplyTrack solves this problem by giving students one central place to track their entire recruiting process. Instead of searching through emails or trying to remember the status of an application, students can quickly open the app and see everything they need to know.

## For Whom?

The main users of ApplyTrack are college students who are actively applying for internships and full-time jobs. Our initial users are students at NYU, including friends and classmates who are currently going through the recruiting process.

These students are a good initial user group because many of them apply to a large number of positions during a recruiting season and already need some way to organize their applications. We gather feedback from real students throughout development and use it to improve the application.

## How?

- **Accounts:** Students create an account so their applications are saved and private.
- **Applications:** For every job or internship, students can save the company, position, application date, job link, location, notes, recruiter contact, and the resume they used.
- **Status pipeline:** Each application has a status that is updated as the student moves through the process:

  **Applied → Online Assessment → Recruiter Screen → Interview → Offer / Rejected**

- **Dashboard:** An overview of all applications, with search, filtering, and sorting by company, status, or date.
- **Dates and reminders:** Students track online assessment deadlines, interviews, and follow-ups, and get reminded so they don't miss them.
- **Recruiting statistics:** Total applications submitted, number that led to interviews, response rate, and active applications.
---

## Core Team
 
- [Bertin](https://github.com/Bertin-Ir)
- [Kumneger](https://github.com/ken11235)
- [Ryan](https://github.com/Exlanious)
- [Estifanos](https://github.com/Estifanos-Wassie)

---
## History

ApplyTrack started as a team project for  Agile Software Development and DevOps course at NYU in Fall 2026. 
---

## Contributing

We welcome contributions from team members and other students. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before getting started. It explains our team norms, Git workflow, and how to submit changes.

---

## Building and Testing

The front-end is a [React](https://react.dev) app built with [Vite](https://vite.dev). In Sprint 1 it runs on mock data (`front-end/public/mock-data/`), so no back-end or database is needed yet.

### Prerequisites

- [Node.js](https://nodejs.org) **20.19 or newer** (check with `node -v`). If you use [nvm](https://github.com/nvm-sh/nvm), run `nvm use` inside `front-end/`.
- [Git](https://git-scm.com)

### Setup

```bash
git clone https://github.com/agile-students-fall2026/generic-mern-stack-project-applyTrack.git
cd generic-mern-stack-project-applyTrack/front-end
npm install
```

### Running the app locally

```bash
cd front-end
npm run dev
```

Open the address shown in the terminal (usually http://localhost:5173). The app is designed for phones; on a computer, use your browser's mobile view for the best experience.

To look around, log in with the demo account **alex.morgan@university.example** / **password123**, or create your own account on the Sign Up screen. Accounts are stored only in your browser for now.

Other commands (run inside `front-end/`):

| Command | What it does |
| --- | --- |
| `npm run lint` | Checks the code for problems |
| `npm run build` | Builds the production version into `front-end/dist/` |
| `npm run preview` | Serves the production build locally |

## Relevant Links/Materials
- [Figma prototype](https://www.figma.com/proto/9EX5tzYDrlj3Gzjzbx0MYe/applytrack-wireframe?node-id=0-1&t=Lk0LxVGaovkle1CD-1)
- [App map](ux-design/ApplyTrack_app_map.png)

