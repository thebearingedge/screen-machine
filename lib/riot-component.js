'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = riotComponent;

var _baseComponent = require('./base-component');

var _baseComponent2 = _interopRequireDefault(_baseComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function riotComponent(riot) {

  return function component(document, events, machine, router) {

    var linkTagName = 'sm-link';
    var linkTemplate = '<a href="{ href }" class="{ activeClass }">\n                            <yield/>\n                          </a>';

    var SmLink = function SmLink(opts) {
      var _this = this;

      _classCallCheck(this, SmLink);

      var to = opts.to;
      var params = opts.params;
      var query = opts.query;
      var hash = opts.hash;
      var active = opts.active;

      this.href = router.href(to, params, query, hash || '');
      var matchActive = function matchActive() {
        var isActive = machine.hasState(to, params, query);
        _this.activeClass = isActive ? active : null;
        _this.update();
      };
      matchActive();
      events.subscribe('stateChangeSuccess', matchActive);
      this.on('unmount', function () {
        events.unsubscribe('stateChangeSuccess', matchActive);
      });
    };

    riot.tag(linkTagName, linkTemplate, SmLink);

    var RiotComponent = (function (_BaseComponent) {
      _inherits(RiotComponent, _BaseComponent);

      function RiotComponent(componentName, viewKey, state) {
        _classCallCheck(this, RiotComponent);

        var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(RiotComponent).apply(this, arguments));

        var views = state.views;
        var component = state.component;

        _this2.tagName = views ? views[viewKey].component : component;
        _this2.tagInstance = null;
        return _this2;
      }

      _createClass(RiotComponent, [{
        key: 'render',
        value: function render(resolved, params, query) {
          var tagName = this.tagName;
          var childViews = this.childViews;

          var opts = this.getOpts(resolved, params, query);
          var node = document.createElement(tagName);

          var _riot$mount = riot.mount(node, tagName, opts);

          var _riot$mount2 = _slicedToArray(_riot$mount, 1);

          var tagInstance = _riot$mount2[0];

          childViews.forEach(function (view) {
            return view.attachWithin(node);
          });
          return Object.assign(this, { node: node, tagInstance: tagInstance });
        }
      }, {
        key: 'update',
        value: function update(resolved, params, query) {
          var tagInstance = this.tagInstance;

          tagInstance.opts = this.getOpts(resolved, params, query);
          tagInstance.update();
          return this;
        }
      }, {
        key: 'destroy',
        value: function destroy() {
          this.tagInstance.unmount();
          this.tagInstance = this.node = null;
          this.childViews.forEach(function (view) {
            return view.detach();
          });
          return this;
        }
      }, {
        key: 'getOpts',
        value: function getOpts(resolved, params, query) {
          return this.state.getResolves().reduce(function (opts, resolve) {
            return Object.assign(opts, _defineProperty({}, resolve.key, resolved[resolve.id]));
          }, { params: params, query: query });
        }
      }]);

      return RiotComponent;
    })(_baseComponent2.default);

    return RiotComponent;
  };
}