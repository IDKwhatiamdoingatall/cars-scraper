const { chromium } = require("playwright");

async function scrapeCars(query = "2018 BMW 550i") {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Set a real browser user agent to avoid bot blocking
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    const searchQuery = encodeURIComponent(query);
    const url = `https://www.cars.com/shopping/results/?stock_type=all&makes[]=&models[]=&list_price_max=&maximum_distance=all&zip=&keyword=${searchQuery}`;

    await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 45000,
    });

    await page.waitForSelector("article.vehicle-card", { timeout: 20000 });

    const cars = await page.$$eval("article.vehicle-card", cards =>
      cards.slice(0, 10).map(card => {
        const title = card.querySelector("h2")?.innerText?.trim();
        const price = card.querySelector('[data-test="vehicleCardPricingBlockPrice"]')?.innerText?.trim();
        const mileage = card.querySelector('[data-test="vehicleMileage"]')?.innerText?.trim();
        const link = card.querySelector("a")?.href;

        return {
          title,
          price,
          mileage,
          link,
        };
      })
    );

    // Optional: save screenshot for debugging
    // await page.screenshot({ path: "debug.png", fullPage: true });

    await browser.close();
    return cars;
  } catch (err) {
    await browser.close();
    console.error("Scraping failed:", err);
    return { error: "Scraping failed", message: err.message };
  }
}

module.exports = scrapeCars;
