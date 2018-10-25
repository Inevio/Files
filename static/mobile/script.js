// Local variables
var win            = $(document.body);
var content        = $( '#weexplorer-content' );
var itemProto      = $( '.weexplorer-element.wz-prototype' );
var itemBack       = $( '.weexplorer-element.back' );
var title          = $( '#weexplorer-menu-name' );
var sidebar        = $( '#weexplorer-sidebar');
var sidebarElement = $( '.weexplorer-sidebar-element.wz-prototype', sidebar );
var uploadButton   = $('.weexplorer-menu-upload')
var userPrototype  = $('.file-options .file-owners-container .user.wz-prototype');
var attachButton   = $('.attach-button');
var record         = [];
var transitionTime = 300;
var mode           = 0; //0 == none, 1 == sidebar, 2==file-options, 3==creating-link,
//4 == more-info, 5 == renaming, 6 == link created, 7 == sharing, 8 == sharing step 2

//var optionsDeployed= false;
var actualPathId   = 0;
var yDeployed      = '-410px';
var sharedList = $('.share-details .friend-list');
var toInsert;
var toInsertS;
var insertedIds;
var oldPermissions;
var newPermissions;
var usersShared = [];
var usersToAddShare = [];
var usersToRemoveShare = [];
var fileSelected;
var myId = api.system.workspace().idWorkspace;
var cancelProgress;
var backWidth;
var percentage;

// Functions
var initFiles = function(){

  //StatusBar.backgroundColorByHexString("#fff");
  //StatusBar.styleDefault();
  translate();
  if ( typeof params !== 'undefined' && params.length && params[0] === 'select-source') {
    $('#weexplorer-content').addClass('select-source-mode');
    $('.attach-footer').addClass('select-source-mode');
  }

}

var addZero = function( value ){

  if( value < 10 ){
    return '0' + value;
  }else{
    return value;
  }

};

