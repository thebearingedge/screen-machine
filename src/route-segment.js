
export default class Segment {

  static create() {
    return new this(...arguments)
  }

  constructor(string) {
    let match, type, key, specificity
    // jshint -W084
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
    Object.assign(this, { type, key, specificity })
  }

  match(string) {
    const { type, key } = this
    if (type === 'splat' || type === 'dynamic') return { [key]: string }
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
