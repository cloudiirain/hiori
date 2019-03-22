"use strict";

const Hiori = require('./lib/Hiori.js');
const ThreadPost = require('./lib/ThreadPost.js');
const BBcode = require('./lib/BBcode.js');
const { HioriError, ParserError, NavigationError, SubmissionError, NotFoundError } = require('./lib/error.js');
const { consoleLog } = require('./lib/helpers.js');

module.exports = {
  Hiori,
  ThreadPost,
  BBcode,
  HioriError,
  ParserError,
  NavigationError,
  SubmissionError,
  NotFoundError,
  consoleLog
}
