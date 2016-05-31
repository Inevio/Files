'use strict';

var ICON_WIDTH = 106;
var ICON_TEXT_WIDTH = 106 - 6;
var ICON_IMAGE_HEIGHT_AREA = 80;
var ICON_RADIUS = 6;
var ICON_GAP_MIN = 10;
var ROWS_GAP = 20;
var TYPE_ROOT = 0;
var TYPE_FOLDER_SPECIAL = 1;
var TYPE_FOLDER = 2;
var TYPE_FILE = 3;

var currentOpened    = null;
var currentList      = [];
var currentRows      = [];
var currentHover     = null;
var currentActive    = [];
var currentScroll    = 0;
var currentMaxScroll = 0;
var historyBackward  = [];
var historyForward   = [];
var pixelRatio       = 1;

var visualHistoryBack          = $('.folder-controls .back');
var visualHistoryForward       = $('.folder-controls .forward');
var visualSidebarItemArea      = $('.ui-navgroup');
var visualSidebarItemPrototype = $('.ui-navgroup-element.wz-prototype');
var visualItemArea             = $('.item-area');
var visualRenameTextarea       = $('.rename');
var ctx                        = visualItemArea[ 0 ].getContext('2d');

var Icon = function( fsnode ){

  this.fsnode            = fsnode;
  this.active            = false;
  this.hover             = false;
  this.bigIcon           = null;
  this.bigIconHeight     = 0;
  this.bigIconTextHeight = 0;
  this.smallIcon         = null;
  this.lines             = getIconLines( fsnode.name );

  if( this.lines.length > 1 ){
    this.bigIconTextHeight = 4 + 14 + 4 + 14 + 4;
  }else{
    this.bigIconTextHeight = 4 + 14 + 4;
  }

  this.bigIconHeight = ICON_IMAGE_HEIGHT_AREA + this.bigIconTextHeight;

  return this;

};

var addToHistoryBackward = function( item ){

  historyBackward.push( item );
  visualHistoryBack.addClass('enabled');

};

var addToHistoryForward = function( item ){

  historyForward.unshift( item );
  visualHistoryForward.addClass('enabled');

};

var appendItemToList = function( items ){

  if( items instanceof Array ){

    items = items.map( function( item ){
      return new Icon( item );
    });

  }else{
    items = [ new Icon( items ) ];
  }

  currentList = currentList.concat( items );
  currentList = currentList.sort( function( a, b ){
    return a.fsnode.type > b.fsnode.type ? 1 : -1;
  });

  updateRows();

};

var appendVisualSidebarItem = function( item ){

  // To Do -> Check if exists
  var visualItem = visualSidebarItemPrototype.clone();

  visualItem.removeClass('wz-prototype').addClass( 'item-' + item.id + ( item.alias ? ' ' + item.alias : '' ) ).attr( 'data-id', item.id );
  visualItem.find('.ui-navgroup-element-txt').text( item.name );

  visualSidebarItemArea.append( visualItem );

};

var calculateGrid = function(){

  var iconsInRow = parseInt( ctx.width / ICON_WIDTH );
  var gap = parseInt( ( ctx.width - ( iconsInRow * ICON_WIDTH ) ) / ( iconsInRow + 1 ) );

  if( gap < ICON_GAP_MIN ){
    iconsInRow--;
    gap = parseInt( ( ctx.width - ( iconsInRow * ICON_WIDTH ) ) / ( iconsInRow + 1 ) );
  }

  return {

    iconsInRow : iconsInRow,
    gap        : gap

  };

};

var clearCanvas = function(){

  visualItemArea.attr( 'width', visualItemArea.width() );
  visualItemArea.attr( 'height', visualItemArea.height() );

};

var clearHistoryForward = function(){

  historyForward = [];

  visualHistoryForward.removeClass('enabled');

};

var clearList = function(){

  currentList   = [];
  currentRows   = [];
  currentHover  = null;
  currentActive = [];

};

var contextmenuAcceptFile = function( fsnode ){

  fsnode.accept( function( error ){

    if( error ){
      return alert( error );
    }

    var banner = api.banner();

    if( fsnode.pointerType === 0 ){
      banner.setTitle( lang.folderShareAccepted );
    }else{
      banner.setTitle( lang.fileShareAccepted );
    }

    banner
    .setText( fsnode.name + ' ' + lang.beenAccepted )
    .setIcon( 'https://static.inevio.com/app/1/file_accepted.png' )
    .render();

  });

};

