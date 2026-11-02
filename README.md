# Sublet Search

Sublet Search is a mobile-friendly web application designed to help students and other renters find and advertise short-term housing. It aims to bring sublet listings, property details, search tools, and communication between renters into one convenient platform.

## Product Vision Statement

For students and renters seeking temporary housing, Sublet Search aims to provide a simple and accessible way to discover available sublets, compare options, and communicate directly with people offering properties.

Instead of relying on scattered social media posts and disconnected listing platforms, users will be able to find relevant housing information in one organized place.

Our initial goal is to make the essential process of finding, viewing, and contacting someone about a sublet straightforward. Additional features will be developed and refined based on stakeholder feedback.

## Planned Features

- Browse sublet listings and view property details.
- Search by location and filter by price and availability.
- Explore apartments using a map view.
- Save listings for later.
- Contact sublessors through messaging.
- Create and manage sublet listings.
- Create an account and manage a user profile.

These are planned features and may change as the project develops.

## Team Members

- [nianordv](https://github.com/nianordv)
- [jl15113](https://github.com/jl15113)
- [kh-noma](https://github.com/kh-noma)
- [tristange123](https://github.com/tristange123)

## Project Background

Sublet Search is a team project developed for the Fall 2026 Agile Software Development & DevOps course at New York University.

Our team chose to focus on short-term housing because finding temporary accommodation can be difficult, particularly for students who need housing for a limited period. The project aims to make this process more organized and convenient for both people searching for sublets and people offering them.

We are developing the application incrementally using Scrum practices, including user stories, sprint planning, prototypes, and stakeholder feedback.

## Technology Stack

The project follows the MERN-stack approach:

- **MongoDB** — Database (planned)
- **Express.js** — Back-end framework (planned)
- **React.js** — Front-end library
- **Node.js** — JavaScript runtime
- **Vite** — Front-end development and build tool

## Development, Building, and Testing

The application is currently under development. The React front end has been initialized using Vite, while the remaining application features and back-end integration are being implemented in later stages.

### Prerequisites

- Node.js and npm installed (the front-end setup has been tested with Node.js 24).
- Git installed to clone the repository.

### Running the Front End

First, clone the repository and navigate to the project folder:

```bash
git clone https://github.com/agile-students-fall2026/generic-mern-stack-project-sublet-search.git
cd generic-mern-stack-project-sublet-search
```

Navigate to the front-end directory and install dependencies:

```bash
cd front-end
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in the terminal, usually:

http://localhost:5173/

### Building the Front End

To create a production build, run the following from the `front-end/` directory:

```bash
npm run build
```

The compiled application will be generated in the `front-end/dist/` directory.

### Testing

The front-end can currently be checked by running the development server and verifying that the application loads in the browser.

The production build can be verified with `npm run build`. Additional testing instructions will be added as the project develops.

### Back End

The `back-end/` directory is reserved for the Express.js server and database integration. Setup and run instructions for the back end will be added when those components are implemented.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the team's development workflow, contribution rules, and collaboration guidelines.

## Project Resources

- [UX Design Documentation](UX-DESIGN.md) — App map, wireframes, and prototype.
- [App Map](ux-design/app-map.png) — Diagram of the application's screens and navigation.
- [UX Design Files](ux-design/) — Design exports and editable source files.
- [GitHub Issues](https://github.com/agile-students-fall2026/generic-mern-stack-project-sublet-search/issues) — User stories, tasks, and planned features.
