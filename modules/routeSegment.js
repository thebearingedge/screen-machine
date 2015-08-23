
'use strict';

module.exports = {

  create: function (string) {

    return new Segment(string);
  }

};


function Segment(string) {

  var match;

  // jshint -W084
  if (match = string.match(/^:([^\/]+)$/)) {

    this.type = 'dynamic';
    this.key = match[0].slice(1);
    this.specificity = '3';
  }
  else if (match = string.match(/^\*([^\/]+)$/)) {

    this.type = 'splat';
    this.key = match[0].slice(1);
    this.specificity = '2';
  }
  else if (string === '') {

    this.type = 'epsilon';
    this.key = '';
    this.specificity = '1';
  }
  else {

    this.type = 'static';
    this.key = string;
    this.specificity = '4';
  }
}


Segment.prototype.match = function match(string) {

  if (this.type === 'splat' || this.type === 'dynamic') {

    var result = {};

    result[this.key] = string;
    return result;
  }

  return this.key === string
    ? {}
    : null;
};


Segment.prototype.interpolate = function interpolate(params) {

  switch (this.type) {
    case 'dynamic': return encodeURIComponent(params[this.key]);
    case 'splat': return params[this.key]
      .split('/')
      .map(function (string) {

        return encodeURIComponent(string);
      })
      .join('/');
    case 'epsilon': return '';
    default: return this.key;
  }
};
