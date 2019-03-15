'use strict';

/**
 * ThreadPost is a cheerio representation of a webpage in a NUF.
 */
module.exports = class Page {
  /**
   * @param {!cheerio} html
   */
  constructor (html) {
    this.$ = html;
  }
}
