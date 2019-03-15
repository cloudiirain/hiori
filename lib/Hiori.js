'use strict';

const cheerio = require('cheerio')
const puppeteer = require('puppeteer');
const config = require('./config.json');
const ThreadPost = require('./ThreadPost.js')

/**
 * Hiori is a bot API for the Novel Updates Forum.
 */
module.exports = class Hiori {
  /**
   * @param {string} username
   * @param {string} password
   */
  constructor (username, password, headless=true) {
    this.username = username;
    this.password = password;
    this.config = config;
    this.headless = headless;
  }

  /**
   * @param {function} callback
   */
  async init (callback) {
    this.browser = await puppeteer.launch({headless: this.headless});
    this.page = await this.browser.newPage();
    callback.bind(this)();
  }

  /* Close haori bot instance */
  close () {
    this.browser.close();
  }

  /* Login to NUF. */
  async login () {
    const response = await this.page.goto(this.config.url.login);
    if (response.status() != 200) {
      throw new Error('Unable to load login page');
    }
    // We check for any re-directs here because the user is automatically
    // redirected to the home page if the user is already logged in.
    if (response.url() == this.config.url.login) {
      await this.page.type('#ctrl_pageLogin_login', this.username);
      await this.page.type('#ctrl_pageLogin_password', this.password);
      const [redirect] = await Promise.all([
        this.page.waitForNavigation(),
        this.page.click('#pageLogin input[type="submit"]')
      ]);
      // Throw an error if NUF did not redirect user to home.
      if (redirect.url() != this.config.url.home) {
        throw new Error('Login credentials invalid.');
      }
    }
  }

  /* Logout of NUF. */
  async logout() {}

  /**
   * Fetch a page in a thread and return a list of commands.
   * @param {string} url
   * @return [!ThreadCommand]
   */
  async fetchThreadCommandsPage(url) {
    const response = await this.page.goto(url);
    const html = await this.page.content();
    const $ = await cheerio.load(html);
    const msgList = await $('#messageList .message');
    if (msgList.length == 0) {
      throw new Error('Thread page format invalid.');
    }
    // Iterate through msgList and concatenate all commands into a list.
    const commandList = await msgList.toArray().reduce((tempList, msg) => {
      const post = new ThreadPost($(msg));
      const commands = post.getCommands();
    	return tempList.concat(commands);
    }, []);
    return commandList;
  }

  /**
   * Fetch a page in a thread and return a list of commands.
   * @param {string} postId
   * @return [!ThreadCommand]
   */
  async fetchThreadCommandsSince(postId) {
    const postUrl = `${this.config.url.thread_post}${postId}/`;
    return await this.fetchThreadCommandsPage(postUrl);
    // Loop forward through future pages
  }

  /**
   * Posts a reply to a thread.
   * @param {string} threadId
   * @param {string} content
   */
  replyThread (threadId, content) {}
}
