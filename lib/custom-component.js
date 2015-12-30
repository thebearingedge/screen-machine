
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = customComponent;

var _baseComponent = require('./base-component');

var _baseComponent2 = _interopRequireDefault(_baseComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function customComponent(document) {
  var CustomComponent = (function (_BaseComponent) {
    _inherits(CustomComponent, _BaseComponent);

    function CustomComponent(componentName, viewKey, state) {
      _classCallCheck(this, CustomComponent);

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(CustomComponent).apply(this, arguments));

      var views = state.views;
      var component = state.component;

      _this.factory = views ? views[viewKey] : component;
      _this.controller = null;
      return _this;
    }

    _createClass(CustomComponent, [{
      key: 'render',
      value: function render(resolved, params, query) {
        var factory = this.factory;
        var childViews = this.childViews;

        var props = this.getProps.apply(this, arguments);

        var _factory = factory(props, document);

        var controller = _factory.controller;
        var node = _factory.node;

        childViews.forEach(function (view) {
          return view.attachWithin(node);
        });
        return Object.assign(this, { controller: controller, node: node });
      }
    }, {
      key: 'update',
      value: function update() {
        var props = this.getProps.apply(this, arguments);
        this.controller.update(props);
        return this;
      }
    }, {
      key: 'destroy',
      value: function destroy() {
        var controller = this.controller;
        var childViews = this.childViews;

        controller.destroy();
        childViews.forEach(function (view) {
          return view.detach();
        });
        this.controller = this.node = null;
        return this;
      }
    }, {
      key: 'getProps',
      value: function getProps(resolved, params, query) {
        return this.state.getResolves().reduce(function (props, r) {
          return Object.assign(props, _defineProperty({}, r.key, resolved[r.id]));
        }, { params: params, query: query });
      }
    }]);

    return CustomComponent;
  })(_baseComponent2.default);

  return CustomComponent;
}