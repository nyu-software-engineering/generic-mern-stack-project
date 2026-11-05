Thanks for your interest in contributing! This document is our team's agreement on how we work together. Everyone contributing to HobbyHub is expected to follow it.

# Team Norms
### Team Values
- We communicate in our public #hobbyhub Discord channel so the whole team (and course staff) can see decisions.
- We respond to teammates' messages within [24 hours].
- If someone is stuck, they ask for help in #hobbyhub after [30 minutes] of trying on their own. Others help if they can.
- Disagreements are discussed openly in the channel or at standup. If we can't agree, we go with the Product Owner's call for product decisions and a majority vote for technical ones.
- If a team member isn't contributing, we first reach out to them directly. If nothing changes after [one sprint], we raise it with the course staff.

### Sprint Cadence
- Sprints are [2 weeks] long.
- Each sprint has a Scrum Master and Product Owner. These roles rotate every sprint so everyone fills each one at least once.

### Daily Standups
- Standups happen Saturday 11:00am, Tuesday 7:45pm, Thursday 7:00pm on Discord/Google Meet.
- Each member answers: What did I do since last standup? What will I do next? Is anything blocking me?
- Members are expected to attend synchronously. Anyone who can't attend posts their update in #hobbyhub beforehand.
- A member who makes no progress on a task for two standups in a row will be flagged to the Scrum Master.

### Coding Standards
- We use VS Code as our editor
- Don't over-engineer. Write the minimum code that gets the task done.
- Never push broken code to `master`. Test your code before opening a pull request.
- Make small, frequent commits with descriptive messages (e.g. `Add search bar to Discovery page`).
- Delete unused code and comments before submitting.

# Git Workflow
We follow the **feature branch workflow**:

1. Pull the latest `master`: `git checkout master && git pull`
2. Create a branch for your task: `git checkout -b feature/short-description`
3. Make your changes and commit them with clear messages.
4. Push your branch: `git push -u origin feature/short-description`
5. Open a pull request on GitHub. **Set the base repository to `agile-students-fall2026/generic-mern-stack-project-hobbyhub` and the base branch to `master`.** GitHub defaults to the instructor's repo, so always check this.
6. At least one teammate reviews and approves the pull request before it is merged.
7. After merging, delete the branch.

Branch naming:
- `feature/...` for new features
- `fix/...` for bug fixes
- `docs/...` for documentation

# Rules of Contributing
- Every piece of work must be tied to a GitHub Issue (user story, task, or spike) on the current sprint's task board.
- Assign yourself to an issue before starting work on it, and move it across the task board as you go.
- Every issue must have a label: `user story`, `task`, or `spike`, plus the relevant `Sprint #` label.
- Commit using your own GitHub account. Your git username must match your GitHub username so contributions are tracked correctly.
- Never commit secrets (passwords, API keys, database URLs). Store them in a `.env` file, which is excluded by `.gitignore`.

# Setting Up Local Development Environment
1. Install [Node.js](https://nodejs.org/) (LTS version) and [Git](https://git-scm.com/).
2. Clone the repository: git clone https://github.com/agile-students-fall2026/generic-mern-stack-project-hobbyhub.git
cd generic-mern-stack-project-hobbyhub
3. Set your git username to match your GitHub username:
4. Install dependencies (once the front end and back end are set up):

# Instructions for Building and Testing
will be updated soon, when we reach that stage.
