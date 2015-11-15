
'use strict';

export default function viewLibs(machine) {
  machine
    .state('viewLibs', {
      path: 'view-libraries',
      resolve: {
        libs() {
          return [
            { libName: 'riot' },
            { libName: 'react' },
            { libName: 'ractive' }
          ];
        }
      },
      views: {
        '@': { component: 'libraries' },
        '@viewLibs': { component: 'libraries-landing' }
      }
    })
    .state('viewLibs.library', {
      path: ':libName',
      component: 'library-description',
      resolve: {
        content: ['libs@viewLibs', (libs, params) => {
          return libs
            .find(lib => lib.libName === params.libName)
            .libName + ' is super-cool';
        }]
      }
    });
}
