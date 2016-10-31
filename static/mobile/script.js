
// Local variables
var win            = $( this );
var content        = $( '#weexplorer-content', win );
var itemProto      = $( '.weexplorer-element.wz-prototype', win );
var itemBack       = $( '.weexplorer-element.back', win );
var title          = $( '#weexplorer-menu-name', win );
var sidebar        = $( '#weexplorer-sidebar', win );
var sidebarElement = $( '.weexplorer-sidebar-element.wz-prototype', sidebar );
var userPrototype  = $('.file-options .user.wz-prototype');
var record         = [];
var transitionTime = 300;
var mode           = 0; //0 == none, 1 == sidebar, 2==file-options, 3==creating-link, 4 == more-info, 5 == renaming, 6 == link created, 7 == sharing
//var optionsDeployed= false;
var actualPathId   = 0;
var yDeployed      = '-410px';
var sharedList = $('.share-details .friend-list');

// Functions
var addZero = function( value ){

  if( value < 10 ){
    return '0' + value;
  }else{
    return value;
  }

};

var changeName = function( fsnode ){

  if( fsnode.type === 0 && !isNaN( parseInt( fsnode.name ) ) ){
    fsnode.name = api.system.user().user;
  }else if( fsnode.type === 1 ){
    fsnode.name = lang.main.folderTranslations[ fsnode.name ] || fsnode.name
  }

  return fsnode;

};

var sortByName = function( a, b ){

  if( a.fsnode.type === b.fsnode.type ){

    var a1, b1, i= 0, n, L,
    rx=/(\.\d+)|(\d+(\.\d+)?)|([^\d.]+)|(\.\D+)|(\.$)/g;
    if( a.fsnode.name === b.fsnode.name ) return 0;
    a= a.fsnode.name.toLowerCase().match(rx);
    b= b.fsnode.name.toLowerCase().match(rx);
    L= a.length;
    while(i<L){
        if(!b[i]) return 1;
        a1= a[i],
        b1= b[i++];
        if(a1!== b1){
            n= a1-b1;
            if(!isNaN(n)) return n;
            return a1>b1? 1:-1;
        }
    }
    return b[i]? -1:0;

  }

  return a.fsnode.type > b.fsnode.type ? 1 : -1;

};

var icon = function( data ){

  // Clone prototype
  var file = itemProto.clone().removeClass('wz-prototype');

  // Insert data
  file.find('.weexplorer-element-name').text( data.name );
  file.find('.weexplorer-element-data').text( api.tool.bytesToUnit( data.size ) );
  file.find('.weexplorer-element-icon').css('background-image', 'url(' + data.icons.small + ')' )
  file.data( 'id', data.id );
  file.data( 'fsnode', data )
  file.addClass( 'file-' + data.id );

  if( data.type < 2 ){
    file.addClass('directory');
  }else{
    file.addClass('file');
  }

  // Return icon
  return file;

};

var iconBack = function(){

  if( record.length < 2 ){
    itemBack.css( 'display', 'none' );
  }else{

    itemBack
      .css( 'display', 'block' )
      .children( '.weexplorer-back-text' )
      .text( 'Back to ' + record[ 1 ].name );

  }

};

var openDirectory = function( id, jump, clear ){

  api.fs( id, function( error, structure ){

    changeName( structure )

    if( !jump ){

      if( clear ){
        record = [];
      }

      record.unshift( { id : structure.id, name : structure.name } );

    }

    // To Do -> Error

    title.text( structure.name );
    sidebar
      .children()
        .removeClass('active')
        .filter('.folder-' + structure.id )
        .addClass('active');

    structure.list( { withPermissions : true }, function( error, list ){

      // To Do -> Error
      content.children().not( itemProto ).not( itemBack ).not('.empty-folder').remove();

      list = list.sort( function( a, b ){
        // TO DO -> Prevent this artifact when use sortByName
        return sortByName( { fsnode : a }, { fsnode : b } );
      })

      var icons = $();

      for( var i in list ){
        changeName( list[ i ] )
        icons = icons.add( icon(list[ i ]) );
      }

      if( id != actualPathId){
        iconBack();
      }
      actualPathId = id;

      if( list.length === 0 ){
        $('.empty-folder').addClass('active');
      }else{
        $('.empty-folder').removeClass('active');
      }

      $('#weexplorer-content').scrollTop(0);
      content.append( icons );

    });

  });

};

