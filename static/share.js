
// Variables
var visualUsersAreaList               = $('.users-area .users-list');
var visualUsersAreaListUserPrototype  = $('.users-area .users-list .user.wz-prototype');
var visualSharedAreaList              = $('.shared-area .users-list');
var visualSharedAreaListUserPrototype = $('.shared-area .users-list .user.wz-prototype');

// Functions
var appendUserToUsersList = function( listArea, prototype, user ){

  console.log( user );

  var newUser = prototype.clone().removeClass('wz-prototype');

  newUser.find('.avatar').attr( 'src', user.avatar.small );
  newUser.find('.name').text( user.fullName );
  newUser.data( 'user', user );
  listArea.append( newUser );

};

var loadInfo = function( id ){

  var users = $.Deferred();
  var sharedWith = $.Deferred();

  api.user.friendList( false, function( error, list ){
    users.resolve( list );
  });

  wz.fs( id, function( error, fsnode ){

    $('.file-name .icon').css( 'background-image', 'url(' + fsnode.icons.tiny + ')' );
    $('.file-name .name').text( fsnode.name );

    fsnode.sharedWith( function( error, users, permissions ){

      sharedWith.resolve({
        users : users,
        permissions : permissions
      });

    });

  });

  $.when( users, sharedWith ).done( function( users, sharedWith ){

    users.forEach( appendUserToUsersList.bind( null, visualUsersAreaList, visualUsersAreaListUserPrototype ) );
    sharedWith.users.forEach( appendUserToUsersList.bind( null, visualSharedAreaList, visualSharedAreaListUserPrototype ) );

  });

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
$('.users-area .users-list').on( 'click', '.user', function(){
  visualSharedAreaList.append( $(this) );
});

$('.shared-area .users-list').on( 'click', '.user', function(){
  visualUsersAreaList.append( $(this) );
});

$('.permission .icon').on( 'click', function(){
  $(this).parent('.permission').toggleClass('active');
});

// Start the app
loadInfo( params );
translate();
