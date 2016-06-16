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

var requestedFrame   = false;
var currentOpened    = null;
var currentList      = [];
var currentRows      = [];
var currentHover     = null;
var currentActive    = [];
var currentScroll    = 0;
var currentMaxScroll = 0;
var currentLastPureClicked = null;
var currentLastDirtyClicked = null;
var currentSort      = null;
var historyBackward  = [];
var historyForward   = [];
var dropActive       = false;
var dropIgnore       = [];

var win                        = $(this);
var visualHistoryBack          = $('.folder-controls .back');
var visualHistoryForward       = $('.folder-controls .forward');
var visualSidebarItemArea      = $('.ui-navgroup');
var visualSidebarItemPrototype = $('.ui-navgroup-element.wz-prototype');
var visualItemArea             = $('.item-area');
var visualRenameTextarea       = $('.rename');
var visualProgressStatusNumber = $('.uploading-area .status-number');
var visualProgressStatusTime   = $('.uploading-area .status-time');
var visualProgressBar          = $('.uploading-area .progress .current');
var visualCreateFolderButton   = $('.folder-utils .create-folder');
var visualDeleteButton         = $('.folder-utils .delete');
var visualDownloadButton       = $('.folder-utils .download');
var visualUploadButton         = $('.folder-utils .upload');
var ctx                        = visualItemArea[ 0 ].getContext('2d');
var backingStoreRatio   = ctx.webkitBackingStorePixelRatio ||
                          ctx.mozBackingStorePixelRatio ||
                          ctx.msBackingStorePixelRatio ||
                          ctx.oBackingStorePixelRatio ||
                          ctx.backingStorePixelRatio || 1;
var pixelRatio          = api.tool.devicePixelRatio() / backingStoreRatio;

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

