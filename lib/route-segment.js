'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Segment = (function () {
  _createClass(Segment, null, [{
    key: 'create',
    value: function create() {
      return new (Function.prototype.bind.apply(this, [null].concat(Array.prototype.slice.call(arguments))))();
    }
  }]);

  function Segment(string) {
    _classCallCheck(this, Segment);

    var match = undefined,
        type = undefined,
        key = undefined,
        specificity = undefined;
    // jshint -W084
    if (match = string.match(/^:([^\/]+)$/)) {
      type = 'dynamic';
      key = match[0].slice(1);
      specificity = '3';
    } else if (match = string.match(/^\*([^\/]+)$/)) {
      type = 'splat';
      key = match[0].slice(1);
      specificity = '2';
    } else if (string === '') {
      type = 'epsilon';
      key = '';
      specificity = '1';
    } else {
      type = 'static';
      key = string;
      specificity = '4';
    }
    Object.assign(this, { type: type, key: key, specificity: specificity });
  }

  _createClass(Segment, [{
    key: 'match',
    value: function match(string) {
      var type = this.type;
      var key = this.key;

      if (type === 'splat' || type === 'dynamic') return _defineProperty({}, key, string);
      return key === string ? {} : null;
    }
  }, {
    key: 'interpolate',
    value: function interpolate(params) {
      var type = this.type;
      var key = this.key;

      switch (type) {
        case 'dynamic':
          return encodeURIComponent(params[key]);
        case 'splat':
          return '';
        case 'epsilon':
          return '';
        default:
          return key;
      }
    }
  }]);

  return Segment;
})();

exports.default = Segment;