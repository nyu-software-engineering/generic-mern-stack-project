# Database Integration

Each team must have completed and [demo'd](https://knowledge.kitchen/content/courses/agile-development-and-devops/scrum/stakeholder-demos/) the integration of a database into their software application projects by the end of the corresponding Sprint.

## Technical requirements

### Musts...

- A MongoDB database hosted on a [free MongoDB Atlas](https://www.mongodb.com/cloud/atlas) instance **must** be used to store all dynamic data of the app.
- The database **must** be integrated into the Express.js back-end code using [mongoose](https://mongoosejs.com/).
- Any credentials used to log into a database or other remote service **must** be stored in a hidden file called `.env` that is excluded from version control by adding it to your .gitignore file. Load these credentials from environmental variables into your project using the [dotenv](https://github.com/motdotla/dotenv) module.
- Any account registration or log in functionality required by an app **must** use **JSON Web Tokens** (JWT) to validate authorization.
- When receiving data from the front-end to store into the database, the back-end **must** do data validation before sending that data to the database. Use the [express-validator](https://express-validator.github.io/docs/) module or something similar to perform data validation prior to sending any data originating from the request to the database.
- Credentials or URIs for logging into databases, APIs, or other remote services, must never be shared in version control. They are usually stored in private settings files, such as `.env` or similar, which are not included in the version control repository.

### Must nots...

- You **must not** host a MongoDB instance locally on your own machine, unless you must work offline for extended periods of time.
- You **must not** store any credentials used by your app to log into remote services, such as MongoDB or 3rd-party APIs, in version control.

## Grading

Individuals will be graded, in part, according to...

- individual code contributions, as visible through [git logs](https://github.com/bloombar/git-developer-contribution-analysis) - make sure you commit your own work!
- proper adherence to the [Feature Branch git workflow](https://knowledge.kitchen/content/courses/agile-development-and-devops/slides/feature-branch-workflow/)
- the [proper setup and maintenance of a GitHub repository](./instructions-0c-project-setup.md)
- the quality of the work as a whole

Any `.env` files necessary for the functioning of the project must be submitted to admins/managers via the team's messenger channel.
