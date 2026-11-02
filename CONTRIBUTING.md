# Contributing to DormShare

This document outlines the guidelines and expectations for contributing to DormShare. All contributors are expected to follow these practices to ensure effective teamwork and consistent development.

## 1. Team Norms

Our team follows these [Scrum Team Norms](https://github.com/nyu-software-engineering/scrum-framework/blob/main/team-norms.md):

- **Communication:** Respond to team messages within 24 hours and communicate blockers or delays early.
- **Accountability:** Complete assigned tasks by agreed deadlines and keep GitHub issues updated.
- **Collaboration:** Respect everyone's opinions, help teammates when needed, and review each other's work.
- **Transparency:** Communicate progress honestly and raise concerns as soon as they arise.
- **Standups:** Attend standup meetings every class day and share what was done, what is planned, and any blockers.
- **Participation:** All team members contribute to development regardless of Scrum roles.

## 2. Git Workflow

We follow the **feature-branch workflow**, using `master` as our main branch.

1. Pull the latest changes from `master`.
2. Create a new branch using the naming convention `feature/short-description`.
3. Make changes and commit them with descriptive messages.
4. Push the feature branch to GitHub.
5. Open a Pull Request targeting `master` in the DormShare repository.
6. Request a code review from a teammate.
7. Obtain **at least one approval** before merging.

Direct commits to `master` should be avoided. Contributors must resolve merge conflicts and address review feedback before merging.

## 3. Contribution Rules

- **GitHub Issues:** All contributions should correspond to an existing issue or an agreed-upon task.
- **Task Assignment:** Contributors should work on their assigned tasks and update their status on the GitHub Project board.
- **Code Quality:** Write readable, maintainable code and follow existing project conventions.
- **Pull Requests:** Each PR should clearly describe the changes and reference the relevant GitHub issue.
- **Peer Review:** At least one teammate must review and approve each PR before merging.
- **Testing:** Test changes locally before submitting a PR.
- **Documentation:** Update relevant documentation whenever functionality or setup procedures change.
- **Security:** Never commit passwords, API keys, `.env` files, or other sensitive information.
- **Collaboration:** Discuss major changes with the team before implementing them.

Contributions may include new features, bug fixes, UI improvements, tests, documentation, and development tooling.

## 4. Local Development Environment

DormShare uses React, Express.js, and Node.js. The Sprint 0 backend health check runs without a database. Database setup is tracked separately.

### Prerequisites

- Git
- Node.js 20.19.0 or newer, with npm
- Access to the DormShare GitHub repository

### Match your Git and GitHub usernames

Course contribution records use the Git username attached to commits. In the repository directory, set it to your GitHub username and confirm the value:

```bash
git config user.name "your-github-username"
git config user.name
```

### Get the project

Clone the repository:

```bash
git clone https://github.com/agile-students-fall2026/dormshare.git
cd dormshare
```

### Run the front end

```bash
cd front-end
npm install
npm run dev
```

Open the local address printed by Vite, usually `http://localhost:5173`. Leave this terminal running.

### Run the back end

Open a second terminal from the repository root, then run:

```bash
cd back-end
npm install
npm run dev
```

The server listens at `http://127.0.0.1:3001`. Visit `http://127.0.0.1:3001/api/health`. It should return `{"status":"ok"}`. Leave this terminal running while you work.

Stop either development server with `Ctrl+C` in its terminal.

### Test the back end

From the `back-end/` directory, run:

```bash
npm test
npm run test:coverage
```

To run the backend without automatic restarts, use `npm start` from `back-end/`.

### Troubleshooting

- **Unsupported Node.js version:** Run `node --version` and install Node.js 20.19.0 or newer.
- **Port 3001 is already in use:** Stop the other backend process. To use another port, run `PORT=3002 npm run dev` on macOS or Linux. In PowerShell, run `$env:PORT=3002` and then `npm run dev`.
- **The front end opens on a different port:** Vite selects another available port when 5173 is busy. Use the address printed in the front-end terminal.
- **The backend health check does not respond:** Confirm the backend terminal is still running, then check the port shown in its output.
- **Dependencies are missing:** Run `npm install` from the relevant `front-end/` or `back-end/` directory.

Database connection settings and credentials are not part of this Sprint 0 setup. Do not commit `.env` files or credentials.

## 5. Building and Testing

For the front end, run these commands from `front-end/`:

```bash
npm run build
npm run lint
npm test
```

For backend tests and coverage, see [Test the back end](#test-the-back-end). The backend currently provides a health check only. Add and document tests as features are implemented.


### Database setup

We use MongoDB Atlas with Mongoose. You do not need to install MongoDB locally.

From the `back-end` directory, install dependencies:

```bash
npm install
```

Create a `.env` file in `back-end` using `.env.example` as a template. Once the team's Atlas cluster is available, set `MONGODB_URI` to its connection string.

Check the connection:

```bash
npm run db:check
```
