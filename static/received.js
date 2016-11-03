var fsnode = params;
var app = $(this);

//Methods
var setInfo = function(){

  $( '.file-info .icon' ).css( 'background-image' , 'url(' + fsnode.icons.tiny + ')' );
  $( '.file-info .name' ).text( fsnode.name + ' ' + lang.received.hasShared );
  $( '.accept-file' ).text( lang.received.contentAccept );
  $( '.refuse-file' ).text( lang.received.contentRefuse );

}

$( '.accept-file' ).on( 'click' , function(){

  api.fs.selectSource( { title: lang.received.chooseDestiny , mode: 'directory' } , function( e , dir ){

    if (!e) {
      fsnode.accept( dir[0] , function(){
        wz.app.removeView( app );
      });
    }else{
      wz.app.removeView( app );
    }

  });

});

$( '.refuse-file' ).on( 'click' , function(){

  fsnode.refuse();
  wz.app.removeView( app );

});

setInfo();
