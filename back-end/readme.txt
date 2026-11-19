Testing the Later back end

From the back-end directory, run npm install, then npm test.
Run npm run coverage to see which lines and branches the tests exercise.

For a new route, add a file under test/ ending in .test.js.
Use test/config.test.js as an example: it sends an HTTP request to the
Express app and checks the JSON a front-end caller receives. You do not
need to start the development server to run the tests.
