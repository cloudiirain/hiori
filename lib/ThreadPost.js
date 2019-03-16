/**
 * @module ThreadPost.js
 * @author cloudiirain
 * @description Class module for the ThreadPost class.
 */

'use strict';

/* ThreadPost Class */
class ThreadPost {

  /**
   * constructor
   * ThreadPost are constructed on individual <li> elements selected using
   * Cheerio. The css selector to use should be: '#messageList .message'.
   * @param {Cheerio} li
   */
  constructor (li) {

    // Initial assignment
    this.pid = li.attr('id');
    this.uid = li.find('.userText .username').first().attr('href');
    this.user = li.attr('data-author');
    this.message = li.find('.messageText');
    this.timestamp = li.find('.datePermalink abbr').first().attr('data-time');

    // Validate that selectors exist
    if (!this.pid || !this.uid || !this.user || !this.message || !this.timestamp) {
      throw new Error('Unable to parse ThreadPost');
    }

    // Process assignments
    this.pid = parseInt(this.pid.split('-')[1]);
    this.uid = parseInt(this.uid.split('.')[1].replace(/[^\d]/g, ''));
    this.timestamp = parseInt(this.timestamp);

  }

  /**
   * Print post as text with whitespace stripped. Optionally remove <div>
   * containers that wrap BBcode quotes and spoilers.
   * @param {boolean} removeContainers
   * @return {string}
   */
  getText (removeContainers=true) {
    var stringList = [];
    var children = this.message.contents();
    if (removeContainers) {
      children = children.not('.bbCodeQuote,.bbCodeSpoilerContainer');
    }
    return children.text().trim();
  }

  /**
   * Returns a list of commands found in a ThreadPost.
   * @return {object[]}
   */
  getCommands () {
    var commandList = [];
    for (var line of this.getText().split('\n')) {
      if (line.startsWith('!')) {
        const words = line.split(' ');
        commandList.push({
          "pid": this.pid,
          "uid": this.uid,
          "user": this.user,
          "time": this.timestamp,
          "cmd": words[0],
          "value": words.slice(1).join(' ')
        });
      }
    }
    return commandList;
  }

}

module.exports = ThreadPost;
