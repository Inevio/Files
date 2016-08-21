
if( params ){

  if( params.command === 'selectPath' ||  params.command === 'selectFile' ){
    $(this).addClass( 'select ' + params.command );
  }else if( params.command === 'saveFile' ){
    $(this).addClass('save');
  }

}

start();
