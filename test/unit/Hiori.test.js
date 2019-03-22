/**
 * @module Hiori.test.js
 * @author cloudiirain
 * @description Unit tests for Hiori class
 */

'use strict';

const chai = require('chai');
const expect = chai.expect;

const { Hiori } = require('../../index.js');

// Run tests
describe('Hiori', function () {

  describe('constructor', function () {

    context('with a username and password', function () {
      it('should construct a Hiori object');
    });

    context('with no username or password', function () {
      it('should throw a RangeError');
    });

  });

  describe('init', function () {
    it('should initialize the Hiori bot');
  });

  describe('goTo', function () {

    context('with a good url', function () {
      it('should return a Cheerio if everything is okay');
      it('should throw a NavigationError if any dependency fails');
    });

    context('with a bad url', function () {
      it('should throw a RangeError');
    });

  });

  describe('isLoggedIn', function () {
    it('should return false if hiori hasn\'t navigated anywhere yet');
    it('should return false if hiori has navigated to a non-NUF page');
    it('should return false if NUF page lacks logged-in user dropdown');
    it('should return true if NUF page has logged-in user dropdown');
  });

  describe('login', function () {

    it('should not login again if hiori is already logged in');

    it('should throw a ParserError if login page HTML is bad');

  });

  describe('fetchThreadPosts', function () {

    it('should throw a NotFoundError if the thread page doesn\'t exist');

    it('should throw a ParserError if the thread page HTML is bad');

  });

  describe('fetchThreadPostsSince', function () {

    it('should throw a NotFoundError if the thread post doesn\'t exist');

    it('should return a list of ThreadPostJSON');

    it('should not return posts older than the specified postID');

  });

  describe('fetchThreadCommandsSince', function () {

    it('should return a list of DetailedCommands with post context');

    it('the first command should have a null prevPost');

  });

  describe('fetchThreadLastPageURL', function () {

    it('should return the URL of the last page in a thread series');

    it('should return false if no last page could be detected');

  });

  describe('replyThread', function () {

    it('should throw a RangeError if no message is provided');

    it('should throw a RangeError if message length is greater than 100,000 characters');

    it('should login hiori if not logged in already');

    it('should throw a NotFoundError if the reply page doesn\'t exist');

    it('should throw a ParserError if the reply page HTML is bad');

  });

  describe('decodeUserstr', function () {

    it('should convert an @USER:1234|Username string to a user object', function () {
      const str = '@USER:1234|hiori';
      const obj = Hiori.decodeUserstr(str);
      expect(obj.uid).to.be.equal(1234);
      expect(obj.user).to.be.equal('hiori');
    });

    it('should convert &nbsp; to regular spaces', function () {
      const str = '@USER:1234|Hello&nbsp;I&nbsp;Am&nbsp;A&nbsp;Tree';
      const obj = Hiori.decodeUserstr(str);
      expect(obj.user).to.be.equal('Hello I Am A Tree');
    });

  });

})
