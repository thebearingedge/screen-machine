
'use strict';

var chai = require('chai');
var expect = chai.expect;

import Segment from '../modules/routeSegment';


describe('routeSegment', function () {

  describe('static', function () {

    var staticSegment;

    beforeEach(function () {

      staticSegment = Segment.create('foo');

      expect(staticSegment.type).to.equal('static');
      expect(staticSegment.specificity).to.equal('4');
      expect(staticSegment.key).to.equal('foo');
    });


    describe('.match(string)', function () {

      it('should not match a non-identical string', function () {

        expect(staticSegment.match('bar')).to.equal(null);
      });


      it('should match an identical string', function () {

        expect(staticSegment.match('foo')).to.deep.equal({});
      });

    });


    describe('.interpolate(params)', function () {

      it('should return its key', function () {

        expect(staticSegment.interpolate({})).to.equal('foo');
      });

    });

  });


  describe('dynamic', function () {

    var dynamicSegment;

    beforeEach(function () {

      dynamicSegment = Segment.create(':foo');

      expect(dynamicSegment.type).to.equal('dynamic');
      expect(dynamicSegment.specificity).to.equal('3');
      expect(dynamicSegment.key).to.equal('foo');
    });


    describe('.match(string)', function () {

      it('should return a key value object', function () {

        expect(dynamicSegment.match('bar')).to.deep.equal({ foo: 'bar' });
      });

    });


    describe('.interpolate', function () {

      it('should return the params value that matches its key', function () {

        expect(dynamicSegment.interpolate({ foo: 'bar' })).to.equal('bar');
      });

    });

  });


  describe('splat', function () {

    var splatSegment;

    beforeEach(function () {

      splatSegment = Segment.create('*foo');

      expect(splatSegment.type).to.equal('splat');
      expect(splatSegment.specificity).to.equal('2');
      expect(splatSegment.key).to.equal('foo');
    });


    describe('.match(string)', function () {

      it('should return a key value object', function () {

        expect(splatSegment.match('baz/qux')).to.deep.equal({ foo: 'baz/qux' });
      });

    });


    describe('.interpolate(params)', function () {

      it('should return an empty string', function () {

        expect(splatSegment.interpolate({ foo: 'bar/baz qux' }))
          .to.equal('');
      });

    });

  });


  describe('epsilon', function () {

    var epsilonSegment;

    beforeEach(function () {

      epsilonSegment = Segment.create('');

      expect(epsilonSegment.type).to.equal('epsilon');
      expect(epsilonSegment.specificity).to.equal('1');
      expect(epsilonSegment.key).to.equal('');
    });


    describe('.match(string)', function () {

      it('should match identical strings', function () {

        expect(epsilonSegment.match('')).to.deep.equal({});
      });


      it('should not match non-identical strings', function () {

        expect(epsilonSegment.match('foo')).to.equal(null);
      });

    });


    describe('.interpolate(params)', function () {

      it('should only return an empty string', function () {

        expect(epsilonSegment.interpolate({})).to.equal('');
      });

    });

  });

});