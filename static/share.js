
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

// Events
$('.permission .icon').on( 'click', function(){
  $(this).parent('.permission').toggleClass('active');
});

// Start the app
api.user.friendList( false, function( error, list ){
  list.forEach( appendUserToUsersList );
});

wz.fs( params, function( error, fsnode ){

  fsnode.sharedWith( function(){
    console.log( arguments );
  });

});
