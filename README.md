# Doin

**Less scrolling. More doing.**

Doin is a social discovery platform that helps people connect through shared hobbies and interests. Its goal is to make it easier to find people who enjoy the same activities and turn common interests into actual experiences.

> **Status:** Planning / Sprint 0. Features and implementation decisions below are proposals for team review, not completed functionality.

## The problem

Finding people who share your hobbies can be difficult, especially when moving to a new place, starting university, or trying something new. Existing social platforms make it easy to see content and communicate, but not always to find someone who wants to participate in a specific hobby.

## Our solution

Doin will let users describe their interests, discover others with overlapping hobbies, and identify potential activity partners. We aim to prioritize meaningful connections around shared activities rather than endless browsing.

## Target users

Our initial audience is university students and young adults looking for people to enjoy hobbies and activities with. The concept could later extend to larger communities.

## Proposed MVP

Our first usable version aims to support:

- **Accounts:** Sign up, log in, and log out, (Account Creation requirements).
- **Profiles:** Create and edit a basic profile and short bio, includes hobbies/interests as labels. Profiles would be shown as cards and there would be contact information provided within the Profile cards as labels.
- **Interests:** Select hobbies from a list and update them later.
- **Discovery:** Browse other users with overlapping interests. A "For You Page" type Discovery mechanic.
- **Compatibility:** Display shared interests and optionally a simple similarity score. The score would be considered a "small" extra UI feature that would appear on profile cards during the "Discovery" process.
- **Event Planner:** The Event Planner would consist of creating announced Events on the app focused on a shared hobby/interest with someone you connected with as the "Event Creators".

**Under discussion:** A lightweight connection request and acceptance flow to allow users to express interest in connecting, without introducing full chat functionality.

### Example user journey

1. A new user signs up and creates a profile.
2. They choose basketball, photography, and hiking as hobbies.
3. Doin shows other users with overlapping interests.
4. They browse profiles and see their shared hobbies.
5. If the team includes connection requests in the MVP, they can send and accept an invitation to connect.

## Future possibilities (not part of the initial MVP)

- Messaging between connections
- More sophisticated interest-based recommendations
- Location and availability-based discovery with privacy safeguards

## Proposed technology stack

We are considering the MERN stack:

- **MongoDB:** Database
- **Express.js and Node.js:** Backend and API
- **React:** Frontend

The team will confirm its architecture and tooling during Sprint 0.

## Project management

We are using Scrum practices and GitHub Projects for planning and tracking work. The Product Backlog contains user stories; each sprint has its own Sprint Backlog and Task Board with tasks and research spikes.

## Getting started

Local installation and run instructions will be added after the application skeleton and development environment are established. We do not yet have a verified installation procedure.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development conventions, branching, pull requests, and collaboration practices.

## Sprint 0: Roles

-Full name: Elize Azzi, (Github: ea3682), Role: Stakeholder

-Full name: Maurice Farfan, (Github: MSF841), Role: Developer

-Full name: Alpartun Gunhan, (Github: AlpartunG), Role: Product Owner

-Full name: Alp Ozbay, (Github: ozbayalp), Role: Scrum Master


