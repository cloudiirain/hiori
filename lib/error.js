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
    super(message || 'Error parsing Novel Updates Forum HTML', 502);
  }
}

/* Error navigating to NUF */
class NavigationError extends HioriError {
  constructor (message) {
    super(message || 'Unable to reach Novel Updates Forum', 503);
  }
}

/* Error after submitting data to NUF */
class SubmissionError extends HioriError {
  constructor (message) {
    super(message || 'Error submitting data to Novel Updates Forum', 403);
  }
}

module.exports = {
  HioriError: HioriError,
  ParserError: ParserError,
  NavigationError: NavigationError,
  SubmissionError: SubmissionError
}
