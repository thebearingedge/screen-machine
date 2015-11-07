
'use strict';

import BaseComponent from './modules/BaseComponent';

export default function vueComponent(Vue) {

  return function component(document, events, machine, router) {

    Vue.component('SmLink', {
      template: '<a :href="href" :class="activeClass"><slot></slot></a>',
      props: {
        to: {
          type: String,
          required: true
        },
        params: {
          type: Object,
          default() {
            return {};
          }
        },
        query: {
          type: Object,
          default() {
            return {};
          }
        },
        hash: {
          type: String,
          default: ''
        },
        active: {
          type: String,
          default: ''
        }
      },
      data() {
        const href = router.href(this.to, this.params, this.query, this.hash);
        return { href, activeClass: null };
      },
      created() {
        this._matchActive = () => {
          const isActive = machine.hasState(this.to, this.params, this.query);
          this.activeClass = isActive ? this.active : '';
        };
        events.subscribe('stateChangeSuccess', this._matchActive);
      },
      destroyed() {
        events.unsubscribe('stateChangeSuccess', this._matchActive);
      }
    });

    return class VueComponent extends BaseComponent {

      constructor(componentName, viewKey, state) {

        super(componentName, viewKey, state);

        this.ViewModel = state.views
          ? Vue.component(state.views[viewKey].component)
          : Vue.component(state.component);
      }

      render(resolved, params, query) {

        const data = this.getData(resolved, params, query);

        this.vm = new this.ViewModel({ data });
        this.node = this.vm.$mount().$el;

        this
          .childViews
          .forEach(view => view.attachWithin(this.node));

        return this;
      }

      update(resolved, params, query) {

        const data = this.getData(resolved, params, query);
        this.vm.$data = data;

        return this;
      }

      destroy() {

        this.vm.$destroy();
        this.vm = this.node = null;

        this
          .childViews
          .forEach(view => view.detach());

        return this;
      }

      getData(resolved, params, query) {

        return this
          .state
          .getResolves()
          .reduce((data, resolve) => {

            data[resolve.key] = resolved[resolve.id];

            return data;
          }, { params, query });
      }

    };

  };

}