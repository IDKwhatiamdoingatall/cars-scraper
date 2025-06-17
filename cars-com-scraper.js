const { chromium } = require("playwright");

async function scrapeCars(query = "2018 BMW 550i") {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const searchQuery = encodeURIComponent(query);
  const url = `https://www.cars.com/shopping/results/?stock_type=all&makes[]=&models[]=&list_price_max=&maximum_distance=all&zip=&keyword=${searchQuery}`;

  await page.goto(url, { waitUntil: "domcontentloaded" });

  await page.waitForSelector('article.vehicle-card');

  const cars = await page.$$eval('article.vehicle-card', cards =>
    cards.slice(0, 10).map(card => {
      const title = card.querySelector('h2')?.innerText?.trim();
      const price = card.querySelector('[data-test="vehicleCardPricingBlockPrice"]')?.innerText?.trim();
      const mileage = card.querySelector('[data-test="vehicleMileage"]')?.innerText?.trim();
      const link = card.querySelector('a')?.href;

      return {
        title,
        price,
        mileage,
        link,
      };
    })
  );

  await browser.close();
  return cars;
}

if (require.main === module) {
  scrapeCars(process.argv.slice(2).join(" ")).then(console.log).catch(console.error);
}

module.exports = scrapeCars;
