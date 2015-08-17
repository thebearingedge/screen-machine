
'use strict';

module.exports = function (machine) {

  machine
    .state('viewLibs', {
      path: 'view-libraries',
      views: {
        '@': { // <- render into root View
          component: 'libraries'
        },
        '@viewLibs': { // <- render into 'libraries' component
          component: 'libraries-landing'
        }
      }
    })
    .state('viewLibs.library', {
      path: '/:libName',
      component: 'library-description', // <- render into 'libraries' component
      resolve: {
        content: function (params) {
          return params.libName + ' is super-cool';
        }
      }
    });
};