var drawIcons = function(){

  if( !currentList ){
    return;
  }

  var grid = calculateGrid();
  var x = grid.gap;
  var y = 10 + currentScroll;
  var iconsInRow = 0;
  var currentRow = 0;

  currentList.forEach( function( icon, i ){

    iconsInRow++;

    if( iconsInRow > grid.iconsInRow ){

      y += currentRows[ currentRow ] + ROWS_GAP;
      x  = grid.gap;
      iconsInRow = 1;
      currentRow++;

    }

    if( icon.hover || icon.active ){

      ctx.strokeStyle = '#ccd3d5';
      ctx.fillStyle = '#f7f8fa';
      drawRoundRect( ctx, x, y, ICON_WIDTH, icon.bigIconHeight, ICON_RADIUS, true );

    }

    if( icon.active ){

      ctx.strokeStyle = '#60b25e';
      ctx.fillStyle = '#60b25e';
      drawRoundRect( ctx, x, y + ICON_IMAGE_HEIGHT_AREA, ICON_WIDTH, icon.bigIconTextHeight, { bl : ICON_RADIUS, br : ICON_RADIUS }, true, false );

    }

    ctx.font = '13px Lato';
    ctx.fillStyle = icon.active ? '#ffffff' : '#545f65';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText( icon.lines[ 0 ], x + ICON_WIDTH / 2, 4 + y + ICON_IMAGE_HEIGHT_AREA);

    if( icon.lines[ 1 ] ){
      ctx.fillText( icon.lines[ 1 ], x + ICON_WIDTH / 2, 4 + y + 18 + ICON_IMAGE_HEIGHT_AREA);
    }

    var imgX = x;
    var imgY = y;

    if( !icon.bigIcon ){

      icon.bigIcon = new Image ();
      icon.bigIcon.src = icon.fsnode.icons.small;

    }

    if( icon.bigIcon.naturalWidth ){
      ctx.drawImage( icon.bigIcon, imgX + ( ICON_WIDTH - icon.bigIcon.width ) / 2, imgY + ( ICON_IMAGE_HEIGHT_AREA - icon.bigIcon.height ) / 2 );
    }else{

      $( icon.bigIcon ).on( 'load', function(){
        ctx.drawImage( icon.bigIcon, imgX + ( ICON_WIDTH - icon.bigIcon.width ) / 2, imgY + ( ICON_IMAGE_HEIGHT_AREA - icon.bigIcon.height ) / 2 );
      });

    }

    x += ICON_WIDTH + grid.gap;

  });

  /*
  ctx.beginPath();
  ctx.strokeStyle = '#60b25e';
  ctx.lineWidth = 4;
  ctx.moveTo( 2, 2 );
  ctx.lineTo( ctx.width - 2, 2 );
  ctx.lineTo( ctx.width - 2, ctx.height - 2 );
  ctx.lineTo( 2, ctx.height - 2 );
  ctx.lineTo( 2, 2 );
  ctx.stroke();
  ctx.closePath();
  */

};

var drawRoundRect = function( ctx, x, y, width, height, radius, fill, stroke ){

  if (typeof stroke == 'undefined') {
    stroke = true;
  }
  if (typeof radius === 'undefined') {
    radius = 5;
  }
  if (typeof radius === 'number') {
    radius = {tl: radius, tr: radius, br: radius, bl: radius};
  } else {
    var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
    for (var side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side];
    }
  }

  ctx.beginPath();
  ctx.moveTo(x + radius.tl, y + 0.5);
  ctx.lineTo( x + width - radius.tr, y + 0.5 ); // Top
  ctx.quadraticCurveTo(x + width, y + 0.5, x + width + 0.5, y + radius.tr);
  ctx.lineTo(x + width + 0.5, y + height - radius.br); // Left
  ctx.quadraticCurveTo(x + width + 0.5, y + height, x + width - radius.br, y + height + 0.5);
  ctx.lineTo(x + radius.bl, y + height + 0.5 ); // Bottom
  ctx.quadraticCurveTo(x, y + height + 0.5, x + 0.5, y + height - radius.bl);
  ctx.lineTo(x + 0.5, y + radius.tl);
  ctx.quadraticCurveTo( x + 0.5 , y, x + radius.tl, y + 0.5);
  ctx.closePath();

  if (fill) {
    ctx.fill();
  }
  if (stroke) {
    ctx.stroke();
  }

};

