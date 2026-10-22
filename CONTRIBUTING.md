# Contribution Guidelines

The following includes our team norms, Git workflow, rules & considerations of contributing, instructions to setup the local development environment, and instructions for building and testing the project (WIP).

# Team Norms

(General)
1. Communicate through our group chat and respond within a reasonable time (within 24 hours).
2. Attend scheduled meetings in-person or via Google Meets and let the team know if you are unavailable.
3. Complete assigned tasks by the agreed deadlines.
4. Commit to peer-reviewing before submission of materials.

(Sprints & Meetings)
1. Sprints will follow the course deadlines [(link to schedule)](https://knowledge.kitchen/content/courses/agile-development-and-devops/schedule/).
2. Before a standup meeting concludes, team members will pencil in the next meeting time & location.
3. Team members will present synchronously, and will update asynchronously if unexpected circumstances arise.

(Coding Standards)
1. Always use single-line commit messages.
2. Write clean, reusable code and document as necessary.
3. Follow a feature branch workflow (details below).

(Accountability)
1. Should any issues in communication arise, we will try to meet privately or collectively to solve the issue. If a consensus cannot be reached, we will reach out to course administrators for support.

And, of course... have fun!

# Git Workflow

Team members will follow a feature branch workflow.

1. Create an isolated branch for each new feature.

```
git checkout -b feature-name master
```
2. Check status and commit changes as usual.
```
git status
git add ...
git commit -m "My commit message here."
```
3. Push changes often! Initially push to a remote tracking branch so that changes do not get lost.

(First Push)
```
git push -u origin feature-name
```
(Subsequent Pushes)
```
git push
```
4. Once ready, create a pull request.

   \**Remember to switch to the correct base repository. Don't create a PR in the parent repository!*
5. At least one other team member (not the owner of the changes) will review changes and make any necessary comments.
6. Anyone can merge commit!
```
git checkout main
git pull
git pull origin feature-name
git push
```

# Branch Protection

A **ruleset** has been created to protect the *master* branch. The following outlines the ruleset configuration:

* Branch Targeting Criteria: *Default* (master branch)
* Restrict Deletions: *Enabled* (stops branch from being deleted)
* Require a Pull Request before Merging: *Enabled* (enforces feature branch workflow)
     * Required Approvals: *1*
     * Require Approval of the Most Recent Reviewable Push: *Enabled* (some *other* member must review the PR)
     * Require an Additional Approval for Copilot PRs: *Enabled*
     * Allowed Merge Methods: *Merge, Squash* (removed rebasing)
* Block Force Pushes: *Enabled*

# Rules of Contribution

1. Create an issue before starting a major feature or task.
2. Keep each branch focused on one feature or task.
3. Test your changes before creating a pull request.
4. Write clear pull request descriptions.
5. Address reviewer feedback before merging.
6. Do not commit passwords, API keys, or other private information.
7. Ask the team for help if you are stuck or need clarification.

# Local Development Configuration

TODO

# Building & Testing

Check back later for more details.