
'use strict';

module.exports = urlWatcher;


function urlWatcher(window, options) {

  options || (options = {});

  var history = window.history;
  var location = window.location;
  var windowEvent = history && history.pushState && (options.html5 !== false)
    ? 'popstate'
    : 'hashchange';

  return {

    listener: null,


    subscribe: function (onChange) {

      this.listener = function () {

        onChange.call(null, this.get());
      }.bind(this);

      this.watch();
      onChange.call(null, this.get());
    },


    getLink: function () {

      var url = this.get();

      return windowEvent === 'popstate'
        ? url
        : '/#' + url;
    },


    watch: function () {

      window.addEventListener(windowEvent, this.listener);
    },


    ignore: function () {

      window.removeEventListener(windowEvent, this.listener);
    },


    get: function () {

      var url = windowEvent === 'popstate'
        ? location.pathname + location.search + location.hash
        : location.hash.slice(1) || '/';

      return decodeURIComponent(url);
    },


    push: function (url) {

      if (windowEvent === 'popstate') {

        history.pushState({}, null, url);
      }
      else {

        this.ignore();
        location.hash = url;
        this.watch();
      }
    },


    replace: function (url) {

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
}
