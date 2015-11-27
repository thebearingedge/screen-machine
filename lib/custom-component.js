
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = customComponent;

var _baseComponent = require('./base-component');

var _baseComponent2 = _interopRequireDefault(_baseComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

      _this.factory = views ? views[viewKey].component : component;
      _this.viewController = null;
      return _this;
    }

    _createClass(CustomComponent, [{
      key: 'render',
      value: function render() {
        var factory = this.factory;
        var childViews = this.childViews;

        var _factory = factory.apply(undefined, Array.prototype.slice.call(arguments).concat([document]));

        var viewController = _factory.viewController;
        var node = _factory.node;

        childViews.forEach(function (view) {
          return view.attachWithin(node);
        });
        return Object.assign(this, { viewController: viewController, node: node });
      }
    }, {
      key: 'update',
      value: function update() {
        var _viewController;

        (_viewController = this.viewController).update.apply(_viewController, arguments);
        return this;
      }
    }, {
      key: 'destroy',
      value: function destroy() {
        var viewController = this.viewController;
        var childViews = this.childViews;

        viewController.destroy();
        childViews.forEach(function (view) {
          return view.detach();
        });
        this.viewController = this.node = null;
        return this;
      }
    }]);

    return CustomComponent;
  })(_baseComponent2.default);

  return CustomComponent;
}