# Contributing to CareerHive

Use this guide with the [README](./README.md) and [UX design](./UX-DESIGN.md). Work in the [shared team repository](https://github.com/agile-students-fall2026/generic-mern-stack-project-careerhive); do not create another fork.

## Team and norms

- Everyone is a developer, including the Product Owner and Scrum Master. These two roles rotate each sprint so everyone holds each at least once; announce them in the team channel and standups.
- The Product Owner orders the backlog and resolves product disagreements. Discuss technical disagreements together, then vote if needed; the Scrum Master makes sure a decision is reached.
- The Scrum Master runs standups, follows the task board, and helps resolve blockers. Discuss missed work directly; report repeated problems to the instructor.
- Use the shared Discord channel with course staff for team communication and decisions. A private conversation alone is not a team decision.
- Ask for help after an hour blocked and explain what you tried. Reply to direct messages within a day; report the same day if you cannot finish work you took.
- Sprints last two weeks. Agree on selected stories, task ownership, and the standup schedule at sprint start. Each task should fit between two standups.
- Standups last 15–30 minutes. Each person reports what they finished, what is next, and blockers. Do not report for absent members. After two standups without progress, the Scrum Master reports it to the instructor.

## Issues and sprint work

Start from a GitHub issue; discuss large changes with the team before implementing them.

| Label | Purpose |
| --- | --- |
| `user story` | A user-facing requirement |
| `task` | One part of a user story; name its parent, such as `Related to user story #11` |
| `spike` | Research or setup not tied to one user story |

Also use the applicable `Sprint 0`–`Sprint 4` labels. Preserve previous sprint labels when work carries over; use labels rather than milestones. Start with the [issue templates](./.github/ISSUE_TEMPLATE/).

Keep the sprint board accurate: **To Do → In Progress → Awaiting Review → Done**. Move work to In Progress when starting, Awaiting Review when requesting review, and Done after merge.

## Branches and Git workflow

`master` must stay working; fix a build you break. Create short-lived branches in the shared repository from current `master`; aim to finish within two or three days.

Name new branches **`<type>/<issue-number>/<short-description>`**, using lowercase words and hyphens:

| Type | Work |
| --- | --- |
| `feat` | Feature implementation |
| `fix` | Bug fixes |
| `docs` | Documentation |
| `spike` | Research or setup |

Examples: `feat/67/tracker-grouped-preview`, `feat/60/browse-jobs`, and `spike/45/scaffold-vite-react-frontend`. Use the task or spike's own issue number; keep a task's parent story in the issue and PR. Branch prefixes do not replace issue labels. Existing published branches keep their names.

Start a feature branch, for example:

```bash
git checkout master
git pull origin master
git checkout -b feat/60/browse-jobs
```

Make small commits with one short, concrete message line describing the change, such as `add grouped tracker previews`. Push at least once between standups, even before review readiness.

Before requesting review, merge current master into your branch and resolve conflicts there:

```bash
git fetch origin
git merge origin/master
git push -u origin feat/60/browse-jobs
```

Open the PR against **this team's repository and `master`**, not the instructor's repository. Use the [PR template](./.github/pull_request_template.md), link the issue, describe validation and remaining work, and request a teammate reviewer. Use `Closes #...` only when the issue is fully addressed; otherwise use `Related to #...`.

The reviewer reads the diff, checks out the branch, runs applicable checks, and requests fixes or approves. Never approve your own PR. Merge only after approval, using **Create a merge commit**, not Rebase and merge. Whoever merges moves the card to Done.

## Code and data rules

- Write the smallest implementation that works. Use clear names and delete commented-out code.
- Use React function components and JSX, built with Vite. The backend will use Express. Do not add Redux, MobX, Next.js, another build/SSR tool, Bootstrap, or Material UI.
- Load future server data through the agreed mock-data access; do not hard-code it into UI components. Use the assignment-compatible image source.
- Keep screens consistent with UX-DESIGN.md. Agree on design changes with the team and update the design notes in the same PR.
- Keep each PR focused; leave unrelated cleanup for separate work. Once tests exist, behavior changes need tests that pass before merge.
- Use VS Code or an editor producing the same formatting. Install the ESLint and Prettier extensions in VS Code, as the course conventions require.
- Keep `node_modules/`, build output, `.env`, credentials, private data, and editor/OS junk out of Git. If a secret is committed, tell the team immediately; deleting it later does not remove it from history.

## Local setup

Install Git, Node.js with npm, and an editor. **Node 24 is the tested default**; the current tooling supports `^20.19.0 || ^22.13.0 || >=24`. Node 21 and 23 are outside ESLint's supported range.

```bash
git clone https://github.com/agile-students-fall2026/generic-mern-stack-project-careerhive.git
cd generic-mern-stack-project-careerhive
git config user.name "your-github-username"
git config --global pull.rebase false
cd front-end
npm install
npm run dev
```

Confirm your Git name matches your own GitHub username with `git log` after committing. The dev server normally runs at http://localhost:5173; use the URL Vite prints if that port is occupied.

Install app dependencies inside their app folder. The frontend is in `front-end/`; `back-end/` remains a placeholder until Sprint 2. Share needed secrets privately through the course channel.

## Checks and PR review

Run these inside `front-end/` before requesting review:

```bash
npm test
npm run lint
npm run build
```

All three must pass. `npm run preview` serves the production build locally. Record actual commands and results in the PR; for UI changes include the viewport, interactions checked, and screenshots. State anything unverified or unfinished.

Frontend tests use Node's runner, React/Vite, and jsdom. The local mock-API tests open an ephemeral localhost port. These tests do not replace real-browser layout, scrolling, image, or focus checks; see the [frontend README](./front-end/README.md).

Sprint 2 backend tests will use mocha/chai with c8 coverage, with each developer covering at least 10% of the backend code; start/test commands will be added when implemented.

Ask questions or propose changes to this agreement in the team channel or an issue, then use the same teammate-review workflow.
