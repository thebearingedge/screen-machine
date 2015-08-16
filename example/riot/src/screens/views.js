
'use strict';

module.exports = function (machine) {

  machine
    .state('views', {
      path: 'views',
      views: {
        '': {
          component: 'views'
        },
        '@views': {
          component: 'views-landing'
        }
      }
    })
    .state('views.riot', {
      path: 'riot',
      component: 'view-description',
      resolve: {
        content: function () {
          return 'Riot is super-cool';
        }
      }
    });
};