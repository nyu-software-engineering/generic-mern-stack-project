# Contributing to CareerHive

This file is the agreement for how work gets into CareerHive. Read it before you open a branch or a pull request.

CareerHive is a mobile web app that helps college students and recent graduates find internships and entry-level jobs and keep track of applications. The product vision and a longer description are in the [README](./README.md).

## Team

[Myra Rafiq](https://github.com/myrarafiq), [Tony Zhou](https://github.com/TonyyZhou), [Abubakar Diallo](https://github.com/Dialloni), and [David Wang](https://github.com/chocolatechipscookiecrumbles) are the core team.

Everyone is a developer. Design and code work are shared every sprint. Two extra roles rotate so that each person holds each one at least once:

- **Scrum Master** runs standups, watches the task board, and follows up on blockers.
- **Product Owner** orders the backlog and decides what the product should do when the team is split.

We name both people in the team channel and standups at the start of each sprint.

## Team norms

We wrote these down so nobody has to guess what is expected. Day-to-day talk happens in the team's shared channel on Discord. Course staff are in that channel. A decision made only in a private chat is not a team decision.

### Asking for help

If you are stuck for more than an hour, ask, and say what you already tried. Do not wait for the next standup to mention a blocker.

Reply to a message aimed at you within a day. If you cannot finish something you took, say so the same day so someone else can take it.

### Disagreements

We talk it through in the channel or on a short call and try to land on something everyone can live with.

- If we still disagree about what the user should be able to do, the Product Owner decides.
- If we still disagree about how to build it, we vote. The Scrum Master makes sure the conversation ends in a decision.
- If someone is not doing the work they took, we tell them directly. If it keeps happening, the Scrum Master tells the instructor. We do not quietly cover for missing work.

### Sprints

A sprint is two weeks. At the start we pick user stories from the product backlog, break them into tasks, and put that work on that sprint's GitHub task board. A task should be small enough for one person to finish between two standups.

### Standups

Standups are about 15-30 minutes. They happen at whatever time we set at the start of the sprint that works for the entire team. Show up. Please.

Each person answers three things:

1. What did you finish since the last standup?
2. What are you doing next?
3. What is blocking you?

We do not report for someone who is absent. If a person has made no progress for two standups in a row, the Scrum Master reports that to the instructor.

### Coding standards

- Visual Studio Code is the editor we standardize on. Another editor is fine if the code still matches the team's formatting once a linter is in place.
- Write the smallest amount of code that makes the feature work. Improve it after it works.
- `master` stays in a working state. If you break the build, you fix it.
- Make small commits, one change at a time, with a single-line message that says what changed.
- Name variables and functions for what they do.
- Delete commented-out code instead of leaving it in.
- Once we have tests, changes that affect behavior need tests, and those tests have to pass before the change is merged.

## Git workflow

We follow the [feature branch workflow](https://knowledge.kitchen/content/courses/agile-development-and-devops/slides/feature-branch-workflow/). Changes are made on a branch, a teammate reviews them in a pull request, and only then do they land on `master`. This repository's trunk is `master`.

There is one shared repository: [agile-students-fall2026/CareerHive](https://github.com/agile-students-fall2026/CareerHive). Make your branches here. Do not fork the repo again, and do not fork a teammate's copy.

### Start from the latest master

```bash
git checkout master
git pull origin master
```

### Branch from an issue

Name the branch after the issue you are working on.

A task:

```bash
git checkout -b user-story/13/task/9/implement-user-login
```

A spike:

```bash
git checkout -b spike/6/set-up-local-environment
```

Move that card to **In Progress** on the sprint board when you start.

Finish the branch within two or three days. A branch that sits longer than that will conflict with other people's work, and the whole team should help get it merged or closed.

### Commit

```bash
git add .
git commit -m "Add login form for user story #13"
```

Commit messages are one line. Push at least once between standups, even if the branch is not ready to merge yet.

### Update your branch, then push

```bash
git fetch origin
git merge origin/master
git push -u origin user-story/13/task/9/implement-user-login
```

Resolve conflicts on your own branch before you open the pull request.

### Open a pull request

Open the pull request on GitHub and assign a teammate as the reviewer. Move the card to **Awaiting Review**.

This repository is a fork of the instructor's repository, so GitHub will try to open the pull request against the instructor's repo. Change the base repository to **CareerHive** and the base branch to `master`. If you leave the instructor's repo selected, your teammates cannot review or merge the work.

Do not approve your own pull request.

### Review

The reviewer checks out the branch, runs whatever can be run, and reads the diff.

```bash
git fetch origin
git checkout user-story/13/task/9/implement-user-login
git pull
```

If something is wrong, leave comments and request changes. The author fixes them and says so. If the change works and fits the issue, the reviewer approves it.

### Merge

Merge with a merge commit. On GitHub, choose **Create a merge commit**. Do not choose **Rebase and merge**. The merge commit is part of the history we keep.

From the command line, either the author or the reviewer can merge after approval:

```bash
git checkout master
git pull origin master
git merge user-story/13/task/9/implement-user-login
git push origin master
```

Whoever merges moves the card to **Done**.

### Leave these out of git

- `.env` files, passwords, API keys, and database URIs
- `node_modules/` and build output
- anyone's personal data
- editor and OS junk (`.DS_Store` and similar are already in `.gitignore`)

If a secret gets committed, tell the team immediately. Deleting it in a later commit does not remove it from history.

## What to contribute

Start from a GitHub issue. If there is no issue for the work, open one and check with the team before writing a large change.

### Issues and labels

Every issue gets one of these labels:

| Label | Use it for |
| --- | --- |
| `user story` | A user-facing requirement in the product backlog |
| `task` | One piece of a user story, small enough to finish between standups |
| `spike` | Research or setup that is not tied to a single user story |

Also add the sprint label: `Sprint 0`, `Sprint 1`, `Sprint 2`, `Sprint 3`, or `Sprint 4`. An issue can carry more than one sprint label if the work continues into the next sprint. We use labels for this, not GitHub Milestones, because a milestone can only point at one sprint.

A task description should name the user story it comes from, for example `Related to user story #22`. The issue templates under `.github/ISSUE_TEMPLATE/` are the starting point.

### A change we will merge

- It does one thing. A login screen and a tracker redesign are two pull requests.
- It matches an open task, spike, or a bug you have written up.
- The pull request says which issue it closes and how you checked the change.
- Screens stay consistent with [UX-DESIGN.md](./UX-DESIGN.md) unless the team has agreed to change the design. If the design changes, update the design notes in the same pull request.
- It does not drag unrelated cleanup along with it. Clean up the code you touched and leave the rest for its own change.

### Stack we are aiming at

The front end will be React, built with Vite, using function components and JSX. The back end will be Express. We are not using Redux, Next.js, Bootstrap, or Material UI. Data that will later come from the server should not be hard-coded into components. Secrets go in `.env`, which is gitignored, and get shared in the course channel when someone needs them to run the app.


## Local setup

Install:

- Git
- Node.js 20 or newer, with npm
- Access to the shared GitHub repository
- Visual Studio Code, or another editor you will keep consistent with the team's formatting

Clone the shared repository. Do not fork it.

```bash
git clone https://github.com/agile-students-fall2026/generic-mern-stack-project-careerhive.git
cd generic-mern-stack-project-careerhive
git config user.name "your-github-username"
git config --global pull.rebase false
```

After your first commit, run `git log` and confirm the name on the commit is your GitHub username.

### Where things live

```
CareerHive/
├── front-end/     # React app (Vite)
├── back-end/      # Express server. Placeholder until Sprint 2.
├── ux-design/     # App map, wireframes, and prototype notes
├── README.md
├── CONTRIBUTING.md
└── UX-DESIGN.md
```

`back-end/` only holds a short note until Sprint 2. Install dependencies inside each app's folder, and do not commit `node_modules`, `dist`, or `.env`.

## Building and testing

### Front end

Run these inside `front-end/`:

```bash
npm install      # install dependencies
npm run dev      # start the app at http://localhost:5173
npm run build    # production build into dist/
npm run lint     # ESLint check
```

Run `npm run lint` and `npm run build` before you open a pull request; both must pass. Install the **ESLint** and **Prettier** extensions in VS Code, as the course conventions require.

There is no test suite yet.

### Back end (Sprint 2)

An Express server in `back-end/`. Unit tests will use mocha and chai, and c8 will check coverage. Each developer covers at least 10% of the back-end code. We will add the start and test commands here.

## Questions

Ask in the team channel, or open a GitHub issue if the whole team should see it. If a rule in this file is wrong or out of date, change it with a pull request like any other work.
