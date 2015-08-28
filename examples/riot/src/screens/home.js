
'use strict';

module.exports = function (machine) {

  machine
    .state('home', {
      path: '/',
      component: 'home',
      resolve: {
        today: function () {

          return new Date();
        }
      },
      cacheable: false
    });
};
