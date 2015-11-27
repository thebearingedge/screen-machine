'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = vueComponent;

var _baseComponent = require('./base-component');

var _baseComponent2 = _interopRequireDefault(_baseComponent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function vueComponent(Vue) {

  return function component(document, events, machine, router) {

    Vue.component('SmLink', {
      template: '<a :href="href" :class="activeClass"><slot></slot></a>',
      props: {
        to: { type: String, required: true },
        params: { type: Object, default: function _default() {
            return {};
          } },
        query: { type: Object, default: function _default() {
            return {};
          } },
        hash: { type: String, default: '' },
        active: { type: String, default: '' }
      },
      data: function data() {
        var to = this.to;
        var params = this.params;
        var query = this.query;
        var hash = this.hash;

        var href = router.href(to, params, query, hash);
        return { href: href, activeClass: null };
      },
      created: function created() {
        var _this = this;

        this._matchActive = function () {
          var to = _this.to;
          var params = _this.params;
          var query = _this.query;
          var active = _this.active;

          _this.activeClass = machine.hasState(to, params, query) ? active : '';
        };
        events.subscribe('stateChangeSuccess', this._matchActive);
      },
      destroyed: function destroyed() {
        events.unsubscribe('stateChangeSuccess', this._matchActive);
      }
    });

    var VueComponent = (function (_BaseComponent) {
      _inherits(VueComponent, _BaseComponent);

      function VueComponent(componentName, viewKey, state) {
        _classCallCheck(this, VueComponent);

        var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(VueComponent).apply(this, arguments));

        _this2.ViewModel = state.views ? Vue.component(state.views[viewKey].component) : Vue.component(state.component);
        return _this2;
      }

      _createClass(VueComponent, [{
        key: 'render',
        value: function render(resolved, params, query) {
          var ViewModel = this.ViewModel;
          var childViews = this.childViews;

          var data = this.getData(resolved, params, query);
          var vm = new ViewModel({ data: data });
          var node = vm.$mount().$el;
          childViews.forEach(function (view) {
            return view.attachWithin(node);
          });
          return Object.assign(this, { vm: vm, node: node });
        }
      }, {
        key: 'update',
        value: function update(resolved, params, query) {
          this.vm.$data = this.getData(resolved, params, query);
          return this;
        }
      }, {
        key: 'destroy',
        value: function destroy() {
          var vm = this.vm;
          var childViews = this.childViews;

          this.vm = this.node = null;
          vm.$destroy();
          childViews.forEach(function (view) {
            return view.detach();
          });
          return this;
        }
      }, {
        key: 'getData',
        value: function getData(resolved, params, query) {
          return this.state.getResolves().reduce(function (data, resolve) {
            data[resolve.key] = resolved[resolve.id];
            return data;
          }, { params: params, query: query });
        }
      }]);

      return VueComponent;
    })(_baseComponent2.default);

    return VueComponent;
  };
}