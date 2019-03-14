'use strict';

const config = require('./config.json');

/**
 * Hiori is a bot API for the Novel Updates Forum.
 */
module.exports = class Hiori {
  /**
   * Initiate hiori bot instance.
   * @param {string} username
   * @param {string} password
   * @param {object} config
   */
  constructor(username, password, config=config) {
    this.username = username;
    this.password = password;
    this.config = config;
    this.isLoggedIn = false;
  }

  /* Login to NUF. */
  login () {}

  /* Logout of NUF. */
  logout () {}

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
