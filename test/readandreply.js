const Hiori = require('../index.js');

const username = process.argv[2];
const password = process.argv[3];
const bot = new Hiori(username, password);
bot.init(async () => {

  await bot.login();
  const cmds = await bot.fetchThreadCommandsSince('4787882');
  const initialText = 'I was missing one tiny thing for it to read multiple pages~\n\n';
  console.log(cmds);
  const text = await cmds.reduce(async (total, cmd) => {
    await total;
    await cmd;
    if (cmd.user == 'villain' || cmd.user == 'villainess') {
      const quote = Hiori.bbCodeQuote(cmd);
      return await total + quote + `Boop! I see you, ${cmd.user}!\n`
    } else {
      return await total;
    }
  }, Promise.resolve(initialText));
  console.log(text);
  await bot.replyThread('83398', text);

  bot.close();
});
