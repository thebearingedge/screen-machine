riot.tag('about', '<p>Good info about our site!</p>', function(opts) {

});
riot.tag('albums', '<h5>You have { totalAlbums } albums.</h5> <ul> <li each="{ albums }"> <span>{ title }</span> </ul>', function(opts) {
    this.albums = opts.albums;
    this.totalAlbums = opts.albums.length;
  
});
riot.tag('home', '<h1>Welcome, { opts.user.name }!</h1> <p>Your are user #{ opts.params.userId }</p> <sm-view></sm-view> <sm-view name="modal"></sm-view>', function(opts) {

});
riot.tag('messages', '<h5>You have { messageCount } messages.</h5> <ul> <li each="{ messages }"> <span>{ title }</span> </ul>', function(opts) {
    this.messages = opts.messages;
    this.messageCount = opts.messages.length;
  
});
riot.tag('modal', '<span>This is a modal.</span>', function(opts) {

});

riot.tag('nested-nested-tag', '<span>Are we there yet?</span>', function(opts) {


});

riot.tag('nested-tag', '<p>Here\'s Johnny!</p> <sm-view name="nested.nested"></sm-view>', function(opts) {

});

riot.tag('parent-tag', '<h1>Say hello to my little friend.</h1> <sm-view name="nested"></sm-view>', function(opts) {


});
riot.tag('profile', '<span>Welcome to your profile.</span>', function(opts) {

});
riot.tag('share', '<textarea></textarea>', function(opts) {

});

riot.tag('simple-tag', '<span>Welcome to { opts.place }</span>', function(opts) {


});
riot.tag('timeline', '<sm-view></sm-view> <ul> <li each="{ stories }">{ content }</li> </ul>', function(opts) {

    this.stories = opts.stories;
  
});