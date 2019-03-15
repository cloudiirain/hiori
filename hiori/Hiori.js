'use strict';

const url = require('url');
const puppeteer = require('puppeteer');
const config = require('./config.json');

/**
 * Hiori is a bot API for the Novel Updates Forum.
 */
module.exports = class Hiori {
  /**
   * @param {string} username
   * @param {string} password
   */
  constructor (username, password) {
    this.username = username;
    this.password = password;
    this.config = config;
  }

  /**
   * @param {function} callback
   */
  async init (callback) {
    this.browser = await puppeteer.launch({headless: false});
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
   * Fetch a thread and return posts.
   * @param {string} threadId
   * @param {string} sincePostId
   * @param {boolean} parseCommands
   */
  fetchThread (threadId, sincePostId) {}

  /**
   * Posts a reply to a thread.
   * @param {string} threadId
   * @param {string} content
   */
  replyThread (threadId, content) {}
}
