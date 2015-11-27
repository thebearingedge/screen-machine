'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = resolveFactory;

var _simpleResolve = require('./simple-resolve');

var _simpleResolve2 = _interopRequireDefault(_simpleResolve);

var _dependentResolve = require('./dependent-resolve');

var _dependentResolve2 = _interopRequireDefault(_dependentResolve);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

function resolveFactory(Promise) {

  return {
    instantiate: function instantiate(resolveKey, state) {
      return Array.isArray(state.resolve[resolveKey]) ? new (Function.prototype.bind.apply(_dependentResolve2.default, [null].concat(Array.prototype.slice.call(arguments), [Promise])))() : new (Function.prototype.bind.apply(_simpleResolve2.default, [null].concat(Array.prototype.slice.call(arguments), [Promise])))();
    },
    addTo: function addTo(state) {
      var _this = this;

      var resolve = state.resolve;

      if (!resolve || (typeof resolve === 'undefined' ? 'undefined' : _typeof(resolve)) !== 'object') return;
      Object.keys(resolve).forEach(function (key) {
        return state.addResolve(_this.instantiate(key, state));
      });
    }
  };
}