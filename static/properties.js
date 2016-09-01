
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
var translate = function (){

  $('.ui-header-brand').find('span').text(lang.properties.properties);
  $('.file-info').find('.title').text(lang.properties.size);
  $('.file-info').find('.metadata').find('.type').text(lang.properties.type);
  $('.file-info').find('.metadata').find('.type').text(lang.properties.special);
  $('.file-path').find('span').text(lang.properties.path);
  $('.file-date').find('.creation').find('.title').text(lang.properties.creation);
  $('.file-date').find('.modification').find('.title').text(lang.properties.modification);
  $('.file-permissions').find('.title').text(lang.properties.permissions);
  $('.file-permissions').find('.link').text(lang.properties.link);
  $('.file-permissions').find('.modify').text(lang.properties.modify);
  $('.file-permissions').find('.copy').text(lang.properties.copy);
  $('.file-permissions').find('.download').text(lang.properties.download);
  $('.file-permissions').find('.share').text(lang.properties.share);
  $('.file-permissions').find('.send').text(lang.properties.send);
  $('.file-shared').find('.title').text(lang.properties.whoAccess);
};
translate();
