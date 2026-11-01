# CareerHive

**Your whole job search, in one place.**

CareerHive is a mobile web app that helps college students and recent graduates manage their whole internship and job search in one place, from finding opportunities to keeping track of deadlines and applications.

## Product Vision

For college students and recent graduates applying to internships and entry-level jobs, CareerHive is one place to find opportunities, track applications, stay on top of deadlines, and figure out which roles are actually worth applying to.

Most job boards only help you find a posting. CareerHive helps with everything that happens after that too: saving and organizing applications by stage, reminding you about deadlines, using AI to explain how well a job matches your background, showing visa sponsorship info clearly, and letting applicants share what they know about the hiring process.

Our goal is to make the job search less scattered and stressful, especially for students applying to a lot of positions at once and for international students who need sponsorship information.

## The Problem

Students look for jobs across LinkedIn, Handshake, company career pages, school emails, and other job boards. Once they find a position, they still have to remember the deadline, decide if it's a good fit, keep track of where their application stands, and look somewhere else to learn about the hiring process.

When someone is applying to dozens of positions at the same time, it gets easy to forget opportunities, miss deadlines, or spend time on roles that aren't a good match for their background.

International students have another problem on top of that: information about visa sponsorship and work authorization is often hard to find or unclear.

## Our Solution

CareerHive brings the main parts of the job search into one app. Users can:

- create a profile with their major, graduation date, skills, interests, preferred job types, and locations
- browse and search internships and entry-level jobs
- filter by job type, location, deadline, and visa sponsorship
- see job details, including deadlines, requirements, the official application link, and sponsorship info
- save jobs to a personal tracker and move them through stages (Saved, Preparing, Applied, Interview, Offer, Rejected)
- see all upcoming application deadlines in one list
- get an AI match analysis that compares their profile with a job description, explains why it might or might not be a good fit, and points out missing skills
- read and post in a public discussion for each job listing about interview timelines, online assessments, sponsorship, and application updates

To keep the first version realistic, CareerHive focuses only on internships and entry-level jobs and uses a smaller, controlled set of listings instead of pulling postings from every job site.

## Core User Journey

A typical CareerHive user goes through these steps:

1. A student signs up and sets up their profile.
2. They browse or search for internships and entry-level jobs that fit their interests.
3. They open a job to check the details, sponsorship info, and AI match analysis.
4. They read the discussion to learn what other applicants have experienced.
5. They save the job to their tracker and apply on the company's site.
6. They update the application's stage as they hear back, and add notes along the way.
7. They check Home and Deadlines to see what needs their attention next.

## Project History

CareerHive began as a team project for NYU's Agile Development and DevOps course. The team focused on helping students and recent graduates organize a job search spread across job boards, deadlines, and application updates. During Sprint 0, the team defined the MVP and created an app map, mobile wireframes, and a Figma prototype to explore the core user journey.

## Team

CareerHive is being developed by:

- [Myra Rafiq](https://www.linkedin.com/in/myrarafiq/) ['myrarafiq'](https://github.com/myrarafiq)
- Tony Zhou ['TonyyZhou'](https://github.com/TonyyZhou)
- [Abubakar Diallo](https://www.linkedin.com/in/dialloni/) ['Dialloni'](https://github.com/Dialloni) 
- David Wang ['chocolatechipscookiecrumbles'](https://github.com/chocolatechipscookiecrumbles)

## Contributing

Read the [contribution guide](./CONTRIBUTING.md) for team norms, the Git workflow, review requirements, and local setup instructions.

## Project Status and Documentation

CareerHive is in Sprint 1. The React front end is set up in `front-end/`; the back end in `back-end/` is still a placeholder until Sprint 2.

See [UX-DESIGN.md](./UX-DESIGN.md) for the app map, wireframes, and outstanding design and prototype checks. The clickable prototype is on [Figma](https://www.figma.com/proto/R4lliiZKlfzQkVtCScmLcN/CareerHive-Prototype?node-id=75-3&starting-point-node-id=75-3).

## Running the front end

You need [Node.js](https://nodejs.org/) 20 or newer, which includes npm.

```bash
cd front-end
npm install      # first time, and whenever package.json changes
npm run dev      # starts the app at http://localhost:5173
```

Other commands, run inside `front-end/`:

- `npm run build` builds the production version into `front-end/dist/`
- `npm run lint` checks the code with ESLint
- `npm run preview` serves the production build locally

## Repository Structure

```
CareerHive/
├── front-end/       # React front end (Vite)
├── back-end/        # Planned Express back end; placeholder
├── ux-design/       # App map, wireframes, and UX design files
├── README.md
├── CONTRIBUTING.md
└── UX-DESIGN.md
```
