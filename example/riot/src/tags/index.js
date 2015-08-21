riot.tag('home', '<h2>Welcome to the Riot Screen Machine Demo</h2> <p>The current date is { today }</p> <br> <sm-link to="viewLibs">Libraries</sm-link>', function(opts) {
    
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
riot.tag('libraries', '<h2>This is the view libraries page</h2>  <ul> <li style="display: inline"> <sm-link to="viewLibs">none</sm-link> </li> <li each="{ libs }" style="display: inline"> <sm-link to="viewLibs.library" params="{ this }">{ libName }</sm-link> </li> </ul> <sm-view></sm-view>', function(opts) {


    this.libs = [
      { libName: 'riot' },
      { libName: 'react' },
      { libName: 'ractive' }
    ];
  
});
riot.tag('library-description', '<h3>Have you heard of { opts.params.libName }?</h3> <p>{ opts.content }</p>', function(opts) {


});