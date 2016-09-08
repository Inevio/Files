
// Local variables
var win            = $( this );
var content        = $( '#weexplorer-content', win );
var itemProto      = $( '.weexplorer-element.wz-prototype', win );
var itemBack       = $( '.weexplorer-element.back', win );
var title          = $( '#weexplorer-menu-name', win );
var sidebar        = $( '#weexplorer-sidebar', win );
var sidebarElement = $( '.weexplorer-sidebar-element.wz-prototype', sidebar );
var record         = [];
var transitionTime = 300;
var mode           = 0; //0 == none, 1 == sidebar, 2==file-options, 3==creating-link, 4 == more-info
var optionsDeployed= false;

// Functions
var addZero = function( value ){

  if( value < 10 ){
    return '0' + value;
  }else{
    return value;
  }

};

var icon = function( data ){

  // Clone prototype
  var file = itemProto.clone().removeClass('wz-prototype');

  // Insert data
  file.find('.weexplorer-element-name').text( data.name );
  file.find('.weexplorer-element-data').text( api.tool.bytesToUnit( data.size ) );
  file.find('.weexplorer-element-icon').css('background-image', 'url(' + data.icons.small + ')' )
  file.data( 'id', data.id );

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

    structure.list( function( error, list ){

      // To Do -> Error

      content.children().not( itemProto ).not( itemBack ).not('.empty-folder').remove();

      var icons = $();

      for( var i in list ){
          icons = icons.add( icon(list[ i ]) );
      }

      iconBack();

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
  var createdDate  = new Date( file.created );
  var modifiedDate = new Date( file.modified );

  console.log( api.tool.bytesToUnit( file.size, 2 ) );

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

  file.sharedWith( true, function( error, owner, permissions, users ){

    if( owner.length != 0 ){

      var userxNameField;
      var userxAvatarField;
      var permissionText;
      var userPrototype = $('.file-options .user.wz-prototype');

      for ( var i = 0; i < owner.length; i++ ) {

        var userx ='.user-'+ owner[i].id;
        var user = userPrototype.clone().removeClass('wz-prototype').addClass('user-' + owner[i].id);

        if( i===0 ){

          user.insertAfter(userPrototype);

        }else{

          user.insertAfter( $('.user' + (i)) );

        }

        if( owner[i].id == file.owner ){

          permissionText = $(userx + ' .change-permission',win);
          permissionText.text ( lang.propertiesOwner );
          $( userx ).toggleClass( 'owner' );

        }

        userxNameField = $(userx + ' .username',win);
        userxAvatarField = $(userx + ' figure',win);
        userxNameField.text( owner[i].fullName );
        userxAvatarField.css( "background-image",'url("'+owner[i].avatar.small+'")' );

        if( owner[i].id == api.system.user().id ){
          userxNameField.text( userxNameField.text() + ' ' + lang.propertiesFileOwner );
        }

      }

    }else{

      var user = userPrototype.clone().removeClass('wz-prototype').addClass( 'user-' + api.system.user().id ).insertAfter(userPrototype);

      var userx ='.user-' + api.system.user().id;
      $( userx ).toggleClass( 'owner' );
      var userxNameField = $( userx + ' .username',win );
      var userxAvatarField = $( userx + ' i',win );
      userxNameField.text( api.system.user().fullName );
      userxAvatarField.css( "background-image",'url("'+api.system.user().avatar.small+'")' );
      permissionText = $( userx + ' .change-permission',win );
      permissionText.text ( lang.propertiesOwner );
      userxNameField.text( userxNameField.text() + ' ' + lang.propertiesFileOwner );

    }

  });

  $('.file-options .file-title').text( file.name );
  $('.file-options .options-logo i').css('background-image', 'url("' + imageUrl  + '")');
  $('.file-options .file-size-value').text( api.tool.bytesToUnit( file.size, 2 ) );

  $( '.file-options' ).show().transition({
    'y' : '-289px'
  },transitionTime, function(){
    mode = 2;
    yDeployed = '-289px';
  });
  showCover();

}

var deployOptions = function(){

  if( !optionsDeployed && mode == 2 ){

    $( '.file-options' ).transition({
      'y' : '-458px'
    },transitionTime, function(){
      optionsDeployed = true;
      yDeployed = '-458px'
    });

  }

}

var undeployOptions = function(){

  if( !optionsDeployed ){
    hideOptions();
  }else{

    $( '.file-options' ).transition({
      'y' : '-289px'
    },transitionTime, function(){
      optionsDeployed = false;
      yDeployed = '-289px';
    });

  }

}

var hideOptions = function(){

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

  }

}

var hideCreateLink = function(){

  if( mode == 3 ){

    $( '.file-options' ).transition({
      'y' : yDeployed
    },transitionTime);

    $( '.create-link-container' ).transition({
      'x' : '100%'
    },transitionTime, function(){
      mode = 2;
      $(this).hide();
    });

  }

}

var showFileInfo = function(){

}

var hideFileInfo = function(){

}

// Events
$( '#weexplorer-menu-sidebar' ).on( 'tap', function(){
  showSidebar();
});

$( '#weexplorer-sidebar' ).on( 'tap', function( e ){
  e.stopPropagation();
});

$( '#weexplorer-content' )
.on( 'tap', '.weexplorer-element', function(){

  api.fs( $(this).data('id'), function( error, structure ){

    if( error ){
      return false; // To Do -> Error
    }

    // Abrir directorios
    if( structure.type <= 1 ){
      openDirectory( structure.id );
    }else{

      structure.open( function( error ){
          // To Do -> Error
          console.log(error);
      });

    }

  });

})

.on( 'tap', '.weexplorer-element-options', function( e ){

  $('.weexplorer-element.file.active').removeClass('active');
  $(this).parent().addClass('active');

  api.fs( $(this).parent().data('id'), function( error, structure ){

    console.log( structure );
    if( !error ){
      showOptions( structure );
    }

  });

  e.stopPropagation();

});

itemBack.on( 'tap', function(){

  record.shift();
  openDirectory( record[ 0 ].id, true );

});

sidebar.on( 'tap', '.weexplorer-sidebar-element', function(){

  if( !$(this).hasClass('active') ){
    openDirectory( $(this).data('fileId'), false, true );
  }

  hideSidebar();

});

$('.opacity-cover').on('click', function(e){

  if( mode == 1 ){
    hideSidebar();
  }else if( mode == 2 ){
    hideOptions();
  }

  e.stopPropagation();

});

win.on('swipeup', '.file-options', function(){
  deployOptions();
})

.on('swipedown', '.file-options', function(){
  undeployOptions();
})

.on('swiperight', '.files-container', function(){
  $('.hamburger').click();
})

.on('swipeleft', '.sidebar', function(){
  $('.back').click();
});

$('.option.download').on('click', function(){

  api.fs( $('.weexplorer-element.file.active').data('id') , function( e, file ){

    console.log(arguments);
    if(e){
      return;
    }

    file.download();

  });

});

$('.options-more').on('click', function(){

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

  $('.file-options').transition({
    'y' : '-100%'
  },transitionTime, function(){
    mode = 4;
  });

})


// Start app
openDirectory( 'root' );

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
$.when( rootPath, hiddenPath, inboxPath, sharedPath, customPath ).then( function( rootPath, hiddenPath, inboxPath, sharedPath, customPath ){

  // AVISO -> hiddenPath es un array
  // Ponemos al principio rootPath, inboxPath y sharedPath
  hiddenPath.unshift( rootPath, inboxPath, sharedPath );

  // Y concatenamos con el listado de carpetas personalizadas
  hiddenPath = hiddenPath.concat( customPath );

  // Y generamos el sidebar
  hiddenPath.forEach( function( element ){

    var controlFolder = sidebarElement.clone().removeClass('wz-prototype');

    controlFolder
      .data( 'file-id', element.id )
      .addClass( 'wz-drop-area folder-' + element.id )
      .find( 'span' )
        .text( element.name );

    if( element.id === api.system.user().rootPath ){
      controlFolder.removeClass( 'folder' ).addClass( 'userFolder user' );
    }else if( element.id === api.system.user().inboxPath ){
      controlFolder.addClass( 'receivedFolder' );
      //notifications();
    }else if( element.id === 'shared' ){
      controlFolder.addClass( 'sharedFolder' );
    }

    if( element.name === 'Documents' || element.name === 'Documentos' || element.alias == 'documents' ){
      controlFolder.removeClass( 'folder' ).addClass( 'doc' );
    }else if( element.name === 'Music' || element.name === 'Música' || element.alias == 'music' ){
      controlFolder.removeClass( 'folder' ).addClass( 'music' );
    }else if( element.name === 'Images' || element.name === 'Imágenes' || element.alias == 'images' ){
      controlFolder.removeClass( 'folder' ).addClass( 'photo' );
    }else if( element.name === 'Video' || element.name === 'Vídeos' || element.alias == 'videos' ){
      controlFolder.removeClass( 'folder' ).addClass( 'video' );
    }

    sidebar.append( controlFolder );

  });

  sidebar.find( '.folder-' + record[ 0 ].id ).addClass('active');

} );

// Ahora que ya tenemos definido que va a pasar ejecutamos las peticiones para cumplir las promesas
api.fs( 'root', function( error, structure ){

  // Ya tenemos la carpeta del usuario, cumplimos la promesa
  rootPath.resolve( structure );

  structure.list( true, function( error, list ){

    // Vamos a filtrar la lista para quedarnos solo con las carpetas ocultas, es decir, de tipo 7
    list = list.filter( function( item ){
      return item.type === 1;
    });

    // Ya tenemos las carpetas ocultas, cumplimos la promesa
    hiddenPath.resolve( list );

  });

});

api.fs( 'inbox', function( error, structure ){

  // Ya tenemos la carpeta de recibidos, cumplimos la promesa
  inboxPath.resolve( structure );

});

api.fs( 'shared', function( error, structure ){

  // Ya tenemos la carpetas de compartidos, cumplimos la promesa
  sharedPath.resolve( structure );

});

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