var showSidebar = function(){

  $( '#weexplorer-sidebar' ).transition({ x : 0 }, transitionTime, function(){
      win.addClass( 'sidebar' );
      mode = 1;
  });
  showCover();

};

var hideSidebar = function(){

  if( win.hasClass( 'sidebar' ) ){

    $( '#weexplorer-sidebar' ).transition({ x : '-100%' }, transitionTime , function(){
      win.removeClass( 'sidebar' );
      mode = 0;
    });
    hideCover();

  }

}

var showCover = function(){

  $('.opacity-cover').show().transition({
    'opacity' : 1
  },transitionTime);

}

var hideCover = function(){

  $('.opacity-cover').transition({
    'opacity' : 0
  },transitionTime,function(){
    $(this).hide();
    mode = 0;
  });

}

var showOptions = function( file ){

  var imageUrl;
  var createdDate  = new Date( file.dateCreated );
  var modifiedDate = new Date( file.dateModified );
  var prototype = $('.share-details .friend-list .user.wz-prototype');
  $('.file-owners-container .user').not('.wz-prototype').remove();
  $('.share-with-friends .user').not('.wz-prototype').remove();
  $('.file-options .file-title').text( file.name );
  $('.file-options .file-rename').val( file.name );
  $('.file-options .options-logo i').css('background-image', 'url("' + imageUrl  + '")');
  $('.file-options .file-size-value').text( api.tool.bytesToUnit( file.size, 2 ) );
  console.log( file );

  if( file.type == 0 || file.type == 1 || file.type == 2 ){
    $('.file-options').addClass('folder');
  }else{
    $('.file-options').removeClass('folder');
  }

  if( file.thumbnails['32'] ){
    imageUrl = file.thumbnails['32'];
  }else{
    imageUrl = file.icons['32'];
  }

  $('.file-options .file-created-value').text(

    addZero( createdDate.getMonth() + 1 ) + '/' +
    addZero( createdDate.getDate() ) + '/' +
    createdDate.getFullYear() + ', ' +
    addZero( createdDate.getHours() ) + ':' +
    addZero( createdDate.getMinutes() ) + ':' +
    addZero( createdDate.getSeconds() )

  );

  $('.file-options .file-modified-value').text(

    addZero( modifiedDate.getMonth() + 1 ) + '/' +
    addZero( modifiedDate.getDate() ) + '/' +
    modifiedDate.getFullYear() + ', ' +
    addZero( modifiedDate.getHours() ) + ':' +
    addZero( modifiedDate.getMinutes() ) + ':' +
    addZero( modifiedDate.getSeconds() )

  );

  file.getPath( function( error, pathList ){

    if( !error ){

      var stringPath = '';

      for( var i=0, len = pathList.length; i < len; i++ ){

        stringPath = stringPath + pathList[i].name;

        if( i != (len-1) ){
          stringPath = stringPath + ' > ';
        }

      }

      $('.file-options .file-location-value').text( stringPath );

    }

  });

  console.log('file', file);

  var toInsert = [];
  var insertedIds = [];

  file.sharedWith( function( error, users ){

    console.log( 'users', users );
    $('.file-owners-container .user').not('.wz-prototype').remove();

    $.each( users, function( index, userInArray ){

      api.user( userInArray.userId, function(error, userI){

        console.log('userI',userI);
        var userxNameField;
        var userxAvatarField;
        var permissionText;

        if( insertedIds.indexOf( userI.id ) == -1 ){

          var userx ='.user-'+ userI.id;
          var user = userPrototype.clone().removeClass('wz-prototype').addClass('user-' + userI.id);

          if( userI.id == file.owner ){

            user.find('.is-owner').text ( lang.propertiesOwner );
            user.toggleClass( 'owner' );

          }

          user.find('.username').text( userI.fullName );
          user.find('figure').css( "background-image",'url("'+ userI.avatar.small +'")' );

          if( userI.id == api.system.user().id ){
            user.find('.username').text( user.find('.username').text() + ' ' + lang.propertiesFileOwner );
          }

          insertedIds.push( userI.id )
          toInsert.push( user );

        }

        if( index == users.length - 1 ){

          console.log('toInsert', toInsert);
          $('.file-owners-container').append( toInsert );

          //Cargamos la lista de amigos y marcamos cuales tienen compartido el fichero
          api.user.friendList( false, function( error, list ){

            $('.share-with-friends .user').not('.wz-prototype').remove();

            list.forEach( function( user, index ) {

              var newUser = prototype.clone().removeClass('wz-prototype');
              newUser.find('.avatar').attr( 'src', user.avatar.small );
              newUser.find('.username').text( user.fullName );
              newUser.data( 'user', user );
              //newUser.data( 'permissions', permissions );
              if( insertedIds.indexOf( user.id ) != -1 ){
                //TODO el usuario ya tiene el fichero compartido
              }
              sharedList.append( newUser );

            });


          });

        }

      });

    });

  });



  $( '.file-options' ).show().transition({
    'y' : yDeployed
  },transitionTime, function(){
    mode = 2;
    yDeployed = '-410px';
  });
  showCover();

}

