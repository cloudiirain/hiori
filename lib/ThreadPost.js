'use strict';

/**
 * A post in a NUF thread.
 */
module.exports = class ThreadPost {
  /**
   * ThreadPost are constructed on individual <li> elements selected using
   * Cheerio. The css selector to use should be: '#messageList .message'.
   * @param {Cheerio} li
   */
  constructor (li) {
    try {
      this.postId = li.attr('id').split('-')[1];
      this.user = li.attr('data-author');
      this.message = li.find('.messageText');
      if (!this.user || !this.message) {
        throw new Error();
      }
    } catch {
      throw new Error('Unable to parse ThreadPost');
    }

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
          "user": this.user,
          "post": this.postId,
          "action": words[0],
          "value": words.slice(1).join(' ')
        });
      }
    }
    return commandList;
  }

}
