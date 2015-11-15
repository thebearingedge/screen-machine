
'use strict';

export default function home(machine) {
  machine
    .state('home', {
      path: '/',
      component: 'home',
      resolve: {
        today() {
          return new Date();
        }
      },
      cacheable: false
    });
}
