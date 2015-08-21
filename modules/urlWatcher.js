
'use strict';

module.exports = urlWatcher;


function urlWatcher(window, options) {

  options || (options = {});

  var history = window.history;
  var location = window.location;
  var windowEvent = history && history.pushState && (options.html5 !== false)
    ? 'popstate'
    : 'hashchange';

  var watcher = {

    listener: null,


    subscribe: function subscribe(onChange) {

      this.listener = function () {

        onChange.call(null, this.get());
      }.bind(this);

      this.watch();
      onChange.call(null, this.get());
    },


    watch: function watch() {

      window.addEventListener(windowEvent, this.listener);
    },


    ignore: function ignore() {

      window.removeEventListener(windowEvent, this.listener);
    },


    get: function get() {

      var url = windowEvent === 'popstate'
        ? location.pathname + location.search + location.hash
        : location.hash.slice(1) || '/';

      return decodeURIComponent(url);
    },


    push: function push(url) {

      if (windowEvent === 'popstate') {

        history.pushState({}, null, url);
      }
      else {

        this.ignore();
        location.hash = url;
        this.watch();
      }
    },


    replace: function replace(url) {

      if (windowEvent === 'popstate') {

        history.replaceState({}, null, url);
      }
      else {

        var href = location.protocol +
          '//' +
          location.host +
          location.pathname +
          location.search +
          '#' +
          url;

        this.ignore();
        location.replace(href);
        this.watch();
      }
    }

  };

  return watcher;
}
