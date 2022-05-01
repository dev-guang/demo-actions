const { yzmbCookies, wahaCookies } = require("../config");

async function yzmbAction(page, client, cookiesBase64Str = yzmbCookies) {
  console.log("start yzmb action");
  if (!cookiesBase64Str) {
    console.warn(`cookies missing, ignore yzmb action`);
    return;
  }
  const cookies = JSON.parse(
    Buffer.from(cookiesBase64Str, "base64").toString()
  );
  console.log("set cookies");
  await page.setCookie(...cookies);
  console.log("goto yzmb page");
  await Promise.all([
    page.goto("https://www.yunzmb.com/"),
    page.setDefaultNavigationTimeout(0),
    page.waitForNavigation({ waitUtil: "networkidle2" }),
  ]);
  console.log("find button");
  const button = await page.waitForSelector("#pper_a");
  console.log("click action");
  await button.click();
  console.log("finish yzmb action");
}

async function wahaAction(page, client, cookiesBase64Str = wahaCookies) {
  console.log("start waha action");
  if (!cookiesBase64Str) {
    console.warn(`cookies missing, ignore waha action`);
    return;
  }
  const cookies = JSON.parse(
    Buffer.from(cookiesBase64Str, "base64").toString()
  );
  console.log("set cookies");
  await page.setCookie(...cookies);
  console.log("goto waha page");
  await Promise.all([
    page.goto("https://bbs.52waha.com/plugin.php?id=gsignin:index"),
    page.setDefaultNavigationTimeout(0),
    page.waitForNavigation({ waitUtil: "networkidle2" }),
  ]);
  // console.log("find button");
  // document.querySelector("#um > p:nth-child(16) > a:nth-child(7)")
  // const button = await page.waitForSelector(
  //   '#um > p:nth-child(17) > a:nth-child(7)'
  // );
  // console.log("click action");
  // await button.click();

  // jspath: document.querySelector("#main > div.content > div.top > a")
  // const result = await page.evaluate(() => {
  //   document.querySelector("#main > div.content > div.top > a")
  // });

  // xpath: //*[@id="main"]/div[1]/div[1]/a
  console.log("find action element");
  const elements = await page.$x('//*[@id="main"]/div[1]/div[1]/a');
  console.info("element click");
  await elements[0].click();
  console.log("finish waha action");
}

module.exports.yzmbAction = yzmbAction;
module.exports.wahaAction = wahaAction;
