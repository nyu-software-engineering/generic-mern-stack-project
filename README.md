# Hotel Planner: Hotel Tracking App

Hotel Planner is a web app for travelers who want to organize, track, and archive their hotel stays. Travelers will be able to log active reservations for quick access to key information, record notes to reflect their personal experiences, and archive their travel history for them to see again in the future.

---

## Product Vision

To allow travelers with a centralized web application to track active hotel reservations and store past stays into a searchable personal archive that contains recordings of traveler's experiences at each hotel.

---

## Team Members

Amy - [GitHub Profile](https://github.com/aaamy242)

Jiayu - [GitHub Profile](https://github.com/ubique888)

Ryan - [GitHub Profile](https://github.com/ryanwlin)

Aaron - [GitHub Profile](https://github.com/Aaron-982)

---

## Contributing.md

Instructions for contributions: [Contributing.md](https://github.com/agile-students-fall2026/generic-mern-stack-project-hotel_planner/blob/master/CONTRIBUTING.md)

---

## Run Hotel Planner locally

Install Node.js 22 LTS (22.13.0 or newer in the 22.x series) and Git. Node.js includes npm. The app uses sample data, so you can start without a database or an `.env` file.

### 1. Get the code

If you already have the repository, open its folder in your terminal and skip the clone.

```bash
git clone https://github.com/agile-students-fall2026/generic-mern-stack-project-hotel_planner.git
cd generic-mern-stack-project-hotel_planner
```

### 2. Start the backend

In the first terminal, start from the folder containing this README.

```bash
cd back-end
npm install
npm run dev
```

Leave this terminal running. The API listens on port `3000`.

### 3. Start the frontend

Open a second terminal in the folder containing this README.

```bash
cd front-end
npm install
npm run dev
```

Leave this terminal running too. Open the address Vite prints, usually [http://localhost:5173](http://localhost:5173). Sign in with the demo email `test@hotelplanner.com` and password `password123`, then try searching for `paris`.

Run `npm install` on first setup or when dependencies change. Press **Ctrl+C** in each terminal to stop the servers.

To build the frontend, run `npm run build` in `front-end`. To run backend tests, run `npm test -- --exit` in `back-end`. See the [backend README](back-end/readme.txt) for coverage.

### Current pages

| Path         | Page                           |
| ------------ | ------------------------------ |
| `/`          | Home and search                |
| `/results`   | Search results                 |
| `/hotel/:id` | Hotel details                  |
| `/saved`     | Saved hotels (edit and delete) |
| `/signin`    | Sign in                        |
| `/signup`    | Sign up                        |
