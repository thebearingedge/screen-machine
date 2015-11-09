
'use strict';

module.exports = urlWatcher;


function urlWatcher(window, options = {}) {
  const { history, location } = window;
  const windowEvent = (history || {}).pushState && (options.html5 !== false)
    ? 'popstate'
    : 'hashchange';

  return {

    listener: null,

    subscribe(onChange) {
      this.listener = () => onChange.call(null, this.get());
      this.watch();
      onChange.call(null, this.get());
    },

    watch() {
      window.addEventListener(windowEvent, this.listener);
    },

    ignore() {
      window.removeEventListener(windowEvent, this.listener);
    },

    get() {
      const url = windowEvent === 'popstate'
        ? location.pathname + location.search + location.hash
        : location.hash.slice(1) || '/';
      return decodeURIComponent(url);
    },

    push(url) {
      if (windowEvent === 'popstate') history.pushState({}, null, url);
      else {
        this.ignore();
        location.hash = url;
        this.watch();
      }
    },

    replace(url) {
      if (windowEvent === 'popstate') history.replaceState({}, null, url);
      else {
        const { protocol, host, pathname, search } = location;
        const href = `${protocol}//${host}${pathname}${search}#${url}`;
        this.ignore();
        location.replace(href);
        this.watch();
      }
    }

  };
}
