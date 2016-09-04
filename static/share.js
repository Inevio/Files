
// Variables
var visualUsersList              = $('.users-list');
var visualUsersListUserPrototype = $('.users-list .user.wz-prototype');

// Functions
var appendUserToUsersList = function( user ){

  var newUser = visualUsersListUserPrototype.clone().removeClass('wz-prototype');

  newUser.find('.avatar').attr( 'src', user.avatar.small );
  newUser.find('.name').text( user.fullName );
  visualUsersList.append( newUser );

};

var translate = function(){

  $('.ui-header-brand span').text(lang.share.share);
  $('.file-name .name').text(lang.share.fileName);
  $('.users-area .title').text(lang.share.search);
  $('.users-area .search').attr('placeholder', lang.share.query);
  $('.shared-area .title').text(lang.share.shareWith);
  $('.global-permissions .title').text(lang.share.globalPermissions);
  $('.global-permissions .link .name').text(lang.share.link);
  $('.global-permissions .modify .name').text(lang.share.modify);
  $('.global-permissions .copy .name').text(lang.share.copy);
  $('.global-permissions .download .name').text(lang.share.download);
  $('.global-permissions .share .name').text(lang.share.share);
  $('.global-permissions .send .name').text(lang.share.send);
  $('.global-permissions .save').text(lang.share.save);

};

// Events
$('.permission .icon').on( 'click', function(){
  $(this).parent('.permission').toggleClass('active');
});

// Start the app
translate();
api.user.friendList( false, function( error, list ){
  list.forEach( appendUserToUsersList );
});

wz.fs( params, function( error, fsnode ){

  fsnode.sharedWith( function(){
    console.log( arguments );
  });

});
