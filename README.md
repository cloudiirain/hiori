## Hiori
Hiori is a nodejs library for interacting with the Novel Updates Forums.

**Built with**
- [Puppeteer](https://github.com/GoogleChrome/puppeteer)
- [Cheerio.js](https://github.com/cheeriojs/cheerio)

## Code Example

```javascript
const { Hiori } = require('hiori');

const username = process.argv[2];
const password = process.argv[3];
const bot = new Hiori(username, password);

bot.init(async () => {

  // Let's find out the most recent post in this thread
  const url = 'https://forum.novelupdates.com/threads/lets-make-a-dungeon-crawler.63096';
  const allPosts = await bot.fetchThreadPosts(url, true);
  const lastPost = allPosts.slice(-1)[0];
  const lastPostID = lastPost.pid;

  // Wait for 10 minutes... do something else... la la la
  // sleep(600)

  // Let's check if there are any new new posts with commands
  const newPosts = await bot.fetchThreadPostsSince(lastPostID);
  const newCommandPosts = newPosts.reduce((accumulator, post) => {
    const commands = post.getCommands();
    if (post.pid > lastPostID && commands.length) {
      accumulator.push(post);
    }
    return accumulator;
  }, []);

  // Let's respond to the NUF thread
  if (newCommandPosts) {
    const reply = `I detected ${newCommandPosts.length} new posts with commands!\n`;
    console.log(reply);
    //await bot.replyThread(83398, reply);
  }

  bot.close();
});
```

## Installation

```bash
npm install cloudiirain/hiori
```

## API Reference

### Hiori class

#### Hiori( username, password, headless=true )

Constructs a `Hiori` instance.

Optionally, set the third argument to `false` if you would like `Hiori` to
open a browser window that you can observe. (default: `true`)

```javascript
const bot = new Hiori(username, password);
```

#### .init( callback )

Starts the `Hiori` instance and executes the callback function when `Hiori` is
ready.

It is recommended to use `async` / `await` in the callback function.

```javascript
bot.init(async () => {
  // Code goes in here
});
```

#### .close()

Closes the `Hiori` instance. Call this method when you are done.

```javascript
bot.init(async () => {
  bot.close();
});
```

#### .goTo( url )

Make `Hiori` go to the specified URL.

Returns a [Cheerio.js document selector](https://github.com/cheeriojs/cheerio)
for the resulting page.

Throws a `NavigationError` if there is a problem.

Note that this is an `async` function that initially returns a `Promise`
(use the `await` keyword).

```javascript
bot.init(async () => {
  const $ = await bot.goTo('https://forum.novelupdates.com/');
  const title = $('title').text().trim(); // Novel Updates Forum
});
```

#### .isLoggedIn()

Returns true if `Hiori` is already logged in at NUF.

Note that this is an `async` function that initially returns a `Promise`
(use the `await` keyword).

```javascript
bot.init(async () => {
  const $ = await bot.goTo('https://forum.novelupdates.com/');
  const loggedIn = await bot.isLoggedIn(); // false
});
```

#### .login()

Make `Hiori` log into the Novel Updates Forum.

Note that this is an `async` function that initially returns a `Promise`
(use the `await` keyword).

```javascript
bot.init(async () => {
  await bot.login();
});
```
#### .fetchThreadPosts( url, recursive=false )

Make `Hiori` fetch all the thread posts at a URL.

Optionally, recursively iterate through all the pages in a thread (after the
provided URL) to fetch all posts in a thread. Set the second argument to `true`
if this behavior is desired. (default: `false`)

Returns an array of ThreadPost objects.

Note that this is an `async` function that initially returns a `Promise`
(use the `await` keyword).

```javascript
bot.init(async () => {
  const url = 'https://forum.novelupdates.com/threads/villains-evil-lair.83398/';
  const threadPosts = await bot.fetchThreadPosts(url);
  const listOfPostIds = await threadPosts.reduce(async (promiseList, post) => {
    // Regular for loops will not work as expected when using async functions
    // As a result, use `reduce()` or `map()` to iterate through lists.
    const accumulator = await promiseList;
    accumulator.push(post.pid);
    return accumulator;
  }, Promise.resolve([]));
});
```

#### .fetchThreadPostsSince( postId )

Wrapper around `.fetchThreadPosts()` with recursive set to `true` and the url
calculated based on the provided NUF post id.

Note that this is an `async` function that initially returns a `Promise`
(use the `await` keyword).

```javascript
bot.init(async () => {
  const threadPosts = await bot.fetchThreadPostsSince(3958778);
});
```

#### .replyThread( threadId, content )

Make `Hiori` reply to a thread with some `content`.

```javascript
bot.init(async () => {
  await bot.login();
  await bot.replyThread(83398, 'Hello world!');
});
```

#### Hiori.bbCodeQuote( message, username, userId, postId )

Shortcut to generate a BBCode Quote string. Like:

`[QUOTE="hiori, post: 12345, member: 123"]message[/QUOTE]`

```javascript
const quote = Hiori.bbCodeQuote(message, username, userId, postId);
```

#### Hiori.decodeUserstr( encodedUserString )

Shortcut to decode a **userString** used for internal processing. Like:

`@USER:1234|Hello&nbsp;I&nbsp;Am&nbsp;A&nbsp;Tree`

And converts it to an object:

`{ "uid": 1234, "user": "Hello I am A Tree" }`

```javascript
const userObject = Hiori.decodeUserstr(encodedUserString);
```

#### Hiori.stripUserCode( text )

Short cut to strip all encoded **userStrings** used for internal processing from
text. Like:

Original: `Hi, @USER:1234|hiori. Goodbye, @USER:1234|Hello&nbsp;I&nbsp;Am&nbsp;A&nbsp;Tree.`

Result: `Hi, @hiori. Goodbye, @Hello I Am A Tree.`

```javascript
const sanitizedText = Hiori.stripUserCode(badText);
```

### ThreadPost class

#### Attributes

- `pid` - The post id (number).
- `uid` - The user id of the post author (number).
- `user` - The user name of the post author (string).
- `timestamp` - The timestamp when the post was created (number).
- `message` - The Cheerio.js selector for the post message.

#### .constructor( cheerioSelector )

Constructs a ThreadPost object given a Cheerio.js selector.

ThreadPosts should be constructed on <li class="message"> elements. To achieve
this, the following Cheerio selector is recommended:

```javascript
const postList = $('#messageList .message');
const threadPostArray = postList.toArray().map((postElement) => {
  const post = new ThreadPost($(postElement));
  return post;
});
```

#### .getText( removeContainers=false, escapeUsernames=false )

Returns the ThreadPost `message` with all HTML stripped.

Optionally, remove BBCode spoilers or quote tags. (default: false)

Optionally, escape @usernames to the **userString** format. (default: false)

```javascript
const textNoQuotes = post.getText(true);
```

#### .getCommands( limit=null )

Returns all the valid `!action` commands in this ThreadPost as a list.

Optionally, limit the number of commands to return from a single ThreadPost.
(default: no limit)

In order to be a valid command, the `!action` must start at the beginning of
the line. By default, commands inside BBcode quotes and spoilers are ignored.
Additionally, usernames with spaces are escaped to the **userString** format:

`@USER:1234|Hello&nbsp;I&nbsp;Am&nbsp;A&nbsp;Tree`

The usernames are escaped because NUF allows usernames with spaces, which will
interfere with any downstream `!action` parser that splits the command by a
space delimiter. To unescape the **userStrings**, see: `Hiori.escapeUsernames`.

```javascript
const firstCommand = post.getCommands(1);
```

#### .toJSON()

Sanitizes the ThreadPost object so that it is suitable for JSON conversion.

The `message` attribute is not included. Instead, a list of Command objects
is provided instead. Note that usernames are parsed to a the **userString** format
in the command list by default:

```javascript
const threadPostJSONFormat = {
  "pid": 12345,
  "uid": 123,
  "user": "hiori",
  "time": 1234567890,
  "cmds": [
    {
      "action": "!hit",
      "value": "!hit me first time"
    },
    {
      "action": "!dodge",
      "value": "!dodge me second time"
    },
    {
      "action": "!swim",
      "value": "!swim @USER:321|justabot! Swim a third time!"
    }
  ]
}
```

## Tests

```bash
npm test
```

## License

ISC © cloudiirain
