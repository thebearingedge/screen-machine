
'use strict';

export default function notFound(machine) {
  machine
    .state('notFound', {
      path: '/*not-found',
      component: 'not-found'
    })
    .state('viewLibs.library.notFound', {
      path: '*notFound',
      views: {
        '@': { component: 'not-found' }
      }
    });
}
