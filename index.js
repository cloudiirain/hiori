"use strict";

var Hiori = require('./hiori/Hiori.js');

var bot = new Hiori(process.argv[2], process.argv[3]);

bot.init(async () => {
  const screenshot = 'screenshot.png';
  await bot.login();
  await bot.page.screenshot({ path: screenshot });
  console.log('See screenshot: ' + screenshot);
  bot.close();
});
