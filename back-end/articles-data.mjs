import axios from "axios";

let articles;
let initialization;

export function initializeArticles() {
  if (!initialization) {
    initialization = fetchArticles();
  }

  return initialization;
}

export function getArticles() {
  if (!initialization || !articles) {
    throw new Error("Still waiting for articles from Mockaroo.");
  }

  return articles;
}

async function fetchArticles() {
  const apiKey = process.env.MOCKAROO_API_KEY;
  const apiUrl = process.env.MOCKAROO_API_URL;
  if (!apiKey || !apiUrl) {
    throw new Error("Mockaroo configuration is missing");
  }

  try {
    const response = await axios.get(apiUrl, {
      params: {
        key: apiKey,
      },
    });
    articles = response.data;
    console.log("Successfully got data from Mockaroo.");
    return articles;
  } catch (err) {
    throw new Error("Unable to retrieve articles from Mockaroo", {
      cause: err,
    });
  }
}
