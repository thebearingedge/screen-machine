
'use strict';

export default function homeScreen(machine) {
  machine
    .state('home', {
      path: '/',
      component: 'Home',
      resolve: {
        today() {
          return new Date();
        }
      },
      cacheable: false
    });
}
