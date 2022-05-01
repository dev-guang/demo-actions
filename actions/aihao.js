const { aiHaoCookies } = require("../config");
const { isLastDayOfMonth } = require("../utils/utils");

const kActionPageURL = "https://www.aihao.cc/plugin.php?id=daka";

function getButtonIndex(date = new Date()) {
  const hours = date.getUTCHours();
  if (hours >= 0 && hours < 1) {
    // Beijing: 08:00 - 09:00
    return 1;
  } else if (hours >= 5 && hours < 6) {
    // Beijing: 13:00 - 14:00
    return 2;
  } else if (hours >= 10 && hours < 11) {
    // Beijing: 18:00 - 19:00
    return 3;
  }
  return 1;
}

function getButton(page, buttonIndex) {
  return page.waitForSelector(`button[name="button${buttonIndex}"]`);
}

function shouldRunAwardAction(date = new Date()) {
  return isLastDayOfMonth(date) && date.getUTCHours() >= 10;
}

module.exports.shouldStartAiHaoAction = () => {
  return getButtonIndex() != -1;
};

module.exports.startAiHaoAction = async (page, cookies = aiHaoCookies) => {
  const now = new Date();
  console.info("-------------- AIHAO START --------------");

  try {
    const cookiesJSON = JSON.parse(Buffer.from(cookies, "base64").toString());
    console.log("Set cookies");
    await page.setCookie(...cookiesJSON);

    console.info(`Load page ${kActionPageURL}...`);
    await Promise.all([
      page.goto(kActionPageURL),
      page.setDefaultNavigationTimeout(0),
      page.waitForNavigation({ waitUtil: "networkidle2" }),
    ]);
    const buttonIndex = getButtonIndex(now);
    if (buttonIndex == -1) {
      console.warn("button not found");
      return;
    }
    console.info("find button", buttonIndex);
    const actionButton = await getButton(page, buttonIndex);
    console.info("button will be click");
    await Promise.all([actionButton.click(), page.waitForNavigation()]);
    console.info("button did click");
  } catch (error) {
    console.error("action error", error);
  }

  if (shouldRunAwardAction(now)) {
    console.info("start award action");
    try {
      const actionButton = await getButton(page, 4);
      console.info("award button will be click");
      await Promise.all([actionButton.click(), page.waitForNavigation()]);
      console.info("award button did click");
    } catch (error) {
      console.error("award award error", error);
    }
  }

  console.info("-------------- AIHAO DONE --------------");
};
