/**
 * @module BBcode.test.js
 * @author cloudiirain
 * @description Unit tests for BBcode class
 */

'use strict';

const chai = require('chai');
const expect = chai.expect;

const { BBcode } = require('../../index.js');

// Run tests
describe('BBcode', function () {

  describe('quote', function () {

    it('create a BBCode quote with the provided parameters', function () {
      const str = BBcode.quote('hi', 'hiori', 123, 12345);
      const exp = '[QUOTE="hiori, post: 12345, member: 123"]hi[/QUOTE]\n';
      expect(str).to.be.equal(exp);
    });

  });

  describe('stripUserStr', function () {

    it('should strip all @USER:1234|Username strings from text', function () {
      const txt = 'Hi, @USER:1234|hiori. Goodbye, @USER:1234|Hello&nbsp;I&nbsp;Am&nbsp;A&nbsp;Tree.'
      const exp = 'Hi, @hiori. Goodbye, @Hello I Am A Tree.';
      const strip = BBcode.stripUserStr(txt);
      expect(strip).to.be.equal(exp);
    });

  });

})