/*var deployOptions = function(){

  if( !optionsDeployed && mode == 2 ){

    $( '.file-options' ).transition({
      'y' : '-458px'
    },transitionTime, function(){
      optionsDeployed = true;
      yDeployed = '-458px'
    });

  }

}*/

/*var undeployOptions = function(){

  if( !optionsDeployed ){
    hideOptions(false);
  }else{

    $( '.file-options' ).transition({
      'y' : '-289px'
    },transitionTime, function(){
      optionsDeployed = false;
      yDeployed = '-289px';
    });

  }

}*/

var hideOptions = function( fullHide ){

  //optionsDeployed = false;
  if( mode == 4 ){
    hideFileInfo();
  }else if( mode == 3 ){
    hideCreateLink();
  }else if( mode == 7 ){
    hideShareScreen();
  }

  $( '.file-options' ).transition({
    'y' : '0%'
  },transitionTime,function(){
    mode = 0;
    $(this).hide();
  });
  hideCover();

}

var showCreateLink = function(){

  if( mode == 2 ){

    $( '.file-options' ).transition({
      'y' : '-413px'
    },transitionTime);

    $( '.create-link-container' ).show().transition({
      'x' : '0'
    },transitionTime, function(){
      mode = 3;
    });

    $('.options-header .options-more').hide();

  }

}

var hideCreateLink = function(){

  if( mode == 3 || mode == 6 ){

    $( '.file-options' ).transition({
      'y' : yDeployed
    },transitionTime);

    $( '.create-link-container' ).transition({
      'x' : '100%'
    },transitionTime, function(){

      $('.options-header .options-more').show();
      $(this).hide();
      if( mode == 6 ){

        $('.toggles-container').transition({
          'x': '0%'
        },0, function(){

          $(this).show();
          $('.link-container input').val('');
          $('.generate-btn').show();
          $('.back-link-btn').hide();

        });

        $('.link-container').transition({
          'x': '100%'
        },0);

      }

      mode = 2;

    });

  }

}

var createLink = function(){

  api.fs( $('.weexplorer-element.active').data('id'),function( error, structure ){

    //var password  = ( $('.link-password input').attr('checked') && $('.link-password-input').val() ) ? $('.link-password-input').val() : null;
    var preview   = $('.toggles-container .preview .selector').hasClass('active');
    var downloads = $('.toggles-container .download .selector').hasClass('active');

      structure.addLink( null, preview, downloads, function( error, link ){

        if( error ){
          return navigator.notification.alert( '', function(){}, error );
        }

        /*if( appendLink( link, true ) ){
          checkViewSize();
        }*/

        mode = 6;
        var input = $('.link-container input');
        input.val( link.url );
        input[ 0 ].setSelectionRange( 0, input[ 0 ].value.length );

        $('.toggles-container').transition({
          'x': '-100%'
        },transitionTime,function(){
          $(this).hide();
        });

        $('.link-container').transition({
          'x': '0'
        },transitionTime);

        $('.generate-btn').hide();
        $('.back-link-btn').show();

    });

  })

}

