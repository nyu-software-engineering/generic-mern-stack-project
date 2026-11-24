import express from "express";
import { getArticles } from "../articles-data.mjs";

const router = express.Router();
router.get("/", (req, res) => {
  try {
    return res.json({ articles: getArticles() });
  } catch (err) {
    return res.status(503).json({
      error: "Articles are not available",
    });
  }
});

router.get("/:id", (req, res) => {
  try {
    const article = getArticles().find(
      (item) => String(item.id) === req.params.id
    );
    if (!article) {
      return res.status(404).json({
        error: "Article not found",
      });
    }

    return res.json(article);
  } catch (err) {
    return res.status(503).json({
      error: "Articles are not available",
    });
  }
});

export default router;
