
'use strict';

module.exports = function (machine) {

  machine
    .state('notFound', {
      path: '/*not-found',
      component: 'NotFound'
    })
    .state('viewLibs.library.notFound', {
      path: '*notFound',
      views: {
        '@': {
          component: 'NotFound'
        }
      }
    });
};
