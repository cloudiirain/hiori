"use strict";

var Hiori = require('./lib/Hiori.js');

var bot = new Hiori(process.argv[2], process.argv[3]);

bot.init(async () => {
  const screenshot = 'screenshot.png';
  const cmds = await bot.fetchThreadCommandsSince("666035");
  await console.log(await cmds);
  //await bot.page.screenshot({ path: screenshot });
  //console.log('See screenshot: ' + screenshot);
  bot.close();
});

/* login snippit
bot.init(async () => {
  const screenshot = 'screenshot.png';
  await bot.login();
  await bot.page.screenshot({ path: screenshot });
  console.log('See screenshot: ' + screenshot);
  bot.close();
});
*/
