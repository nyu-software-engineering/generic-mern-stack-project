import express from "express";
import axios from "axios";

const router = express.Router();
router.get("/", async (req, res) => {
  try {
    const apiKey = process.env.MOCKAROO_API_KEY;
    const apiUrl = process.env.MOCKAROO_API_URL;
    if (!apiKey || !apiUrl) {
      return res.status(500).json({
        error: "Mockaroo configuration is missing",
      });
    }

    const response = await axios.get(process.env.MOCKAROO_API_URL, {
      params: {
        key: apiKey,
      },
    });
    return res.json({ articles: response.data });
  } catch (err) {
    console.error("Mockaroo request failed:", err.message);

    return res.status(502).json({
      error: "Unable to retrieve articles",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const apiKey = process.env.MOCKAROO_API_KEY;
    const apiUrl = process.env.MOCKAROO_API_URL;
    if (!apiKey || !apiUrl) {
      return res.status(500).json({
        error: "Mockaroo configuration is missing",
      });
    }

    const response = await axios.get(apiUrl, {
      params: {
        key: apiKey,
      },
    });
    const article = response.data.find(
      (item) => String(item.id) === req.params.id
    );
    if (!article) {
      return res.status(404).json({
        error: "Article not found",
      });
    }

    return res.json(article);
  } catch (err) {
    console.error("Mockaroo request failed:", err.message);

    return res.status(502).json({
      error: "Unable to retrieve articles",
    });
  }
});

export default router;
