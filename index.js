"use strict";

const Hiori = require('./lib/Hiori.js');
const ThreadPost = require('./lib/ThreadPost.js');
const { HioriError, ParserError, NavigationError, SubmissionError, NotFoundError } = require('./lib/error.js');
const { consoleLog } = require('./lib/helpers.js');

module.exports = {
  Hiori,
  ThreadPost,
  HioriError,
  ParserError,
  NavigationError,
  SubmissionError,
  NotFoundError,
  consoleLog
}
