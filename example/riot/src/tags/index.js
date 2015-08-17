riot.tag('home', '<h2>Welcome to the Riot Screen Machine Demo</h2> <p>The current date is { today }</p>', function(opts) {
    
    this.today = opts.today;

    this.interval = setInterval(function () {
      'use strict';
      this.today = new Date();
      this.update();
    }.bind(this), 1000);

    this.on('unmount', function () {
      'use strict';
      clearInterval(this.interval);
    }.bind(this));

  
});
riot.tag('libraries-landing', '<p>This is the "Libraries" landing page.</p>', function(opts) {


});
riot.tag('libraries', '<h2>This is the view libraries page</h2> <input type="text"> <sm-view></sm-view>', function(opts) {


});
riot.tag('library-description', '<h3>Have you hear of { opts.params.libName }?</h3> <p>{ opts.content }</p>', function(opts) {


});