var showFileInfo = function(){

  if( mode == 3 ){

    $( '.create-link-container' ).transition({
      'x' : '100%'
    },transitionTime, function(){
      $(this).hide();
    });

  }

  $('.file-details').show().transition({
    'y' : '0%'
  },transitionTime);

  $('.file-options .options-more').hide();
  $('.file-options .options-close').show();

  $('.file-options').transition({
    'y' : '-100%'
  },transitionTime, function(){
    mode = 4;
  });

}

var hideFileInfo = function(){

  $('.file-details').show().transition({
    'y' : '100%'
  },transitionTime, function(){
    $(this).hide();
  });

  $('.file-options').transition({
    'y' : '0'
  },transitionTime, function(){
    mode = 2;
  });

  $('.file-options .options-close').hide();
  $('.file-options .options-more').show();

}

var showShareScreen = function(){

  if( mode == 3 ){

    $( '.create-link-container' ).transition({
      'x' : '100%'
    },transitionTime, function(){
      $(this).hide();
    });

  }

  $('.share-details').show().transition({
    'y' : '0%'
  },transitionTime);

  $('.file-options .options-more').hide();
  $('.file-options .options-close').show();

  $('.file-options').transition({
    'y' : '-100%'
  },transitionTime, function(){
    mode = 7;
  });

}

var hideShareScreen = function(){

  $('.share-details').show().transition({
    'y' : '100%'
  },transitionTime, function(){
    $(this).hide();
  });

  $('.file-options').transition({
    'y' : '0'
  },transitionTime, function(){
    mode = 2;
  });

  $('.file-options .options-close').hide();
  $('.file-options .options-more').show();

}

var activateRename = function(){

  mode = 5;
  $('.file-options .file-title').hide();
  $('.file-options .file-rename').show().focus();
  $('.file-options .options-more').hide();
  $('.file-options .rename-accept, .file-options .rename-cancel').show();

}

var acceptRename = function(){

  api.fs( $('.weexplorer-element.active').data('id') , function( e, file ){

    if(e){
      return;
    }

    if( $('.file-options .file-rename').val() != $('.file-options .file-title').text() ){

      file.rename( $('.file-options .file-rename').val() ,function( error, o){

        if( error ){
          navigator.notification.alert( '', function(){}, error );
        }

      });

    }else{
      cancelRename();
    }


  });

}

var cancelRename = function(){

  $('.file-options .file-rename').hide();
  $('.file-options .file-title').show();
  $('.file-options .rename-accept, .file-options .rename-cancel').hide();
  $('.file-options .options-more').show();
  mode = 2;

}

var translate = function (){

  $('.file-size-title').text( lang.properties.size.toUpperCase() );
  $('.file-location-title').text( lang.properties.path.toUpperCase() );
  $('.file-created-title').text( lang.properties.creation.toUpperCase() );
  $('.file-modified-title').text( lang.properties.modification.toUpperCase() );
  $('.file-owners-title').text( lang.properties.permissions.toUpperCase() );
  $('.file-owners-section .is-owner').text( lang.properties.whoAccess.toUpperCase() );
  $('.option-section.share .option-title').text( lang.shared.attrShare.toUpperCase() );
  $('.option-section.share .option.create-link div').text( lang.main.createLink );
  $('.option-section.share .option.share-with div').text( lang.main.shareWith );
  $('.option-section.share .option.send-to div').text( lang.main.sendTo );
  $('.option-section.options .option-title').text( lang.properties.options.toUpperCase() );
  $('.option-section.options .option.download div').text( lang.properties.download );
  $('.option-section.options .option.rename div').text( lang.main.rename );
  $('.option-section.options .option.delete div').text( lang.main.remove );
  $('.create-link-container .create-link-title').text( lang.main.createLink );
  $('.create-link-container .preview div').text( lang.link.preview );
  $('.create-link-container .download div').text( lang.link.download );
  $('.create-link-container .password div').text( lang.link.password );
  $('.create-link-container .generate-btn span').text( lang.linkGenerate );
  //$('.create-link-container .back-link-btn span').text( lang.linkGenerate );
  $('#weexplorer-sidebar .weexplorer-sidebar-title').text( lang.favourites );

};

