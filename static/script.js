'use strict';

var ICON_WIDTH = 106;
var ICON_TEXT_WIDTH = 106 - 6;
var ICON_IMAGE_HEIGHT_AREA = 80;
var ICON_RADIUS = 3;
var ICON_GAP_MIN = 10;
var ROWS_GAP = 20;

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

  console.log(historyBackward,historyForward);

};

var addToHistoryForward = function( item ){

  historyForward.unshift( item );
  visualHistoryForward.addClass('enabled');

  console.log(historyBackward,historyForward);

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

  visualItem.removeClass('wz-prototype').addClass( 'item-' + item.id + ( item.alias ? ' ' + item.alias : '' ) );
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
      ctx.fillStyle = '#f3f4f5';
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
  ctx.moveTo(x + radius.tl, y);
  ctx.lineTo(x + width - radius.tr, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  ctx.lineTo(x + width, y + height - radius.br);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
  ctx.lineTo(x + radius.bl, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  ctx.lineTo(x, y + radius.tl);
  ctx.quadraticCurveTo(x, y, x + radius.tl, y);
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

  api.fs( id, function( error, structure ){

    structure.list( function( error, list ){
      // To Do -> Error
      end.resolve( list );
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

var getIconWithMouserOver = function( event ){

  var offset = visualItemArea.offset();
  var posX   = event.pageX - offset.left;
  var posY   = event.pageY - offset.top;

  // Get row
  var row     = null;
  var rowsPos = 10 + currentScroll;

  for( var i = 0; i < currentRows.length; i++ ){

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

  if( row === -1 ){
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

  api.fs( 'root', function( error, structure ){

    structure.list( true, function( error, list ){

      list = list.filter( function( item ){
          return item.type === 1;
      });

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

  getFolderItems( id ).then( function( list ){

    if( !isBack && !isForward && currentOpened ){
      addToHistoryBackward( currentOpened );
      clearHistoryForward();
    }else if( isBack ){
      addToHistoryForward( currentOpened );
    }else if( isForward ){
      addToHistoryBackward( currentOpened );
    }

    currentOpened = id;

    clearList();
    appendItemToList( list );
    clearCanvas();
    drawIcons();

  });

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

$(this)
.on( 'ui-view-resize ui-view-maximize ui-view-unmaximize', function(){

  updateCanvasSize();
  clearCanvas();
  updateRows();
  drawIcons();

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

});

visualHistoryBack.on( 'click', function(){
  historyGoBack();
});

visualHistoryForward.on( 'click', function(){
  historyGoForward();
});

getSidebarItems().then( function( list ){
  list.forEach( appendVisualSidebarItem );
});

openFolder('root');
updateCanvasSize();
clearCanvas();
