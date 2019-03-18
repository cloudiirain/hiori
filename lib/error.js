/**
 * @module error.js
 * @author cloudiirain
 * @description Module for custom error classes.
 */

/* Base application Error */
class HioriError extends Error {
  constructor (message, status) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
    this.status = status || 500;
  }
}

/* Error parsing NUF HTML */
class ParserError extends HioriError {
  constructor (message) {
    super(message || 'Error parsing NUF HTML', 502);
  }
}

module.exports = {
  HioriError: HioriError,
  ParserError: ParserError
}
