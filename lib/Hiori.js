/**
 * @module Hiori.js
 * @author cloudiirain
 * @description Hiori is a bot API for the Novel Updates Forum.
 *              See config.json for global configuration options.
 */

'use strict';

const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

const ThreadPost = require('./ThreadPost.js');
const { NavigationError, ParserError, SubmissionError } = require('./error.js');
const { consoleLog } = require('./helpers.js');
const config = require('./config.json');

/* Hiorir class */
module.exports = class Hiori {
  /**
   * Constructor
   * @param {string} username The NUF username for the bot
   * @param {string} password The NUF password for the bot
   * @param {boolean} headless True if puppeteer should be headless
   */
  constructor (username, password, headless=true) {
    if (!username || !password) {
      throw new RangeError('Please provide a username and password for Hiori');
    }
    this.username = username;
    this.password = password;
    this.config = config;
    this.headless = headless;
  }

  /**
   * Initializes hiori bot.
   * This method exists because constructors in javascript cannot return a
   * Promise. As a result, to support the asynchronous nature of of puppeteer,
   * use the init function to start hiori.
   * @param {function} callback The function to execute after hiori starts
   */
  async init (callback) {
    this.browser = await puppeteer.launch({headless: this.headless});
    this.page = await this.browser.newPage();
    callback.bind(this)();
  }

  /**
   * Shuts down hiori bot.
   * Please call this method when you are finished with hiori, or else
   * puppeteer will hang indefinitely.
   */
  close () {
    this.browser.close();
  }

  /**
   * Go to URL using hiori bot.
   * @param {string} url
   */
  async goTo (url) {
    try {
      return await this.page.goto(url);
    } catch {
      throw new NavigationError(`Unable to reach webpage: ${url}`);
    }
  }

  /**
   * Checks if hiori is logged in.
   * @return {boolean}
   */
   async isLoggedIn () {
     const html = await this.page.content();
     const $ = await cheerio.load(html);
     const usr = $('#navigation ul.visitorTabs strong.accountUsername');
     const username = usr.text().trim();
     if (username.toLowerCase() == this.username.toLowerCase()) {
       return true;
     }
     return false;
   }

  /**
   * Login to NUF using hiori.
   * @return {boolean}
   */
  async login () {
    // Check if user is logged in already
    const isLoggedInAlready = await this.isLoggedIn();
    if (isLoggedInAlready) {
      return true;
    }

    // User is not logged in so go to login page
    consoleLog(`Visiting: ${this.config.url.login}`);
    const response = await this.goTo(this.config.url.login);
    const html = await this.page.content();
    const $ = await cheerio.load(html);

    // Validate if hiori is on the right page
    const userInput = $('#ctrl_pageLogin_login').length;
    const pswdInput = $('#ctrl_pageLogin_password').length;
    const submtInput = $('#pageLogin input[type="submit"]').length;
    if (!userInput || !pswdInput || !submtInput) {
      throw new ParserError('Error parsing NUF login page');
    }

    // Type in login information
    await this.page.type('#ctrl_pageLogin_login', this.username);
    await this.page.type('#ctrl_pageLogin_password', this.password);
    const [redirect] = await Promise.all([
      this.page.waitForNavigation(),
      this.page.click('#pageLogin input[type="submit"]')
    ]);

    // Throw an error if NUF did not redirect user to home.
    // TODO: Determine precisely if login failed
    if (redirect.url() != this.config.url.home) {
      throw new SubmissionError('Login credentials invalid.');
    }
    return true;

  }

  /**
   * Recusively fetch all commands in a whole thread
   * @param {string} initUrl The initial thread page URL
   * @return {ThreadPost[]}
   */
  async fetchAllThreadPosts (initUrl) {
    // Go to requested page
    consoleLog(`Visiting: ${initUrl}`);
    const response = await this.goTo(initUrl);
    const html = await this.page.content();
    const $ = await cheerio.load(html);

    // Determine if a thread page was reached
    // TODO: validation
    // TODO: inb4 hiori failed when sent to a postid that did not exist

    // Fetch all posts
    const msgList = $('#messageList .message');
    const thisPostList = await msgList.toArray().reduce((prevList, msg) => {
      const post = new ThreadPost($(msg));
    	return prevList.concat(post);
    }, []);

    // Determine if thread has more pages to visit
    const nextUrl_sfx = $('link[rel=next]').attr('href');
    if (nextUrl_sfx) {

      // Recursively call this function with the next page to visit
      const nextUrl = this.config.url.home + nextUrl_sfx;
      return thisPostList.concat(await this.fetchAllThreadPosts(nextUrl));

    } else {
      // Recursion stops when there are no more pages to visit
      return thisPostList;
    }
  }

  /**
   * Fetches a page in a thread and return a list of all subsequent posts.
   * @param {int} postId
   * @return {ThreadPost[]}
   */
  async fetchThreadPostsSince (postId) {
    const postUrl = `${this.config.url.thread_post}${postId}/`;
    const postList = await this.fetchAllThreadPosts(postUrl);
    return postList;
  }

  /**
   * Fetches a page in a thread and return a list of all subsequent commands.
   * @param {int} postId
   * @return {Command[]}
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
   * @param {int} threadId
   * @param {string} content
   */
  async replyThread (threadId, content) {
    // Parameter validation
    if (!content) {
      throw new RangeError('Hiori cannot reply to a thread with empty content.');
    }

    // Log in hiori if necessary
    const isLoggedInAlready = await this.isLoggedIn();
    if (!isLoggedInAlready) {
      await this.login();
    }

    // Go to thread reply page
    const url = `${this.config.url.thread}${threadId}/${this.config.url.thread_reply_sfx}`;
    consoleLog(`Visiting: ${url}`);
    const response = await this.page.goto(url);
    const html = await this.page.content();
    const $ = await cheerio.load(html);

    // Validate if hiori is on the right page
    const title = $('#content h1').text() == 'Reply to Thread';
    const switch = $('#ThreadReply .redactor_btn_switchmode').length;
    const button = $('#ThreadReply input[type="submit"]').length;
    if (!title || !switch || !button) {
      throw new ParserError('Error parsing NUF thread reply page');
    }

    // Make reply
    await this.page.click('#ThreadReply .redactor_btn_switchmode');
    await this.page.evaluate((content) => {
      document.querySelector('#ThreadReply textarea[name="message"]').value = content;
    }, content);
    const [redirect] = await Promise.all([
      this.page.waitForNavigation(),
      this.page.click('#ThreadReply input[type="submit"]')
    ]);

    // TODO: Verify that reply was submitted
  }

  /**
   * Wraps supplied text in a bbCodeQuote block.
   * @param {string} message The message to wrap inside a BBcode quote
   * @param {string} user The name of the user to quote
   * @param {number} uid The user id of the user to quote
   * @param {number} pid The post id that the quote refers to
   * @return {string}
   */
   static bbCodeQuote (message, user, uid, pid) {
     const postid = pid ? `, post: ${pid}` : '';
     const userid = uid ? `, member: ${uid}` : '';
     const info = `${user}${postid}${userid}`;
     return `[QUOTE="${info}"]${message}[/QUOTE]\n`;
   }

   /**
    * @typedef {Object} User
    * @property {number} uid The user id
    * @property {string} user The user name
    */

   /**
    * Decode an escaped user string generated by the ThreadPost parser.
    * See ThreadPost._escapeUsernames() for reasons why it is recommended to
    * escape usernames when working with hiori. This function works with
    * escaped user strings like:
    *    @USER:1234|Hello&nbsp;I&nbsp;Am&nbsp;A&nbsp;Tree
    * @param {string} text
    * @return {User}
    */
    static decodeUserstr (userString) {
      const preparse = userString.split(' ')[0].split('USER:')[1];
      const uid = parseInt(preparse.split('|')[0]);
      const nbspName = preparse.split('|')[1];
      return {
        'uid': uid,
        'user': nbspName.replace(/\&nbsp;/g, ' ')
      }
    }

    /**
     * Strips all escaped user strings from text.
     * @param {string} text
     * @return {object}
     */
     static stripUserCode (text) {
       return text.replace(/\&nbsp;/g, ' ').replace(/@USER:\d+\|/g, '')
     }
}
