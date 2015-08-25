
'use strict';

var assign = require('object-assign');
var BaseComponent = require('./modules/BaseComponent');

module.exports = riotComponent;


function riotComponent(riot) {

  return function component(document, events, machine, router) {

    riot.tag(
      'sm-link',
      '<a href="{ href }" class="{ activeClass }"><yield/></a>',
      function (opts) {

        var stateName = opts.to;
        var params = opts.params || {};
        var query = opts.query || {};
        var hash = opts.hash || '';

        this.href = router.href(stateName, params, query, hash);

        this.matchActive = function () {

          var isActive = machine.hasState(stateName, params, query);
          // thanks to @prateekbh
          this.activeClass = isActive
            ? opts.active
            : null;
          this.update();

        }.bind(this);

        this.matchActive();

        events.subscribe('stateChangeSuccess', this.matchActive);

        this.on('unmount', function () {

          events.unsubscribe('stateChangeSuccess', this.matchActive);
        });
      }
    );

    function RiotComponent(componentName, viewKey, state) {

      BaseComponent.apply(this, arguments);

      this.tagName = state.views
        ? state.views[viewKey].component
        : state.component;
    }


    assign(RiotComponent.prototype, BaseComponent.prototype, {

      constructor: RiotComponent,


      tagInstance: null,


      render: function (resolved, params, query) {

        var opts = this.getOpts(resolved, params, query);

        this.node = document.createElement(this.tagName);
        this.tagInstance = riot.mount(this.node, this.tagName, opts)[0];

        this
          .childViews
          .forEach(function (view) {

            view.attachWithin(this.node);
          }, this);

        return this;
      },


      update: function (resolved, params, query) {

        this.tagInstance.opts = this.getOpts(resolved, params, query);
        this.tagInstance.update();

        return this;
      },


      destroy: function () {

        this.tagInstance.unmount();
        this.tagInstance = this.node = null;

        this
          .childViews
          .forEach(function (view) {

            view.detach();
          });

        return this;
      },


      getOpts: function (resolved, params, query) {

        var opts = {
          params: params,
          query: query
        };

        return this
          .state
          .getResolves()
          .reduce(function (opts, resolve) {

            opts[resolve.key] = resolved[resolve.id];

            return opts;
          }, opts);
      }

    });

    return RiotComponent;
  };
}