var getFolderItems = function( id ){

  var end = $.Deferred();

  api.fs( id, function( error, fsnode ){

    fsnode.list( function( error, list ){
      list.forEach( item => console.log( 'getFolderItems', item.name, item.type ) );
      // To Do -> Error
      end.resolve( fsnode, list );
    });

  });

  return end;

};

var getIconLines = function( text ){

  ctx.font  = '13px Lato';

  var words = text.split(' ');
  var lines = [];
  var line  = '';

  if( ctx.measureText( text ).width < ICON_TEXT_WIDTH ){
    return [ text.trim() ];
  }

  while( words.length > 0 ){

    while( ctx.measureText( words[ 0 ] ).width >= ICON_TEXT_WIDTH ){

      var tmp    = words[ 0 ];
      words[ 0 ] = tmp.slice( 0, -1 );

      if( words.length > 1 ){
        words[ 1 ] = tmp.slice( -1 ) + words[ 1 ];
      }else{
        words.push( tmp.slice( -1 ) );
      }
    }

    if( ctx.measureText( line + words[ 0 ] ).width < ICON_TEXT_WIDTH ){
      line += words.shift() + ' ';
    }else{
      lines.push( line.trim() );
      line = '';
    }

    if( words.length === 0 ){
      lines.push( line.trim() );
    }

  }

  return lines;

};

var getIconPosition = function( icon ){

  for( var i = 0; i < currentList.length; i++ ){

    if( icon === currentList[ i ] ){
      break;
    }

  }

  var index = i;
  var grid  = calculateGrid();
  var row   = parseInt( i / grid.iconsInRow );
  var col   = parseInt( i % grid.iconsInRow );
  var posX  = col * ( grid.gap + ICON_WIDTH ) + grid.gap;
  var posY  = 10;

  for( var i = 0; i < row; i++ ){
    posY += currentRows[ i ] + ROWS_GAP;
  }

  return {

    x : posX,
    y : posY

  };

};

var getIconWithMouserOver = function( event ){

  var offset = visualItemArea.offset();
  var posX   = event.pageX - offset.left;
  var posY   = event.pageY - offset.top;

  // Get row
  var row     = null;
  var rowsPos = 10 + currentScroll;

  for( var i = 0; i <= currentRows.length; i++ ){

    if( rowsPos > posY ){
      row = i - 1;
      break;
    }

    if( rowsPos + currentRows[ i ] < posY & rowsPos + currentRows[ i ] + ROWS_GAP > posY ){
      row = -1;
      break;
    }

    rowsPos += currentRows[ i ] + ROWS_GAP;

  }

  if( row === -1 || isNaN( rowsPos ) ){
    return;
  }

  if( row === null ){
    row = currentRows.length - 1;
  }

  // Get column
  var grid    = calculateGrid();
  var col     = null;
  var colsPos = grid.gap;

  for( var i = 0; i < grid.iconsInRow; i++ ){

    if( colsPos > posX ){
      col = i - 1;
      break;
    }

    if( colsPos + ICON_WIDTH < posX & colsPos + ICON_WIDTH + grid.gap > posX ){
      col = -1;
      break;
    }

    colsPos += ICON_WIDTH + grid.gap;

  }

  if( col === -1 ){
    return;
  }

  if( col === null ){
    col = grid.iconsInRow - 1;
  }

  return currentList[ row * grid.iconsInRow + col ];

};

var getMaxIconHeight = function( list ){

  var maxHeightInRow = 0;

  for( var i = 0; i < list.length; i++ ){

    if( list[ i ].bigIconHeight > maxHeightInRow ){
      maxHeightInRow = list[ i ].bigIconHeight;
    }

  }

  return maxHeightInRow;

};

var getSidebarItems = function(){

  var end    = $.Deferred();
  var first  = $.Deferred();
  var second = $.Deferred();

  api.fs( 'root', function( error, fsnode ){

    fsnode.list( true, function( error, list ){
      list.forEach( item => console.log( 'getSidebarItems', item.name, item.type ) );
      list = list.filter( function( item ){
          return item.type === 1;
      });

      list.unshift( fsnode );

      first.resolve( list );

    });

  });

  wql.getSidebar( function( error, rows ){

    if( error || !rows.length ){
      return second.resolve( [] );
    }

    var folders = [];

    rows.forEach( function( item ){

        var promise = $.Deferred();

        folders.push( promise );

        api.fs( item.folder, function( error, structure ){
          promise.resolve( error ? null: structure );
        });

    });

    $.when.apply( null, folders ).done( function(){

      var folders = [];

      for( var i in arguments ){

        if( arguments[ i ] !== null ){
          folders.push( arguments[ i ] );
        }

      }

      customPath.resolve( folders );

    });

  });

  $.when( first, second ).done(function( first, second ){
    end.resolve( first.concat( second ) );
  });

  return end;

};

