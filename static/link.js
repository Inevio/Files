
// Contants
var DEFAULT_HEIGHT = 368;

// Variables
var win           = $(this);
var linkOutput    = $('.generate-link .link');
var passwordInput = $('.generate-link .password-input');
var linksList     = $('.links');
var linkPrototype = $('.links .wz-prototype');
var showLinks     = $('.show-links');

// Methods
var appendLink = function( link ){

  if( linksList.find( '.link-' + link.id ).length ){
    return;
  }

  var newLink = linkPrototype.clone().removeClass('wz-prototype');

  newLink.addClass( 'opened link link-' + link.id );
  newLink.find('td:eq(1)').text( link.url );
  newLink.find('td:eq(2)').text( link.visitsCounter );
  newLink.find('td:eq(3)').text( link.downloadsCounter );
  newLink.find('td:eq(4)').text( link.importsCounter );

  if( link.password ){
    newLink.find('td:eq(0) .password').addClass('enabled');
  }

  if( link.preview ){
    newLink.find('td:eq(0) .preview').addClass('enabled');
  }

  if( link.download ){
    newLink.find('td:eq(0) .download').addClass('enabled');
  }

  linksList.append( newLink );
  newLink.data( 'id' , link.id );

  checkViewSize();

};

var removeLink = function( link ){

  $( '.link-' + link ).remove();
  checkViewSize();

}
// API Events
api.fs
.on( 'linkAdded', function( link, fsnode ){

  if( fsnode.id === params ){
    appendLink( link );
  }

})

.on( 'linkRemoved', function( hash ){

  removeLink( hash );

});

// DOM Events
linkOutput.on( 'focus', function(){
  linkOutput.select();
});

$('.create-link').on( 'click', function(){

  var password  = !!$('.generate-link .option.password .ui-checkbox.active').length || null;
  var preview   = !!$('.generate-link .option.preview .ui-checkbox.active').length;
  var downloads = !!$('.generate-link .option.download .ui-checkbox.active').length;

  if( password ){
    password = passwordInput.val() || null;
  }

  $('.links').show();

  api.fs( params, function( error, fsnode ){

    fsnode.addLink( password, preview, downloads, function( error, link ){

      // To Do -> Error
      console.log( error );
      linkOutput.val( link.url ).focus();
      appendLink(link)


    });

  });

});

$('.option.password .ui-checkbox').on( 'click', function( e ){

  if( $(this).hasClass('active') ){

    passwordInput.val('').blur();
    win.removeClass('show-password');
    checkViewSize();

  }else{

    win.addClass('show-password');
    passwordInput.val('').focus();
    checkViewSize();

  }

});

$('.option.preview .ui-checkbox').on( 'click', function( e ){

  if( $(this).closest('.option').hasClass('disabled') ){

    e.stopImmediatePropagation();
    return false;

  }else if( $(this).hasClass('active') ){
    $('.option.download').addClass('disabled').find('.ui-checkbox').addClass('active');
  }else{
    $('.option.download').removeClass('disabled');
  }

});

$('.option.download .ui-checkbox').on( 'click', function( e ){

  if( $(this).closest('.option').hasClass('disabled') ){

    e.stopImmediatePropagation();
    return false;

  }if( $(this).hasClass('active') ){
    $('.option.preview').addClass('disabled').find('.ui-checkbox').addClass('active');
  }else{
    $('.option.preview').removeClass('disabled');
  }

});

win.on( 'click' , '.remove-link' , function(){

  var id = $(this).closest('tr').data('id');

  api.fs( params, function( error, node ){

      if( error ){
          return;
      }

      node.removeLink( id );

  });

});

var translate = function () {

  $ ('.ui-header-brand').find('span').text(lang.link.createLinkToFile);
  $ ('.generate-link .title').text(lang.link.linkToFile);
  $ ('.generate-link .link').attr('placeholder' , lang.link.link);
  $ ('.generate-link .private').text(lang.link.private);
  $ ('.generate-link .public').text(lang.link.public);
  $ ('.password').find('figcaption').text(lang.link.password);
  $ ('.preview').find('figcaption').text(lang.link.preview);
  $ ('.download').find('figcaption').text(lang.link.download);
  $ ('.create-link').text(lang.link.createLink);
  $ ('.show-links span').text(lang.link.showLinks);
  $ ('.links').find('th').eq(0).text(lang.link.permissionsTitle);
  $ ('.links').find('th').eq(1).text(lang.link.permissionLinkTitle);
  $ ('.links').find('th').eq(2).text(lang.link.visitsTitle);
  $ ('.links').find('th').eq(3).text(lang.link.downloadTitle);
  $ ('.links').find('th').eq(4).text(lang.link.importedTitle);
  $ ('.remove-link-button' ).text(lang.main.remove);

}

var checkViewSize = function(){

    var height = 0;

    console.log(win);

    win.children().not('.wz-dialog').each( function(){
        height += $(this).outerHeight( true );
    });

    if( height !== win.height() ){
        api.view.setSize( win.width(), height );
    }

};

// Start
translate();
api.fs( params, function( error, fsnode ){

  fsnode.getLinks( function( error, links ){

    if( error || !links.length ){
      return;
    }

    for( var i = 0; i < links.length; i++ ){
      appendLink( links[ i ] );
    }

    checkViewSize();

  });

  $('.file-info .icon').css( 'background-image', 'url(' + fsnode.icons.tiny + ')' );
  $('.file-info .name').text( fsnode.name );

  //Desactivamos la opcion descargar e importar
  $('.option.download').addClass('disabled');

});
