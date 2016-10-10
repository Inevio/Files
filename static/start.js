
if( params ){

  if( params.command === 'selectSource' ){
    $(this).addClass( 'selectSource ' + params.mode );
  }else if( params.command === 'selectDestiny' ){
    $(this).addClass('selectDestiny');
  }

}

start();
