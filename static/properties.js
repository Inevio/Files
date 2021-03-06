
// Variables
var win  = $( this );
var visualBreadcrumbs = $('.folder-breadcrumbs');
var visualBreadcrumbsEntryPrototype = $('.folder-breadcrumbs .entry.wz-prototype');
var visualBreadcrumbsList = $('.folder-breadcrumbs .list');
var userPrototype = $('.file-shared .user.wz-prototype');
var userList = $('.file-shared .list');

// Functions
var changeVolumeName = function( fsnode ){

  if( fsnode.type === 0 && !isNaN( parseInt( fsnode.name ) ) ){
    fsnode.name = api.system.workspace().name;
  }

  return fsnode;

};

var loadInfo = function( id ){

  api.fs( id, function( error, fsnode ){

    $('.file-name .icon img').attr( 'src', fsnode.icons.tiny );
    if ( fsnode.type === 3 ) {
      $('.file-name .icon').removeClass( 'folder' );
      $('.file-name .icon').addClass( 'file' );
    }else{
      $('.file-name .icon').removeClass( 'file' );
      $('.file-name .icon').addClass( 'folder' );
    }
    $('.file-name .name').text( fsnode.name );
    $('.file-info .size-value').text( wz.tool.bytesToUnit( fsnode.size, 1 ) );
    $('.file-date .creation-value').text( ( new Date( fsnode.dateCreated ) ).format('d/m/Y H:i:s') );
    $('.file-date .modification-value').text( ( new Date( fsnode.dateModified ) ).format('d/m/Y H:i:s') );

    updateFSNodeType( fsnode );

    if( fsnode.permissions.link ){
      $('.file-permissions .permission.link').addClass('active');
    }

    if( fsnode.permissions.write ){
      $('.file-permissions .permission.modify').addClass('active');
    }

    if( fsnode.permissions.copy ){
      $('.file-permissions .permission.copy').addClass('active');
    }

    if( fsnode.permissions.download ){
      $('.file-permissions .permission.download').addClass('active');
    }

    if( fsnode.permissions.share ){
      $('.file-permissions .permission.share').addClass('active');
    }

    if( fsnode.permissions.send ){
      $('.file-permissions .permission.send').addClass('active');
    }

    fsnode.getPath( function( error, path ){

      path[ 0 ] = changeVolumeName( path[ 0 ] );

      var list = [];

      path.forEach( function( item ){

        var entry = visualBreadcrumbsEntryPrototype.clone().removeClass('wz-prototype');
        entry.text( item.name );
        entry.data( 'id', item.id );
        list.push( entry );

      });

      visualBreadcrumbs.prepend( list );

      var isOverflowing = visualBreadcrumbs[ 0 ].clientWidth < visualBreadcrumbs[ 0 ].scrollWidth;
      var firstIteration = true;
      var limitReached = false;

      while( isOverflowing && !limitReached ){

        if( firstIteration ){

          firstIteration = false
          var entry = visualBreadcrumbsEntryPrototype.clone().removeClass('wz-prototype');
          entry.addClass('list-trigger').append('<i></i>');
          visualBreadcrumbs.prepend( entry );

        }

        var entries = visualBreadcrumbs.children('.entry').not('.wz-prototype, .list-trigger');

        if( entries.length > 1 ){
          entries.first().prependTo( visualBreadcrumbsList )
        }else{
          limitReached = true
        }

        isOverflowing = visualBreadcrumbs[ 0 ].clientWidth < visualBreadcrumbs[ 0 ].scrollWidth;

      }

    });

    loadUsers( fsnode );

  });

};

var translate = function (){

  $('.ui-header-brand span').text(lang.properties.properties);
  $('.file-info .title').text(lang.properties.size);
  $('.file-info .metadata .type').text(lang.properties.type);
  $('.file-info .metadata .special').text(lang.properties.special);
  $('.file-path .title').text(lang.properties.path);
  $('.file-date .creation .title').text(lang.properties.creation);
  $('.file-date .modification .title').text(lang.properties.modification);
  $('.file-permissions .title').text(lang.properties.permissions);
  $('.file-permissions .link span').text(lang.properties.link);
  $('.file-permissions .modify span').text(lang.properties.modify);
  $('.file-permissions .copy span').text(lang.properties.copy);
  $('.file-permissions .download span').text(lang.properties.download);
  $('.file-permissions .share span').text(lang.properties.share);
  $('.file-permissions .send span').text(lang.properties.send);
  $('.file-shared .title').text(lang.properties.whoAccess);
};

var updateFSNodeType = function( fsnode ){

  if( fsnode.type !== 3 ){
    $('.metadata-type').text( lang.properties.metadataDirectory );
    $('.title.special, .metadata-special').hide();
    return;
  }

  fsnode.getFormats( function( error, formats ){

    var special = '';

    if( formats && formats.original && formats.original.metadata ){

      if( formats.original.metadata.exif ){
        special = lang.properties.metadataSpecialImage;
      }else if( fsnode.mime.indexOf('video') === 0 ){
        special = lang.properties.metadataSpecialVideo;
      }else if( fsnode.mime.indexOf('audio') === 0 ){
        special = lang.properties.metadataSpecialAudio;
      }else if( formats.original.metadata.pdf ){
        special = lang.properties.metadataSpecialPdf;
      }

    }

    $('.metadata-type').text( lang.properties.metadataFile );

    if( special ){
      $('.metadata-special').text( special );
    }else{
      $('.title.special, .metadata-special').hide();
    }

  });

};

var loadUsers = function( fsnode ){

  fsnode.sharedWith( function( err , users ){

    $.each( users , function( i , user ){

      var isOwner = user.isOwner;

      api.user( user.idWorkspace , function( err , user ){

        appendUser( user , isOwner );

      });


    });

  });

}

var appendUser = function( user , isOwner ){

  var newUser = userPrototype.clone();
  newUser.removeClass( 'wz-prototype' ).addClass( 'user-' + user.idWorkspace );
  newUser.find( 'img' ).css( 'background-image' , 'url(' + user.avatar.small + ')' );
  newUser.find( '.name' ).text( user.fullName );

  if ( isOwner ) {
    newUser.find( '.rol' ).text( lang.propertiesOwner );
  }

  userList.append( newUser );

  win.height( $( '.file-shared' ).outerHeight() + 506 );

}

// Events
visualBreadcrumbs.on( 'click', '.list-trigger', function(){

  var position = $(this).position();

  visualBreadcrumbsList.css({
    display : 'block',
    left : parseInt( position.left ),
    top : position.top + 20
  });

  win.one( 'mousedown', function(){
    visualBreadcrumbsList.css( 'display', 'none' )
  })

});

// Start
loadInfo( params );
translate();
