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
    console.log(`visiting: ${this.config.url.login}`);
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

  /**
   * Recusively fetch all commands in a whole thread
   * @param {string} initUrl The initial thread page URL.
   * @param {ThreadPost[]} initPostList The initial list of Posts.
   * @return {ThreadPost[]}
   */
  async fetchAllThreadPosts (initUrl) {
    console.log(`visiting: ${initUrl}`);
    const response = await this.page.goto(initUrl);
    const html = await this.page.content();
    const $ = await cheerio.load(html);
    const nextUrl_sfx = await $('link[rel=next]').attr('href');
    const msgList = await $('#messageList .message');
    const thisPostList = await msgList.toArray().reduce((prevList, msg) => {
      const post = new ThreadPost($(msg));
    	return prevList.concat(post);
    }, []);
    if (nextUrl_sfx) {
      const nextUrl = this.config.url.home + nextUrl_sfx;
      return thisPostList.concat(await this.fetchAllThreadPosts(nextUrl));
    } else {
      return thisPostList;
    }
  }

  /**
   * Fetch a page in a thread and return a list of commands.
   * @param {string} postId
   * @return [!ThreadCommand]
   */
  async fetchThreadCommandsSince (postId) {
    const postUrl = `${this.config.url.thread_post}${postId}/`;
    const postList = await this.fetchAllThreadPosts(postUrl);
    const cmdList = await postList.reduce((prevList, post) => {
      const cmds = post.getCommands();
      return prevList.concat(cmds);
    }, []);
    return cmdList;
  }

  /**
   * Posts a reply to a thread.
   * @param {string} threadId
   * @param {string} content
   */
  replyThread (threadId, content) {
    const url = `${this.config.url.thread}${threadId}/${this.config.url.thread_reply_sfx}`;
    console.log(`visiting: ${url}`);
    const response = await this.page.goto(url);
    if (response.status() != 200) {
      throw new Error('Unable to load thread reply page');
    }
    const html = await this.page.content();
    const $ = await cheerio.load(html);

  }
}
