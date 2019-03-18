const cheerio = require('cheerio');
const Hiori = require('../index.js');


const username = process.argv[2];
const password = process.argv[3];
const bot = new Hiori(username, password);
bot.init(async () => {

  await bot.goTo('https://forum.novelupdates.com/');
  const html = await bot.page.content();
  const $ = await cheerio.load(html);
  const userInput = $('#ctrl_pageLogin_login').length;
  const pswdInput = $('#ctrl_pageLogin_password').length;
  const submtInput = $('#pageLogin input[type="submit"]').length;
  if (!userInput || !pswdInput || !submtInput) {
    console.log('bad!');
  }


  await bot.login();

  console.log(await bot.isLoggedIn());

  //console.log(bot.page.url());

  //await bot.login();
  /*
  const cmds = await bot.fetchThreadCommandsSince(4792168);
  const initialText = 'Test Test~\n\n';
  console.log(cmds);
  const text = await cmds.reduce(async (total, cmd) => {
    await total;
    await cmd;
    if (true) {
      const quote = Hiori.bbCodeQuote(cmd);
      return await total + quote + `Boop! I see you, ${cmd.user}!\n`
    } else {
      return await total;
    }
  }, Promise.resolve(initialText));
  console.log(Hiori.stripUserCode(text));
  */
  //await bot.replyThread('83398', text);

  bot.close();
});
