import express from "express";

import articlesRouter from "./routes/articles.mjs";
const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Jargonot API is running" });
});

app.use("/api/articles", articlesRouter);

export default app;
