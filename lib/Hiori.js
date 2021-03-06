/**
 * @module      Hiori.js
 * @author      cloudiirain
 * @description Hiori is a bot API for the Novel Updates Forum.
 *              See config.json for global configuration options.
 */

'use strict';

const cheerio = require('cheerio');
const isUrl = require('is-url');
const puppeteer = require('puppeteer');

const ThreadPost = require('./ThreadPost.js');
const { NavigationError, ParserError, SubmissionError, NotFoundError } = require('./error.js');
const { consoleLog } = require('./helpers.js');
const config = require('./config.json');

/* Hiori class */
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
   * Go to URL using hiori bot and return Cheerio object of page response.
   * @param {string} url
   * @return {Cheerio}
   */
  async goTo (url) {
    if (!isUrl(url)) {
      throw new RangeError('Invalid URL provided');
    }
    try {
      consoleLog(`Visiting: ${url}`);
      const response = await this.page.goto(url);
      const html = await this.page.content();
      const $ = await cheerio.load(html);
      return $;
    } catch (e) {
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
    const $ = await this.goTo(this.config.url.login);

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
    if (redirect.url() != this.config.url.home) {
      throw new SubmissionError('Login credentials invalid.');
    }
    return true;

  }

  /**
   * Fetch all posts in a single NUF thread page.
   * Optionally, recursively fetch all posts on a NUF thread page and all
   * subsequent pages in the same thread.
   * @param {string} initUrl The initial thread page URL
   * @param {boolean} recursive Set to true if recursive behavior is desired
   * @return {ThreadPost[]}
   */
  async fetchThreadPosts (initUrl, recursive=false) {
    // Go to requested page
    const $ = await this.goTo(initUrl);

    // Determine if a thread page was reached
    const isErrorPage = $('#content').hasClass('error') || $('#content').hasClass('error_with_login');
    if (isErrorPage) {
      throw new NotFoundError(`The URL resouce could not be found: ${initUrl}`);
    }

    // Validate if hiori is on the right page
    const msgList = $('#messageList .message');
    if (!msgList.length) {
      throw new ParserError('Error parsing NUF thread page');
    }

    // Fetch all posts
    const thisPostList = msgList.toArray().map((postElement) => {
      const post = new ThreadPost($(postElement));
      return post;
    });

    // Determine if thread has more pages to visit if recursive option is set
    if (recursive) {
      const nextUrl_sfx = $('link[rel=next]').attr('href');
      if (nextUrl_sfx) {

        // Recursively call this function with the next page to visit
        const nextUrl = this.config.url.home + nextUrl_sfx;
        return thisPostList.concat(await this.fetchThreadPosts(nextUrl));

      }
    }

    // Recursion stops when there are no more pages to visit
    return thisPostList;

  }

  /**
   * Fetches a page in a thread and return a list of all subsequent posts.
   * @param {int} postId
   * @return {ThreadPostJSON[]}
   */
  async fetchThreadPostsSince (postId) {
    const postUrl = `${this.config.url.thread_post}${postId}/`;
    const postList = await this.fetchThreadPosts(postUrl, true);
    const jsonList = postList.reduce((accumulator, threadPost) => {
      if (threadPost.pid > postId) {
        const jsonPost = threadPost.toJSON();
        accumulator.push(jsonPost);
      }
      return accumulator;
    }, []);
    return jsonList;
  }

  /**
   * @typedef {Object} DetailedCommand
   * @property {string} action The command issued (e.g. !hit)
   * @property {string} value The whole line containing the command
   * @property {number} index The index number of the command in the post
   * @property {ThreadPostJSON} post
   * @property {ThreadPostJSON} prevPost
   */

  /**
   * Fetches a page in a thread and return a list of all subsequent commands.
   * The returned list of DetailedCommands includes context about the parent
   * post and previous post.
   * @param {int} postId
   * @return {DetailedCommand[]}
   */
  async fetchThreadCommandsSince (postId) {
    const postList = await this.fetchThreadPostsSince(postId);
    const cmdList = postList.reduce((accumulator, post, index, array) => {
      const prevPost = (index == 0) ? null : array[index - 1];
      const detailedCommands = post.cmds.reduce((accum, cmd, i, a) => {
        accum.push({
          "action": cmd.action,
          "value": cmd.value,
          "index": i,
          "post": post,
          "prevPost": prevPost
        });
        return accum;
      }, []);
      return accumulator.concat(detailedCommands);
    }, []);
    return cmdList;
  }

  /**
   * Fetches the url for the last page in a thread.
   * @param {int} threadId
   * @return {string}
   */
  async fetchThreadLastPageURL (threadId) {
    const threadUrl = `${this.config.url.thread}${threadId}/`;
    const $ = await this.goTo(threadUrl);
    const navdata = $('.pageNavLinkGroup div.PageNav').first();
    if (navdata) {
      const lastPage = navdata.attr('data-last');
      const suffix = lastPage ? `${this.config.url.thread_page_sfx}${lastPage}` : '';
      return `${threadUrl}${suffix}`;
    }
    return false;
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
    if (content.length > 100000) {
      throw new RangeError('Response content exceeds 100,000 characters.');
    }

    // Log in hiori if necessary
    const isLoggedInAlready = await this.isLoggedIn();
    if (!isLoggedInAlready) {
      await this.login();
    }

    // Go to thread reply page
    const url = `${this.config.url.thread}${threadId}/${this.config.url.thread_reply_sfx}`;
    const $ = await this.goTo(url);

    // Determine if a thread page was reached
    const isErrorPage = $('#content').hasClass('error');
    if (isErrorPage) {
      throw new NotFoundError(`The URL resouce could not be found: ${url}`);
    }

    // Validate if hiori is on the right page
    const title = $('#content h1').text() == 'Reply to Thread';
    const toggle = $('#ThreadReply .redactor_btn_switchmode').length;
    const button = $('#ThreadReply input[type="submit"]').length;
    if (!title || !toggle || !button) {
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

    // Throw an error if an error popup was triggered
    const re$ = await cheerio.load(await this.page.content());
    const hasError = $('.errorOverlay');
    if (hasError.length) {
      throw new SubmissionError('Unable to submit post.');
    }
    return true;

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

}
