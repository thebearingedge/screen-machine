
riot.tag('nested-nested-tag', '<span>Are we there yet?</span>', function(opts) {


});

riot.tag('nested-tag', '<p>Here\'s Johnny!</p> <sm-view name="nested.nested"></sm-view>', function(opts) {

});

riot.tag('parent-tag', '<h1>Say hello to my little friend.</h1> <sm-view name="nested"></sm-view>', function(opts) {


});

riot.tag('simple-tag', '<span>Welcome to { opts.place }</span>', function(opts) {


});