# Bounty
A web app for NYU students who want to find items they've lost on campus by speaking to fellow members of the community.  

## What and why?
Bounty would be a campus-based platform where students can post belongings they have lost, report items they have found, or ask the community for something they need on short notice. At NYU, these situations are usually handled through separate group chats, social media posts, or individual building lost-and-found desks. Bringing everything into one system would make it easier for students to reach the right people quickly. Users could also attach a reward to a lost-item post to motivate others to help search for something important.

## For whom?
The platform would primarily serve NYU students who spend time across different campus buildings and locations. Our first users could be friends, classmates, roommates, and other students we regularly interact with, allowing us to test the system with people who could realistically use it.

## How?
Students could post an item they lost or found with details such as a photo, description, location, category, and approximate time. Lost-item posts could include an optional bounty. The platform would also let students ask for items they temporarily need, such as a charger, calculator, textbook, or umbrella. Other students could respond to these posts and coordinate with the person who created them. Search tools and filters would help users find relevant listings, and completed posts could be marked as resolved.

## Scope
The project is reasonable because it involves several connected parts, including user accounts, different types of posts, image uploads, search and filtering, messaging or responses, notifications, and bounty tracking. These features provide enough work to divide among team members without making the project too large for one semester. The main goal would be to build a complete system where students can post, search, respond, and resolve listings. Features such as automatic matching between lost and found items, reputation scores, or location-based suggestions could be added in the future.

## Team
- Leonardo Villalobos ([GitHub](https://github.com/LeoLobo9906))
- Alyssa Lai ([GitHub](https://github.com/AlyssaLai111))
- Natt Hong ([GitHub](https://github.com/nmh6063-star))
- Sunny Chen ([GitHub](https://github.com/ynnsnxhc))

## History
We've all lost something at some point, whether it be something as trivial as a pencil or something as important as our keys. Between trying to find that item yourself or frantically asking social media for help, it might feel a bit futile. So, as a team of NYU students, we decided to work on a project where students can get their items lost on campus back with the help of the community. 

Open to [contributions](https://github.com/agile-students-fall2026/generic-mern-stack-project-bounty/blob/master/CONTRIBUTING.md).

## Instructions
The app has two parts that run at the same time: an Express.js back-end and a React.js front-end. You will need [Node.js](https://nodejs.org/) installed.

### 1. Get the code
1. Fork this repository
2. Clone your fork of this repository to your local machine
3. Navigate into the project directory

### 2. Set up and run the back-end
1. Navigate into the back-end directory: `cd back-end`
2. Copy the example settings file: `cp .env.example .env`
3. Run `npm install` to install all dependencies listed in the package.json file
4. Run `npm run dev` to start the Express.js server at http://localhost:3000
5. Leave this terminal running

### 3. Set up and run the front-end
1. Open a second terminal and navigate into the front-end directory: `cd front-end`
2. Run `npm install` to install all dependencies listed in the package.json file
3. Run `npm run dev` to launch the React.js development web server
4. Navigate your web browser to http://localhost:5173

The front-end automatically sends all `/api` requests to the back-end, so both must be running.

### Running the back-end tests
From the back-end directory:
- `npm test` runs the unit tests (mocha and chai)
- `npm run coverage` runs the tests and shows the code coverage report (c8)
