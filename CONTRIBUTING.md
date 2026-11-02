# Guide to Contributing


## Team Norms

### Team values

- We treat each other with respect and assume good intentions.
- We communicate openly in our team's shared channel on the course messaging app, where the professor and course assistants can see our work.
- If you are stuck for more than a few hours, ask for help in the team channel instead of waiting until a deadline.
- We respond to messages directed at us within 24 hours, and sooner close to a deadline.
- If you cannot finish a task you took on, tell the team as early as possible so someone else can help or pick it up.

### Resolving conflicts

- Disagreements about direction are discussed in the team channel or at standup, and decided by majority vote. The Product Owner breaks ties on product questions.
- If a member repeatedly misses their commitments, the team first raises it with them directly. If it continues for more than two standups, the Scrum Master reports it to the professor or course assistants.

### Sprint cadence

- Sprints follow the course schedule, about two weeks each.
- Each sprint starts with sprint planning and ends with a stakeholder demo.
- The Scrum Master and Product Owner roles rotate every sprint, so each member fills each role at least once.

### Daily standups

- Standups are held every **Monday, Wednesday and Friday at 7pm ET** on Discord voice, last no more than 15 minutes, and everyone attends live.
- Everyone attends synchronously. Each member answers three questions: what they did since the last standup, what they are working on now, and anything blocking them.
- The Scrum Master posts a written report of each standup to the team's standups channel.
- We do not cover for teammates who do not participate. A member who makes no progress for two or more standups in a row will be reported to the professor.

## Git Workflow

We use the **feature branch workflow**.

1. Always start from the latest `master`:
```bash
   git checkout master
   git pull
```
2. Create a branch for each user story, task or spike, named with your name and the feature:
```bash
   git checkout -b yourname-feature-name
```
3. Make small commits with clear, one-line messages, and push your branch:
```bash
   git push -u origin yourname-feature-name
```
4. Open a pull request on GitHub. Make sure the **base repository is `agile-students-fall2026/generic-mern-stack-project-leverage`** (not the instructor's repository) and the base branch is `master`.
5. Link the issue in the pull request description, for example `Closes #12`.
6. At least one other team member reviews and approves the pull request before it is merged.
7. Never commit directly to `master`.

## Rules for Contributing

- Every piece of work must have a GitHub issue labeled `user story`, `task` or `spike`, plus the label of the sprint it belongs to (for example `Sprint 1`).
- User stories stay unassigned. Tasks and spikes are assigned to the person doing them.
- Move your issues across the task board as you work (To do, In progress, Awaiting review, Done).
- Only push code that works. If you break the build, fixing it is your top priority.
- Write clear, self-documenting code with descriptive names, and delete dead or commented-out code.
- Do not commit secrets such as passwords or API keys, or anything listed in `.gitignore`.
- Commit messages must be a single line. Enable the repository's commit hook to enforce this (see setup below).

## Setting Up the Local Development Environment

1. Install [git](https://git-scm.com/) and [Node.js](https://nodejs.org/) (LTS version).
2. Clone the repository:
```bash
   git clone https://github.com/agile-students-fall2026/generic-mern-stack-project-leverage.git
   cd generic-mern-stack-project-leverage
```
3. Set your git username to **exactly** your GitHub username, so your contributions are tracked correctly:
```bash
   git config --global user.name "your-github-username"
```
4. Enable the single-line commit message hook:
```bash
   chmod a+x .githooks/commit-msg
   git config core.hooksPath ".githooks"
```

## Building and Testing

See the [Building and testing](README.md#building-and-testing) section of the README for how to install and run the app. Before opening a pull request, run `npm run lint` and `npm run build` inside `front-end/` and make sure both pass.

## Effort Estimation

We estimate user stories using planning poker. Each team member privately picks a card, then everyone reveals at the same time. If the estimates differ widely, the people with the highest and lowest cards explain their reasoning, and we vote again until we agree.

We use a physical planning poker deck during sprint planning.
**Deck:** 0, 1, 2, 3, 5, 8, 13, ?

| Card | Meaning |
|---|---|
| 0 | No effort |
| 1–3 | Small |
| 5–8 | Medium |
| 13 | Large — consider splitting the story |
| ? | Not enough information to estimate |
