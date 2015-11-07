
'use strict';

import BaseComponent from './modules/BaseComponent';

export default function vueComponent(Vue) {

  return function component(document, events, machine, router) {

    Vue.component('SmLink', {
      template: '<a :href="href" :class="activeClass"><slot></slot></a>',
      props: {
        to: { type: String, required: true },
        params: { type: Object, default: () => ({}) },
        query: { type: Object, default: () => ({}) },
        hash: { type: String, default: '' },
        active: { type: String, default: '' }
      },
      data() {
        const { to, params, query, hash } = this;
        const href = router.href(to, params, query, hash);
        return { href, activeClass: null };
      },
      created() {
        this._matchActive = () => {
          const { to, params, query, active } = this;
          this.activeClass = machine.hasState(to, params, query) ? active : '';
        };
        events.subscribe('stateChangeSuccess', this._matchActive);
      },
      destroyed() {
        events.unsubscribe('stateChangeSuccess', this._matchActive);
      }
    });

    class VueComponent extends BaseComponent {

      constructor(componentName, viewKey, state) {
        super(...arguments);
        this.ViewModel = state.views
          ? Vue.component(state.views[viewKey].component)
          : Vue.component(state.component);
      }

      render(resolved, params, query) {
        const {  ViewModel, childViews } = this;
        const data = this.getData(resolved, params, query);
        const vm = new ViewModel({ data });
        const node = vm.$mount().$el;
        childViews.forEach(view => view.attachWithin(node));
        return Object.assign(this, { vm, node });
      }

      update(resolved, params, query) {
        this.vm.$data = this.getData(resolved, params, query);
        return this;
      }

      destroy() {
        const { vm, childViews } = this;
        this.vm = this.node = null;
        vm.$destroy();
        childViews.forEach(view => view.detach());
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

    }

    return VueComponent;

  };

}