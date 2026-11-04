# Contributing to Doin

This document defines the team's initial collaboration practices. It is a **draft** to be reviewed and approved by all four team members.

## Communication

- Use the team's agreed messaging channel (such as Discord) for project communication.
- Flag blockers early and keep decisions visible to the whole team.
- Update assigned GitHub issues as work progresses.
- Confirm major scope and sprint decisions with all team members.

## Development environment

- Use Visual Studio Code for editing and its built-in Git integration or integrated terminal for Git operations.
- Use a Linux/UNIX-compatible shell (WSL or Git Bash on Windows).
- Configure your Git identity to match your GitHub username, as required by the course.
- Configure Git pulls not to rebase (`git config --global pull.rebase false`).
- Follow the course's required single-line commit message convention and set up the prescribed local commit-message hook.
- Use the team's agreed ESLint and Prettier configuration once established.
- Do not use prohibited agentic coding tools or Git desktop clients for course work. Check the course conventions for the full restriction list.

## Issues and Scrum workflow

- Create a GitHub issue before beginning substantive work.
- Use `user story` for user-facing requirements, `task` for implementation or documentation, and `spike` for time-boxed research.
- Label issues with their relevant sprint (for example, `Sprint 0`).
- Link tasks and spikes to the related user story where applicable.
- Assign concrete tasks and spikes to contributors and keep the current sprint's task board updated: **To do**, **In progress**, **Awaiting review**, **Done**.
- Do not retrospectively alter completed sprint boards.

## Feature branch workflow

Never develop directly on `main` (or the repository's designated default branch).

1. Start from the latest default branch.
2. Create a short-lived feature branch for one issue, for example `task/15-hobby-selection`.
3. Make focused changes, test them, and commit with a descriptive **single-line** message.
4. Push the branch and open a pull request **into the team's own repository**, not the instructor's upstream repository.
5. Reference the relevant issue in the pull request description.
6. Request review from at least one other teammate. Never approve your own pull request.
7. Address feedback before merging. Move the issue to **Done** when the work is actually complete.

Example terminal commands (after cloning the repository):

```bash
git checkout main
git pull origin main
git checkout -b task/15-hobby-selection
# Edit and test files in VS Code
git add .
git commit -m "Add hobby selection interface"
git push -u origin task/15-hobby-selection
```

Replace `main` and the issue number with the actual repository default branch and issue. Check staged changes before committing.

## Pull request checklist

- [ ] This pull request addresses or references an issue.
- [ ] The change is focused and reasonably small.
- [ ] The code runs locally and relevant tests pass, where applicable.
- [ ] Formatting and lint checks pass, once configured.
- [ ] Any necessary documentation was updated.
- [ ] Another teammate has reviewed and approved the work.

## Team decisions still needed

(Empty for now)

## Reference

Course conventions: https://knowledge.kitchen/content/courses/agile-development-and-devops/conventions/

GitHub project management: https://knowledge.kitchen/content/courses/agile-development-and-devops/scrum/github-project-management/

## Team Messaging Channel & Meeting Cadence

-Whatsapp & Discord
-Meeting Schedule:
*Saturday: 12:00-12:15 (Might be longer),
*Monday: 09:15-09:30 (--),
*Wednesday: 13:00-13:15 (--)


## Testing approach and definition of done

-3 Requirements per backlog item, if all three requirements are met, task is done. Agreed upon by the whole team.


## Review expectations and merge strategy

Review strategy consists of assigned reviewer checking if all 3 done requirements are met.
