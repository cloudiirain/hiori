/**
 * @module      BBcode.js
 * @author      cloudiirain
 * @description Miscellaneous static methods for generating BBcode.
 */

'use strict';

/* BBcode class */
module.exports = class BBcode {

  /**
  * Wraps supplied text in a bbCodeQuote block.
  * @param {string} message The message to wrap inside a BBcode quote
  * @param {string} user The name of the user to quote
  * @param {number} uid The user id of the user to quote
  * @param {number} pid The post id that the quote refers to
  * @return {string}
  */
  static quote (message, user, uid, pid) {
    const postid = pid ? `, post: ${pid}` : '';
    const userid = uid ? `, member: ${uid}` : '';
    const info = `${user}${postid}${userid}`;
    const quoteUsr = user ? `="${info}"` : '';
    return `[QUOTE${quoteUsr}]${message}[/QUOTE]\n`;
  }

  /**
   * Strips all escaped user strings from text.
   * @param {string} text
   * @return {object}
   */
  static stripUserStr (text) {
    return text.replace(/\&nbsp;/g, ' ').replace(/@USER:\d+\|/g, '@');
  }

}
