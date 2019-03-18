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

  describe('fetchAllThreadPosts', function () {

    it('should throw a NotFoundError if the thread page doesn\'t exist');

    it('should throw a ParserError if the thread page HTML is bad');

  });

  describe('replyThread', function () {

    it('should throw a RangeError if no message is provided');

    it('should throw a RangeError if message length is greater than 100,000 characters');

    it('should login hiori if not logged in already');

    it('should throw a NotFoundError if the reply page doesn\'t exist');

    it('should throw a ParserError if the reply page HTML is bad');

  });

  describe('bbCodeQuote', function () {

    it('create a BBCode quote with the provided parameters', function () {
      const str = Hiori.bbCodeQuote('hi', 'hiori', 123, 12345);
      const exp = '[QUOTE="hiori, post: 12345, member: 123"]hi[/QUOTE]\n';
      expect(str).to.be.equal(exp);
    });

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

  describe('stripUserCode', function () {

    it('should strip all @USER:1234|Username strings from text', function () {
      const txt = 'Hi, @USER:1234|hiori. Goodbye, @USER:1234|Hello&nbsp;I&nbsp;Am&nbsp;A&nbsp;Tree.'
      const exp = 'Hi, @hiori. Goodbye, @Hello I Am A Tree.';
      const strip = Hiori.stripUserCode(txt);
      expect(strip).to.be.equal(exp);
    });

  });

})
