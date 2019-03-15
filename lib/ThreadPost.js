'use strict';

/**
 * ThreadPost is a cheerio representation of a post in a NUF thread.
 */
module.exports = class ThreadPost {
  /**
   * @param {!cheerio} li
   */
  constructor (li) {
    this.postId = li.attr('id').split('-')[1];
    this.user = li.attr('data-author');
    this.message = li.find('.messageText');
  }

  /**
   * @param {boolean} removeContainers Removes BBcode quotes and spoilers.
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
