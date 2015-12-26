
export default class Segment {

  static create() {
    return new this(...arguments)
  }

  constructor(string, parser = val => val) {
    let match, type, key, specificity
    if (match = string.match(/^:([^\/]+)$/)) {
      type = 'dynamic'
      key = match[0].slice(1)
      specificity = '3'
    }
    else if (match = string.match(/^\*([^\/]+)$/)) {
      type = 'splat'
      key = match[0].slice(1)
      specificity = '2'
    }
    else if (string === '') {
      type = 'epsilon'
      key = ''
      specificity = '1'
    }
    else {
      type = 'static'
      key = string
      specificity = '4'
    }
    Object.assign(this, { type, key, parser, specificity })
  }

  match(string) {
    const { type, key, parser } = this
    if (type === 'dynamic') {
      if (typeof parser === 'function') {
        return { [key]: parser(string) }
      }
      return { [key]: string }
    }
    if (type === 'splat') return { [key]: string }
    return key === string ? {} : null
  }

  interpolate(params) {
    const { type, key } = this
    switch (type) {
      case 'dynamic': return encodeURIComponent(params[key])
      case 'splat': return ''
      case 'epsilon': return ''
      default: return key
    }
  }

}
