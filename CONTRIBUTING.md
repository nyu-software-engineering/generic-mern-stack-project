# Contributing to Worn

Thanks for your interest in contributing to Worn. This document explains how our team works, the rules for contributing, and how to set up the project locally. By submitting a contribution, you agree to follow the process described here.

## Team Norms

These are the commitments team members make to each other.

### Team Values

**How we work together**

- We communicate in Discord in the #worn channel
- We respond to messages directed at us within a couple days at a maximum
- We meet over video calls for standups or when needed: [Tu/Th/Su: 8:30 PM EST].

**Asking for help**

- Post in Discord channel with what you tried, what you expected, and what happened.
- Anyone who is free should respond. If no one can help, escalate to grader/professor.

**Resolving conflicts**

- Disagreements on direction are discussed openly and settled by team consensus. If consensus can't be reached, we vote on it or delegate the decision to the sprint's product owner
- If a member is failing to deliver on their obligations, the team first talks to that member directly. If the problem continues, we escalate to the professor.

### Sprint Cadence

- Sprints are **2 weeks** long.
- Sprint planning happens before the first day of the following sprint and the sprint review and retrospective happen also before that next sprint starts.

### Daily Standups

- **When:** [Tu/Th/Su: 8:30 PM EST], lasting no more than [15] minutes.
- Members are expected to attend synchronously.
- We do not cover for members who do not participate.
- A member who makes no progress on a task for four standups in a row will be have to discuss with larger group why they're unable to make progress on their given tasks.

### Coding Standards

- **Editor:** We use VS Code to keep contributions consistent and simple.
- **Don't over-engineer.** Write the minimum code to get things working end to end, then iterate.
- **Always push working code.** If you break the build, fix it right away.
- **Small, granular commits.** One feature or bug fix per commit.
- **Descriptive commit messages.** Say what changed and why. Keep it to one line.
- **Self-documenting code.** Use descriptive variable and function names and avoid unnecessary abbreviations.
- **No dead code.** Delete commented-out or unused code when you see it.
- **Automated tests.** Write tests for critical integration points and functionality.

## Git Workflow

We use a feature-branch workflow with pull requests.

1. **Never commit directly to `main`.** It must always contain working code.
2. **Create a branch** from the latest `main` for each task, spike, or bug fix:

   ```bash
   git checkout main
   git pull
   git checkout -b <type>/<short-description>
   ```

   Branch name examples: `feature/add-item-form`, `fix/cost-per-wear-rounding`, `docs/update-readme`.

3. **Commit often** in small, focused commits with descriptive messages.
4. **Push your branch** and open a pull request against `main`.
5. **Request a review** from at least [1] teammate.
6. **Address feedback** by pushing additional commits to the same branch.
7. **Merge** once the PR is approved and all checks pass. Merge commit, then delete the branch.

## Rules of Contributing

### What You Can Contribute

- Bug fixes
- New features that match a user story on our product backlog
- Documentation improvements
- Tests

For large changes or new features not on the backlog, please open an issue first so we can discuss it before you invest time.

### Pull Request Requirements

- Every task and spike must be **peer-reviewed** before merging into `main`.
- Link the related issue or user story in the PR description.
- Describe what changed, why, and how to test it.
- Keep PRs small and focused on one thing.
- Do not merge your own PR without a review.

### Reporting Bugs and Requesting Features

Open a GitHub issue. For bugs, include steps to reproduce, expected behavior, actual behavior, and screenshots if relevant.

## Local Development Setup

### Prerequisites

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) 20 or newer
- [Code editor, e.g. VS Code]

### Steps

1. Clone the repository:

   ```bash
   git clone [repository URL]
   cd [repository folder]
   ```

2. Install front-end dependencies:

   ```bash
   cd front-end
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the local URL Vite prints in the terminal (typically `http://localhost:5173`).
