'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _baseResolve = require('./base-resolve');

var _baseResolve2 = _interopRequireDefault(_baseResolve);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DependentResolve = (function (_BaseResolve) {
  _inherits(DependentResolve, _BaseResolve);

  function DependentResolve(resolveKey, state, Promise) {
    _classCallCheck(this, DependentResolve);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(DependentResolve).call(this, resolveKey, state, Promise));

    var resolveDef = state.resolve[resolveKey];
    var invokableIndex = resolveDef.length - 1;
    _this.invokable = resolveDef[invokableIndex];
    _this.injectables = resolveDef.slice(0, invokableIndex).map(function (injectable) {
      return injectable.indexOf('@') > -1 ? injectable : injectable + '@' + state.name;
    });
    return _this;
  }

  _createClass(DependentResolve, [{
    key: 'execute',
    value: function execute(params, query, transition, dependencies) {
      var injectables = this.injectables;
      var invokable = this.invokable;

      var args = injectables.map(function (injectable) {
        return dependencies[injectable];
      });
      return invokable.apply(undefined, _toConsumableArray(args).concat([params, query, transition]));
    }
  }]);

  return DependentResolve;
})(_baseResolve2.default);

exports.default = DependentResolve;