"use strict";

const cheerio = require('cheerio');
const Hiori = require('./lib/Hiori.js');

// Add your {username} and {password} through command line args
var bot = new Hiori(process.argv[2], process.argv[3]);

/* Fetch all commands in a thread since a given post
bot.init(async () => {
  console.log('Event List');
  const cmds = await bot.fetchThreadCommandsSince('4785847');
  console.log(cmds);
  bot.close();
});
*/

/* Fetch all posts in a thread after a given url
bot.init(async () => {
  console.log('Event List');
  //const cmds = await bot.fetchAllThreadPosts('https://forum.novelupdates.com/threads/games-event-list.6650/page-6');
  const cmds = await bot.fetchAllThreadPosts('https://forum.novelupdates.com/threads/villains-evil-lair.83398/');
  console.log(cmds);
  bot.close();
});
*/

/* login snippit
bot.init(async () => {
  const screenshot = 'screenshot.png';
  await bot.login();
  await bot.page.screenshot({ path: screenshot });
  console.log('See screenshot: ' + screenshot);
  bot.close();
});
*/
