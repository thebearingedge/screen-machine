'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = urlWatcher;
function urlWatcher(window) {
  var _ref = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var _ref$html = _ref.html5;
  var html5 = _ref$html === undefined ? true : _ref$html;
  var history = window.history;
  var location = window.location;

  var windowEvent = (history || {}).pushState && html5 ? 'popstate' : 'hashchange';
  var POPSTATE = windowEvent === 'popstate';

  return {

    listener: null,

    subscribe: function subscribe(onChange) {
      var _this = this;

      this.listener = function () {
        return onChange(_this.get());
      };
      this.watch();
      this.listener();
    },
    watch: function watch() {
      window.addEventListener(windowEvent, this.listener);
    },
    ignore: function ignore() {
      window.removeEventListener(windowEvent, this.listener);
    },
    get: function get() {
      var pathname = location.pathname;
      var search = location.search;
      var hash = location.hash;

      var url = POPSTATE ? pathname + search + hash : hash.slice(1) || '/';
      return decodeURIComponent(url);
    },
    push: function push(url) {
      if (POPSTATE) history.pushState({}, null, url);else {
        this.ignore();
        location.hash = url;
        this.watch();
      }
    },
    replace: function replace(url) {
      if (POPSTATE) history.replaceState({}, null, url);else {
        var protocol = location.protocol;
        var host = location.host;
        var pathname = location.pathname;
        var search = location.search;

        var href = protocol + '//' + host + pathname + search + '#' + url;
        this.ignore();
        location.replace(href);
        this.watch();
      }
    }
  };
}