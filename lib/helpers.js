/**
 * @module helpers.js
 * @author cloudiirain
 * @description Module for custom helper functions.
 */

 /**
  * Logs a message to console.
  * @param {Cheerio} li
  */
const consoleLog = (message, context='hiori') => {
  return console.log(`${new Date().toISOString()}[${context}] ${message}`);
}

module.exports = {
  consoleLog: consoleLog,
}
