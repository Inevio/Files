
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

  $('.ui-header-brand').find('span').text(lang.share.share);
  $('.file-name').find('span').text(lang.share.fileName);
  $('.users-area').find('p').text(lang.share.search);
  $('.users-area').find('input').attr('placeholder', lang.share.query);
  $('.shared-area').find('p').text(lang.share.shareWith);
  $('.global-permissions').find('p').text(lang.share.globalPermissions);
  $('.global-permissions').find('.link').find('figcaption').text(lang.share.link);
  $('.global-permissions').find('.link').find('figcaption').text(lang.share.modify);
  $('.global-permissions').find('.link').find('figcaption').text(lang.share.copy);
  $('.global-permissions').find('.link').find('figcaption').text(lang.share.download);
  $('.global-permissions').find('.link').find('figcaption').text(lang.share.share);
  $('.global-permissions').find('.link').find('figcaption').text(lang.share.send);
  $('.global-permissions').find('.save').text(lang.share.save);

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
