
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

      users = users.filter( function( user ){
        var notFound = true;
        sharedWith.forEach( function( shared ){
          if ( user.id === shared.userId ) {
            notFound =  false;
          }
        });
        return notFound;
      });

      users = users.sort( function( a, b ){
        return a.fullName.localeCompare( b.fullName );
      });

      sharedWith = sharedWith.sort( function( a, b ){
        return a.user.fullName.localeCompare( b.user.fullName );
      });

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

      var oldPermissions = $('.permissions-list .permission');
      oldPermissions = {
        read     : true,
        link     : oldPermissions.filter('.link').hasClass('active'),
        move     : oldPermissions.filter('.modify').hasClass('active'),
        write    : oldPermissions.filter('.modify').hasClass('active'),
        copy     : oldPermissions.filter('.copy').hasClass('active'),
        download : oldPermissions.filter('.download').hasClass('active'),
        share    : oldPermissions.filter('.share').hasClass('active'),
        send     : oldPermissions.filter('.send').hasClass('active')
      }

      $('.save').on( 'click', function(){

        var permissions = $('.permissions-list .permission')

        permissions = {
          read     : true,
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
        var sharedWithIds = sharedWith.map( function( item ){ return item.userId })

        console.log( sharedWithIds )

        $('.shared-area .user:not(.wz-prototype)').each( function( i ){
          usersSharing.push( $(this).data('user').id )
        })

        var permissionsChanged = false;
        if ( JSON.stringify( oldPermissions ) != JSON.stringify( permissions ) ) {
          permissionsChanged = true;
        }

        // ADD SHARE
        // Todo esto teniendo en cuenta que el Array sharedWith sea una lista de id's, si no es asi he de modificarlo
        var usersToAddShare    = api.tool.arrayDifference( usersSharing, sharedWithIds )
        var usersToRemoveShare = api.tool.arrayDifference( sharedWithIds, usersSharing )
        var toAddPromises      = [];
        var toRemovePromises   = [];

        /* FALTA PROBARLO - Cuando cambian los permisos
        if( permissionsChanged ){

          usersToRemoveShare = users;
          usersToAddShare = sharedWithIds;

        }
        */

        console.log('ADD',usersToAddShare)
        console.log('REM',usersToRemoveShare)

        usersToAddShare.forEach( function( userId ){
          toAddPromises.push( $.Deferred() )
        })

        usersToRemoveShare.forEach( function( userId ){
          toRemovePromises.push( $.Deferred() )
        })

        promises = promises.concat( toAddPromises ).concat( toRemovePromises )

        api.fs( id, function( error , fsnode ){

          console.log( 'FSNODE', fsnode )

          usersToRemoveShare.forEach( function( userId, i ){

            fsnode.removeShare( userId, function( err ){
              console.log( 'REM', err )
              toRemovePromises[ i ].resolve( err )
            })

          })

          usersToAddShare.forEach( function( userId, i ){

            fsnode.addShare( userId , permissions, function( err ){
              console.log( 'ADD', err )
              toAddPromises[ i ].resolve( err )
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

var containsWord = function( wordToCompare ){

  return function( index , element ) {

    return $( element ).find( '.name' ).text().toLowerCase().indexOf( wordToCompare.toLowerCase() ) !== -1;

  }

}

var appendUserInOrder = function( list , user ){

  var usersInDom = list.find( '.user:not(.wz-prototype)' ).toArray();
  var nUsersInDom = usersInDom.length;
  var appended = false;

  if ( nUsersInDom === 0 ) {
    list.append( user );
    return;
  }

  usersInDom.forEach(function( userInDom ){

    var userInDom = $( userInDom );

    if ( !appended && user.find( '.name' ).text().localeCompare( userInDom.find( '.name' ).text() ) === -1 ) {
      userInDom.before( user );
      appended = true;
    }

  });

  if ( !appended ) {
    $( usersInDom[ nUsersInDom -1 ] ).after( user );
  }

}
// Events
$('.users-area .users-list').on( 'click', '.user', function(){
  appendUserInOrder( visualSharedAreaList , $(this) );
});

$('.shared-area .users-list').on( 'click', '.user', function(){
  appendUserInOrder( visualUsersAreaList , $(this) );
});

$('.permission .icon').on( 'click', function(){
  $(this).parent('.permission').toggleClass('active');
});

$('.users-area .search').on( 'input' , function(){

  var filter = $( this ).val();
  var users = $( '.user' );
  var usersToShow = users.filter( containsWord( filter ) );

  users.removeClass( 'covert' );
  users.not( usersToShow ).addClass( 'covert' );

});


// Start the app
loadInfo( params );
translate();
