# Contributing to Later

This document is a contract between everyone who works on this project: team members, collaborators, and outside contributors. By opening a pull request, you agree to the rules and processes described here.

## Table of Contents

1. [Team Norms](#1-team-norms)
2. [Git Workflow](#2-git-workflow)
3. [Rules of Contributing](#3-rules-of-contributing)
4. [Local Development Setup](#4-local-development-setup)
5. [Building and Testing](#5-building-and-testing)
6. [Getting Help](#6-getting-help)

---

## 1. Team Norms

These are commitments we make to each other. They reflect how our team actually works.

### Team Values

- **Respect:** We treat teammates and contributors with courtesy and assume good intent.
- **Honesty:** We report our real progress, admit mistakes and blockers early, and credit others' work. We never claim work we did not do, and we never hide a broken build or a missed task.
- **Accountability:** We do what we say we will do. If we cannot, we say so as early as possible.
- **Quality:** We write high-quality code and review each other's work carefully.

### How We Work Together

- Our main communication channel is **Instagram**.
- Every member commits work under their own GitHub account so contributions are visible.
- If you need help, send a message in the team chat describing the problem and what you have already tried. Other members respond within two hours.

### Sprint Cadence

- Each sprint is approximately **2 weeks** long.
- Work is tracked on the **Later Task Board** in GitHub Projects.
- Each member keeps their assigned tasks up to date on the board as they work on and complete them.

### Standups

- **Schedule:** Monday 11:00–11:15, Wednesday 11:00–11:15, and Thursday 11:20–11:35, on Zoom.
- Members are expected to attend **synchronously**. Each person answers:
  1. What did I do since the last standup?
  2. What will I do next?
  3. What is blocking me?
- A member who cannot attend needs a valid reason, and must post their answers to the three questions in the team chat before the standup.

### Definition of Done

A task or spike is done only when:

- The code is written and meets the acceptance criteria in its issue.
- It has been peer-reviewed and approved by at least one teammate who is not the author.
- Automated tests pass and the build is not broken.
- Any needed documentation is updated.
- It is merged into `main` and its card is moved to **Done** on the task board.

### Coding Standards

- Visual Studio Code is the designated code editor.
- Write the minimum code to get things working end to end first, then iterate and improve.
- Code for each task and spike must be peer-reviewed and pass tests before merging into `main`.
- Always push working code. If you break the pipeline or build, fixing it is your top priority.
- Make small commits, one per feature or bug fix, with clear commit messages.
- Use descriptive variable and function names and avoid unnecessary abbreviations.
- Do not leave dead or commented-out code behind. If you see it, delete it.
- Write tests for critical integration points and functionality.

### Resolving Conflicts

1. **Talk directly:** The people involved discuss the disagreement openly and respectfully.
2. **Team discussion:** If it is still unresolved, bring it to the next standup. Disagreements about the technical direction of the project are settled by consensus.
3. **Escalate:** If a member repeatedly fails to deliver on their obligations, or a conflict cannot be resolved by the team, we raise it with the professor or TA.

---

## 2. Git Workflow

We use a **feature-branch workflow**. No one commits directly to `main`; all changes go through reviewed pull requests.

### Step by Step

1. During sprint planning, pick tasks you would be excited to take on. Remaining tasks are assigned by Aashma or whichever member is responsible for the task board.
2. When you are ready to start a task, pull the latest changes from `main` into your local repository.
3. Create a new branch for your task (see [Create a Feature Branch](#create-a-feature-branch) for naming).
4. Make your changes and test them.
5. Commit small and often with descriptive messages.
6. Stay up to date by merging or rebasing `main` into your branch regularly.
7. Push your branch to GitHub.
8. Open a pull request into `main`, link the issue (e.g. `Closes #42`), and request a review.
9. Address review feedback by pushing more commits to the same branch.
10. Merge once the pull request is approved and all checks pass.

### Commit Messages

- Start with a short summary in the present tense (e.g. `Add vote buttons to place card`).
- Add detail in the body when something is not obvious.
- One logical change per commit.

---

## 3. Rules of Contributing

### How and What You Can Contribute

- Report bugs and suggest features by opening an issue.
- Fix bugs, build features, write tests, or improve documentation from open issues on the task board.
- Review other people's pull requests.

Before starting work, check that an issue exists and that nobody else is already assigned to it. For anything large, comment on the issue first so the team can agree on the approach.

### Reporting Bugs and Requesting Features

Search existing issues first to avoid duplicates.

- **A good bug report includes:** steps to reproduce, expected vs. actual behavior, screenshots or error output, and your environment (OS, browser, Node version).
- **A feature request should explain:** the problem it solves and who benefits.

### Pull Request Rules

Every pull request must:

- Be linked to an issue
- Target `main`
- Have a clear title and a description of what changed and why
- Include screenshots for visible UI changes
- Be small and focused (one task per pull request)
- Pass all tests
- Include tests for new behavior where applicable
- Contain no secrets, `.env` files, or `node_modules`
- Be approved by at least one teammate who is not the author
- Have all review comments resolved

### Code Review

- **Authors:** Review your own diff before requesting a review, and respond to every comment.
- **Reviewers:** Review within 24 hours. Be specific, explain the reasoning behind your requests, and keep feedback about the code, not the person. Approve only when you would be comfortable maintaining the code yourself.

---

## 4. Local Development Setup

Follow these instructions to set up your local environment and start contributing.

### Prerequisites

- **Git**, installed on your computer
- **A GitHub account** with access to the team's repository
- **Node.js and npm**, to run the JavaScript development environment

### Configure Git

GitHub attributes commits to your account by matching your commit **email**, so set both your name and the email linked to your GitHub account:

```bash
git config --global user.name "your-github-username"
git config --global user.email "your-github-email@example.com"
```

Verify your configuration:

```bash
git config user.name
git config user.email
```

### Clone the Repository

Team members clone the shared repository directly rather than creating forks:

```bash
git clone https://github.com/agile-students-fall2026/Later.git
cd Later
```

### Install Dependencies

Run `npm install` in each directory of the project that contains a `package.json` file:

```bash
npm install
```

### Create a Feature Branch

Before making changes, update your local copy and create a branch for your task:

```bash
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

Use a short, descriptive branch name that reflects the task, e.g. `feature/paste-link-input` or `fix/map-pin-offset`.

### Verify Your Setup

Check that dependencies installed without errors and that any required environment variables (`.env`) and database connections are configured. Ask a teammate for the values; never commit them.

Refer to the [README.md](README.md) and the scripts in the project's `package.json` files for the commands to start the application.

Once your environment works, develop on your feature branch and submit your changes through a pull request following the [Git workflow](#2-git-workflow).

---

## 5. Building and Testing

To be added once the project reaches the build and testing stage (after Sprint 0).

---

## 6. Getting Help

- **Questions about the project:** message the team on Instagram.
- **Questions about this document:** ask the Scrum Master.

---

*This document was collaboratively written and agreed upon by all team members.*