// Events
$( '#weexplorer-menu-sidebar' ).on( 'click', function(){
  showSidebar();
});

$( '#weexplorer-sidebar' ).on( 'click', function( e ){
  e.stopPropagation();
});

$( '#weexplorer-content' )
.on( 'click', '.weexplorer-element:not(.back)', function(){

  var structure = $(this).data('fsnode')

  if( structure.pending ){

    return navigator.notification.confirm( lang.main.fileReceivedDialogDescription, function( accepted ){

      accepted = accepted === 1

      if( accepted ){

        structure.accept( 'root', function(){
          console.log( arguments )
        })

      }

    }, lang.main.fileReceivedDialogTitle.replace( '%s', structure.name ) )

  }

  // Abrir directorios
  if( structure.type <= 2 ){
    return openDirectory( structure.id );
  }

  structure.open( content.find('.file').map( function(){ return $(this).data('id') }).get(), function( error ){

    if( error ){
      navigator.notification.alert( '', function(){}, lang.main.fileCanNotOpen )
    }

  });

})

.on( 'click', '.weexplorer-element-options', function( e ){

  $('.weexplorer-element.file.active').removeClass('active');
  $(this).parent().addClass('active');

  api.fs( $(this).parent().data('id'), function( error, structure ){

    if( !error ){
      showOptions( structure );
    }

  });

  e.stopPropagation();

});

itemBack.on( 'click', function(){

  if( record.length > 1 ){

    record.shift();
    openDirectory( record[ 0 ].id, true );

  }

});

sidebar.on( 'click', '.weexplorer-sidebar-element', function(){

  if( !$(this).hasClass('active') ){
    openDirectory( $(this).data('fileId'), false, true );
  }

  hideSidebar();

});

$('.opacity-cover').on('click', function(e){

  if( mode == 1 ){
    hideSidebar();
  }else{
    hideOptions(true);
  }

  e.stopPropagation();

});

win.on('swipedown', '.file-owners-section', function(e){
  e.stopPropagation();
})

.on('swipedown', '.file-options', function(){
  hideOptions();
})

.on('click', '.file-options .options-close', function(){
  hideOptions(false);
})

.on('swiperight', '.files-container', function(){
  $('.hamburger').click();
})

.on('swipeleft', '.sidebar', function(){
  itemBack.click();
})

.on('backbutton', function( e ){

  e.stopPropagation()
  itemBack.click()

});

$('.option.download').on('click', function(){

  api.fs( $('.weexplorer-element.active').data('id') , function( e, file ){

    if(e){
      return;
    }

    file.download();

  });

});

$('.options-more').on('click', function(){

  showFileInfo();

});

$('.option.delete').on('click',function(){

  api.fs( $('.weexplorer-element.active').data('id') , function( e, file ){

    if(e){
      return;
    }

    file.remove( function( error, o){

      if( !error ){

        hideOptions(true);

      }

    });

  });

})

$('.option.share-with').on('click', function(){
  showShareScreen();
});

$('.option.create-link').on('click', function(){
  showCreateLink();
});

$('.create-link-container .selector').on('click', function(){
  $(this).toggleClass('active');
})

$('.option.rename').on('click', function(){
  activateRename();
});

$('.file-options .rename-accept').on('click', function(){
  acceptRename();
});

$('.file-options .rename-cancel').on('click', function(){
  cancelRename();
});

$('.create-link-container .generate-btn').on('click', function(){
  createLink();
});

