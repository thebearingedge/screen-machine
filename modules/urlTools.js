
'use strict';


module.exports = {

  toParts: function toParts(encodedUrl) {

    var url = decodeURIComponent(encodedUrl);

    var hashAt = url.indexOf('#');
    var searchAt = url.indexOf('?');

    var hasHash = hashAt > -1;
    var hasQuery = searchAt > -1;

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

    };
  },


  parseQuery: function parseQuery(queryString) {

    return queryString
      .split('&')
      .reduce(function (queryParams, queryPair) {

        var keyVal = queryPair.split('=');

        queryParams[keyVal[0]] = keyVal[1];

        return queryParams;
      }, {});
  },


  formatQuery: function formatQuery(queryParams) {

    return Object
      .keys(queryParams)
      .reduce(function (pairs, key) {

        var queryKey = encodeURIComponent(key);
        var queryValue = encodeURIComponent(queryParams[key]);

        return pairs.concat(queryKey + '=' + queryValue);
      }, [])
      .join('&');
  },


  combine: function (pathname, search, hash) {

    search || (search = '');

    if (typeof search === 'object') {

      search = this.formatQuery(search);
    }

    var url = pathname;

    if (search) {

      url += '?' + search;
    }

    if (typeof hash !== 'undefined' && hash !== '') {

      url += '#' + hash;
    }

    return url;
  }

};
