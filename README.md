## Vignettes

```javascript
/**
 * Fetch all commands made to a thread after a postID
 */
 const Hiori = require('hiori');
 var bot = new Hiori(process.argv[2], process.argv[3]);
 bot.init(async () => {
   const cmds = await bot.fetchThreadCommandsSince('4785847');
   console.log(cmds);
   bot.close();
 });
```

```javascript
/**
 * Reply to a thread
 */
const Hiori = require('hiori');
var bot = new Hiori(process.argv[2], process.argv[3]);
bot.init(async () => {
  await bot.login();
  await bot.replyThread('83398', 'Hello World!');
  bot.close();
});
```

## Project Roadmap

* Build bot module
* Make base game

## Bot module

* Post to forum thread
* Read thread, return posts

## Base game module

* Main loop
  * Fetch most recent post from db ------------------ nedb
  * Determine if any new posts (after recentpost)
  * For each post:
    * Execute commands
    * Save post to db
  * Reply to thread
* Database
    * Posts read

## General game pseudocode

* Main controller (registers commands)
* Game state stored in db:
  * Farm plot
    * Plot A: {}
    * Plot B: {}
  * Users
    * User stats
    * User inventory
