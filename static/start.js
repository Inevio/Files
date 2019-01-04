var win = $(this);
var mobile = win.hasClass('wz-mobile-view');

if( params ){

  if( params.command === 'selectSource' ){
    $(this).addClass( 'selectSource ' + params.mode );
  }else if( params.command === 'selectDestiny' ){
    $(this).addClass('selectDestiny');
  }

}


if( typeof cordova == 'undefined' ){

  wql.isFirstOpen( [ api.system.workspace().idWorkspace ] , function( e , o ){

    if ( o.length === 0 ){

      win.addClass('first-open');
      win.addClass('upload-not-explained');

      wql.firstOpenDone( [ api.system.workspace().idWorkspace ] , function( e , o ){
        if(e) console.log(e);
      });

    }else if(! o[0]['upload_explain']){
      win.addClass('upload-not-explained');
    }

    start();

  });

}

//api.app.createWidget('downloadManager')
