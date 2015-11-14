
'use strict';

export default function viewLibsScreen(machine) {
  machine
    .state('viewLibs', {
      path: 'view-libraries',
      resolve: {
        libs() {
          return [
            { libName: 'riot' },
            { libName: 'react' },
            { libName: 'ractive' },
            { libName: 'vue' }
          ];
        }
      },
      views: {
        '@': {  component: 'Libraries' },
        '@viewLibs': { component: 'LibrariesLanding' }
      }
    })
    .state('viewLibs.library', {
      path: ':libName',
      component: 'LibraryDescription',
      resolve: {
        content: ['libs@viewLibs', (libs, params) => {
          return libs
            .find(lib => lib.libName === params.libName)
            .libName + ' is super-cool';
        }]
      }
    });
}
