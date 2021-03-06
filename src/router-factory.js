
import Route from './route'
import urlTools from './url-tools'

export default function routerFactory() {

  return {

    root: null,

    routes: {},

    queues: { __absolute__: [] },

    add(name, path, parsers) {
      return this.register(new Route(name, path, parsers))
    },

    register(route) {
      const { routes } = this
      if (route.path === '/') {
        routes[route.name] = this.root = route
        return this.flushQueueFor(route)
      }
      if (route.isAbsolute()) {
        if (!this.root) return this.enqueue(null, route)
        routes[route.name] = route
        this.root.addChild(route)
        return this.flushQueueFor(route)
      }
      const parentName = route.parentName
      let parentRoute = this.routes[parentName]
      if (parentName && !parentRoute) return this.enqueue(parentName, route)
      this.routes[route.name] = route
      parentRoute || (parentRoute = this.root)
      parentRoute.addChild(route)
      return this.flushQueueFor(route)
    },

    find(url) {
      const urlParts = urlTools.toParts(url)
      const [, ...unmatched ] = urlParts.pathname.split('/')
      const results = []
      let route = this.root
      results.push(route.match(unmatched))
      let children = (route.children || []).slice()
      while (unmatched.length && children.length) {
        let matched
        children.sort((a, b) => b.specificity - a.specificity)
        for (let i = 0; i < children.length; i++) {
          const child = children[i]
          if (matched = child.match(unmatched)) {
            results.push(matched)
            route = child
            children = route.children
              ? route.children.slice()
              : []
            break
          }
          else continue
        }
        if (!matched) break
      }
      if (unmatched.length) return null
      const params = flattenParams(results)
      const query = urlParts.search
        ? urlTools.parseQuery(urlParts.search)
        : {}
      return [route.name, params, query]
    },

    href() {
      return this.toUrl(...arguments)
    },

    toUrl(name, params, query, fragment) {
      const pathname = this.routes[name].generate(params)
      return urlTools.combine(pathname, query, fragment)
    },

    enqueue(parentName, route) {
      const { queues } = this
      if (!parentName) queues.__absolute__.push(route)
      else {
        queues[parentName] || (queues[parentName] = [])
        queues[parentName].push(route)
      }
      return this
    },

    flushQueueFor(route) {
      const { root, queues } = this
      const toFlush = route === root
        ? [queues.__absolute__, queues[route.name]]
        : [queues[route.name]]
      toFlush.forEach(queue => {
        while (queue && queue.length) this.register(queue.pop())
      })
      return this
    }

  }

}

function flattenParams(results) {
  return results
    .reduce((flattened, resultSet) => flattened.concat(resultSet), [])
    .reduce((params, result) => Object.assign(params, result), {})
}
