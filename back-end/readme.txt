Run the Hotel Planner backend

1. Install Node.js 22 LTS (22.13.0 or newer in the 22.x series). It includes npm.
2. Open a terminal in the repository folder and run:

   cd back-end
   npm install
   npm run dev

3. Keep this terminal running. Open http://localhost:3000/api/hotels/search?q=paris
   in your browser to check the API. You should see JSON containing Hotel Aurora.

Run npm install on first setup or when dependencies change. The server reloads
when backend files change. Press Ctrl+C to stop it. The API uses sample data and
can start without a database or an .env file.

To open the app, follow the frontend steps in ../README.md in a second terminal.

Optional checks from back-end

Run the tests:

   npm test -- --exit

Run the tests and generate an HTML coverage report at coverage/index.html:

   npx c8 --all --include="**/*.js" --exclude="test/**" --exclude="coverage/**" --reporter=text --reporter=html npm test -- --exit

The --exit flag lets Mocha finish even if a test leaves a temporary server open.
