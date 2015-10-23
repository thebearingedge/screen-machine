
'use strict';

module.exports = function (machine) {

  machine

    .state('viewLibs', {
      path: 'view-libraries',
      resolve: {
        libs: function () {
          return [
            { libName: 'riot' },
            { libName: 'react' },
            { libName: 'ractive' },
            { libName: 'vue' }
          ];
        }
      },
      views: {
        '@': { // <- render into root View
          component: 'Libraries'
        },
        '@viewLibs': { // <- render into 'libraries' component
          component: 'LibrariesLanding'
        }
      }
    })

    .state('viewLibs.library', {
      path: ':libName',
      component: 'LibraryDescription', // <- render into 'libraries' component
      resolve: {
        content: ['libs@viewLibs', function (libs, params) {

          var lib = libs
            .filter(function (lib) {

              return lib.libName === params.libName;
            })[0];

          return lib.libName + ' is super-cool.';
        }]
      }
    });
};