var hideRenameTextarea = function(){

  visualRenameTextarea.removeClass('active');

  var name = visualRenameTextarea.val()
  var icon = visualRenameTextarea.data('icon');

  visualRenameTextarea.removeData('icon').val('');

  if( !icon || !name.trim() || icon.fsnode.name === name ){
    return;
  }

  var oldName = icon.fsnode.name;
  icon.fsnode.name = name;
  icon.lines = getIconLines( name );

  clearCanvas();
  drawIcons();

  icon.fsnode.rename( name, function( error ){

    if( error ){

      icon.fsnode.name = oldName;
      icon.lines = getIconLines( oldName );

      clearCanvas();
      drawIcons();

    }

  });

};

var historyGoBack = function(){

  if( !historyBackward.length ){
    return;
  }

  openFolder( historyBackward.pop(), true );

  if( !historyBackward.length ){
    visualHistoryBack.removeClass('enabled');
  }

};

var historyGoForward = function(){

  if( !historyForward.length ){
    return;
  }

  openFolder( historyForward.shift(), false, true );

  if( !historyForward.length ){
    visualHistoryForward.removeClass('enabled');
  }

};

var openFile = function( fsnode ){

  fsnode.open( /*fileArea.find('.file').map( function(){ return $(this).data('file-id') }).get(),*/ function( error ){

    if( error ){
      alert( lang.noApp );
    }

  });

};

var openFolder = function( id, isBack, isForward ){

  getFolderItems( id ).then( function( fsnode, list ){

    visualSidebarItemArea.find('.active').removeClass('active');
    visualSidebarItemArea.find( '.item-' + fsnode.id ).addClass('active');

    if( !isBack && !isForward && currentOpened ){
      addToHistoryBackward( currentOpened );
      clearHistoryForward();
    }else if( isBack ){
      addToHistoryForward( currentOpened );
    }else if( isForward ){
      addToHistoryBackward( currentOpened );
    }

    currentOpened = fsnode.id;

    clearList();
    appendItemToList( list );
    clearCanvas();
    drawIcons();

  });

};

var showRenameTextarea = function( icon ){

  var areaPosition = visualItemArea.position();
  var iconPosition = getIconPosition( icon );

  visualRenameTextarea.val( icon.fsnode.name ).css({

    top : areaPosition.top + iconPosition.y + ICON_IMAGE_HEIGHT_AREA,
    left : areaPosition.left + iconPosition.x,

  }).data( 'icon', icon ).addClass('active').focus().select();

};

var updateRows = function(){

  var grid         = calculateGrid();
  currentMaxScroll = 0;
  currentRows      = [];

  for( var i = 0; i < currentList.length; i += grid.iconsInRow ){

    var max = getMaxIconHeight( currentList.slice( i, i + grid.iconsInRow ) );
    currentMaxScroll += max + ROWS_GAP;
    currentRows.push( max );

  }

};

var updateCanvasSize = function(){

  ctx.width  = visualItemArea.width() * pixelRatio;
  ctx.height = visualItemArea.height() * pixelRatio;

  /*
  if( pixelRatio > 1 ){
    ctx.scale( pixelRatio, pixelRatio );
  }
  */

};

// API Events
api.fs.on( 'new', function( fsnode ){

  if( fsnode.parent === currentOpened ){
    appendItemToList( fsnode );
  }

});

// DOM Events
$(this)
.on( 'ui-view-resize ui-view-maximize ui-view-unmaximize', function(){

  updateCanvasSize();
  clearCanvas();
  updateRows();
  drawIcons();

})

.key( 'esc', function(e){

  if( $(e.target).is('textarea') ){
    hideRenameTextarea();
  }

});

visualSidebarItemArea
.on( 'click', '.ui-navgroup-element', function(){
  openFolder( $(this).attr('data-id') );
});

visualHistoryBack.on( 'click', function(){
  historyGoBack();
});

visualHistoryForward.on( 'click', function(){
  historyGoForward();
});

visualItemArea
.on( 'mousewheel', function( e, delta, x, y ){

  currentScroll += y;

  if( currentScroll > 0 ){
    currentScroll = 0;
  }else if( -1 * currentMaxScroll + ctx.height > currentScroll ){
    currentScroll = -1 * currentMaxScroll + ctx.height;
  }

  clearCanvas();
  drawIcons();

})

