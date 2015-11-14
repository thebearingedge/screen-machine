
'use strict';

export default function vues(Vue) {

  Vue.component('Home', {
    template: `<div>
                <h2>Welcome to the Vue Screen Machine Demo</h2>
                <p>The current date is {{ today }}</p>
                <br>
                <sm-link to='viewLibs' active='active'>Libraries</sm-link>
              </div>`,
    data() {
      return { today: this.$options.today };
    },
    created() {
      this.interval = setInterval(() => {
        this.today = new Date();
      }, 1000);
    },
    destroyed() {
      clearInterval(this.interval);
    }
  });

  Vue.component('Libraries', {
    template: `<div>
                <ul>
                  <li style='display: inline'>
                    <sm-link to='home' active='active'>Home</sm-link>
                  </li>
                  <li style='display: inline'>
                    <sm-link to='viewLibs' active='active'>Libraries</sm-link>
                  </li>
                </ul>
                <h2>This is the view libraries page</h2>
                <ul>
                  <li v-for='lib in libs' style='display: inline'>
                    <sm-link to='viewLibs.library' :params='lib' active='active'>{{ lib.libName }}</sm-link>
                  </li>
                </ul>
                <sm-view></sm-view>
              </div>`
  });

  Vue.component('LibrariesLanding', {
    template: `<p>This is the "Libraries" landing page.</p>`
  });

  Vue.component('LibraryDescription', {
    template: `<div>
                <h3>Have you heard of {{ params.libName }}?</h3>
                <p>{{ content }}</p>
              </div>`
  });

  Vue.component('NotFound', {
    template: `<h4>Aw, Snap. We could not find the page you were looking for :(</h4>`
  });

}