$('.create-link-container .back-link-btn').on('click', function(){
  hideCreateLink();
});

api.fs.on( 'move', function( structure, destinyID, originID ){

 console.log('move', structure);

   /*if( originID !== destinyID ){

       if( originID === current.id ){

           fileArea.children( '.weexplorer-file-' + structure.id ).remove();
           centerIcons();
           updateFolderStatusMessage();

       }else if( destinyID === current.id ){
           displayIcons( icon( structure ) );
       }

   }*/

})

.on( 'new', function( structure ){

  console.log('new', structure);

  if( structure.parent === actualPathId ){
    //appendIcon( icon( structure ) );
    openDirectory( actualPathId, true );
  }

})

.on( 'modified', function( structure ){

  console.log('modified', structure);

  /*if( structure.parent === current.id ){

    var file = $('.file-' + structure.id );

    if( file.hasClass('temporal-file') && structure.type !== 3 ){

     file
       .removeClass('temporal-file weexplorer-file-uploading')
       .addClass('file')
       .data( 'fsnode', structure )
       .find('img')
           .attr( 'attr', file.find('img').attr('src').replace( '?upload', '' ) );


    }else if( file.hasClass('file') && structure.type === 3 ){

     file
       .addClass('temporal-file weexplorer-file-uploading')
       .removeClass('file')
       .data( 'fsnode', structure )
       .find('img')
           .attr( 'attr', file.find('img').attr('src').replace( '?upload', '' ) );


    }else{
     file.data( 'fsnode', structure );
    }

    console.log( file.data('fsnode').mime );

  }*/

})

.on( 'remove', function( id, quota, parent ){

  console.log('remove', arguments);

  $( '.file-' + id ).remove();
  $( '.weexplorer-sidebar .folder-' + id ).remove();

  if( actualPathId === id ){
    itemBack.click();
  }

})

.on( 'rename', function( structure ){

  $( '.file-' + structure.id + ' .weexplorer-element-name').text( structure.name );
  //sortIcons( fileArea.find('.weexplorer-file') );

  if( mode === 5 ){
    cancelRename();
    $('.file-options .file-title').text( $('.file-options .file-rename').val() );
  }

  if( structure.id === actualPathId ){
    $( '#weexplorer-menu #weexplorer-menu-name' ).text( structure.name );
  }

  $( '.weexplorer-sidebar .folder-' + structure.id + ' .weexplorer-sidebar-name' ).text( structure.name );

})

/*.on( 'sharedStart', function( structure ){

   $( '.weexplorer-file-' + structure.id, win ).addClass( 'shared' );

})

.on( 'sharedStop', function( structure ){

   $( '.weexplorer-file-' + structure.id, win ).removeClass( 'shared' );

})*/

.on( 'thumbnail', function( structure ){
  $( '.file-' + structure.id ).find('.weexplorer-element-icon').css('background-image', 'url(' + structure.icons.small + ')' )
});

// Start app
openDirectory( 'root' );

/* GENERATE SIDEBAR */

// Esta parte la comento porque usa promesas y puede resultar un poco rara si no se han usado nunca
// Sacamos las estructuras del sidebar asíncronamente
// Para ello primero generamos 5 promesas
var rootPath   = $.Deferred(); // Para la carpeta del usuario
var hiddenPath = $.Deferred(); // Para las carpetas escondidas
//var inboxPath  = $.Deferred(); // Para la carpeta de inbox
//var sharedPath = $.Deferred(); // Para la carpeta de compartidos
var customPath = $.Deferred(); // Para las carpetas que haya añadido el usuario