var addToCollection = function( collection, item ){

  if( collection.indexOf( item ) === -1 ){
    collection.push( item );
  }

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
  currentList = currentList.sort( currentSort );

  updateRows();
  requestDraw();

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

var checkDraggableArea = function(){

  if( currentActive.length ){
    visualItemArea.addClass('wz-draggable wz-dragger');
  }else{
    visualItemArea.removeClass('wz-draggable wz-dragger');
  }

};

var checkScrollLimits = function(){

  if( currentScroll > 0 || currentMaxScroll < ctx.height ){
    currentScroll = 0;
  }else if( -1 * currentMaxScroll + ctx.height > currentScroll ){
    currentScroll = -1 * currentMaxScroll + ctx.height;
  }

};

var clearCanvas = function(){

  visualItemArea.attr('width', visualItemArea.width() * pixelRatio );
  visualItemArea.attr('height', visualItemArea.height() * pixelRatio );

  if( pixelRatio > 1 ){
    ctx.scale( pixelRatio, pixelRatio );
  }

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

  checkDraggableArea();

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

var createFolder = function(){

  currentOpened.createDirectory( getAvailableNewFolderName(), function( error, newDirectory ){

    /*
    setTimeout( function(){
      beginRename( $( '.weexplorer-file-' + newDirectory.id, fileArea ) );
    }, 100);
    */

  });

};

var deleteAllActive = function(){

  confirm( 'Title', function( doIt ){

    if( !doIt ){
      return;
    }

    currentActive.forEach( function( item ){

      item.fsnode.remove( function( error ){
        //console.log( error );
      });

    });

  });

};

var downloadAllActive = function(){

  currentActive.forEach( function( item ){
    item.fsnode.download();
  });

};

var drawIcons = function(){

  if( !currentList.length ){
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

    if( dropActive && dropIgnore.indexOf( icon ) === -1 ){

      if( icon.fsnode.type !== TYPE_FILE ){

        if( icon === dropActive ){

          ctx.strokeStyle = '#60b25e';
          ctx.fillStyle = '#60b25e';
          drawRoundRect( ctx, x, y, ICON_WIDTH, icon.bigIconHeight, ICON_RADIUS, true );

        }else{

          ctx.strokeStyle = '#ccd3d5';
          ctx.fillStyle = '#eff7ef';
          drawRoundRect( ctx, x, y, ICON_WIDTH, icon.bigIconHeight, ICON_RADIUS, true );

        }

      }

    }else{

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

    }

    if( dropActive ){

      if( ( icon.fsnode.type !== TYPE_FILE && icon === dropActive ) || dropIgnore.indexOf( icon ) !== -1 ){
        ctx.fillStyle = '#ffffff';
      }else{
        ctx.fillStyle = '#545f65';
      }

    }else{
      ctx.fillStyle = icon.active ? '#ffffff' : '#545f65';
    }

    ctx.font = '13px Lato';
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
      icon.bigIcon.src = icon.fsnode.icons.small + ( icon.fsnode.type === TYPE_FILE ? '?time=' + Date.now() : '' );

    }

    if( icon.bigIcon.naturalWidth ){

      var normalized = normalizeBigIconSize( icon.bigIcon );

      ctx.drawImage( icon.bigIcon, imgX + ( ICON_WIDTH -  normalized.width ) / 2, imgY + ( ICON_IMAGE_HEIGHT_AREA - normalized.height ) / 2, normalized.width, normalized.height );

    }else{
      $( icon.bigIcon ).on( 'load', requestDraw );
    }

    if( ( dropActive && icon.fsnode.type === TYPE_FILE ) || dropIgnore.indexOf( icon ) !== -1 ){

      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillRect( x, y, ICON_WIDTH + 1, icon.bigIconHeight + 1 );

    }

    x += ICON_WIDTH + grid.gap;

  });

  if( dropActive === true || dropIgnore.indexOf( dropActive ) !== -1 ){

    ctx.fillStyle = '#60b25e';
    ctx.fillRect( 0, 0, ctx.width, 4 );
    ctx.fillRect( 0, 0, 4, ctx.height );
    ctx.fillRect( 0, ctx.height - 4, ctx.width, 4 );
    ctx.fillRect( ctx.width - 4, 0, 4, ctx.height );

  }

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

var getAvailableNewFolderName = function(){

  var found     = false;
  var finished  = false;
  var name      = lang.newFolder;
  var iteration = 1;

  while( !finished ){

    found = false;

    for( var i = 0; i < currentList.length; i++ ){

      if( currentList[ i ].fsnode.name === name ){
        found = true;
        break;
      }

    }

    if( !found ){
      finished = true;
    }else{
      name = lang.newFolder + ' ' + iteration++;
    }

  }

  return name;

};

var getFolderItems = function( id ){

  var end = $.Deferred();

  api.fs( id, function( error, fsnode ){

    fsnode.list( function( error, list ){
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

var hideRenameTextarea = function( cancel ){

  visualRenameTextarea.removeClass('active');

  var name = visualRenameTextarea.val()
  var icon = visualRenameTextarea.data('icon');

  visualRenameTextarea.removeData('icon').val('');

  if( cancel || !icon || !name.trim() || icon.fsnode.name === name ){
    return;
  }

  var oldName      = icon.fsnode.name;
  icon.fsnode.name = name;
  icon.lines       = getIconLines( name );
  currentList      = currentList.sort( currentSort );

  requestDraw();

  icon.fsnode.rename( name, function( error ){

    if( error ){

      icon.fsnode.name = oldName;
      icon.lines       = getIconLines( oldName );
      currentList      = currentList.sort( currentSort );

      requestDraw();

    }

  });

};

var historyGoBack = function(){

  if( !historyBackward.length ){
    return;
  }

  openFolder( historyBackward.pop().id, true );

  if( !historyBackward.length ){
    visualHistoryBack.removeClass('enabled');
  }

};

var historyGoForward = function(){

  if( !historyForward.length ){
    return;
  }

  openFolder( historyForward.shift().id, false, true );

  if( !historyForward.length ){
    visualHistoryForward.removeClass('enabled');
  }

};

var normalizeBigIconSize = function( image ){

  if( image.naturalWidth > 64 || image.naturalHeight > 64 ){

    return {

      height : parseInt( image.naturalHeight / 2 ),
      width : parseInt( image.naturalWidth / 2 )

    };

  }

  return {

    height : image.naturalHeight,
    width : image.naturalWidth

  };

};

var openFile = function( fsnode ){

  fsnode.open( currentList.filter(function( item ){ return item.fsnode.type === TYPE_FILE; }).map( function( item ){ return item.fsnode.id; }), function( error ){

    if( error ){
      alert( lang.noApp );
    }

  });

};

var openFolder = function( id, isBack, isForward ){

  getFolderItems( id ).then( function( fsnode, list ){

    fsnode.getPath( function(){
      //console.log( arguments );
    });

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

    currentOpened = fsnode;
    currentLastPureClicked = null;

    clearList();
    appendItemToList( list );
    requestDraw();

  });

};

var removeFromCollection = function( collection, item ){

  if( collection.indexOf( item ) !== -1 ){

    var tail = collection.splice( 0, collection.indexOf( item ) );
    collection.shift();
    collection.unshift.apply( collection, tail );

  }

};

var removeItemFromList = function( fsnodeId ){

  currentList = currentList.filter( function( icon ){
    return icon.fsnode.id !== fsnodeId;
  });

  currentActive = currentActive.filter( function( icon ){
    return icon.fsnode.id !== fsnodeId;
  });

  if( currentHover && currentHover.fsnode.id === fsnodeId ){
    currentHover = null;
  }

  checkDraggableArea();
  updateRows();
  checkScrollLimits();
  requestDraw();

};

var requestDraw = function(){

  if( requestedFrame ){
    return;
  }

  requestedFrame = true;

  requestAnimationFrame( function(){

    clearCanvas();
    drawIcons();

    requestedFrame = false;

  });

}

var showRenameTextarea = function( icon ){

  var areaPosition = visualItemArea.position();
  var iconPosition = getIconPosition( icon );

  visualRenameTextarea.val( icon.fsnode.name ).css({

    top : areaPosition.top + iconPosition.y + ICON_IMAGE_HEIGHT_AREA,
    left : areaPosition.left + iconPosition.x,

  }).data( 'icon', icon ).addClass('active').focus().select();

};

var sortByName = function( a, b ){

  if( a.fsnode.type === b.fsnode.type ){

    var a1, b1, i= 0, n, L,
    rx=/(\.\d+)|(\d+(\.\d+)?)|([^\d.]+)|(\.\D+)|(\.$)/g;
    if( a.fsnode.name === b.fsnode.name ) return 0;
    a= a.fsnode.name.toLowerCase().match(rx);
    b= b.fsnode.name.toLowerCase().match(rx);
    L= a.length;
    while(i<L){
        if(!b[i]) return 1;
        a1= a[i],
        b1= b[i++];
        if(a1!== b1){
            n= a1-b1;
            if(!isNaN(n)) return n;
            return a1>b1? 1:-1;
        }
    }
    return b[i]? -1:0;

  }

  return a.fsnode.type > b.fsnode.type ? 1 : -1;

};

var toggleInCollection = function( collection, item ){

  if( collection.indexOf( item ) === -1 ){
    collection.push( item );
    return true;
  }else{
    var tail = collection.splice( 0, collection.indexOf( item ) );
    collection.shift();
    collection.unshift.apply( collection, tail );
    return false;
  }

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

  ctx.width  = visualItemArea.width();
  ctx.height = visualItemArea.height();

};

// API Events
api.fs
.on( 'new', function( fsnode ){

  if( fsnode.parent === currentOpened.id ){
    appendItemToList( fsnode );
  }

})

.on( 'modified', function( fsnode ){

  if( fsnode.parent !== currentOpened.id ){
    return;
  }

  for( var i = 0; i < currentList.length; i++ ){

    if( currentList[ i ].fsnode.id === fsnode.id ){

      currentList[ i ].fsnode  = fsnode;
      currentList[ i ].bigIcon = null;
      break;

    }

  }

  requestDraw();

})

.on( 'thumbnail', function( fsnode ){

  if( fsnode.parent !== currentOpened.id ){
    return;
  }

  for( var i = 0; i < currentList.length; i++ ){

    if( currentList[ i ].fsnode.id === fsnode.id ){

      currentList[ i ].bigIcon = null;
      break;

    }

  }

  requestDraw();

})

.on( 'remove', function( fsnodeId, quota, parent ){

  if( parent !== currentOpened.id ){
    return;
  }

  removeItemFromList( fsnodeId );

});

api.upload
.on( 'fsnodeEnqueue', function( list ){

  if( win.hasClass('uploading') ){

    var files = parseInt( visualProgressStatusNumber.text().match(/\d+/)[ 0 ] ) + list.length;

    visualProgressStatusNumber.text( ( files === 1 ? lang.uploadingNumberFile : lang.uploadingNumberFiles ).replace( '%d', files ) );

  }else{

    win.addClass('uploading');

    visualProgressStatusNumber.text( ( list.length === 1 ? lang.uploadingNumberFile : lang.uploadingNumberFiles ).replace( '%d', list.length ) );

  }

})

.on( 'fsnodeProgress', function( fsnodeId, progress, queueProgress, time ){

  visualProgressBar.width( parseFloat( queueProgress * 100 ).toFixed( 4 ) + '%' );

  var percentage = parseFloat( ( queueProgress * 100 ).toFixed( 1 ) );

  if( !time ){
    visualProgressStatusTime.text( lang.uploadingTimeCalculating.replace( '%d', percentage ) );
  }else if( time < 60 ){
    visualProgressStatusTime.text( ( parseInt( time ) === 1 ? lang.uploadingTimeSecond : lang.uploadingTimeSeconds ).replace( '%d', parseInt( time ) ).replace( '%d', percentage ) );
  }else if( time < 3600 ){
    visualProgressStatusTime.text( ( parseInt( time / 60 ) === 1 ? lang.uploadingTimeMinute : lang.uploadingTimeMinutes ).replace( '%d', parseInt( time / 60 ) ).replace( '%d', percentage ) );
  }else{
    visualProgressStatusTime.text( ( parseInt( time / 3600 ) === 1 ? lang.uploadingTimeHour : lang.uploadingTimeHours ).replace( '%d', parseInt( time / 3600 ) ).replace( '%d', percentage ) );
  }

})

.on( 'fsnodeQueueEnd', function(){

  if( !win.hasClass('uploading') ){
    return;
  }

  win.removeClass('uploading');

});

// DOM Events
$(this)
.on( 'ui-view-resize ui-view-maximize ui-view-unmaximize', function(){

  updateCanvasSize();
  updateRows();
  requestDraw();

})

.key( 'delete', function(e){

  if( $(e.target).is('textarea') ){
    e.stopPropagation();
  }else{
    deleteAllActive();
  }

})

.key( 'enter', function(e){

  e.preventDefault();

  if( $(e.target).is('textarea') ){
    hideRenameTextarea();
  }else{
    console.log('TO DO');
  }

})

.key( 'esc', function(e){

  if( $(e.target).is('textarea') ){
    hideRenameTextarea( true );
  }else{
    console.log('TO DO');
  }

})

.key( 'shift', null, null, null, function( e ){

  if( $(e.target).is('textarea') ){
    e.stopPropagation();
  }else if( currentLastDirtyClicked ){

    currentLastPureClicked = currentLastDirtyClicked;
    currentLastDirtyClicked = null;

  }

});

visualSidebarItemArea
.on( 'click', '.ui-navgroup-element', function(){
  openFolder( $(this).attr('data-id') );
});

visualHistoryBack.on( 'click', historyGoBack );
visualHistoryForward.on( 'click', historyGoForward );
visualCreateFolderButton.on( 'click', createFolder );
visualDeleteButton.on( 'click', deleteAllActive );
visualDownloadButton.on( 'click', downloadAllActive );

visualUploadButton.on( 'click', function(){

  $(this).data( 'destiny', currentOpened.id );

  /*
  if( current.id !== $( '.sharedFolder', sidebar ).data( 'file-id' ) && current.id !== $( '.receivedFolder', sidebar ).data( 'file-id' ) ){
    $(this).data( 'destiny', current.id );
  }else{
    $(this).removeData( 'destiny' );
  }
  */

});

visualItemArea
.on( 'mousewheel', function( e, delta, x, y ){

  currentScroll += y;

  checkScrollLimits();
  requestDraw();

})

.on( 'mouseout', function( e ){

  if( !currentHover ){
    return;
  }

  currentHover.hover = false;
  currentHover       = null;

  requestDraw();

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

    requestDraw();

  }else if( itemOver && !currentHover ){

    currentHover       = itemOver;
    currentHover.hover = true;

    requestDraw();

  }else if( !itemOver && currentHover ){

    currentHover.hover = false;
    currentHover       = null;

    requestDraw();

  }

})

.on( 'mousedown', function( e ){

  var itemClicked = getIconWithMouserOver( e );

  if( !itemClicked && !e.shiftKey && !e.metaKey && !e.ctrlKey && !e.shiftKey ){

    currentActive.forEach( function( item ){ item.active = false; });
    currentActive = [];

  }else if( itemClicked && !e.metaKey && !e.ctrlKey && !e.shiftKey && currentActive.indexOf( itemClicked ) === -1 ){

    currentActive.forEach( function( item ){ item.active = false; });
    currentActive = [];

    addToCollection( currentActive, itemClicked );
    itemClicked.active = true;
    currentLastPureClicked = itemClicked;

  }else if( itemClicked && ( e.metaKey || e.ctrlKey ) && ( !e.shiftKey || ( e.shiftKey && ! currentLastPureClicked ) ) ){

    itemClicked.active = toggleInCollection( currentActive, itemClicked );
    currentLastPureClicked = itemClicked;

  }else if( itemClicked && e.shiftKey ){

    var positions = [ currentList.indexOf( currentLastPureClicked ), currentList.indexOf( currentLastDirtyClicked || currentLastPureClicked ) ].sort( function( a, b ){ return a - b; });

    currentList.slice( positions[ 0 ], positions[ 1 ] + 1 ).forEach( function( item ){

      removeFromCollection( currentActive, item );
      item.active = false;

    });

    positions = [ currentList.indexOf( currentLastPureClicked ), currentList.indexOf( itemClicked ) ].sort( function( a, b ){ return a - b; });

    currentList.slice( positions[ 0 ], positions[ 1 ] + 1 ).forEach( function( item ){

      addToCollection( currentActive, item );
      item.active = true;

    });

    currentLastDirtyClicked = itemClicked;

  }

  checkDraggableArea();
  requestDraw();

})

.on( 'contextmenu', function( e ){

  var itemClicked = getIconWithMouserOver( e );

  // Context menu
  var menu = api.menu();

  if( !itemClicked ){

    api.menu()
    .addOption( lang.upload, visualUploadButton.click )
    .addOption( lang.newFolder, createFolder )
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

    if( itemClicked.fsnode.permissions.write ){
      menu.addOption( lang.rename, showRenameTextarea.bind( null, itemClicked ) );
    }

    if( itemClicked.fsnode.permissions.link ){
      menu.addOption( lang.createLink, api.app.createView.bind( null, itemClicked.fsnode.id, 'link') );
    }

    if( itemClicked.fsnode.permissions.send ){
      menu.addOption( lang.sendTo, api.app.createView.bind( null, itemClicked.fsnode.id, 'send') );
    }

    if( itemClicked.fsnode.permissions.share ){
      menu.addOption( lang.shareWith, api.app.createView.bind( null, itemClicked.fsnode.id, 'share') );
    }

    if( itemClicked.fsnode.permissions.download ){
      menu.addOption( lang.download, downloadAllActive );
    }

    if( [ 'image/jpeg', 'image/jpg', 'image/png', 'image/gif' ].indexOf( itemClicked.fsnode.mime ) !== -1 ){

      menu.addOption( 'Establecer como fondo', function(){
        api.config.setFSNodeAsWallpaper( icon.data( 'file-id' ) );
      });

    }

    menu
    .addOption( lang.properties, api.app.createView.bind( null, itemClicked.fsnode.id, 'properties') )
    .addOption( lang.remove, deleteAllActive, 'warning' );

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

    if( itemClicked.fsnode.permissions.write ){
      menu.addOption( lang.rename, showRenameTextarea.bind( null, itemClicked ) );
    }

    if( itemClicked.fsnode.permissions.download ){
      menu.addOption( lang.download, downloadAllActive );
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

    menu
    .addOption( lang.properties, api.app.createView.bind( null, itemClicked.fsnode.id, 'properties') )
    .addOption( lang.remove, deleteAllActive, 'warning' );

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

  if( itemClicked.fsnode.type === TYPE_ROOT || itemClicked.fsnode.type === TYPE_FOLDER_SPECIAL || itemClicked.fsnode.type === TYPE_FOLDER ){
    openFolder( itemClicked.fsnode.id );
  }else if( itemClicked.fsnode.type === TYPE_FILE ){
    openFile( itemClicked.fsnode );
  }

})

.on( 'wz-dropenter', function( e, item ){

  var itemOver = getIconWithMouserOver( e );

  dropActive = itemOver || true;

  requestDraw();

})

.on( 'wz-dropover wz-dropmove', function( e, item, list ){

  var itemOver = getIconWithMouserOver( e );
  dropIgnore = list || [];

  if( dropActive !== itemOver ){

    dropActive = itemOver || true;

    requestDraw();

  }

})

.on( 'wz-dropleave', function( e, item ){

  dropActive = false;
  dropIgnore = [];

  requestDraw();

})

.on( 'wz-drop', function( e, item, list ){

  var itemOver = getIconWithMouserOver( e );

  if( item === 'fileNative' ){
    $(this).data( 'wz-uploader-destiny', itemOver ? itemOver.fsnode.id : currentOpened.id );
  }else{

    var destiny = itemOver ? itemOver.fsnode.id : currentOpened.id;

    list.filter( function( item ){
      return item.fsnode.parent !== destiny;
    }).forEach( function( item ){

      console.log('move',item.fsnode);

      item.fsnode.move( destiny, null, function(){
        console.log( arguments );
      });

    });

  }

  dropActive = false;

  requestDraw();

})

.on( 'wz-dragstart', function( e, drag ){

  var position = $(this).offset();
  var ghost = $('<div></div>');

  ghost.css({

      'min-width'     : currentActive.length > 1 ? '16px' : '110px',
      'width'         : currentActive.length > 1 ? '16px' : 'auto',
      'padding'       : '10px 9px 9px',
      'height'        : '16px',
      'line-height'   : '16px',
      'background'    : '#60b25e',
      'border-radius' : '3px',
      'text-align'    : 'left',
      'box-shadow'    : '0px 2px 5px rgba(0,0,0,.25)',
      'display'       : 'inline-block',
      'opacity'       : '.95',
      'left'          : drag.origin.clientX - position.left - 9 - 16,
      'top'           : drag.origin.clientY - position.top - 10 - 16

  });

  if( currentActive.length > 1 ){

    ghost.append(

      $('<i></i>').css({

        'display'             : 'inline-block',
        'width'               : '16px',
        'height'              : '16px',
        'margin-right'        : '10px',
        'background-image'    : 'url(' + currentLastPureClicked.fsnode.icons.tiny + ')',
        'background-position' : 'center center',
        'background-size'     : '16px 16px'

      })

    ).append(

      $('<i></i>').css({

        'display'          : 'inline-block',
        'min-width'        : '19px',
        'height'           : '19px',
        'border-radius'    : '10px',
        'padding'          : '0 3px',
        'background-color' : '#fa565a',
        'border'           : 'solid 2px #fff',
        'position'         : 'absolute',
        'top'              : '-7px',
        'right'            : '-7px',
        'font-family'      : 'Lato',
      	'font-size'        : '13px',
      	'color'            : '#fff',
        'text-align'       : 'center',
        'box-sizing'       : 'border-box'

      }).text( currentActive.length )

    );

  }else{

    ghost.append(

      $('<i></i>').css({

        'display'             : 'inline-block',
        'width'               : '16px',
        'height'              : '16px',
        'margin-right'        : '10px',
        'background-image'    : 'url(' + currentLastPureClicked.fsnode.icons.tiny + ')',
        'background-position' : 'center center',
        'background-size'     : '16px 16px'

      })

    ).append(

      $('<span></span>').text( currentLastPureClicked.fsnode.name ).css({

        'display'        : 'inline-block',
        'font-family'    : 'Lato',
        'font-size'      : '13px',
        'color'          : '#fff',
        'vertical-align' : 'text-top'

      })

    );

  }

  drag.ghost( ghost );
  drag.data( currentActive  );

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

// Start the app
currentSort = sortByName;

updateCanvasSize();
clearCanvas();

if( params ){
  openFolder( typeof params === 'object' ? parseInt( params.data ) || 0 : params );
}else{
  openFolder('root');
}
