
// Variables
var win                               = $(this)
var visualUsersAreaList               = $('.users-area .users-list');
var visualUsersAreaListUserPrototype  = $('.users-area .users-list .user.wz-prototype');
var visualSharedAreaList              = $('.shared-area .users-list');
var visualSharedAreaListUserPrototype = $('.shared-area .users-list .user.wz-prototype');

// Functions
var appendUserToUsersList = function( listArea, prototype, user, permissions ){

  var newUser = prototype.clone().removeClass('wz-prototype');

  newUser.find('.avatar').attr( 'src', user.avatar.small );
  newUser.find('.name').text( user.fullName );
  newUser.data( 'user', user );
  newUser.data( 'permissions', permissions );
  listArea.append( newUser );

};

var loadInfo = function( id ){

  var users = $.Deferred();
  var sharedWith = $.Deferred();

  api.user.friendList( false, function( error, list ){
    users.resolve( list );
  });

  api.fs( id, function( error, fsnode ){

    $('.file-name .icon').css( 'background-image', 'url(' + fsnode.icons.tiny + ')' );
    $('.file-name .name').text( fsnode.name );

    fsnode.sharedWith( function( error, users ){

      sharedWith.resolve( users.filter( function( share ){
        return !share.isOwner;
      }))

    });

  });

  $.when( users, sharedWith ).done( function( users, sharedWith ){

    var currentUser = api.system.user();
    var usersList = {};
    var sharedPromises = [];

    users.forEach( function( user ){
      usersList[ user.id ] = user;
    });

    sharedWith = sharedWith.filter( function( share ){
      return !share.isOwner;
    })

    sharedWith.forEach( function( share ){

      if( usersList[ share.userId ] ){
        share.user = usersList[ share.userId ];
      }else if( share.userId === currentUser.id ){
        share.user = currentUser;
      }else{

        var promise = $.Deferred();

        sharedPromises.push( promise );

        api.user( share.userId, function( error, user ){
          share.user = user;
          promise.resolve();
        });

      }

    });

    $.when.apply( null, sharedPromises ).done( function(){

      users.forEach( function( user ){
        appendUserToUsersList( visualUsersAreaList, visualUsersAreaListUserPrototype, user );
      });

      sharedWith.forEach( function( share ){
        appendUserToUsersList( visualSharedAreaList, visualSharedAreaListUserPrototype, share.user, share.permissions );
      });

      if( sharedWith.length ){

        var permissions = sharedWith[ 0 ].permissions;

        Object.keys( permissions ).forEach( function( permission ){

          if( permissions[ permission ] ){
            $('.permissions-list .permission.' + permission ).addClass('active')
          }

        });

      }else{
        $('.permissions-list .permission').addClass('active')
      }

      $('.save').on( 'click', function(){

        var permissions = $('.permissions-list .permission')

        permissions = {
          link     : permissions.filter('.link').hasClass('active'),
          move     : permissions.filter('.modify').hasClass('active'),
          write    : permissions.filter('.modify').hasClass('active'),
          copy     : permissions.filter('.copy').hasClass('active'),
          download : permissions.filter('.download').hasClass('active'),
          share    : permissions.filter('.share').hasClass('active'),
          send     : permissions.filter('.send').hasClass('active')
        }

        var promises = [];

        var usersSharing = [];
        $.each( $( '.shared-area .user' ).not( $( '.shared-area .user.wz-prototype' ) , function( i , domUser ){

          usersSharing.push( domUser.data( 'user' ).id )

        })

        // ADD SHARE
        // Todo esto teniendo en cuenta que el Array sharedWith sea una lista de id's, si no es asi he de modificarlo
        var newUsersSharing = $.makeArray( usersSharing ).not( $.makeArray( sharedWith ) )
        $.each( newUsersSharing , function( i , userId ){

          var promise = $.Deferred()
          promises.push( promise )

          api.fs( id , function( error , fsnode ){

            fsnode.addShare( userId , permissions, function( err ){
              promise.resolve( err )
            })

          })

        })

        // REMOVE SHARE
        // Todo esto teniendo en cuenta que el Array sharedWith sea una lista de id's, si no es asi he de modificarlo
        var oldNotSharingUsers = users.filter(function( user ){

          return sharedWith.indexOf( user.id ) < 0

        })
        var newNotSharingUsers = users.filter(function( user ){

          return usersSharing.indexOf( user.id ) < 0

        })

        var usersToRemoveShare = $.makeArray( newNotSharingUsers ).not( $.makeArray( oldNotSharingUsers ) )
        $.each( usersToRemoveShare , function( i , userId ){

          var promise = $.Deferred()
          promises.push( promise )

          api.fs( id , function( error , fsnode ){

            fsnode.removeShare( userId , permissions, function( err ){
              promise.resolve( err )
            })

          })

        })


        $.when.apply ( null, promises ).done( function(){
          api.app.removeView( win )
        })

      });

    });

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
