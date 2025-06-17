const express = require("express");
const scrapeCars = require("./cars-com-scraper");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post("/scrape", async (req, res) => {
  const { query } = req.body;

  if (!query) return res.status(400).json({ error: "Missing query" });

  try {
    const results = await scrapeCars(query);
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Scraping failed", message: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

