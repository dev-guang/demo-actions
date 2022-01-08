async function createBrowserInstances() {
  const puppeteer = require("puppeteer-extra");
  let browser = null;
  let page = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        process.env.HTTP_PROXY
          ? `--proxy-server=${process.env.HTTP_PROXY}`
          : "",
        "--disable-features=IsolateOrigins,site-per-process",
        "--flag-switches-begin --disable-site-isolation-trials --flag-switches-end",
      ],
    });
    page = await browser.newPage();
    const client = await page.target().createCDPSession();
    return { browser, page, client };
  } catch (error) {
    console.error("init browser error", error);
    if (browser) {
      await browser.close();
    }
    throw error;
  }
}

async function createFolderIfNeeded(folderPath) {
  const fs = require("fs").promises;
  try {
    await fs.access(folderPath);
  } catch (error) {
    await fs.mkdir(folderPath);
  }
}

async function yzmbAction(page, client, cookiesBase64Str) {
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

async function aihaoAction(page, client, cookiesBase64Str) {
  console.log("start aihao action");
  if (!cookiesBase64Str) {
    console.warn(`cookies missing, ignore aihao action`);
    return;
  }
  const cookies = JSON.parse(
    Buffer.from(cookiesBase64Str, "base64").toString()
  );
  console.log("set cookies");
  await page.setCookie(...cookies);
  console.log("goto aihao page");
  await Promise.all([
    page.goto("https://www.aihao.cc/plugin.php?id=daka"),
    page.setDefaultNavigationTimeout(0),
    page.waitForNavigation({ waitUtil: "networkidle2" }),
  ]);
  console.log("find button");
  const button = await page.waitForSelector(
    `button[name="button${getAiHaoButtonIndex()}"]`
  );
  console.log("click action");
  await Promise.all([button.click(), page.waitForNavigation()]);
  console.log("finish aihao action");
}

function getAiHaoButtonIndex() {
  const now = new Date();
  const hours = now.getUTCHours();
  if (hours >= 0 && hours < 1) {
    return 1;
  } else if (hours >= 5 && hours < 6) {
    return 2;
  } else if (hours >= 10 && hours < 11) {
    return 3;
  } else {
    return -1;
  }
}

function shouldStartAiHaoAction() {
  return getAiHaoButtonIndex() != -1;
}

function shouldStartYZMBAction() {
  return getAiHaoButtonIndex() == 1;
}

(async () => {
  const path = require("path");
  const startAt = new Date();
  console.info(`start action hours ${startAt.getHours()}, UTC hours ${startAt.getUTCHours()}`);

  let cacheFolder;
  try {
    // create cache folder if needed
    cacheFolder = path.resolve(__dirname, ".cache");
    await createFolderIfNeeded(cacheFolder);
  } catch (error) {
    cacheFolder = null;
    console.error("cache folder invalid");
  }
  let browserInstances;
  try {
    // init
    browserInstances = await createBrowserInstances();
  } catch (error) {
    console.error("init browser error", error);
    process.exist(-1);
    return;
  }

  const { browser, page, client } = browserInstances;
  const { yzmbCookies, cookies } = require("./config");

  let occurError = false;
  if (shouldStartAiHaoAction()) {
    try {
      await aihaoAction(page, client, cookies);
      await page.screenshot({
        path: path.resolve(cacheFolder, "aihao-success.jpg"),
        type: "jpeg",
      });
    } catch (error) {
      console.error("aihao action error", error);
      occurError = true;
    }
  } else {
    console.log("skill aihao action");
  }
  if (shouldStartYZMBAction()) {
    try {
      await yzmbAction(page, client, yzmbCookies);
      await page.screenshot({
        path: path.resolve(cacheFolder, "yzmb-success.jpg"),
        type: "jpeg",
      });
    } catch (error) {
      console.error("yzmb action error", error);
      occurError = true;
    }
  } else {
    console.log("skill yzmb action");
  }

  await browser.close();

  if (occurError) {
    process.exit(-1);
  }
})();
