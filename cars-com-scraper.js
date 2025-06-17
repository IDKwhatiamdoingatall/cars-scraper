const { chromium } = require("playwright");

async function scrapeCars(query = "2018 BMW 550i") {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Spoof user agent to bypass bot detection
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });

    const searchQuery = encodeURIComponent(query);
    const url = `https://www.cars.com/shopping/results/?stock_type=all&makes[]=&models[]=&list_price_max=&maximum_distance=all&zip=&keyword=${searchQuery}`;

    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });

    await page.waitForSelector("article.vehicle-card", { timeout: 20000 });

    const cars = await page.$$eval("article.vehicle-card", cards =>
      cards.slice(0, 10).map(card => {
        try {
          const title = card.querySelector("h2")?.innerText?.trim() || "No title";
          const price = card.querySelector('[data-test="vehicleCardPricingBlockPrice"]')?.innerText?.trim() || "No price";
          const mileage = card.querySelector('[data-test="vehicleMileage"]')?.innerText?.trim() || "No mileage";
          const link = card.querySelector("a")?.href || "";

          return { title, price, mileage, link };
        } catch {
          return { error: "Could not parse this listing" };
        }
      })
    );

    await browser.close();

    if (!cars.length) {
      return { message: "No cars found. Try a different search or keyword." };
    }

    return cars;
  } catch (err) {
    await browser.close();
    console.error("Scraping failed:", err);
    return { error: "Scraping failed", message: err.message };
  }
}

module.exports = scrapeCars;
