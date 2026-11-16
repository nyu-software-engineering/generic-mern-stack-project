import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "Article API is working",
    articles: [],
  });
});
export default router;
