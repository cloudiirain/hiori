const { Hiori } = require('../index.js');
const ThreadPost = require('../lib/ThreadPost.js');

const username = process.argv[2];
const password = process.argv[3];
const bot = new Hiori(username, password);

bot.init(async () => {

  const lastPage = await bot.fetchThreadLastPageURL(63096);
  console.log(lastPage);

  /*
  // Let's find out the most recent post in this thread
  const url = 'https://forum.novelupdates.com/threads/lets-make-a-dungeon-crawler.63096';
  const allPosts = await bot.fetchThreadPosts(url, true);
  const lastPost = allPosts.slice(-1)[0];
  const lastPostID = lastPost.pid;

  // Wait for 60 seconds... do something else
  // sleep(60)

  // Let's check if there are any new new posts with commands
  const newPosts = await bot.fetchThreadPostsSince(lastPostID);
  const newCommandPosts = newPosts.reduce((accumulator, post) => {
    const postJSON = post.toJSON();
    if (postJSON.pid > lastPostID && postJSON.cmds.length) {
      accumulator.push(postJSON);
    }
    return accumulator;
  }, []);

  // Let's respond to the NUF thread
  if (newCommandPosts) {
    const reply = `I detected ${newCommandPosts.length} new posts with commands!\n`;
    console.log(reply);
    //await bot.replyThread(83398, reply);
  }
  */


  //console.log(listOfPostIds);

  //const url = 'https://forum.novelupdates.com/threads/lets-make-a-dungeon-crawler.63096/page-2';

  // Fetch all posts in this thread starting from the given URL
  //const threadPosts = await bot.fetchThreadPosts(url, true);

  // Select the last post
  //const lastThreadPost = threadPosts.slice(-1)[0];

  // Get the text of the last post (with quotes/spoilers removed)
  //const text = lastThreadPost.getText(true);
  //console.log(text);

  // Get the commands in the last posts
  //const commands = lastThreadPost.getCommands();
  //const reply = `I detected ${commands.length} commands in the last post!\n`;
  //console.log(reply);

  //Uncomment the next line to actually post to NUF
  //await bot.replyThread(83398, reply);

  bot.close();
});
