const { yzmbAction, wahaAction } = require("./actions/other");

async function main() {
  const puppeteer = require("puppeteer-extra");

  const StealthPlugin = require("puppeteer-extra-plugin-stealth");
  const { startAiHaoAction } = require("./actions/aihao");
  puppeteer.use(StealthPlugin());

  // That's it, the rest is puppeteer usage as normal 😊
  puppeteer.launch({ headless: true }).then(async (browser) => {
    console.info('Browser launch', new Date());
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(2 * 60 * 1000);
    await page.setViewport({ width: 800, height: 600 });

    // console.log(`Testing adblocker plugin..`)
    // await page.goto('https://www.vanityfair.com')
    // await page.waitForTimeout(1000)
    // await page.screenshot({ path: 'adblocker.png', fullPage: true })

    // console.log(`Testing the stealth plugin..`)
    // await page.goto('https://bot.sannysoft.com')
    // await page.waitForTimeout(5000)
    // await page.screenshot({ path: 'stealth.png', fullPage: true })

    await startAiHaoAction(page);

    try {
      await yzmbAction(page);
      await wahaAction(page);
    } catch (error) {
      console.error("error", error);
      process.exit(-1);
    }


    console.log(`All done, check the screenshots. ✨`);
    await browser.close();
  });
}

main();
