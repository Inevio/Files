var fsnode = params;

//Methods
var setInfo = function(){

  $( '.file-info .icon' ).css( 'background-image' , 'url(' + fsnode.icons.tiny + ')' );
  $( '.file-info .name' ).text( fsnode.name + ' ' + lang.received.hasShared );
  $( '.accept-file' ).text( lang.received.contentAccept );
  $( '.refuse-file' ).text( lang.received.contentRefuse );

}

$( '.accept-file' ).on( 'click' , function(){

  fsnode.accept();

});

$( '.refuse-file' ).on( 'click' , function(){

  fsnode.refuse();

});

setInfo();