var changeName = function( fsnode ){

  if( fsnode.type === 0 && !isNaN( parseInt( fsnode.name ) ) ){
    fsnode.name = api.system.workspace().name;
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
  file.find('.weexplorer-element-icon').css('background-image', 'url(' + data.icons.normal + ')' )
  file.data( 'id', data.id );
  file.data( 'fsnode', data )
  file.addClass( 'file-' + data.id );

  if( data.type <= 2 ){
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
    .text( lang.backTo + ' ' + record[ 1 ].name );
  }

};

var openDirectory = function( id, jump, clear ){

  api.fs( id, function( error, structure ){

    $('.horbito-uploader').data('folder-id', structure.id)

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

    let prevScrollTop = $('#weexplorer-content').scrollTop()

    structure.list( { withPermissions : true }, function( error, list ){

      // To Do -> Error
      console.log('list', error, list)
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


      if( list.length === 0 ){
        $('.empty-folder').addClass('active');
      }else{
        $('.empty-folder').removeClass('active');
      }
      $('#weexplorer-content').scrollTop(0);

      uploadButton.data( 'data-wz-uploader-destiny', actualPathId )
      console.log(content,icons)
      content.append( icons );

      if( id !== actualPathId ){
        iconBack();
      }else{
        $('#weexplorer-content').scrollTop(prevScrollTop)
      }
      actualPathId = structure.id;

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

  console.log(win.hasClass( 'sidebar' ))
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
  },transitionTime, function(){
    content.addClass('stop-scroll');
  });

}

var hideCover = function(){

  $('.opacity-cover').transition({
    'opacity' : 0
  },transitionTime,function(){
    $(this).hide();
    content.removeClass('stop-scroll');
    mode = 0;
  });

}

var showOptions = function( file ){

  var createdDate  = new Date( file.dateCreated );
  var modifiedDate = new Date( file.dateModified );
  var prototype = $('.share-details .friend-list .user.wz-prototype');

  console.log('file', file);
  $('.file-owners-container .user').not('.wz-prototype').remove();
  $('.share-with-friends .user').not('.wz-prototype').remove();
  $('.file-options .file-title').text( file.name );
  $('.file-options .file-rename').val( file.name );
  $('.file-options .options-logo i').css('background-image', 'url("' + file.icons['small']  + '")');
  $('.file-options .file-size-value').text( api.tool.bytesToUnit( file.size, 2 ) );

  //TODO quitar al soportar android 7.0
  /*if( device.platform.toLowerCase() === 'android' && parseInt( device.version ) >= 7 ){
    $('.file-options .option-section .option.download').hide();
  }*/

  //TODO quitar despues de implementar compartir
  $('.option-section.share .share-with').hide();

  if( file.type == 0 || file.type == 1 || file.type == 2 ){

    $('.file-options').addClass('folder');
    //TODO quitar despues de implementar compartir
    $('.option-section.share').hide();

  }else{

    $('.file-options').removeClass('folder');
    //TODO quitar despues de implementar compartir
    $('.option-section.share').show();

  }

  $('.file-options .file-created-value').text(

    addZero( createdDate.getMonth() + 1 ) + '/' +
    addZero( createdDate.getDate() ) + '/' +
    createdDate.getFullYear() + ', ' +
    addZero( createdDate.getHours() ) + ':' +
    addZero( createdDate.getMinutes() )

  );

  $('.file-options .file-modified-value').text(

    addZero( modifiedDate.getMonth() + 1 ) + '/' +
    addZero( modifiedDate.getDate() ) + '/' +
    modifiedDate.getFullYear() + ', ' +
    addZero( modifiedDate.getHours() ) + ':' +
    addZero( modifiedDate.getMinutes() )

  );

  if( win.height() > 500 ){
    $('.share-details .share-with-friends .second-step .title').css('margin-bottom','40px');
  }

  file.getPath( function( error, pathList ){

    if( !error ){

      pathList[0] = changeName( pathList[0] )

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

  file.sharedWith( function( error, users ){

    toInsert = [];
    insertedIds = [];
    toInsertS = [];

    if( users.length ){

      var permissions = users[ 0 ].permissions;
      Object.keys( permissions ).forEach( function( permission ){

        if( permissions[ permission ] ){
          $('.permissions-list .permission.' + permission ).addClass('active')
        }

      });

    }else{
      $('.permissions-list .permission').addClass('active')
    }

    oldPermissions = $('.permissions-list .permission');
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

    //console.log(oldPermissions);
    console.log('users',users);
    $('.file-owners-container .user').not('.wz-prototype').remove();

    $.each( users, function( index, userInArray ){

      var isOwner = userInArray.isOwner;
      /*console.log(isOwner);
      console.log(myId);
      console.log(userInArray.idWorkspace);
      console.log(!(isOwner && ( userInArray.idWorkspace == myId )));*/

      api.user( userInArray.idWorkspace, function(error, userI){

        var userxNameField;
        var userxAvatarField;
        var permissionText;

        if( insertedIds.indexOf( userI.id ) == -1 ){

          var userx ='.user-'+ userI.id;
          var user = userPrototype.clone().removeClass('wz-prototype').addClass('user-' + userI.id);
          var userS = prototype.clone().removeClass('wz-prototype').addClass('user-' + userI.id);

          if( isOwner ){

            user.find('.is-owner').text ( lang.propertiesOwner );
            user.toggleClass( 'owner' );

          }

          user.find('.username').text( userI.fullName );
          userS.find('.avatar').css( 'background-image', 'url("' + userI.avatar.normal + '")' );
          userS.find('.username').text( userI.fullName );
          userS.data( 'user', userI );
          userS.addClass('active');
          user.find('figure').css( "background-image",'url("'+ userI.avatar.normal +'")' );

          if( userI.id == api.system.workspace().idWorkspace ){
            user.find('.username').text( user.find('.username').text() + ' ' + lang.propertiesFileOwner );
          }

          insertedIds.push( userI.id )
          toInsert.push( user );
          if( !( isOwner && (userI.id == myId) ) ){
            toInsertS.push( userS );
          }

        }

        if( index == users.length - 1 ){

          $('.file-owners-container').append( toInsert );
          $('.share-with-friends .user').not('.wz-prototype').remove();
          sharedList.append( toInsertS );

          //Cargamos la lista de amigos y marcamos cuales tienen compartido el fichero
          api.user.friendList( false, function( error, list ){

            list.forEach( function( user, index ) {

              if( insertedIds.indexOf( user.id ) == -1 ){

                var newUser = prototype.clone().removeClass('wz-prototype').addClass('user-' + user.id);
                newUser.find('.avatar').css( 'background-image', 'url("' + user.avatar.normal + '")' );
                newUser.find('.username').text( user.fullName );
                newUser.data( 'user', user );
                //newUser.data( 'permissions', permissions );
                sharedList.append( newUser );

              }

            });

          });

        }

      });

    });

  });

  $( '.file-options' ).show().transition({
    'y' : yDeployed,
    'height' : '410px'
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

  console.log('hideOptions')
  //optionsDeployed = false;
  if( mode == 4 ){
    hideFileInfo();
  }else if( mode == 3 || mode == 6 ){
    hideCreateLink();
  }else if( mode == 7 || mode == 8 ){
    hideShareScreen();
  }else if( mode == 5 ){
    cancelRename();
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
    $('.toggles-container .preview .selector,.toggles-container .download .selector').addClass('active');
    $('.toggles-container .password .selector').removeClass('active');
    $('.create-link-title').removeClass('password-mode');
    $('.password-container').val('').hide();

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

    var password  = ( $('.password-container').val().length ) ? $('.password-container').val() : null;
    var preview   = $('.toggles-container .preview .selector').hasClass('active');
    var downloads = $('.toggles-container .download .selector').hasClass('active');

      structure.addLink( password, preview, downloads, function( error, link ){

        if( error ){
          return alert( '', function(){}, error );
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

var acceptShare1 = function(){

  var usersArray = $('.share-with-friends .user').not('.wz-prototype');

  usersShared = [];
  usersToAddShare = [];
  usersToRemoveShare = [];

  usersArray.each( function(index){

    if( $(this).hasClass('active') && insertedIds.indexOf( $(this).data('user').idWorkspace ) == -1 ){

      usersToAddShare.push( $(this).data('user').idWorkspace );

    }else if( !$(this).hasClass('active') && insertedIds.indexOf( $(this).data('user').idWorkspace ) != -1 ){

      usersToRemoveShare.push( $(this).data('user').idWorkspace );

    }else if( $(this).hasClass('active') ){

      usersShared.push( $(this).data('user').idWorkspace );

    }

  });

  console.log( 'aniadir compartir', usersToAddShare );
  console.log( 'eliminar compartir', usersToRemoveShare );
  console.log( 'ya estaba compartido', usersShared );

  $('.first-step').transition({
    'x' : '-100%'
  },transitionTime,function(){
    $(this).hide();
    mode = 8;
  });

  $('.second-step').show().transition({
    'x' : '0'
  },transitionTime);

}

var acceptShare2 = function(){

  var usersToApi         = [];
  var promises           = [];
  var toAddPromises      = [];
  var toRemovePromises   = [];

  var newPermissions = $('.permissions-list .permission');
  newPermissions = {
    read     : true,
    link     : newPermissions.filter('.link').hasClass('active'),
    move     : newPermissions.filter('.modify').hasClass('active'),
    write    : newPermissions.filter('.modify').hasClass('active'),
    copy     : newPermissions.filter('.copy').hasClass('active'),
    download : newPermissions.filter('.download').hasClass('active'),
    share    : newPermissions.filter('.share').hasClass('active'),
    send     : newPermissions.filter('.send').hasClass('active')
  }

  console.log( JSON.stringify(oldPermissions) === JSON.stringify(newPermissions) );

  usersToApi = usersToApi.concat(usersToAddShare);

  if( JSON.stringify(oldPermissions) != JSON.stringify(newPermissions) ){
    //Si los permisos son distintos, aplicamos a todos los usuarios que tienen el archivo
    usersToApi = usersToApi.concat(usersShared);
  }

  usersToApi.forEach( function( userId ){
    toAddPromises.push( $.Deferred() )
  })

  usersToRemoveShare.forEach( function( userId ){
    toRemovePromises.push( $.Deferred() )
  })

  promises = promises.concat( toAddPromises ).concat( toRemovePromises )

  usersToApi.forEach( function( userId, i ){

    fileSelected.addShare( userId, newPermissions, function( err ){

      console.log( 'ADD', err )
      toAddPromises[ i ].resolve( err )

    })

  })

  usersToRemoveShare.forEach( function( userId, i ){

    fileSelected.removeShare( userId, function( err ){

      console.log( 'REM', err )
      toRemovePromises[ i ].resolve( err )

    })

  })

  $.when.apply ( null, promises ).done( function(){

    console.log('fin de las operaciones');
    hideOptions();

  })

}

var hideShareScreen = function(){

  $('.share-details').show().transition({
    'y' : '100%'
  },transitionTime, function(){
    $(this).hide();
  });

  $('.file-options').transition({
    'y' : '0'
  },transitionTime);

  $('.first-step').show().transition({
    'x' : '0'
  },transitionTime);

  $('.second-step').transition({
    'x' : '100%'
  },transitionTime,function(){
    $(this).hide();
    mode = 2;
  });

  $('.file-options .options-close').hide();
  $('.file-options .options-more').show();

}

var activateRename = function(){

  console.log('Activate rename')
  mode = 5;
  $('.file-options').addClass('renaming');
  $('.file-options .file-title').hide();
  $('.file-options .file-rename').show();
  $('.file-options .options-more').hide();
  $('.file-options .rename-accept, .file-options .rename-cancel').show();
  $('.file-options').height('100%')
  if ( $('.file-options .file-rename').val().lastIndexOf('.') < 0 ) {
    selectRangeText( $('.file-options .file-rename')[0] , 0 , $('.file-options .file-rename').val().length );
  }else{
    selectRangeText( $('.file-options .file-rename')[0] , 0 , $('.file-options .file-rename').val().lastIndexOf('.') );
  }

}

var acceptRename = function(){

  console.log('Accept rename')

  api.fs( $('.weexplorer-element.active').data('id') , function( e, file ){

    if(e){
      return;
    }

    if( $('.file-options .file-rename').val() != $('.file-options .file-title').text() ){

      file.rename( $('.file-options .file-rename').val() ,function( error, o){

        if( error ){
          alert( '', function(){}, error );
        }

      });

    }

  });

}

var cancelRename = function(){

  console.log('Cancel rename')
  if( mode !== 5 ) return

  $('.file-options .file-rename').hide();
  $('.file-options').removeClass('renaming');
  $('.file-options .file-title').show();
  $('.file-options .rename-accept, .file-options .rename-cancel').hide();
  $('.file-options .options-more').show();
  $('.file-options').height('410px')
  mode = 2;

}

var translate = function (){

  $('.weexplorer-sidebar-header .weexplorer-sidebar-title').text( lang.main.favourites );
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
  $('.create-link-container .back-link-btn span').text( lang.back );
  //$('.create-link-container .back-link-btn span').text( lang.linkGenerate );
  $('.share-details .second-step .title').text(lang.share.globalPermissions.toUpperCase());
  $('.share-details .second-step .link .name').text(lang.share.link);
  $('.share-details .second-step .modify .name').text(lang.share.modify);
  $('.share-details .second-step .copy .name').text(lang.share.copy);
  $('.share-details .second-step .download .name').text(lang.share.download);
  $('.share-details .second-step .share .name').text(lang.share.share);
  $('.share-details .second-step .send .name').text(lang.share.send);
  $('.share-details .second-step .save').text(lang.share.save);
  $('.attach-button span').text(lang.attach);
  $('.attach-selected').text( '0 ' + lang.filesSelected);
  $('.cancel-progress').text( lang.cancel );
  $('.progress-text').text( lang.downloading );

};

var handleBack = function(){

  if( mode == 0 ){
    itemBack.click();
  }else if ( mode == 1 ) {
    hideSidebar();
  }else{
    hideOptions();
  }

}

var selectRangeText = function( input , start , end ){

  input.focus();
  input.setSelectionRange( start , end );

}

// Events
$( '#weexplorer-menu-sidebar' ).on( 'click', function(){
  showSidebar();
});

$( '#weexplorer-sidebar' ).on( 'click', function( e ){
  e.stopPropagation();
});

$( '#weexplorer-content' )
.on( 'click', '.weexplorer-element:not(.back):not(.select-file)', function(e){

  console.log(e);
  var structure = $(this).data('fsnode')

  if( structure.pending ){

    return confirm( lang.main.fileReceivedDialogDescription, function( accepted ){

      console.log('PULSADO BOTON ' + accepted)
      accepted = accepted === 1

      if( accepted ){

        structure.accept( 'root', function(){
          console.log( arguments )
        })

      }

    }) //, lang.main.fileReceivedDialogTitle.replace( '%s', structure.name ) )

  }

  // Abrir directorios
  if( structure.type <= 2 ){
    if ( $('#weexplorer-content').hasClass('select-source-mode') ) {
      $('.attach-selected').text( '0 ' + lang.filesSelected);
    }
    return openDirectory( structure.id );
  }

  if ( $('#weexplorer-content').hasClass('select-source-mode') ) {
    $(this).find('.ui-radio-button').toggleClass('active');
    var nSelected = $('.ui-radio-button.active');
    if (nSelected.length === 1) {
      $('.attach-selected').text( '1 ' + lang.fileSelected);
    }else{
      $('.attach-selected').text( nSelected.length + ' ' + lang.filesSelected);
    }
  }else{
    structure.open( content.find('.file').map( function(){ return $(this).data('id') }).get(), function( error ){

      if( error ){
        alert( lang.main.fileCanNotOpen, function(){} )
      }

    });
  }

})

.on( 'click', '.weexplorer-element-options', function( e ){

  $('.weexplorer-element.file.active').removeClass('active');
  $(this).parent().addClass('active');

  api.fs( $(this).parent().data('id'), function( error, structure ){

    if( !error ){
      showOptions( structure );
      fileSelected = structure;
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
    openDirectory( $(this).data('fileId'), false, false );
  }
  hideSidebar();

});

attachButton.on( 'click' , function(){
  var fsnodeSelected = [];
  $.each( $('.ui-radio-button.active') , function( i , element ){
      fsnodeSelected.push( $(element).closest('.weexplorer-element').data('fsnode') )
  });
  params[1]( fsnodeSelected );
  api.app.removeView( win );
});

$('.opacity-cover').on('click', function(e){

  console.log(mode)
  if( mode === 1 ){
    hideSidebar();
  }else{
    hideOptions(true);
  }
  e.stopPropagation();

});

win.on('swipedown', '.file-owners-section', function(e){
  e.stopPropagation();
})

.on( 'app-param', function( e, params ){

  if( params.command === 'selectSource' ||  params.command === 'selectDestiny' ){
    warn('selectSource/selectDestiny not implemented yet')
  }else{
    openDirectory( typeof params === 'object' ? parseInt( params.data ) || 'root' : params );
  }

})

.on('swipedown', '.file-options', function(e){

  /*if( mode != 7 ){
    hideOptions();
  }
  e.stopPropagation();*/

})

.on('swipedown', '.opacity-cover', function(e){

  if( mode > 1 ){
    hideOptions();
    e.stopPropagation();
  }

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
  handleBack();

})

.on('click', '.share-details .user', function(){
  $(this).toggleClass('active');
})

.on('click', '.accept-share', function(){

  if( mode == 7 ){
    acceptShare1();
  }else if( mode == 8 ){
    acceptShare2();
  }

})

.on('click', '.permissions-list .permission', function(){
  $(this).toggleClass('active');
})

.on('click', '.option.download', function(){

  api.fs( $('.weexplorer-element.active').data('id') , function( e, file ){

    if(e){
      return console.error(e);
    }
    $( '.actual-file,.total-file' ).text( 1 );

    cancelProgress = file.download( function(event){

      percentage = ( event.loaded / event.total );

      if( percentage < 0.01 ){

        $('.progress-container .cancel-progress').show();
        $('.progress-text').text( lang.downloading );
        $('.progress-container').addClass('active');
        backWidth = $('.progress-bar').width();

      }else{

        $('.progress-bar-loaded').width( backWidth * percentage );

      }

    }, function( error ){

      $('.progress-container').removeClass('active');
      $('.progress-bar-loaded').width( 0 );

    });

  });

})

.on('click', '.options-more', function(){
  showFileInfo();
})

.on('click', '.option.delete', function(){

  api.fs( $('.weexplorer-element.active').data('id') , function( e, file ){

    if(e){
      return;
    }

    return confirm( lang.main.confirmDelete, function( accepted ){

      accepted = accepted === 1

      if( accepted ){

        file.remove( function( error, o){

          if( !error ){

            hideOptions(true);

          }

        });

      }

    })

  });

})

.on('click', '.option.share-with', function(){
  showShareScreen();
})

.on('click', '.option.create-link', function(){
  showCreateLink();
})

.on('click', '.create-link-container .selector', function(){

  $(this).toggleClass('active');
  if( $(this).parent().hasClass('password') ){

    if( $(this).hasClass('active') ){
      $('.create-link-title').addClass('password-mode');
      $('.password-container').show();
    }else{
      $('.create-link-title').removeClass('password-mode');
      $('.password-container').hide();
    }

  }

})

.on('click', '.option.rename', function(){
  activateRename();
})

.on('click', '.file-options .rename-accept', function(e){
  acceptRename();
  //e.stopPropagation();
})

.on('click', '.file-options .rename-cancel', function(){
  console.log('cancelo renombrar');
  cancelRename();
})

.on('click', '.create-link-container .generate-btn', function(){
  createLink();
})

.on('click', '.create-link-container .back-link-btn', function(){
  hideCreateLink();
})

.on('click', '.cancel-progress', function(){

  if( cancelProgress !== undefined ){
    cancelProgress();
  }

})

/*.on('focus', 'input.file-rename', function(){
  activateRename();
})

.on('blur', 'input.file-rename', function(){
  cancelRename();
});*/


api.fs.on( 'move', function( structure, destinyID, originID ){

 console.log('move', structure);

   if( originID !== destinyID ){

      if( originID === actualPathId ){

        fileArea.children( '.weexplorer-file-' + structure.id ).remove();
        centerIcons();
        updateFolderStatusMessage();

      }else if( destinyID === actualPathId ){
        displayIcons( icon( structure ) );
      }

   }

})

.on( 'new', function( structure ){

  console.log('new', structure, actualPathId);

  if( parseInt(structure.parent) === actualPathId ){
    //appendIcon( icon( structure ) );
    openDirectory( actualPathId, true );
  }

})

.on( 'modified', function( structure ){

  console.log('modified', structure);

  if( parseInt(structure.parent) === actualPathId ){
    openDirectory( actualPathId, true );
  }

  if( structure.parent === actualPathId ){

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

  }

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

  console.log('rename')

  $( '.file-' + structure.id + ' .weexplorer-element-name').text( structure.name );
  //sortIcons( fileArea.find('.weexplorer-file') );

  if( mode === 5 ){
    $('.file-options .file-title').text(structure.name)
    $('.file-options .file-rename').val(structure.name)
    cancelRename();
  }

  if( structure.id === actualPathId ){
    $( '#weexplorer-menu #weexplorer-menu-name' ).text( structure.name );
  }

  $( '.weexplorer-sidebar .folder-' + structure.id + ' .weexplorer-sidebar-name' ).text( structure.name );

})

.on( 'conversionEnd', function( fsnodeId ){

  console.log( 'conversionEnd', arguments );
  api.fs( fsnodeId, function( error, fsnode ){

    if( error ){
      return;
    }

    if( fsnode.parent === actualPathId ){
      openDirectory( actualPathId, true );
    }

  });

})

.on( 'sharedStart', function( structure ){
  $( '.weexplorer-file-' + structure.id, win ).addClass( 'shared' );
})

.on( 'sharedStop', function( structure ){
  $( '.weexplorer-file-' + structure.id, win ).removeClass( 'shared' );
})

.on( 'thumbnail', function( structure ){
  $( '.file-' + structure.id ).find('.weexplorer-element-icon').css('background-image', 'url(' + structure.icons.normal + ')' )
});

api.upload
.on( 'fileEnqueued', function( file, queue ){

  console.log( 'fileEnqueued', arguments );
  $('.progress-text').text( lang.uploading );
  $('.progress-container .cancel-progress').hide();
  $('.progress-container').addClass('active');
  backWidth = $('.progress-bar').width();
  var queueSize = queue.length();

  if( queueSize === 1 ){
    $( '.actual-file,.total-file' ).text( 1 )
  }else{

    $( '.actual-file' ).text( (queueSize - queue.pending.length) || 1 );
    $( '.total-file' ).text( queueSize )

  }

})

.on( 'fsnodeStart', function( fsnode, queue ){

  console.log( 'fsnodeStart', arguments );
  $('.progress-text').text( lang.uploading );
  $('.progress-container .cancel-progress').hide();
  $('.progress-container').addClass('active');
  backWidth = $('.progress-bar').width();
  var queueSize = queue.length();

  if( queueSize === 1 ){
    $( '.actual-file,.total-file' ).text( 1 )
  }else{

    $( '.actual-file' ).text( (queueSize - queue.pending.length) || 1 );
    $( '.total-file' ).text( queueSize )

  }

})

.on( 'fsnodeProgress', function( fsnodeId, progress, queue ){

  console.log( 'fsnodeProgress', arguments );
  $('.progress-bar-loaded').width( backWidth * queue.progress() );
  var queueSize = queue.length();

  if( queueSize === 1 ){
    $( '.actual-file,.total-file' ).text( 1 )
  }else{

    $( '.actual-file' ).text( (queueSize - queue.pending.length) || 1 );
    $( '.total-file' ).text( queueSize )

  }

})

.on( 'fsnodeQueueEnd', function(){

  console.log( 'fsnodeQueueEnd', arguments );
  $('.progress-container').removeClass('active');
  $('.progress-bar-loaded').width( 0 );
  openDirectory( actualPathId );

});

// Start app
//console.log(lang)
openDirectory('root');

/* GENERATE SIDEBAR */

// Esta parte la comento porque usa promesas y puede resultar un poco rara si no se han usado nunca
// Sacamos las estructuras del sidebar asíncronamente
// Para ello primero generamos 5 promesas
var rootPath   = $.Deferred(); // Para la carpeta del usuario
var hiddenPath = $.Deferred(); // Para las carpetas escondidas
var inboxPath  = $.Deferred(); // Para la carpeta de inbox
var sharedPath = $.Deferred(); // Para la carpeta de compartidos
var customPath = $.Deferred(); // Para las carpetas que haya añadido el usuario

// Y determinamos que pasará cuando se cumplan esas promesas, en este caso, generamos el sidebar
$.when( rootPath, hiddenPath ).then( function( rootPath, hiddenPath ){
//$.when( rootPath, hiddenPath, customPath ).then( function( rootPath, hiddenPath, customPath ){

  // AVISO -> hiddenPath es un array
  // Ponemos al principio rootPath, inboxPath y sharedPath
  hiddenPath.unshift( rootPath );

  // Y concatenamos con el listado de carpetas personalizadas
  //hiddenPath = hiddenPath.concat( customPath );

  // Y generamos el sidebar
  hiddenPath.forEach( function( element ){

    var controlFolder = sidebarElement.clone().removeClass('wz-prototype');

    controlFolder.data( 'file-id', element.id ).addClass( 'wz-drop-area folder-' + element.id )

    element.id = parseInt(element.id);

    if( element.id == api.system.workspace().rootPath ){
      controlFolder.removeClass( 'folder' ).addClass( 'userFolder user' );
    }else if( element.id === api.system.workspace().inboxPath ){
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

  if(!error){
    //alert('cargo files')
    //console.warn('llego a cargar fs')
  } 
  // Ya tenemos la carpeta del usuario, cumplimos la promesa
  rootPath.resolve( structure );

  console.log('soy files y recibo: ', error, structure)
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

});

api.fs( 'shared', function( error, structure ){

  // Ya tenemos la carpetas de compartidos, cumplimos la promesa
  //sharedPath.resolve( structure );
  inboxPath.resolve( structure );

});*/

/*wql.getSidebar( function( error, rows ){

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

});*/

if( typeof params !== 'undefined' ){
  if( params.command === 'selectSource' ||  params.command === 'selectDestiny' ){
    warn('selectSource/selectDestiny not implemented yet')
  }else{
    openDirectory( typeof params === 'object' ? parseInt( params.data ) || 'root' : params );
  }
}

//alert('abro files')
initFiles();
/*setTimeout( function(){
  alert('asdasdasd')
}, 2000)*/