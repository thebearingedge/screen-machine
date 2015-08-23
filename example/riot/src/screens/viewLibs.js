
'use strict';

module.exports = function (machine) {

  machine

    .state('viewLibs', {
      path: 'view-libraries',
      resolve: {
        libs: function () {
          console.log('fetching libs...');
          return [
            { libName: 'riot' },
            { libName: 'react' },
            { libName: 'ractive' }
          ];
        }
      },
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
      path: ':libName',
      component: 'library-description', // <- render into 'libraries' component
      resolve: {
        content: ['libs@viewLibs', function (libs, params) {
          console.log('fetching description for ' + params.libName + '...');

          var lib = libs
            .filter(function (lib) {

              return lib.libName === params.libName;
            })[0];

          return lib.libName + ' is super-cool.';
        }]
      }
    });
};
