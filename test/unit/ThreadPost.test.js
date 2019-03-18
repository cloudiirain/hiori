/**
 * @module ThreadPost.test.js
 * @author cloudiirain
 * @description Unit tests for ThreadPost class
 */

'use strict';

const chai = require('chai');
const cheerio = require('cheerio');
const fs = require('fs');
const expect = chai.expect;

const ThreadPost = require('../../lib/ThreadPost.js');
const { ParserError } = require('../../lib/error.js');

// Load fixtures
const goodHTML = fs.readFileSync('test/unit/fixtures/ThreadPost.html', 'utf8');

// Helper functions for testing
const makeCheerio = (templateHtml, content='') => {
  const html = templateHtml.replace('{{CONTENT}}', content);
  return cheerio.load(html)('#messageList .message').first();
}
const makeQuote = (content) => {
  return `<blockquote class="bbCodeBlock bbCodeQuote">${content}</blockquote>`
}
const makeSpoiler = (content) => {
  return `<div class="ToggleTriggerAnchor bbCodeSpoilerContainer">${content}</div>`
}

// Run tests
describe('ThreadPost', function() {

  describe('constructor', function() {

    context('with a cheerio selector with valid HTML', function() {
      it('should construct a ThreadPost', function() {
        const li = makeCheerio(goodHTML);
        const post = new ThreadPost(li);
        expect(post.pid).to.be.equal(12345);
        expect(post.uid).to.be.equal(54321);
        expect(post.user).to.be.equal('hiori');
        expect(post.timestamp).to.be.equal(987654321);
      });
    });

    context('with a cheerio selector with bad HTML', function() {
      it('should throw a ParserError', function() {
        const li = makeCheerio(goodHTML);
        const badcheerio = li.removeAttr('data-author');
        const badinit = () => new ThreadPost(badcheerio);
        expect(badinit).to.throw(ParserError);
      });
    });

  });

  describe('removeContainers', function() {

    it('should remove all BBcode blockquote <div>\'s from the cheerio tree', function () {
      const text = 'Hello World';
      const li = makeCheerio(goodHTML, makeQuote('Inside Quote') + text + makeQuote('Second Quote'));
      const post = new ThreadPost(li);
      const noQuote = ThreadPost._removeContainers(post.message);
      expect(noQuote.text().trim()).to.be.equal(text);
    });

    it('should remove all BBcode spoiler <div>\'s from the cheerio tree', function () {
      const text = 'Hello World';
      const li = makeCheerio(goodHTML, makeSpoiler('Inside Quote') + text + makeSpoiler('Second Quote'));
      const post = new ThreadPost(li);
      const noQuote = ThreadPost._removeContainers(post.message);
      expect(noQuote.text().trim()).to.be.equal(text);
    });

  });

  describe('escapeUsers', function() {

    it('should convert @usernames to an escaped format', function () {
      const username = '<a class="username" data-user="31294, @justabot">@justabot</a>'
      const li = makeCheerio(goodHTML, `Hi, ${username}`);
      const post = new ThreadPost(li);
      const escUser = ThreadPost._escapeUsernames(post.message);
      expect(escUser.text().trim()).to.be.equal(`Hi, @USER:31294|justabot`);
    });

    it('should convert @usernames with spaces to &nbsp;', function () {
      const username = '<a class="username" data-user="31294, @Hello I Am A Tree">@Hello I Am A Tree</a>'
      const li = makeCheerio(goodHTML, `Hi, ${username}`);
      const post = new ThreadPost(li);
      const escUser = ThreadPost._escapeUsernames(post.message);
      expect(escUser.text().trim()).to.be.equal(`Hi, @USER:31294|Hello&nbsp;I&nbsp;Am&nbsp;A&nbsp;Tree`);
    });

  });

  describe('getText', function() {

    it('should strip HTML tags', function () {
      const li = makeCheerio(goodHTML, '<div>Hello world!</div>');
      const post = new ThreadPost(li);
      const text = post.getText();
      expect(text).to.be.equal('Hello world!');
    });

    it('should strip trailing and leading whitespace', function () {
      const li = makeCheerio(goodHTML, '      Hello world!     <br/>\n   ');
      const post = new ThreadPost(li);
      const text = post.getText();
      expect(text).to.be.equal('Hello world!');
    });

  });

  describe('getCommands', function() {

    context('with default parameters', function() {

      it('should return an empty list if a post has no commands', function () {
        const li = makeCheerio(goodHTML, 'Hello world!');
        const post = new ThreadPost(li);
        const commands = post.getCommands();
        expect(commands.length).to.be.equal(0);
      });

      it('should sense multiple !action commands at the start of their own lines', function () {
        const txt = 'Yo<br/>\n!hit me<br/>\n!rawr this<br/>\n<br/>\nThis is extra text.';
        const li = makeCheerio(goodHTML, txt);
        const post = new ThreadPost(li);
        const commands = post.getCommands();
        expect(commands.length).to.be.equal(2);
        expect(commands[0].action).to.be.equal('!hit');
        expect(commands[0].value).to.be.equal('!hit me');
      });

      it('should not sense !action commands in the middle of a sentence', function () {
        const txt = 'Yo this is a sentence !hit me okay?';
        const li = makeCheerio(goodHTML, txt);
        const post = new ThreadPost(li);
        const commands = post.getCommands();
        expect(commands.length).to.be.equal(0);
      });

      it('should not sense !action commands inside quotes', function () {
        const li = makeCheerio(goodHTML, makeQuote('!hit me'));
        const post = new ThreadPost(li);
        const commands = post.getCommands();
        expect(commands.length).to.be.equal(0);
      });

    });

    context('with limit set to 1 command returned', function() {

      it('should return only 1 command even if a post has multiple', function () {
        const txt = 'Yo<br/>\n!hit me<br/>\n!rawr this<br/>\n<br/>\nThis is extra text.';
        const li = makeCheerio(goodHTML, txt);
        const post = new ThreadPost(li);
        const commands = post.getCommands(1);
        expect(commands.length).to.be.equal(1);
        expect(commands[0].action).to.be.equal('!hit');
        expect(commands[0].value).to.be.equal('!hit me');
      });

    });

  });

  describe('toJSON', function() {

    it('should convert a ThreadPost into a JSON object', function () {
      const txt = '!hit me<br/>\n!twice okay?';
      const li = makeCheerio(goodHTML, txt);
      const post = new ThreadPost(li);
      const json = post.toJSON();
      expect(json.pid).to.be.equal(12345);
      expect(json.uid).to.be.equal(54321);
      expect(json.user).to.be.equal('hiori');
      expect(json.time).to.be.equal(987654321);
      expect(json.cmds.length).to.be.equal(2);
      expect(json.cmds[0].action).to.be.equal('!hit');
    });

  });

});