.on( 'mouseout', function( e ){

  if( !currentHover ){
    return;
  }

  currentHover.hover = false;
  currentHover       = null;

  clearCanvas();
  drawIcons();

})

.on( 'mousemove mousewheel', function( e ){

  if( !currentList.length ){
    return;
  }

  var itemOver = getIconWithMouserOver( e );

  if( itemOver && currentHover ){

    currentHover.hover = false;
    currentHover       = itemOver;
    currentHover.hover = true;

    clearCanvas();
    drawIcons();

  }else if( itemOver && !currentHover ){

    currentHover       = itemOver;
    currentHover.hover = true;

    clearCanvas();
    drawIcons();

  }else if( !itemOver && currentHover ){

    currentHover.hover = false;
    currentHover       = null;

    clearCanvas();
    drawIcons();

  }

})

.on( 'mousedown', function( e ){

  var itemClicked = getIconWithMouserOver( e );

  if( itemClicked ){

    currentActive.forEach( function( item ){ item.active = false; });
    currentActive      = [ itemClicked ];
    itemClicked.active = true;

  }else{

    currentActive.forEach( function( item ){ item.active = false; });
    currentActive = [];

  }

  clearCanvas();
  drawIcons();

})

.on( 'contextmenu', function( e ){

  var itemClicked = getIconWithMouserOver( e );

  // Context menu
  var menu = api.menu();

  if( !itemClicked ){

    api.menu()
    .addOption( lang.upload, function(){
        uploadButton.click();
    })
    .addOption( lang.newDirectory, function(){
        createDirectory();
    })
    .render();

  /*}else if( icon.hasClass( 'shared-pending' ) ){

    menu.addOption( lang.acceptFile, contextmenuAcceptFile.bind( null, itemClicked.fsnode ) )

    .addOption( lang.properties, function(){
      api.app.createView( icon.data( 'file-id' ), 'properties' );
    })

    .addOption( lang.refuseFile, function(){

      api.fs( icon.data( 'file-id' ), function( error, structure ){

        structure.refuse( function( error ){

          if( error ){
            alert( error );
            return;
          }

          var banner = api.banner();

          if( structure.pointerType === 0 ){
            banner.setTitle( lang.folderShareRefused );
          }else{
            banner.setTitle( lang.fileShareRefused );
          }

          banner
          .setText( structure.name + ' ' + lang.beenRefused )
          .setIcon( 'https://static.inevio.com/app/1/file_denied.png' )
          .render();

        });

      });

    }, 'warning');

  }else if( icon.hasClass('received') ){

    menu
    .addOption( lang.acceptFile, function(){

      api.fs( icon.data( 'file-id' ), function( error, structure ){

        structure.accept( function( error ){

          if( error ){
            alert( error );
          }else{

            api.banner()
            .setTitle( lang.fileShareAccepted )
            .setText( structure.name + ' ' + lang.beenAccepted )
            .setIcon( 'https://static.inevio.com/app/1/file_accepted.png' )
            .render();

          }

        });

      });

    })

    .addOption( lang.properties, function(){
      api.app.createView( icon.data( 'file-id' ), 'properties' );
    })

    .addOption( lang.refuseFile, function(){

      api.fs( icon.data( 'file-id' ), function( error, structure ){

        structure.refuse( function( error ){

          if( error ){
            alert( error );
          }else{

            api.banner()
            .setTitle( lang.fileShareRefused )
            .setText( structure.name + ' ' + lang.beenRefused )
            .setIcon( 'https://static.inevio.com/app/1/file_denied.png' )
            .render();

          }

        });

      });

    }, 'warning');

  // To Do -> Check all the rules -> }else if( icon.hasClass('file') || ( icon.data( 'filePointerType' ) === 2 && !icon.hasClass('pointer-pending') ) ){
  */
  }else if( itemClicked.fsnode.type === TYPE_FILE ){

    menu.addOption( lang.openFile, openFile.bind( null, itemClicked.fsnode.id ) )
    menu.addOption( lang.openFileLocal, itemClicked.fsnode.openLocal );

    if( itemClicked.fsnode.permissions.modify ){
      menu.addOption( lang.rename, showRenameTextarea.bind( null, itemClicked ) );
    }

    if( itemClicked.fsnode.permissions.link ){
      menu.addOption( lang.createLink, api.app.createView.bind( null, itemClicked.fsnode.id, 'link') );
    }

    if( itemClicked.fsnode.permissions.send ){
      menu.addOption( lang.sendTo, api.app.createView.bind( null, itemClicked.fsnode.id, 'send') );
    }

    if( itemClicked.fsnode.permissions.share ){
      menu.addOption( lang.shareWith, api.app.createView.bind( null, itemClicked.fsnode.id, 'share'));
    }

    /*
    if( itemClicked.fsnode.permissions.download ){

      menu.addOption( lang.download, function(){
        downloadFiles.mousedown();
      });

    }
    */

    if( [ 'image/jpeg', 'image/jpg', 'image/png', 'image/gif' ].indexOf( itemClicked.fsnode.mime ) !== -1 ){

      menu.addOption( 'Establecer como fondo', function(){
        api.config.setFSNodeAsWallpaper( icon.data( 'file-id' ) );
      });

    }

    menu.addOption( lang.properties, api.app.createView.bind( null, itemClicked.fsnode.id, 'properties') );

    /*
    menu.addOption( lang.remove, function(){
      deleteAllActive();
    }, 'warning');
    */

  // To Do -> Check all the rules -> else if( icon.hasClass('directory') || ( icon.data( 'filePointerType' ) === 0 && !icon.hasClass('pointer-pending') ) ){
  }else if( itemClicked.fsnode.type === TYPE_FOLDER ){
    
    menu
    .addOption( lang.openFolder, openFolder.bind( null, itemClicked.fsnode.id ) )
    .addOption( lang.openInNewWindow, api.app.createView.bind( null, itemClicked.fsnode.id, 'main') );

    if( itemClicked.fsnode.permissions.send ){
      menu.addOption( lang.sendTo, api.app.createView.bind( null, itemClicked.fsnode.id, 'send') );
    }

    if( itemClicked.fsnode.permissions.share ){
      menu.addOption( lang.shareWith, api.app.createView.bind( null, itemClicked.fsnode.id, 'share'));
    }

    if( itemClicked.fsnode.permissions.modify ){
      menu.addOption( lang.rename, showRenameTextarea.bind( null, itemClicked ) );
    }

    /*if( itemClicked.fsnode.permissions.download ){

      menu.addOption( lang.download, function(){
        downloadFiles.mousedown();
      });

    }

    if( isInSidebar( icon.data('file-id') ) ){

      menu.addOption( lang.removeFromSidebar, function(){
        removeFromSidebar( icon.data( 'file-id' ) );
      });

    }else{

      menu.addOption( lang.addToSidebar, function(){

        if( icon.data('filePointer') ){
          addToSidebar( icon.data( 'filePointer' ), icon.find('textarea').val() );
        }else{
          addToSidebar( icon.data( 'file-id' ), icon.find('textarea').val() );
        }

      });

    }*/

    menu.addOption( lang.properties, api.app.createView.bind( null, itemClicked.fsnode.id, 'properties') );

    /*
    menu.addOption( lang.remove, function(){
      deleteAllActive();
    }, 'warning');
    */

  }/*else if( icon.hasClass( 'pointer-pending' ) ){
    // To Do
  }*/

  menu.render();

})

