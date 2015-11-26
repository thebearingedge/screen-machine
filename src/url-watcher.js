
export default function urlWatcher(window, { html5 = true } = {}) {

  const { history, location } = window
  const windowEvent = (history || {}).pushState && (html5)
    ? 'popstate'
    : 'hashchange'
  const POPSTATE = windowEvent === 'popstate'

  return {

    listener: null,

    subscribe(onChange) {
      this.listener = () => onChange(this.get())
      this.watch()
      this.listener()
    },

    watch() {
      window.addEventListener(windowEvent, this.listener)
    },

    ignore() {
      window.removeEventListener(windowEvent, this.listener)
    },

    get() {
      const { pathname, search, hash } = location
      const url = POPSTATE ? pathname + search + hash : hash.slice(1) || '/'
      return decodeURIComponent(url)
    },

    push(url) {
      if (POPSTATE) history.pushState({}, null, url)
      else {
        this.ignore()
        location.hash = url
        this.watch()
      }
    },

    replace(url) {
      if (POPSTATE) history.replaceState({}, null, url)
      else {
        const { protocol, host, pathname, search } = location
        const href = `${protocol}//${host}${pathname}${search}#${url}`
        this.ignore()
        location.replace(href)
        this.watch()
      }
    }

  }
}
