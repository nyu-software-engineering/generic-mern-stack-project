# Contributing to ApplyTrack

Thank you for your interest in contributing to ApplyTrack. This document is the agreement every contributor follows. 

By contributing to this repository, you agree to follow the norms and processes below.



---

## Team Norms

### Team Values

- **Respect:** We treat each other's time, ideas, and work with respect. Feedback is about the code, never the person.
- **Ownership:** When we take on a task, we see it through, or we say early that we can't.
- **Transparency:** Progress and blockers are visible to everyone on the task board and in standups.
- **Helpfulness:** If a teammate is stuck, we help. Asking for help is encouraged, not a weakness.
- **Quality over speed:** We would rather merge a smaller feature that works than a large one that breaks `master`.

**Asking for help:** If you are blocked on a task, ask for help.

### Coding Standards

- Keep code readable: descriptive names for variables and functions, small focused functions, and comments where the purpose isn't obvious.
- **Don't break `master`.** Run the app and the tests locally before opening a pull request.
- Commit small, logical changes often. Avoid huge commits that mix unrelated work.
- Write clear single line commit messages in the present tense that say what the commit does, e.g. `Add validation to application form`.
- Never commit secrets (API keys, passwords, database URLs). Use a `.env` file, which is listed in `.gitignore`.
- Don't commit generated files or dependencies (e.g. `node_modules/`, build output).



## Git Workflow

We follow the feature branch workflow. All changes are made in branches, peer-reviewed through pull requests, and merged into `master`, which must always be in a deployable state.


### Step by step

1. **Get the latest `master`:**
   ```bash
   git checkout master
   git pull origin master
   ```

2. **Create a feature branch** named after the task or issue:
   ```bash
   git checkout -b feature/<issue-number>-<short-description>
   ```
   Branch name prefixes:
   | Prefix | Use for | Example |
   | --- | --- | --- |
   | `feature/` | New functionality | `feature/12-add-application-form` |
   | `fix/` | Bug fixes | `fix/27-login-error-message` |
   | `docs/` | Documentation | `docs/update-readme` |

3. **Make your changes and commit often:**
   ```bash
   git add <files>
   git commit -m "Add company and position fields to application form"
   ```

4. **Bring in the latest `master` before pushing**, to resolve any conflicts locally:
   ```bash
   git checkout master
   git pull origin master
   git checkout feature/<branch-name>
   git merge master
   ```
   Resolve any conflicts, run the app to make sure it still works, then commit.

5. **Push your branch to the team repository:**
   ```bash
   git push -u origin feature/<branch-name>
   ```

6. **Open a pull request** on GitHub from your branch into `master`.

7. **Address review feedback** by committing to the same branch and pushing again. The pull request updates automatically.

8. **Merge** once the pull request is approved, then **delete the branch** on GitHub.

9. **Clean up locally:**
   ```bash
   git checkout master
   git pull origin master
   git branch -d feature/<branch-name>
   ```

### Rules

- **Never commit or push directly to `master`.** `master` is protected and only changes through approved pull requests.
- One branch per task or issue. Keep branches small and short-lived.
- Pull from `master` often to avoid large merge conflicts.

---

## Rules for Contributing

### What to contribute

- Work on tasks that are **assigned to you on the task board** for the current sprint.
- Every change should be linked to an **issue** (a user story, task, or spike). If you find something that needs doing and there's no issue for it, create one first and discuss it with the team.
- Bug reports and suggestions are welcome as issues. Describe the problem, the steps to reproduce it, and what you expected to happen.

### Pull requests

Every pull request must:

- Have a clear title describing the change.
- Include a description of **what** changed, **why**, and **how to test it**.
- Be small enough to review in one sitting. Split large changes into several pull requests.
- Pass all tests and run without errors locally.

### Code review

- Every pull request needs **at least [one] approval** from another team member before merging.
- **Do not approve or merge your own pull request.**
- Reviewers check that the code works, is readable, follows our coding standards, and doesn't break existing features.

### Definition of Done

A task is done only when:

- [ ] The code meets the acceptance criteria of the issue.
- [ ] It runs locally without errors.
- [ ] Tests are written and passing (once testing is set up).
- [ ] The pull request has been reviewed and approved.
- [ ] It has been merged into `master`.
- [ ] The issue is closed and the card is moved to **Done**.

---

## Setting Up the Local Development Environment

To be updated

## Building and Testing

To be updated

