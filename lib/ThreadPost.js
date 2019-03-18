/**
 * @module ThreadPost.js
 * @author cloudiirain
 * @description Class module for the ThreadPost class.
 */

'use strict';

const cheerio = require('cheerio');
const { ParserError } = require('./error.js');

/* ThreadPost Class */
class ThreadPost {

  /**
   * @typedef {Object} ThreadPost
   * @property {number} pid The post id
   * @property {number} uid The post author's user id
   * @property {string} user The post author's user name
   * @property {Cheerio} message The cheerio selector for the text area
   * @property {number} timestamp The timestamp when this post was created
   */

  /**
   * Constructs a ThreadPost object using a Cheerio selector
   * Individual posts in NUF are wrapped by <li class="message"> tags. To
   * select posts in a thread, use the css selector: '#messageList .message'.
   * @param {Cheerio} li
   * @return {ThreadPost}
   */
  constructor (li) {
    try {
      // Initial assignment
      this.pid = li.attr('id');
      this.uid = li.find('.userText .username').first().attr('href');
      this.user = li.attr('data-author');
      this.message = li.find('.messageText');
      this.timestamp = li.find('.datePermalink abbr').first().attr('data-time');


      // Validate that selectors exist
      if (!this.pid || !this.uid || !this.user || !this.message | !this.timestamp) {
        throw new Error();
      }

      // Process assignments
      this.pid = parseInt(this.pid.split('-')[1]);
      this.uid = parseInt(this.uid.split('.')[1].replace(/[^\d]/g, ''));
      this.timestamp = parseInt(this.timestamp);

    } catch {
      throw new ParserError();
    }
  }

  /**
   * Removes all BBcode quote or spoiler <div>'s from the Cheerio element.
   * Note that the removal operation is performed on a copy of the original
   * Cheerio element tree and the copy is returned.
   * @return {Cheerio}
   */
  static _removeContainers(element) {
    const messageCopy = element.clone();
    messageCopy.find('.bbCodeQuote,.bbCodeSpoilerContainer').remove();
    return messageCopy;
  }

  /**
   * Converts @Username NUF tags to an HTML-escaped version.
   * This is performed because: (1) some usernames on NUF contain spaces, which
   * causes ambiguity when the message is converted to text, and (2) the user
   * id information is lost when the message is converted to text.
   * Note that the escape operation is performed on a copy of the original
   * Cheerio element tree and the copy is returned.
   * @return {Cheerio}
   */
  static _escapeUsernames(element) {
    const messageCopy = element.clone();
    const users = messageCopy.find('a.username');
    users.each((i, a) => {
      try {
        const userdata = a.attribs['data-user'];
        const uid = parseInt(userdata.split(', ')[0]);
        const name = userdata.split(', ')[1].replace('@', '');
        const newText = `@USER:${uid}|${name}`.replace(/ /g, '&nbsp;');
        a.children[0].data = newText; // direct manipulation on DOM tree
      } catch {
        throw new ParserError();
      }
    });
    return messageCopy;
  }

  /**
   * Prints ThreadPost message as text with whitespace stripped.
   * Optionally, remove containers or escape usernames (see above).
   * @param {boolean} removeContainers
   * @param {boolean} escapeUsernames
   * @return {string}
   */
  getText (removeContainers, escapeUsernames) {
    if (escapeUsernames) {
      const escUser = ThreadPost._escapeUsernames(this.message);
      if (removeContainers) {
        return ThreadPost._removeContainers(escUser).text().trim();
      }
      return escUser.text().trim();
    }
    if (removeContainers) {
      return ThreadPost._removeContainers(this.message).text().trim();
    }
    return this.message.text().trim();
  }

  /**
   * @typedef {Object} Command
   * @property {number} pid The post id
   * @property {number} uid The post author's user id
   * @property {string} user The post author's user name
   * @property {number} time The timestamp when this post was created
   * @property {string} cmd The command issued (e.g. !hit)
   * @property {string} value The whole line containing the command
   */

  /**
   * Returns a list of Commands found in a ThreadPost.
   * @param {number} limit Maximum number of commands to return
   * @return {Command[]}
   */
  getCommands (limit=null) {
    var commandList = [];
    for (var line of this.getText(true, true).split('\n')) {
      if (line.startsWith('!')) {
        const words = line.split(' ');
        commandList.push({
          "action": words[0],
          "value": line
        });
      }
    }
    if (limit) {
      return commandList.slice(0, limit);
    }
    return commandList;
  }

  /**
   * @typedef {Object} ThreadPostJSON
   * @property {number} pid The post id
   * @property {number} uid The post author's user id
   * @property {string} user The post author's user name
   * @property {number} time The timestamp when this post was created
   * @property {Command[]} cmds The commands contained within this post
   */

  /**
   * Returns a sanitized JSON object suitable for database storage.
   * @return {ThreadPostJSON}
   */
  toJSON () {
    const commands = this.getCommands();
    return {
      "pid": this.pid,
      "uid": this.uid,
      "user": this.user,
      "time": this.timestamp,
      "cmds": commands
    };
  }

}

module.exports = ThreadPost;