// Y determinamos que pasará cuando se cumplan esas promesas, en este caso, generamos el sidebar
$.when( rootPath, hiddenPath, customPath ).then( function( rootPath, hiddenPath, customPath ){

  // AVISO -> hiddenPath es un array
  // Ponemos al principio rootPath, inboxPath y sharedPath
  hiddenPath.unshift( rootPath );

  // Y concatenamos con el listado de carpetas personalizadas
  hiddenPath = hiddenPath.concat( customPath );

  // Y generamos el sidebar
  hiddenPath.forEach( function( element ){

    var controlFolder = sidebarElement.clone().removeClass('wz-prototype');

    controlFolder.data( 'file-id', element.id ).addClass( 'wz-drop-area folder-' + element.id )

    if( element.id === api.system.user().rootPath ){
      controlFolder.removeClass( 'folder' ).addClass( 'userFolder user' );
    }else if( element.id === api.system.user().inboxPath ){
      controlFolder.addClass( 'receivedFolder' );
      //notifications();
    }else if( element.id === 'shared' ){
      controlFolder.addClass( 'sharedFolder' );
    }

    if( element.type === 1 && element.name === 'Documents' ){
      controlFolder.removeClass( 'folder' ).addClass( 'doc' );
    }else if( element.type === 1 && element.name === 'Music' ){
      controlFolder.removeClass( 'folder' ).addClass( 'music' );
    }else if( element.type === 1 && element.name === 'Images' ){
      controlFolder.removeClass( 'folder' ).addClass( 'photo' );
    }else if( element.type === 1 && element.name === 'Videos' ){
      controlFolder.removeClass( 'folder' ).addClass( 'video' );
    }

    changeName( element )
    controlFolder.find( 'span' ).text( element.name );
    sidebar.append( controlFolder );

  });

  sidebar.find( '.folder-' + record[ 0 ].id ).addClass('active');

} );

// Ahora que ya tenemos definido que va a pasar ejecutamos las peticiones para cumplir las promesas
api.fs( 'root', function( error, structure ){

  // Ya tenemos la carpeta del usuario, cumplimos la promesa
  rootPath.resolve( structure );

  structure.list( { withPermissions : true }, function( error, list ){

    // Vamos a filtrar la lista para quedarnos solo con las carpetas ocultas, es decir, de tipo 7
    list = list.filter( function( item ){
      return item.type === 1;
    });

    list = list.sort( function( a, b ){
      // TO DO -> Prevent this artifact when use sortByName
      return sortByName( { fsnode : a }, { fsnode : b } );
    })

    // Ya tenemos las carpetas ocultas, cumplimos la promesa
    hiddenPath.resolve( list );

  });

});

/*api.fs( 'received', function( error, structure ){

  // Ya tenemos la carpeta de recibidos, cumplimos la promesa
  console.log(arguments);
  inboxPath.resolve( structure );

});*/

/*api.fs( 'shared', function( error, structure ){

  // Ya tenemos la carpetas de compartidos, cumplimos la promesa
  //sharedPath.resolve( structure );
  inboxPath.resolve( structure );

});*/

wql.getSidebar( function( error, rows ){

  // Si hay algún error o no hay carpetas damos la promesa por cumplida
  if( error || !rows.length ){
    customPath.resolve( [] );
    return false;
  }

  // Si hay carpetas las cargamos asíncronamente, hacemos un array con promesas
  // Estas promesas se irán cumpliendo según se hayan devuelto todos los datos del servidor
  var folders = [];

  rows.forEach( function( item ){

    var promise = $.Deferred();

    // Añadimos la promesa al array
    folders.push( promise );

    api.fs( item.folder, function( error, structure ){

      if( error ){
        promise.resolve( null );
      }else{
        promise.resolve( structure );
      }

    });

  });

  // Definimos que ocurrirá cuando todas las promesas de listar los directorios ocurran
  $.when.apply( null, folders ).done( function(){

    // Como el resultado puede cambiar de número tenemos que hacernos un recorrido de arguments
    // IMPORTANTE arguments no es un array aunque tiene ciertos comportamientos similares
    // Hay que convertir arguments a un array, y de paso, descartamos las estructuras incorrectas

    var folders = [];

    for( var i in arguments ){

      if( arguments[ i ] !== null ){
        folders.push( arguments[ i ] );
      }

    }

    // Y damos como cumplida la promesa de cargar los directorios personalizados del usuario
    customPath.resolve( folders );

  });

});

translate();
