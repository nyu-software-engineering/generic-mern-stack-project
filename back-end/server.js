import app from './app.js';

const port = process.env.PORT || 3000;

// Start the Express server
const listener = app.listen(port, () => {
  console.log(`Server running on port: ${port}`);
});

// Gracefully stop the server
const close = () => {
  listener.close();
};

export { close };