.on( 'dblclick', function( e ){

  if( !currentList.length ){
    return;
  }

  var itemClicked = getIconWithMouserOver( e );

  if( !itemClicked ){
    return;
  }

  if( itemClicked.fsnode.type <= 1 ){
    openFolder( itemClicked.fsnode.id );
  }else if( itemClicked.fsnode.type === 2 ){
    openFile( itemClicked.fsnode );
  }

})

.on( 'wz-dropenter', function( e, item ){
  //console.log( e, item );
})

.on( 'wz-dropover', function( e, item ){
  //console.log( e, item );
})

.on( 'wz-dropleave', function( e, item ){
  //console.log( e, item );
})

.on( 'wz-drop', function( e, item ){
  $(this).data( 'wz-uploader-destiny', currentOpened );
});

visualRenameTextarea.on( 'blur', function(){

  if( !visualRenameTextarea.hasClass('active') ){
    return;
  }

  hideRenameTextarea();

});

visualRenameTextarea.on( 'blur', function(){

  if( !visualRenameTextarea.hasClass('active') ){
    return;
  }

  hideRenameTextarea();

});

getSidebarItems().then( function( list ){
  list.forEach( appendVisualSidebarItem );
});

updateCanvasSize();
clearCanvas();

if( params ){
  openFolder( typeof params === 'object' ? parseInt( params.data ) || 0 : params );
}else{
  openFolder('root');
}
