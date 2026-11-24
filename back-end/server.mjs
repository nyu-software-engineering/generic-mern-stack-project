import app from "./app.mjs";
import "dotenv/config";
import { initializeArticles } from "./articles-data.mjs";

const PORT = process.env.PORT || 3001;

try {
  await initializeArticles();
  app.listen(PORT, () => {
    console.log(`server is listening on http://localhost${PORT}`);
  });
} catch (err) {
  console.error("Backend startup failed:", err.message);
  process.exitCode = 1;
}
