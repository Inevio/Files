
api.fs( params, function( error, fsnode ){

  $('.file-name .icon').css( 'background-image', 'url(' + fsnode.icons.tiny + ')' );
  $('.file-name .name').text( fsnode.name );

  $('.file-info .size-value').text( wz.tool.bytesToUnit( fsnode.size, 1 ) );

  $('.file-date .creation-value').text( ( new Date( fsnode.dateCreated ) ).format('d/m/Y H:i:s') );
  $('.file-date .modification-value').text( ( new Date( fsnode.dateModified ) ).format('d/m/Y H:i:s') );

  if( fsnode.permissions.link ){
    $('.file-permissions .permission.link').addClass('active');
  }

  if( fsnode.permissions.write ){
    $('.file-permissions .permission.modify').addClass('active');
  }

  if( fsnode.permissions.copy ){
    $('.file-permissions .permission.copy').addClass('active');
  }

  if( fsnode.permissions.download ){
    $('.file-permissions .permission.download').addClass('active');
  }

  if( fsnode.permissions.share ){
    $('.file-permissions .permission.share').addClass('active');
  }

  if( fsnode.permissions.send ){
    $('.file-permissions .permission.send').addClass('active');
  }

});
