
if( params ){

  if( params.command === 'selectSource' ){
    $(this).addClass( 'selectSource ' + params.mode );
  }else if( params.command === 'selectDestiny' ){
    $(this).addClass('selectDestiny');
  }

}

/*wql.isFirstOpen( [ api.system.user().id; ] , function( e , o ){

  if ( o.length === 0 ){

    $(this).addClass('first-open');

    wql.firstOpenDone( [ api.system.user().id; ] , function( e , o ){
      if(e) console.log(e);
    });

  }

});*/

$(this).addClass('first-open');
start();
