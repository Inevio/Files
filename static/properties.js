
// Variables
var visualBreadcrumbs = $('.folder-breadcrumbs');
var visualBreadcrumbsEntryPrototype = $('.folder-breadcrumbs .entry.wz-prototype');

// Functions
var changeVolumeName = function( fsnode ){

  if( fsnode.type === 0 && !isNaN( parseInt( fsnode.name ) ) ){
    fsnode.name = api.system.user().user;
  }

  return fsnode;

};

var loadInfo = function( id ){

  api.fs( id, function( error, fsnode ){

    $('.file-name .icon').css( 'background-image', 'url(' + fsnode.icons.tiny + ')' );
    $('.file-name .name').text( fsnode.name );
    $('.file-info .size-value').text( wz.tool.bytesToUnit( fsnode.size, 1 ) );
    $('.file-date .creation-value').text( ( new Date( fsnode.dateCreated ) ).format('d/m/Y H:i:s') );
    $('.file-date .modification-value').text( ( new Date( fsnode.dateModified ) ).format('d/m/Y H:i:s') );

    updateFSNodeType( fsnode );

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

    fsnode.getPath( function( error, path ){

      path[ 0 ] = changeVolumeName( path[ 0 ] );

      path.reverse().forEach( function( item ){

        var entry = visualBreadcrumbsEntryPrototype.clone().removeClass('wz-prototype');
        entry.text( item.name );
        visualBreadcrumbs.prepend( entry );

      });

    });

  });

};

var translate = function (){

  $('.ui-header-brand span').text(lang.properties.properties);
  $('.file-info .title').text(lang.properties.size);
  $('.file-info .metadata .type').text(lang.properties.type);
  $('.file-info .metadata .special').text(lang.properties.special);
  $('.file-path span').text(lang.properties.path);
  $('.file-date .creation .title').text(lang.properties.creation);
  $('.file-date .modification .title').text(lang.properties.modification);
  $('.file-permissions .title span').text(lang.properties.permissions);
  $('.file-permissions .link span').text(lang.properties.link);
  $('.file-permissions .modify span').text(lang.properties.modify);
  $('.file-permissions .copy span').text(lang.properties.copy);
  $('.file-permissions .download span').text(lang.properties.download);
  $('.file-permissions .share span').text(lang.properties.share);
  $('.file-permissions .send span').text(lang.properties.send);
  $('.file-shared .title').text(lang.properties.whoAccess);
};

var updateFSNodeType = function( fsnode ){

  if( fsnode.type !== 3 ){
    $('.metadata-type').text( lang.properties.metadataDirectory );
    $('.title.special, .metadata-special').hide();
    return;
  }

  fsnode.getFormats( function( error, formats ){

    var special = '';

    if( formats && formats.original && formats.original.metadata ){

      if( formats.original.metadata.exif ){
        special = lang.properties.metadataSpecialImage;
      }else if( fsnode.mime.indexOf('video') === 0 ){
        special = lang.properties.metadataSpecialVideo;
      }else if( fsnode.mime.indexOf('audio') === 0 ){
        special = lang.properties.metadataSpecialAudio;
      }else if( formats.original.metadata.pdf ){
        special = lang.properties.metadataSpecialPdf;
      }

    }

    $('.metadata-type').text( lang.properties.metadataFile );

    if( special ){
      $('.metadata-special').text( special );
    }else{
      $('.title.special, .metadata-special').hide();
    }

  });

};

loadInfo( params );
translate();
