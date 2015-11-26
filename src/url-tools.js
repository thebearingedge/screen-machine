
export default {

  toParts(encodedUrl) {
    const url = decodeURIComponent(encodedUrl)
    const hashAt = url.indexOf('#')
    const searchAt = url.indexOf('?')
    const hasHash = hashAt > -1
    const hasQuery = searchAt > -1
    return {
      pathname: hasQuery
        ? url.slice(0, searchAt)
        : hasHash
          ? url.slice(0, hashAt)
          : url,
      search: hasQuery && hasHash
        ? url.slice(searchAt + 1, hashAt)
        : hasQuery
          ? url.slice(searchAt + 1)
          : undefined,
      hash: hasHash
        ? url.slice(hashAt + 1)
        : undefined
    }
  },

  parseQuery(queryString) {
    return queryString
      .split('&')
      .reduce((queryParams, queryPair) => {
        const keyVal = queryPair.split('=')
        queryParams[keyVal[0]] = keyVal[1]
        return queryParams
      }, {})
  },

  formatQuery(queryParams) {
    return Object
      .keys(queryParams)
      .reduce((pairs, key) => {
        const queryKey = encodeURIComponent(key)
        const queryValue = encodeURIComponent(queryParams[key])
        return pairs.concat(queryKey + '=' + queryValue)
      }, [])
      .join('&')
  },

  combine(pathname, search, hash) {
    let url = pathname
    search || (search = '')
    if (typeof search === 'object') search = this.formatQuery(search)
    if (search) url += '?' + search
    if (hash) url += '#' + hash
    return url
  }

}
