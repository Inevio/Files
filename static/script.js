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
var PROGRESS_RADIUS = 5;
var PROGRESS_ICON = new Image();
PROGRESS_ICON.src = 'https://static.horbito.com/app/377/img/processing@2x.png';
var SHARING_ICON = new Image();
SHARING_ICON.src = 'https://static.horbito.com/app/377/img/sharing@2x.png';
var SHARED_PATH = 0;
var RADIUS = 90;
var dy = 1;

/* COLORS */
var BLUEUI = '#0071f6';
var COLOR_INACTIVE = "#bbbbc1";
var CIRCLE = "#f9f9fe";
var TRANSPARENTBLUEUI = 'rgba(0, 113, 246, 0.3)';
var DARKTEXTS = '#252525';
var WHITE = '#fff';

var channel                 = null;
var requestedFrame          = false;
var currentOpened           = null;
var currentIcons            = {};
var currentList             = [];
var currentRows             = [];
var currentHover            = null;
var currentActive           = [];
var currentActiveIcons      = {};
var currentScroll           = 0;
var currentMaxScroll        = 0;
var currentLastPureClicked  = null;
var currentLastDirtyClicked = null;
var currentSort             = null;
var historyBackward         = [];
var historyForward          = [];
var dropActive              = false;
var dropIgnore              = [];
var border                  = 0;
var borderAnimation         = null;
var selectDragOrigin        = null;
var selectDragCurrent       = null;
var automaticScroll         = 0;
var uploadingAreaPosition   = 0;
var uploadingAreaTimer      = 0;
var currentGoToItemString   = '';
var currentGoToItemTimer    = 0;
var enabledMultipleSelect   = true;
var disabledFileIcons       = false;
var sidebarFolders          = [];
var notificationBellButton  = $('.notification-center');
var notificationList        = $('.notification-list');
var animationEmptyActive = false;
var animationEmptyImages = [];
var animationEmptyPosition = [];
var proportionEmpty = 1;
var animationOpacity = 0;
var initialColor = [ 187 , 187 , 193 ];


if( params && ( params.command === 'selectSource' ||  params.command === 'selectDestiny' ) ){
  enabledMultipleSelect = params.command === 'selectSource' && params.mode === 'file' && params.multiple;
  disabledFileIcons = params.command === 'selectSource' && params.mode === 'directory';
  notificationBellButton.hide();
}

var win                        = $(this);
var window                     = win.parents().slice( -1 )[ 0 ].parentNode.defaultView;
var visualHistoryBack          = $('.folder-controls .back');
var visualHistoryForward       = $('.folder-controls .forward');
var visualBreadcrumbs          = $('.folder-breadcrumbs');
var visualBreadcrumbsEntryPrototype = $('.folder-breadcrumbs > .entry.wz-prototype');
var visualBreadcrumbsList      = $('.folder-breadcrumbs .list');
var visualSidebarItemArea      = $('.ui-navgroup');
var visualSidebarItemPrototype = $('.ui-navgroup-element.wz-prototype');
var visualItemArea             = $('.item-area');
var visualRenameTextarea       = $('.rename');
var visualUploadingArea        = $('.uploading-area');
var visualProgressStatusNumber = $('.uploading-area .status-number');
var visualProgressStatusTime   = $('.uploading-area .status-time');
var visualProgressBar          = $('.uploading-area .progress .current');
var visualCreateFolderButton   = $('.folder-utils .create-folder');
var visualSortPreferenceButton = $('.folder-utils .sort-preference');
var visualDeleteButton         = $('.folder-utils .delete');
var visualDownloadButton       = $('.folder-utils .download');
var visualUploadButton         = $('.folder-utils .upload');
var visualAcceptButton         = $('.ui-confirm .accept');
var visualCancelButton         = $('.ui-confirm .cancel');
var visualDestinyNameInput     = $('.ui-confirm input');
var sortOptions                = $('.sort-options');
var visualSharingNotificationPrototype = $('.share-notification.wz-prototype');
var ctx                        = visualItemArea[ 0 ].getContext('2d');
var backingStoreRatio          = ctx.webkitBackingStorePixelRatio ||
                          ctx.mozBackingStorePixelRatio ||
                          ctx.msBackingStorePixelRatio ||
                          ctx.oBackingStorePixelRatio ||
                          ctx.backingStorePixelRatio || 1;
var pixelRatio                 = api.tool.devicePixelRatio() / backingStoreRatio;

var Icon = function( fsnode ){

  this.fsnode             = fsnode;
  this.active             = false;
  this.hover              = false;
  this.bigIcon            = null;
  this.bigIconHeight      = 0;
  this.bigIconTextHeight  = 0;
  this.smallIcon          = null;
  this.conversionProgress = -1;

  this.updateName()

  return this;

};

Icon.prototype.updateName = function(){

  this.lines = getIconLines( this.fsnode.name );

  if( this.lines.length > 1 ){
    this.bigIconTextHeight = 4 + 14 + 4 + 14 + 4;
  }else{
    this.bigIconTextHeight = 4 + 14 + 4;
  }

  this.bigIconHeight = ICON_IMAGE_HEIGHT_AREA + this.bigIconTextHeight;

  return this

}

var acceptButtonHandler = function(){

  if( params.command === 'selectSource' ){

    var validIcons = currentActive.filter( function( icon ){

      if( params.mode === 'file' ){
        return icon.fsnode.type === 3
      }

      return icon.fsnode.type === 2

    }).map( function( icon ){
      return icon.fsnode.id
    })

    if( !validIcons.length ){

      if( params.mode === 'file' ){
        return
      }

      validIcons = [ currentOpened.id ]

    }

    params.callback( null, validIcons );
    api.app.removeView( win );

  }else if( params.command === 'selectDestiny'){

    var name = visualDestinyNameInput.val()

    if( !name && !params.name ){
      return
    }

    if( !name ){
      name = params.name
    }

    if( params.extension ){

      var currentExtension = name.slice( -1 * params.extension.length )

      if( currentExtension !== params.extension ){
        name += '.' + params.extension.replace( /^\.+/, '')
      }

    }

    var found = false;

    for( var i = 0; i < currentList.length; i++ ){

      if( currentList[ i ].fsnode.type !== TYPE_FILE ){
        continue
      }

      if( currentList[ i ].fsnode.name === name ){
        found = currentList[ i ]
        break
      }

    }

    if( found ){

      confirm( lang.replace, function( accepted ){

        if( accepted ){

          params.callback( null, {

            destiny : currentOpened.id,
            replace : found.fsnode.id,
            name    : name

          })
          api.app.removeView( win )

        }

      })

    }else{

      params.callback( null, {

        destiny : currentOpened.id,
        replace : null,
        name    : name

      })
      api.app.removeView( win );

    }

  }

};

var addScroll = function( value ){

  currentScroll += value;

  checkScrollLimits();
  requestDraw();

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

  var list = [];

  if( items instanceof Array ){

    items.forEach( function( item ){

      if( !currentIcons[ item.id ] ){

        currentIcons[ item.id ] = new Icon( item );
        list.push( currentIcons[ item.id ] );

      }

    });

  }else if( !currentIcons[ items.id ] ){

    currentIcons[ items.id ] = new Icon( items );
    list.push( currentIcons[ items.id ] );

  }

  if( list.length ){

    currentList = currentList.concat( list );
    currentList = currentList.sort( currentSort );

    updateRows();
    requestDraw();

  }

};

var refreshNotificationCenter = function( receivedFolder ){

  SHARED_PATH = receivedFolder.id;

  receivedFolder.list( function( e , list ){

    list.forEach( function( item ){

      api.user( item.owner , function( err , user ){
        appendSharingNotification( item, user );
      });

    });

  });

}

var appendVisualSidebarItem = function( item ){

  if ( item.type === 1 && item.alias === 'received' ) {
    return refreshNotificationCenter( item );
  }

  if( isInSidebar( item.id ) ){
    return
  }

  var visualItem = visualSidebarItemPrototype.clone().removeClass('wz-prototype')

  visualItem.removeClass('wz-prototype').addClass( 'item-' + item.id + ( item.alias ? ' ' + item.alias : '' ) ).data( 'fsnode', item ).data( 'id' , item.id );
  visualItem.find('.ui-navgroup-element-txt').text( item.name );

  sidebarFolders.push( item );
  visualSidebarItemArea.append( visualItem );

};

var appendSharingNotification = function( receivedItem , user ){

  notificationBellButton.find( '.notification-icon' ).addClass( 'not-empty' );

  var sharingNotification = visualSharingNotificationPrototype.clone();

  sharingNotification.removeClass( 'wz-prototype' ).addClass( 'sharing-notification-' + receivedItem.id );
  sharingNotification.find( '.user-avatar' ).css( 'background-image' , 'url(' + user.avatar.tiny + ')' );

  sharingNotification.find( '.share-action' ).html( '<i class="ellipsis">' + user.fullName + '</i> ' + lang.main.sharedYou );
  sharingNotification.find( '.file-icon' ).css( 'background-image' , 'url(' + receivedItem.icons.tiny + ')' );
  sharingNotification.find( '.file-title' ).text( receivedItem.name );
  sharingNotification.find( '.file-desc' ).text( api.tool.bytesToUnit( receivedItem.size ) );


  if ( receivedItem.type === 3 ) {
    sharingNotification.addClass( 'file-type' );
  }

  notificationList.append( sharingNotification );
  sharingNotification.data( 'fsnode' , receivedItem );

}

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

var cancelButtonHandler = function(){

  params.callback('USER ABORT');
  api.app.removeView( win );

}

var changeName = function( fsnode ){

  if( fsnode.type === 0 && !isNaN( parseInt( fsnode.name ) ) ){
    fsnode.name = api.system.user().user;
  }else if( fsnode.type === 1 ){
    fsnode.name = lang.main.folderTranslations[ fsnode.name ] || fsnode.name
  }

  return fsnode;

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
  }else if( -1 * currentMaxScroll + ctx.height - uploadingAreaPosition > currentScroll ){
    currentScroll = -1 * currentMaxScroll + ctx.height - uploadingAreaPosition;
  }

};

var clearCanvas = function(){

  visualItemArea.attr('width', visualItemArea.width() * pixelRatio );
  visualItemArea.attr('height', visualItemArea.height() * pixelRatio );

  if( pixelRatio > 1 ){
    ctx.scale( pixelRatio, pixelRatio );
  }

};

var clearGoToItemString = function(){
  currentGoToItemString = '';
};

var clearHistoryForward = function(){

  historyForward = [];

  visualHistoryForward.removeClass('enabled');

};

var clearList = function(){

  currentList        = [];
  currentIcons       = {};
  currentRows        = [];
  currentHover       = null;
  currentActive      = [];
  currentActiveIcons = {};

  checkDraggableArea();

};

var clipboardCopy = function( items ){
  cancelCuttedItems();
  api.app.storage( 'clipboard', { copy : ( items || currentActive ).map( function( item ){ return item } ) } )
};

var clipboardCut = function( items ){
  cancelCuttedItems();
  api.app.storage( 'clipboard', { cut : ( items || currentActive ).map( function( item ){ return item } ) });
  requestDraw();
};

var clipboardPaste = function(){

  var storage = api.app.storage( 'clipboard');
  cancelCuttedItems();

  if( storage.copy ){

    storage.copy.forEach( function( item ){

      console.log( item.fsnode );
      item.fsnode.copy( currentOpened.id, { fixCollision: true } , function(){
        console.log( arguments );
      });

    });

  }else if( storage.cut ){

    storage.cut.forEach( function( item ){

      if ( item.fsnode.parent != currentOpened.id ) {
        item.fsnode.move( currentOpened.id, function(){
          console.log( arguments );
        });
      }

    });

  }

  requestDraw();

};

var contextmenuAcceptFile = function( fsnode ){

  fsnode.accept( function( error ){

    if( error ){
      return alert( error );
    }

    var banner = api.banner();

    if( fsnode.pointerType === 0 ){
      banner.setTitle( lang.main.folderShareAccepted );
    }else{
      banner.setTitle( lang.main.fileShareAccepted );
    }

    banner
    .setText( fsnode.name + ' ' + lang.main.beenAccepted )
    .setIcon( 'https://static.horbito.com/app/377/file_accepted.png' )
    .render();

  });

};

var createFolder = function(){

  currentOpened.createDirectory( getAvailableNewFolderName(), function( error, newDirectory ){

    appendItemToList( newDirectory );
    showRenameTextarea( currentIcons[ newDirectory.id ] );

  });

};

var deleteAll = function( items ){

  items = items || currentActive
  items = items.filter( function( item ){ return item.fsnode.type !== TYPE_FOLDER_SPECIAL })

  if( !items.length ){
    return
  }

  var dialog = api.dialog();

  dialog.setTitle( lang.main.remove );

  if( items.length > 1 ){
    dialog.setText( lang.main.confirmDelete2 );
  }else{
    dialog.setText( lang.main.confirmDelete );
  }

  dialog.setButton( 0, wzLang.core.dialogCancel, 'black' );
  dialog.setButton( 1, wzLang.core.dialogAccept, 'blue' );

  dialog.render(function( doIt ){

    items.forEach( function( item ){

      if( item.fsnode.type === TYPE_FOLDER_SPECIAL|| !doIt ){
        return
      }

      checkIsOnSidebar( item.fsnode );
      item.fsnode.remove( function( error ){});

    });

  });

};

var checkIsOnSidebar = function( fsnode ){

  var index = sidebarFolders.indexOf( fsnode );

  if( index > -1 ){
    sidebarFolders.splice(index, 1)
    removeFromSidebar( fsnode )
  }

}

var downloadAll = function( items ){

  ( items || currentActive ).forEach( function( item ){
    item.fsnode.download()
  })

}

var drawIcons = function(){

  if( currentList.length ){
    drawIconsInGrid();
    //drawIconsInList()
  }

  if( currentList.length === 0 && dropActive === false){
    clearCanvas();
    initialColor = [ 187 , 187 , 193 ];
    drawEmptyBackground();
  }

  if( currentList.length === 0 && dropActive === true && !animationEmptyActive ){
    backgroundHover();
  }

  if( dropActive === true || dropIgnore.indexOf( dropActive ) !== -1 ){

    if ( !animationEmptyActive ) {
      if ( currentList.length === 0 ) {

        animationEmptyActive = true;
        animationEmptyFolder();

      }else{
        ctx.fillStyle = BLUEUI;
        drawBorder ( 3 );
      }
    }

  }else{
    animationEmptyActive = false;
    animationOpacity = 0;
  }

}

var drawEmptyBackground = function(){

  animationEmptyActive = false;

  ctx.beginPath();
  ctx.strokeStyle = COLOR_INACTIVE;
  ctx.fillStyle = CIRCLE;
  ctx.lineWidth = 4*proportionEmpty;
  ctx.lineCap = 'round';
  ctx.setLineDash([10*proportionEmpty]);
  ctx.arc(ctx.width/2, 2*ctx.height/5, RADIUS, 0, 2*Math.PI, false);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.strokeStyle= COLOR_INACTIVE;
  ctx.lineWidth = 10*proportionEmpty;
  ctx.lineCap = 'round';
  ctx.setLineDash([]);
  ctx.moveTo(ctx.width/2 - RADIUS/3,  2*ctx.height/5);
  ctx.lineTo(ctx.width/2 + RADIUS/3,  2*ctx.height/5);
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.strokeStyle= COLOR_INACTIVE;
  ctx.lineWidth = 10*proportionEmpty;
  ctx.lineCap = 'round';
  ctx.setLineDash([]);
  ctx.moveTo(ctx.width/2,  2*ctx.height/5 + RADIUS/3);
  ctx.lineTo(ctx.width/2,  2*ctx.height/5 - RADIUS/3);
  ctx.stroke();
  ctx.closePath();

  ctx.fillStyle= COLOR_INACTIVE;
  ctx.font= 'bold '+ 38 *proportionEmpty+'px Lato';
  ctx.textAlign = 'center';
  ctx.fillText(lang.emptyFolder, ctx.width/2,  2*ctx.height/5 + 5 * RADIUS/3);

  ctx.fillStyle= COLOR_INACTIVE;
  ctx.font= 21 * proportionEmpty + 'px Lato';
  ctx.textAlign = 'center';
  ctx.fillText(lang.dragIt, ctx.width/2,  2*ctx.height/5 + 6.5* RADIUS /3 - 10);

}

var animationEmptyFolder = function (){
  if (animationEmptyActive){

    ctx.globalAlpha = animationOpacity;

    ctx.clearRect(0, 0, ctx.width, ctx.height);

    for (var i = 0; i < animationEmptyImages.length; i++){

      var normalized = normalizeBigIconSize( animationEmptyImages[i] );

      ctx.drawImage(animationEmptyImages[i], animationEmptyPosition[i][0]-animationEmptyImages[i].width/2, animationEmptyPosition[i][1]-animationEmptyImages[i].height/2, normalized.width, normalized.height);
      animationEmptyPosition[i][1] += animationEmptyPosition[i][2];
      if (animationEmptyPosition[i][1] > ctx.height + animationEmptyImages[i].height)
        reset(i);
    }

    ctx.fill();
    ctx.stroke();
    backgroundHover();

    if ( animationOpacity < 1) {
      animationOpacity += 0.005;
    }else{
      animationOpacity = 1;
    }

    requestAnimationFrame(animationEmptyFolder);
  }
}

var backgroundHover = function(){

  var finalColor = [ 0 , 113 , 246 ];

  initialColor.forEach(function( color , i ){
    initialColor[i] += (finalColor[i] - color) * (animationOpacity / 10);
  });

  var colorOnTransition = 'rgba('+Math.floor(initialColor[0])+', '+Math.floor(initialColor[1])+', '+Math.floor(initialColor[2])+', 1)';
  console.log(colorOnTransition,animationOpacity);

  ctx.beginPath();
  ctx.strokeStyle = colorOnTransition;
  ctx.fillStyle = CIRCLE;
  ctx.lineWidth = 4*proportionEmpty;
  ctx.lineCap = 'round';
  ctx.setLineDash([10*proportionEmpty]);
  ctx.arc(ctx.width/2,  2*ctx.height/5, RADIUS, 0, 2*Math.PI, false);
  ctx.fill();
  ctx.stroke();
  ctx.closePath();

  ctx.beginPath();
  ctx.strokeStyle = colorOnTransition;
  ctx.lineWidth = 10*proportionEmpty;
  ctx.lineCap = 'round';
  ctx.setLineDash([]);
  ctx.moveTo(ctx.width/2-RADIUS/3,  2*ctx.height/5);
  ctx.lineTo(ctx.width/2+RADIUS/3,  2*ctx.height/5);
  ctx.stroke();
  ctx.closePath();

  //ctx.beginPath();
  ctx.strokeStyle = colorOnTransition;
  ctx.lineWidth = 10*proportionEmpty;
  ctx.lineCap = 'round';
  ctx.setLineDash([]);
  ctx.moveTo(ctx.width/2,  2*ctx.height/5 + RADIUS/3);
  ctx.lineTo(ctx.width/2,  2*ctx.height/5 - RADIUS/3);
  ctx.stroke();
  //ctx.closePath();

  ctx.fillStyle = "#252525";
  ctx.font= 'bold '+ 38 *proportionEmpty+'px Lato';
  ctx.textAlign = 'center';
  ctx.fillText(lang.dropIt, ctx.width/2,  2*ctx.height/5 + 5 * RADIUS/3);
  ctx.fillText(lang.toUpload, ctx.width/2,  2*ctx.height/5 + 5 * RADIUS/3 + 43);


}

var reset = function (i){
  animationEmptyPosition[i]= [ctx.width * Math.random(),  - 100, Math.random()*dy]
}

var drawBorder = function ( size ) {

  if(border < size){
    border = border + 0.1;
    ctx.fillRect( 0, 0, ctx.width, border );
    ctx.fillRect( 0, 0, border, ctx.height );
    ctx.fillRect( 0, ctx.height - border, ctx.width, border );
    ctx.fillRect( ctx.width - border, 0, border, ctx.height );
    for(var i = 0; i< 5; i++ && border < size){
      border = border + 0.1;
      ctx.fillRect( 0, 0, ctx.width, border );
      ctx.fillRect( 0, 0, border, ctx.height );
      ctx.fillRect( 0, ctx.height - border, ctx.width, border );
      ctx.fillRect( ctx.width - border, 0, border, ctx.height );
    }
  }

  else{
    ctx.fillRect( 0, 0, ctx.width, size );
    ctx.fillRect( 0, 0, size, ctx.height );
    ctx.fillRect( 0, ctx.height - size, ctx.width, size );
    ctx.fillRect( ctx.width - size, 0, size, ctx.height );

  }

}

var drawIconsInGrid = function(){

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
          ctx.strokeStyle = '#e5e9ea';
          ctx.fillStyle = '#e5e9ea';
          drawRoundRect( ctx, x, y, ICON_WIDTH, icon.bigIconHeight, ICON_RADIUS, true );
          border = 0;


        }else{
          ctx.strokeStyle = '#ccd3d5';
          ctx.fillStyle = '#f9fafb';
          drawRoundRect( ctx, x, y, ICON_WIDTH, icon.bigIconHeight, ICON_RADIUS, true );


        }

      }

    }else{

      if( icon.hover || icon.active ){

        ctx.strokeStyle = '#e4e8e9';
        ctx.fillStyle = '#f9fafb';
        drawRoundRect( ctx, x, y, ICON_WIDTH, icon.bigIconHeight, ICON_RADIUS, true );

      }

      if( icon.active && !isCutted(icon) ){

        ctx.strokeStyle = BLUEUI;
        ctx.fillStyle = BLUEUI;
        drawRoundRect( ctx, x, y + ICON_IMAGE_HEIGHT_AREA, ICON_WIDTH, icon.bigIconTextHeight, { bl : ICON_RADIUS, br : ICON_RADIUS }, true, false );

      }

    }

    if( dropActive ){

      if( ( icon.fsnode.type !== TYPE_FILE && icon === dropActive ) || dropIgnore.indexOf( icon ) !== -1 ){
        ctx.fillStyle = '#252525';
      }else{
        ctx.fillStyle = '#252525';
      }

    }else{
      if (isCutted(icon)) {
        ctx.fillStyle = '#b6babc';
      }else{
        ctx.fillStyle = icon.active ? '#ffffff' : '#252525';
      }
    }


    ctx.font = '13px Lato';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText( icon.lines[ 0 ], x + ICON_WIDTH / 2, 4 + y + ICON_IMAGE_HEIGHT_AREA);

    if( icon.lines[ 1 ] ){
      ctx.fillText( icon.lines[ 1 ], x + ICON_WIDTH / 2, 4 + y + 18 + ICON_IMAGE_HEIGHT_AREA);
    }

    if( !icon.bigIcon ){

      icon.bigIcon = new Image ();
      icon.bigIcon.src = icon.fsnode.icons.small + ( icon.fsnode.type === TYPE_FILE ? '?time=' + Date.now() : '' );

    }

    if( icon.bigIcon.naturalWidth ){

      var normalized = normalizeBigIconSize( icon.bigIcon );

      ctx.drawImage( icon.bigIcon, x + ( ICON_WIDTH -  normalized.width ) / 2, y + ( ICON_IMAGE_HEIGHT_AREA - normalized.height ) / 2, normalized.width, normalized.height );

    }else{
      $( icon.bigIcon ).on( 'load', requestDraw );
    }

    if ( icon.fsnode.isSharedRoot && icon.bigIcon.naturalWidth ) {

      var normalized = normalizeBigIconSize( icon.bigIcon );
      var centerX = normalized.width + x + ( ICON_WIDTH -  normalized.width ) / 2;
      var centerY = normalized.height + y + ( ICON_IMAGE_HEIGHT_AREA -  normalized.height ) / 2;

      drawSharedCircle( ctx , { x: centerX - 5 , y: centerY - 5 } );

    }

    if( icon.conversionProgress !== -1 ){

      if ( icon.bigIcon.naturalWidth ) {

        var normalized = normalizeBigIconSize( icon.bigIcon );
        var centerX = normalized.width + x + ( ICON_WIDTH -  normalized.width ) / 2;
        var centerY = normalized.height + y + ( ICON_IMAGE_HEIGHT_AREA -  normalized.height ) / 2;

        drawProgressCircle( ctx , { x: centerX , y: centerY }  , icon.conversionProgress );

      }else{

        var centerX = x + ICON_WIDTH / 2
        var centerY = y + ICON_IMAGE_HEIGHT_AREA / 2

        drawProgressCircle( ctx , { x: centerX , y: centerY }  , icon.conversionProgress );

      }

    }

    if(
      ( disabledFileIcons && icon.fsnode.type === TYPE_FILE ) ||
      ( dropActive && icon.fsnode.type === TYPE_FILE ) ||
      dropIgnore.indexOf( icon ) !== -1 ||
      icon.fsnode.fileId === 'TO_UPDATE' || isCutted(icon)
    ){

      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.fillRect( x, y, ICON_WIDTH + 1, icon.bigIconHeight + 1 );

    }

    x += ICON_WIDTH + grid.gap;

  });

  if( selectDragCurrent ){

    ctx.fillStyle = TRANSPARENTBLUEUI;
    ctx.fillRect( selectDragOrigin.x, selectDragOrigin.y + currentScroll, selectDragCurrent.x - selectDragOrigin.x, selectDragCurrent.y - selectDragOrigin.y );

  }

};

var drawProgressCircle = function( ctx , center , progress ){

  var centerX = center.x;
  var centerY = center.y;

  ctx.beginPath();
  ctx.arc( centerX , centerY , 13 , 0 , 2*Math.PI );
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#ccd3d5';
  ctx.fillStyle = '#fff';
  ctx.fill();

  ctx.stroke();

  ctx.beginPath();
  var startAngle = 1.5;
  var endAngle = startAngle + 2 * progress;
  ctx.arc( centerX , centerY , 12 , startAngle*Math.PI , endAngle*Math.PI );
  ctx.lineWidth = 2;
  ctx.strokeStyle = BLUEUI;

  ctx.stroke();

  ctx.drawImage( PROGRESS_ICON , centerX - 7 , centerY - 6 , 14 , 13 );

}

var drawSharedCircle = function( ctx , center ){

  var centerX = center.x;
  var centerY = center.y;

  ctx.beginPath();
  ctx.arc( centerX , centerY , 13 , 0 , 2*Math.PI );
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#ccd3d5';
  ctx.fillStyle = '#fff';
  ctx.fill();

  ctx.stroke();

  ctx.drawImage( SHARING_ICON , centerX - 7 , centerY - 6 , 14 , 13 );

}

var drawIconsInList = function(){

  currentList.forEach( function( icon, currentRow ){

    ctx.fillStyle = '#ccd3d5';
    ctx.fillRect( ICON_GAP_MIN, ( currentRow + 1 ) * 34, ctx.width - ( ICON_GAP_MIN * 2 ), 1 );

    ctx.fillStyle = '#ff0000';
    ctx.fillRect( ICON_GAP_MIN * 2, currentRow * 34 + 9, 16, 16 );

    ctx.font = '13px Lato';
    ctx.fillStyle = '#252525';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText( icon.fsnode.name, ICON_GAP_MIN * 2 + 16 + ICON_GAP_MIN, currentRow * 34 + 11 );

    console.log( ( currentRow + 1 ) * 34 );

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

var findIconWithSimilarName = function( list, name ){

  for( var i = 0; i < list.length; i++ ){

    if( list[ i ].fsnode.name.toLowerCase() >= name ){
      return list[ i ];
    }

  }

};

var generateBreadcrumbs = function( path ){

  visualBreadcrumbs.find('.entry').not('.wz-prototype').remove();

  var list = [];

  path.forEach( function( item ){

    changeName( item )
    var entry = visualBreadcrumbsEntryPrototype.clone().removeClass('wz-prototype');
    entry.text( item.name );
    entry.data( 'id', item.id );
    list.push( entry );

  });

  list[ list.length - 1 ].addClass('current');
  visualBreadcrumbs.prepend( list );

  var isOverflowing = visualBreadcrumbs[ 0 ].clientWidth < visualBreadcrumbs[ 0 ].scrollWidth;
  var firstIteration = true;
  var limitReached = false;

  while( isOverflowing && !limitReached ){

    if( firstIteration ){

      firstIteration = false
      var entry = visualBreadcrumbsEntryPrototype.clone().removeClass('wz-prototype');
      entry.addClass('list-trigger').append('<i></i>');
      visualBreadcrumbs.prepend( entry );

    }

    var entries = visualBreadcrumbs.children('.entry').not('.wz-prototype, .list-trigger');

    if( entries.length > 1 ){
      entries.first().prependTo( visualBreadcrumbsList )
    }else{
      limitReached = true
    }

    isOverflowing = visualBreadcrumbs[ 0 ].clientWidth < visualBreadcrumbs[ 0 ].scrollWidth;

  }

};

var getAvailableNewFolderName = function(){

  var found     = false;
  var finished  = false;
  var name      = lang.main.newFolder;
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
      name = lang.main.newFolder + ' ' + iteration++;
    }

  }

  return name;

};

var getFolderItems = function( fsnode ){

  var end = $.Deferred();

  fsnode.list({ withPermissions: true }, function( error, list ){

    // To Do -> Error
    list = list.filter( function( item ){

      if( item.type === TYPE_FOLDER_SPECIAL && item.name === 'Received' ){
        return false
      }

      changeName( item )

      return true

    })

    end.resolve( list )

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

var getIconsInArea = function( start, end ){

  var startX, startY, endX, endY;

  if( start.x < end.x ){
    startX = start.x;
    endX   = end.x;
  }else if( start.x > end.x ){
    startX = end.x;
    endX   = start.x;
  }else{
    return [];
  }

  if( start.y < end.y ){
    startY = start.y;
    endY   = end.y;
  }else if( start.y > end.y ){
    startY = end.y;
    endY   = start.y;
  }else{
    return [];
  }

  var grid  = calculateGrid();
  var startPosX = grid.gap;
  var startPosY = 10;
  var startCol  = 0;
  var startRow  = 0;
  var endPosX   = grid.gap;
  var endPosY   = 10;
  var endCol    = 0;
  var endRow    = 0;

  for( var i = 0; i < grid.iconsInRow; i++ ){

    if( startX < startPosX + ICON_WIDTH ){
      break;
    }

    startPosX += ICON_WIDTH + grid.gap;
    startCol++;

  }

  for( var i = 0; i < grid.iconsInRow; i++ ){

    if( endX < endPosX + ICON_WIDTH + grid.gap ){
      break;
    }

    endPosX += ICON_WIDTH + grid.gap;
    endCol++;

  }

  if( endCol >= grid.iconsInRow ){
    endCol = grid.iconsInRow - 1;
  }

  for( var i = 0; i < currentRows.length; i++ ){

    if( startY < startPosY + currentRows[ i ] ){
      break;
    }

    startPosY += currentRows[ i ] + ROWS_GAP;
    startRow++;

  }

  for( var i = 0; i < currentRows.length; i++ ){

    if( endY < endPosY + currentRows[ i ] + ROWS_GAP ){
      break;
    }

    endPosY += currentRows[ i ] + ROWS_GAP;
    endRow++;

  }

  var list = [];

  for( var i = startRow; i <= endRow; i++ ){

    if( i === startRow ){

      currentList.slice( i * grid.iconsInRow + startCol, i * grid.iconsInRow + endCol + 1 ).forEach( function( item ){

        if( startPosY + item.bigIconHeight > startY ){
          list.push( item );
        }

      });

    }else{
      list = list.concat( currentList.slice( i * grid.iconsInRow + startCol, i * grid.iconsInRow + endCol + 1 ) );
    }

  }

  return list;

};

var getIconWithMouserOver = function( event ){

  var offset = visualItemArea.offset();
  var posX   = event.clientX - offset.left;
  var posY   = event.clientY - offset.top;

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

  var icon = currentList[ row * grid.iconsInRow + col ];

  if( !icon ){
    return;
  }

  rowsPos = rowsPos - currentScroll - currentRows[ row ] - ROWS_GAP;
  posY    = posY - currentScroll;

  if( posY >= rowsPos && posY <= rowsPos + icon.bigIconHeight ){
    return icon;
  }

};

var getItemPath = function( fsnode ){

  var end = $.Deferred();

  fsnode.getPath( function( error, path ){
    // To Do -> Error
    end.resolve( path || [] );
  });

  return end;

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

    fsnode.list({ withPermissions: true }, function( error, list ){

      list = list.filter( function( item ){
        return item.type === 1;
      })

      list.forEach( function( item ){

        injectAliasAttribute( item )
        changeName( item )

      });

      list = list.sort( function( a, b ){
        // TO DO -> Prevent this artifact when use sortByName
        return sortByName( { fsnode : a }, { fsnode : b } );
      });

      list.unshift( changeName( injectAliasAttribute( fsnode ) ) );
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

      second.resolve( folders );

    });

  });

  $.when( first, second ).done(function( first, second ){
    end.resolve( first.concat( second ) );
  });

  return end;

};

var hideRenameTextarea = function( cancel ){

  visualRenameTextarea.removeClass('active');

  var name = visualRenameTextarea.val().replace( /(?:\r\n|\r|\n)/g, ' ' );
  var icon = visualRenameTextarea.data('icon');

  visualRenameTextarea.removeData('icon').val('');

  if( cancel || !icon || !name.trim() || icon.fsnode.name === name ){
    return;
  }

  var oldName      = icon.fsnode.name;
  icon.fsnode.name = name;

  icon.updateName()

  currentList = currentList.sort( currentSort );

  makeIconVisible( icon );
  requestDraw();

  icon.fsnode.rename( name, function( error ){

    if( error ){

      icon.fsnode.name = oldName;
      icon.lines       = getIconLines( oldName );
      currentList      = currentList.sort( currentSort );

      makeIconVisible( icon );
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

var injectAliasAttribute = function( fsnode ){

  if( fsnode.type === 0 && !isNaN( parseInt( fsnode.name ) ) ){
    fsnode.alias = 'root'
  }else if( fsnode.type === 1 && lang.main.folderTranslations[ fsnode.name ] ){
    fsnode.alias = lang.main.folderAlias[ fsnode.name ]
  }

  return fsnode;

};

var makeIconVisible = function( icon ){

  if( disabledFileIcons && icon.fsnode.type === TYPE_FILE ){
    return
  }

  var position = getIconPosition( icon );
  var scroll   = -1 * ( position.y + icon.bigIconHeight + ( ROWS_GAP / 2 ) - ctx.height );

  if( scroll < currentScroll ){
    currentScroll = scroll;
  }else if( position.y < -1 * currentScroll ){
    currentScroll = - 1 * position.y + ( ROWS_GAP / 2 );
  }

  requestDraw();

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
      console.log( lang.main.noApp );
      fsnode.openLocal();
    }

  });

};

var openFolder = function( id, isBack, isForward ){

  if( !currentOpened || id !== currentOpened.id ){

    api.fs( id, function( error, fsnode ){

      $.when( getFolderItems( fsnode ), getItemPath( fsnode ) ).done( function( list, path ){

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

        currentScroll = 0;
        currentOpened = fsnode;
        currentLastPureClicked = null;

        clearList();
        appendItemToList( list );
        generateBreadcrumbs( path );
        requestDraw();

      });

    });

  }

};

var openItem = function( item ){

  if ( item.fsnode.pending ) {
    api.app.createView( item.fsnode , 'received' );
  }else if( item.fsnode.type === TYPE_ROOT || item.fsnode.type === TYPE_FOLDER_SPECIAL || item.fsnode.type === TYPE_FOLDER ){
    openFolder( item.fsnode.id );
  }else if( item.fsnode.type === TYPE_FILE ){

    if( params && ( params.command === 'selectSource' || params.command === 'selectDestiny' ) ){
      acceptButtonHandler()
    }else{
      openFile( item.fsnode );
    }

  }

}

var removeFromCollection = function( collection, item ){

  if( collection.indexOf( item ) !== -1 ){

    var tail = collection.splice( 0, collection.indexOf( item ) );
    collection.shift();
    collection.unshift.apply( collection, tail );

  }

};

var removeItemFromList = function( fsnodeId ){

  if( !currentIcons[ fsnodeId ] ){
    return;
  }

  var iconToRemove = currentIcons[ fsnodeId ];

  currentList = currentList.filter( function( icon ){
    return icon !== iconToRemove;
  });

  currentActive = currentActive.filter( function( icon ){
    return icon !== iconToRemove;
  });

  if( currentHover && currentHover === iconToRemove ){
    currentHover = null;
  }

  delete currentIcons[ fsnodeId ];
  delete currentActiveIcons[ fsnodeId ];

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

    if( !animationEmptyActive ){
      clearCanvas();
    }

    drawIcons();

    requestedFrame = false;

  });

}

var selectAllIcons = function(){

  currentActiveIcons = {};
  currentActive      = currentList.map( function( item ){ item.active = true; return item; });

  checkDraggableArea();
  requestDraw();

};

var selectIcon = function( e, itemClicked ){

  if( !itemClicked && !e.shiftKey && !e.metaKey && !e.ctrlKey && !e.shiftKey && !visualRenameTextarea.hasClass('active') ){

    currentActive.forEach( function( item ){ item.active = false; });
    currentActive = [];
    currentActiveIcons = {};

  }else if( itemClicked && disabledFileIcons && itemClicked.fsnode.type === TYPE_FILE ){
    return
  }else if( itemClicked && ( !enabledMultipleSelect || ( !e.metaKey && !e.ctrlKey && !e.shiftKey ) ) && currentActive.indexOf( itemClicked ) === -1 ){

    currentActive.forEach( function( item ){ item.active = false; });

    currentActive                               = [ itemClicked ];
    currentActiveIcons                          = {};
    currentActiveIcons[ itemClicked.fsnode.id ] = itemClicked;
    itemClicked.active                          = true;
    currentLastPureClicked                      = itemClicked;

    if( params && params.command === 'selectDestiny' && currentLastPureClicked.fsnode.type === TYPE_FILE ){
      setDestinyNameInput( currentLastPureClicked.fsnode.name )
    }

  }else if( itemClicked && ( e.metaKey || e.ctrlKey ) && ( !e.shiftKey || ( e.shiftKey && ! currentLastPureClicked ) ) ){

    itemClicked.active = toggleInCollection( currentActive, itemClicked );

    if( itemClicked.active ){
      currentActiveIcons[ itemClicked.fsnode.id ] = itemClicked;
    }else{
      delete currentActiveIcons[ itemClicked.fsnode.id ];
    }

    currentLastPureClicked = itemClicked;

  }else if( itemClicked && e.shiftKey ){

    var positions = [ currentList.indexOf( currentLastPureClicked ), currentList.indexOf( currentLastDirtyClicked || currentLastPureClicked ) ].sort( function( a, b ){ return a - b; });

    currentList.slice( positions[ 0 ], positions[ 1 ] + 1 ).forEach( function( item ){

      if( currentActiveIcons[ item.fsnode.id ] ){

        delete currentActiveIcons[ item.fsnode.id ];
        removeFromCollection( currentActive, item );
        item.active = false;

      }

    });

    positions = [ currentList.indexOf( currentLastPureClicked ), currentList.indexOf( itemClicked ) ].sort( function( a, b ){ return a - b; });

    currentList.slice( positions[ 0 ], positions[ 1 ] + 1 ).forEach( function( item ){

      if( !currentActiveIcons[ item.fsnode.id ] ){

        currentActiveIcons[ item.fsnode.id ] = item;
        currentActive.push( item );
        item.active = true;

      }

    });

    currentLastDirtyClicked = itemClicked;

  }

  checkDraggableArea();
  requestDraw();

};

var showRenameTextarea = function( icon ){

  makeIconVisible( icon );

  var areaPosition = visualItemArea.position();
  var iconPosition = getIconPosition( icon );

  visualRenameTextarea.val( icon.fsnode.name ).css({

    top : areaPosition.top + iconPosition.y + currentScroll + ICON_IMAGE_HEIGHT_AREA,
    left : areaPosition.left + iconPosition.x,

  }).data( 'icon', icon ).addClass('active');

  if ( visualRenameTextarea.val().lastIndexOf('.') < 0 ) {
    selectRangeText( visualRenameTextarea[0] , 0 , visualRenameTextarea.val().length );
  }else{
    selectRangeText( visualRenameTextarea[0] , 0 , visualRenameTextarea.val().lastIndexOf('.') );
  }

};

var selectRangeText = function( input , start , end ){

  input.focus();
  input.setSelectionRange( start , end );

}

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

var sortBySize = function( a, b ){
  return b.fsnode.size - a.fsnode.size
}

var sortByCreation = function( a, b ){
  return b.fsnode.dateCreated - a.fsnode.dateCreated
}

var sortByModif = function( a, b ){
  return b.fsnode.dateModified - a.fsnode.dateModified
}

var moveListenerMousemove = function( e ){

  var offset = visualItemArea.offset();
  selectDragCurrent = { x : e.clientX - offset.left, y : e.clientY - offset.top - currentScroll };
  var iconsInArea = getIconsInArea( selectDragOrigin, selectDragCurrent );

  currentActive.forEach( function( item ){
    item.active = false;
  });

  currentActive = [];
  currentActiveIcons = {};

  iconsInArea.forEach( function( item ){

    currentActiveIcons[ item.fsnode.id ] = item;
    currentActive.push( item );
    item.active = true;

  });

  requestDraw();

  var topDistance    = e.clientY - offset.top;
  var bottomDistance = e.clientY - offset.top - visualItemArea.height();

  if( topDistance < 0 ){
    setAutomaticScroll( topDistance < -100 ? -100 : topDistance );
  }else if( bottomDistance > 0 ){
    setAutomaticScroll( bottomDistance > 100 ? 100 : bottomDistance );
  }else{
    setAutomaticScroll( 0 );
  }

};

var moveListenerMouseup = function(){

  selectDragOrigin  = null;
  selectDragCurrent = null;
  currentLastPureClicked = currentActive[ 0 ] || null;

  setAutomaticScroll( 0 );
  stopListeningMove();
  requestDraw();

};

var setAutomaticScroll = function( size ){

  clearInterval( automaticScroll );

  if( !size ){
    return;
  }

  addScroll( -1 * size );

  automaticScroll = setInterval( function(){
    addScroll( -1 * size );
  }, 1000 / 60 );

};

var setDestinyNameInput = function( name ){

  name = name || params.name

  if( !name ){
    return
  }

  if( params.extension ){

    var currentExtension = name.slice( -1 * params.extension.length )

    if( currentExtension !== params.extension ){
      name += '.' + params.extension.replace( /^\.+/, '')
    }

  }

  visualDestinyNameInput.val( name )

};

var startListeningMove = function(){

  $( window )
  .on( 'mousemove', moveListenerMousemove )
  .on( 'mouseup', moveListenerMouseup );

};

var startUploadingAnimation = function(){

  clearInterval( uploadingAreaTimer );

  uploadingAreaTimer = setInterval( function(){

    uploadingAreaPosition = parseInt( visualUploadingArea.css('bottom') );

    checkScrollLimits();
    requestDraw();

  }, 1000 / 60 );

};

var stopListeningMove = function(){

  $( window )
  .off( 'mousemove', moveListenerMousemove )
  .off( 'mouseup', moveListenerMouseup );

};

var stopUploadingAnimation = function(){

  uploadingAreaPosition = parseInt( visualUploadingArea.css('bottom') );

  clearInterval( uploadingAreaTimer );
  checkScrollLimits();
  requestDraw();

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

var updateIconConversionProgress = function( fsnodeId, progress ){

  if( !currentIcons[ fsnodeId ] ){
    return
  }

  currentIcons[ fsnodeId ].conversionProgress = progress

  requestDraw()

}

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
  /*
  var proportionEmptyWidth = ctx.width /700;
  var proportionEmptyHeight = ctx.height / 700;

  //if ( (proportionEmptyWidth / proportionEmptyHeight < 1.5 ) && (proportionEmptyHeight / proportionEmptyWidth < 1.5 )){
    proportionEmpty = (proportionEmptyHeight + proportionEmptyWidth) / 2;
    //console.log("Modificated proportion")
  //}
  emptyradiusmodificated = RADIUS * proportionEmpty;
    if ( ctx.height/2+6.5* emptyradiusmodificated /3 > ctx.height){
      proportionEmpty =  ((ctx.height -ctx.height/2) * 3/6.5) / RADIUS;
    }
    //console.log(" ESTOOOO" ,emptyradiusmodificated, proportionEmptyWidth / proportionEmptyHeight, proportionEmptyHeight / proportionEmptyWidth, proportionEmpty);
*/
};

var addToSidebar = function( fsnode ){

  wql.addFolder( [ fsnode.id , 0 ], function( error, result ){

      // To Do -> Error
      if( !error && result.affectedRows ){

          appendVisualSidebarItem( fsnode );

          if( channel === null ){

              api.channel( function( error, chn ){

                  channel = chn;
                  channel.send( { action : 'addToTaskbar', id : fsnode.id , name : fsnode.name } );

              });

          }else{

              channel.send( { action : 'addToTaskbar', id : fsnode.id , name : fsnode.name } );

          }

      }

  });

};

var isInSidebar = function( id ){
  return visualSidebarItemArea.find( '.item-' + id ).length;
};

var removeFromSidebar = function( fsnode ){

  wql.removeFolder( fsnode.id , function( error, result ){

      // To Do -> Error
      if( !error && result.affectedRows ){

          removeFromSidebarUi( fsnode );

          if( channel === null ){

              api.channel( function( error, chn ){

                  channel = chn;
                  channel.send( { action : 'removeFromTaskbar', id : fsnode.id } );

              });

          }else{
              channel.send( { action : 'removeFromTaskbar', id : fsnode.id } );
          }

      }

  });

};

var removeFromSidebarUi = function( item ){
  var index = sidebarFolders.indexOf( item );
  if (index > -1) {
    sidebarFolders.splice(index, 1);
  }
  return visualSidebarItemArea.find( '.item-' + item.id ).remove();
};

var acceptContent = function( fsnode ){

  api.fs.selectDestiny( { title: lang.received.chooseDestiny , mode: 'directory' , name: fsnode.name } , function( e , dir ){


    if (!e) {

      fsnode.accept( dir.destiny , function(){
        console.log(arguments);
      })

    }

  });

}

var refuseContent = function( fsnode ){

  fsnode.refuse(function(){
    console.log(arguments);
  });

}

var updateNotificationCenter = function( fsnode , options ){

  var fsnodeId = options.onlyId ? fsnode : fsnode.id;

  if ( options.isNew && SHARED_PATH === fsnode.parent ) {

    api.user( fsnode.owner , function( err , user ){
      appendSharingNotification( fsnode , user );
    });

  }else{

    if ( $( '.sharing-notification-' + fsnodeId ).length > 0 ) {

      $( '.sharing-notification-' + fsnodeId ).remove();

      if ( $( '.share-notification:not(.wz-prototype)' ).length === 0 ) {
        $( '.notification-list-container' ).css( 'display', 'none' );
        notificationBellButton.find( '.notification-icon' ).removeClass( 'not-empty' );
      }

    }

  }

}

var isOnSidebar = function( fsnode ){

  var res = sidebarFolders.filter( function( item ){
    return item.id === fsnode.id;
  });

  return res.length;

}

var generateContextMenu = function( item, options ){

  var menu = api.menu()
  options = options || {}

  console.log('item', item?item.fsnode:'null')

  if( !item ){

    if( currentOpened.type === 1 && currentOpened.name === 'Received' ){
      return
    }

    menu
    .addOption( lang.main.upload, function(){ visualUploadButton.click()  } )
    .addOption( lang.main.newFolder, createFolder )
    .addOption( lang.main.paste, clipboardPaste )

  }else if( item.fsnode.pending ){

    menu.addOption( lang.received.contentAccept , acceptContent.bind( null , item.fsnode ) );
    menu.addOption( lang.received.contentRefuse , refuseContent.bind( null , item.fsnode ), 'warning');

  }else if( item.fsnode.type === TYPE_FILE ){

    menu.addOption( lang.main.openFile, openFile.bind( null, item.fsnode ) )
    .addOption( lang.main.openFileLocal, item.fsnode.openLocal )

    if ( item.fsnode.permissions.copy ) {
      menu.addOption( lang.main.copy, clipboardCopy.bind( null, null ) )
    }
    menu.addOption( lang.main.cut, clipboardCut.bind( null, null ) )

    if( item.fsnode.permissions.link ){
      menu.addOption( lang.main.createLink, api.app.createView.bind( null, item.fsnode.id, 'link') );
    }

    /* Not supported yet
    if( item.fsnode.permissions.send ){
      menu.addOption( lang.main.sendTo, api.app.createView.bind( null, item.fsnode.id, 'send') );
    }
    */

    if( item.fsnode.permissions.share ){
      menu.addOption( lang.main.shareWith, api.app.createView.bind( null, item.fsnode.id, 'share') );
    }

    if( item.fsnode.permissions.download ){
      menu.addOption( lang.main.download, downloadAll.bind( null, null ) );
    }

    if( [ 'image/jpeg', 'image/jpg', 'image/png', 'image/gif' ].indexOf( item.fsnode.mime ) !== -1 ){

      menu.addOption( 'Establecer como fondo', function(){
        api.config.setFSNodeAsWallpaper( item.fsnode.id );
      });

    }


    if( item.fsnode.permissions.write ){
      menu.addOption( lang.main.rename, showRenameTextarea.bind( null, item ) );
    }

    menu
    .addOption( lang.main.properties, api.app.createView.bind( null, item.fsnode.id, 'properties') )
    .addOption( lang.main.remove, deleteAll.bind( null, null ), 'warning' );

  }else if( item.fsnode.type === TYPE_FOLDER ){

    menu
    .addOption( lang.main.openFolder, openFolder.bind( null, item.fsnode.id ) )
    .addOption( lang.main.openInNewWindow, api.app.createView.bind( null, item.fsnode.id, 'main') )

    if( options.inSidebar ){
      if ( item.fsnode.permissions.copy ) {
        menu.addOption( lang.main.copy, clipboardCopy.bind( null, [ item ] ) )
      }
      menu.addOption( lang.main.cut, clipboardCut.bind( null, [ item ] ) )
    }else{
      if ( item.fsnode.permissions.copy ) {
        menu.addOption( lang.main.copy, clipboardCopy.bind( null, null ) )
      }
      menu.addOption( lang.main.cut, clipboardCut.bind( null, null ) )
    }

    if( isOnSidebar( item.fsnode ) ){
      menu.addOption( lang.removeFromSidebar, removeFromSidebar.bind( null , item.fsnode ) )
    }else{
      menu.addOption( lang.addToSidebar, addToSidebar.bind( null , item.fsnode ) )
    }

    /* Not supported yet
    if( item.fsnode.permissions.send ){
      menu.addOption( lang.main.sendTo, api.app.createView.bind( null, item.fsnode.id, 'send') );
    }
    */

    if( item.fsnode.permissions.share ){
      menu.addOption( lang.main.shareWith, api.app.createView.bind( null, item.fsnode.id, 'share'));
    }

    if( item.fsnode.permissions.download ){

      if( options.inSidebar ){
        menu.addOption( lang.main.download, downloadAll.bind( null, [ item ] ) );
      }else{
        menu.addOption( lang.main.download, downloadAll.bind( null, null ) );
      }

    }

    if ( item.fsnode.pending ) {
      menu.addOption( lang.received.contentAccept, acceptContent.bind( null , item.fsnode ) );
      menu.addOption( lang.received.contentRefuse, refuseContent.bind( null , item.fsnode ) );
    }

    if( item.fsnode.permissions.write && !options.inSidebar ){
      menu.addOption( lang.main.rename, showRenameTextarea.bind( null, item ) );
    }

    menu
    .addOption( lang.main.properties, api.app.createView.bind( null, item.fsnode.id, 'properties') )

    if( options.inSidebar ){
      menu.addOption( lang.main.remove, deleteAll.bind( null, [ item ] ), 'warning' );
    }else{
      menu.addOption( lang.main.remove, deleteAll.bind( null, null ), 'warning' );
    }

  // To Do -> Check all the rules -> }else if( icon.hasClass('file') || ( icon.data( 'filePointerType' ) === 2 && !icon.hasClass('pointer-pending') ) ){
  }else if( item.fsnode.type === TYPE_FOLDER_SPECIAL ){

    menu
    .addOption( lang.main.openFolder, openFolder.bind( null, item.fsnode.id ) )
    .addOption( lang.main.openInNewWindow, api.app.createView.bind( null, item.fsnode.id, 'main') )

    if ( item.fsnode.permissions.copy ) {
      if( options.inSidebar ){
        menu.addOption( lang.main.copy, clipboardCopy.bind( null, [ item ] ) )
      }else{
        menu.addOption( lang.main.copy, clipboardCopy.bind( null, null ) )
      }
    }


    // Add to sidebar
    if( wz.system.user().rootPath !== parseInt( item.fsnode.parent ) ){

      if( isOnSidebar( item.fsnode ) ){
        menu.addOption( lang.removeFromSidebar, removeFromSidebar.bind( null , item.fsnode ) )
      }else{
        menu.addOption( lang.addToSidebar, addToSidebar.bind( null , item.fsnode ) )
      }

    }

    /* Not supported yet
    if( item.fsnode.permissions.send ){
      menu.addOption( lang.main.sendTo, api.app.createView.bind( null, item.fsnode.id, 'send') );
    }
    */

    if( item.fsnode.permissions.download ){

      if( options.inSidebar ){
        menu.addOption( lang.main.download, downloadAll.bind( null, [ item ] ) );
      }else{
        menu.addOption( lang.main.download, downloadAll.bind( null, null ) );
      }

    }

    menu
    .addOption( lang.main.properties, api.app.createView.bind( null, item.fsnode.id, 'properties') )

  }

  menu.render()

}

var cancelCuttedItems = function(){
  api.app.storage( 'clipboard', { cut : '' });
}

var isCutted = function( icon ){

  var cuttedIcons = api.app.storage( 'clipboard' ) ? api.app.storage( 'clipboard' ).cut : false;
  if (cuttedIcons) {
    cuttedIcons = cuttedIcons.filter(function( iconCutted ){
      return iconCutted.fsnode.id === icon.fsnode.id;
    });
    cuttedIcons = cuttedIcons.length > 0 ? true : false;
  }
  return cuttedIcons;

}

var loadEmptyAnimationImg = function(){

  animationEmptyImages[0] = new Image();
  animationEmptyImages[0].src = "https://static.horbito.com/app/377/img/emptyAnimation/jpg.png";
  animationEmptyImages[1] = new Image();
  animationEmptyImages[1].src = "https://static.horbito.com/app/377/img/emptyAnimation/mp3.png";
  animationEmptyImages[2] = new Image();
  animationEmptyImages[2].src = "https://static.horbito.com/app/377/img/emptyAnimation/mp4.png";
  animationEmptyImages[3] = new Image();
  animationEmptyImages[3].src = "https://static.horbito.com/app/377/img/emptyAnimation/docx.png";
  animationEmptyImages[4] = new Image();
  animationEmptyImages[4].src = "https://static.horbito.com/app/377/img/emptyAnimation/pptx.png";
  animationEmptyImages[5] = new Image();
  animationEmptyImages[5].src = "https://static.horbito.com/app/377/img/emptyAnimation/xlsx.png";
  animationEmptyImages[6] = new Image();
  animationEmptyImages[6].src = "https://static.horbito.com/app/377/img/emptyAnimation/jpg.png";
  animationEmptyImages[7] = new Image();
  animationEmptyImages[7].src = "https://static.horbito.com/app/377/img/emptyAnimation/mp3.png";

  animationEmptyImages[8] = new Image();
  animationEmptyImages[8].src = "https://static.horbito.com/app/377/img/emptyAnimation/photoshop.png";
  animationEmptyImages[9] = new Image();
  animationEmptyImages[9].src = "https://static.horbito.com/app/377/img/emptyAnimation/afterEffects.png";
  animationEmptyImages[10] = new Image();
  animationEmptyImages[10].src = "https://static.horbito.com/app/377/img/emptyAnimation/Illustrator.png";
  animationEmptyImages[11] = new Image();
  animationEmptyImages[11].src = "https://static.horbito.com/app/377/img/emptyAnimation/lightroom.png";
  animationEmptyImages[12] = new Image();
  animationEmptyImages[12].src = "https://static.horbito.com/app/377/img/emptyAnimation/eps.png";
  animationEmptyImages[13] = new Image();
  animationEmptyImages[13].src = "https://static.horbito.com/app/377/img/emptyAnimation/premiere.png";

  for (var i = 0; i < animationEmptyImages.length; i++){
    animationEmptyPosition[i] = [ctx.width * Math.random(), Math.random() * (visualItemArea[ 0 ].height + 300), 0.5 + dy * Math.random()];
  }

}

// API Events
api.fs
.on( 'new', function( fsnode ){

  updateNotificationCenter( fsnode , { isNew: true , onlyId: false } );

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

.on( 'rename', function( fsnode ){

  if( fsnode.parent !== currentOpened.id ){
    return;
  }

  for( var i = 0; i < currentList.length; i++ ){

    if( currentList[ i ].fsnode.id === fsnode.id ){

      currentList[ i ].fsnode  = fsnode;
      currentList[ i ].updateName()
      break;

    }

  }

  currentList = currentList.sort( currentSort );

  requestDraw();

})

.on( 'move', function( fsnode, finalDestiny, originalSource ){

  updateNotificationCenter( fsnode , { isNew: false , onlyId: false } );

  if( originalSource === currentOpened.id ){
    removeItemFromList( fsnode.id );
  }else if( finalDestiny === currentOpened.id ){
    appendItemToList( fsnode );
  }

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

  updateNotificationCenter( fsnodeId , { isNew: false , onlyId: true } );

  if( parent === currentOpened.id ){
    removeItemFromList( fsnodeId );
  }

})

.on( 'conversionStart', function( fsnodeId ){
  updateIconConversionProgress( fsnodeId, 0 )
})

.on( 'conversionProgress', function( fsnodeId, progress ){
  updateIconConversionProgress( fsnodeId, progress )
})

.on( 'conversionEnd', function( fsnodeId ){
  updateIconConversionProgress( fsnodeId, -1 )
});

api.upload
.on( 'fileEnqueued', function( file, queue ){

  var queueSize = queue.length()

  if( !win.hasClass('uploading') ){

    win.addClass('uploading');
    startUploadingAnimation();

  }

  if( queueSize === 1 ){
    visualProgressStatusNumber.text( lang.main.uploadingNumberFile.replace( '%d', queueSize ) )
  }else{
    visualProgressStatusNumber.text( lang.main.uploadingNumberFiles.replace( '%d', ( queueSize - queue.pending.length ) || 1 ).replace( '%d', queueSize ) )
  }

})

.on( 'fsnodeStart', function( fsnode, queue ){

  var queueSize = queue.length()

  if( queueSize === 1 ){
    visualProgressStatusNumber.text( lang.main.uploadingNumberFile.replace( '%d', queueSize ) )
  }else{
    visualProgressStatusNumber.text( lang.main.uploadingNumberFiles.replace( '%d', ( queueSize - queue.pending.length ) || 1 ).replace( '%d', queueSize ) )
  }

})

.on( 'fsnodeProgress', function( fsnodeId, progress, queue ){

  if( !win.hasClass('uploading') ){

    var queueSize = queue.length();

    win.addClass('uploading');
    startUploadingAnimation();

    if( queueSize === 1 ){
      visualProgressStatusNumber.text( lang.main.uploadingNumberFile.replace( '%d', queueSize ) )
    }else{
      visualProgressStatusNumber.text( lang.main.uploadingNumberFiles.replace( '%d', ( queueSize - queue.pending.length ) || 1 ).replace( '%d', queueSize ) )
    }

  }

  var progress = queue.progress()
  var percentage = parseFloat( progress * 100 ).toFixed( 1 )
  var time = 100

  visualProgressBar.width( parseFloat( progress * 100 ).toFixed( 4 ) + '%' );

  /*if( !time ){
    visualProgressStatusTime.text( lang.main.uploadingTimeCalculating.replace( '%d', percentage ) );
  }else if( time < 60 ){
    visualProgressStatusTime.text( ( parseInt( time ) === 1 ? lang.main.uploadingTimeSecond : lang.main.uploadingTimeSeconds ).replace( '%d', parseInt( time ) ).replace( '%d', percentage ) );
  }else if( time < 3600 ){
    visualProgressStatusTime.text( ( parseInt( time / 60 ) === 1 ? lang.main.uploadingTimeMinute : lang.main.uploadingTimeMinutes ).replace( '%d', parseInt( time / 60 ) ).replace( '%d', percentage ) );
  }else{
    visualProgressStatusTime.text( ( parseInt( time / 3600 ) === 1 ? lang.main.uploadingTimeHour : lang.main.uploadingTimeHours ).replace( '%d', parseInt( time / 3600 ) ).replace( '%d', percentage ) );
  }*/

  visualProgressStatusTime.text( lang.main.uploadingProgress.replace( '%d', percentage ) )

})

.on( 'fsnodeQueueEnd', function(){

  if( !win.hasClass('uploading') ){
    return;
  }

  win.removeClass('uploading');
  startUploadingAnimation();

});

// DOM Events
win
.on( 'ui-view-resize ui-view-maximize ui-view-unmaximize ui-view-resize-end', function(){

  updateCanvasSize();
  updateRows();
  checkScrollLimits();
  requestDraw();

})

.on( 'transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd', function(){
  stopUploadingAnimation();
})

.key( 'delete', function(e){

  if( $(e.target).is('textarea') ){
    e.stopPropagation();
  }else{
    deleteAll();
  }

})

.key( 'enter', function(e){

  e.preventDefault();

  if( $(e.target).is('textarea') ){
    return hideRenameTextarea()
  }

  var pending = currentActive.filter( function( item ){ return item.fsnode.pending })
  var folder = currentActive.filter( function( item ){ return pending.indexOf( item ) === -1 && ( item.fsnode.type === TYPE_ROOT || item.fsnode.type === TYPE_FOLDER_SPECIAL || item.fsnode.type === TYPE_FOLDER ) }).slice( -1 )[ 0 ]
  var files = currentActive.filter( function( item ){ return pending.indexOf( item ) === -1 && folder !== item })

  pending.forEach( openItem )
  openItem( folder )
  files.forEach( openItem )

})

.key( 'esc', function( e ){

  cancelCuttedItems();

  if( $(e.target).is('textarea') ){
    hideRenameTextarea( true );
  }else{
    selectIcon( e );
  }

})

.key( 'shift', null, null, null, function( e ){

  if( $(e.target).is('textarea') ){
    e.stopPropagation();
  }else if( currentLastDirtyClicked ){

    currentLastPureClicked = currentLastDirtyClicked;
    currentLastDirtyClicked = null;

  }

})

.key( 'left, right', null, function( e ){

  if( !$(e.target).is('textarea') ){

    var direction     = e.keyCode === 37 ? -1 : 1;
    var itemClickedId = currentList.indexOf( currentLastPureClicked ) + direction;
    itemClickedId     = itemClickedId < 0 ? 0 : itemClickedId;

    if( !currentList[ itemClickedId ] ){
      return;
    }

    e.metaKey  = false;
    e.ctrlKey  = false;
    e.shiftKey = false;

    selectIcon( e, currentList[ itemClickedId ] );
    makeIconVisible( currentList[ itemClickedId ] );

  }

})

.key( 'up, down', function( e ){

  if( !$(e.target).is('textarea') ){

    var grid          = calculateGrid();
    var direction     = grid.iconsInRow * ( e.keyCode === 38 ? -1 : 1 );
    var itemClickedId = currentList.indexOf( currentLastPureClicked ) + direction;

    if( !currentLastPureClicked ){

      if( direction < 0 ){
        itemClickedId = currentList.length - 1;
      }else{
        itemClickedId = 0;
      }

    }

    if( !currentList[ itemClickedId ] ){
      return;
    }

    e.metaKey  = false;
    e.ctrlKey  = false;
    e.shiftKey = false;

    selectIcon( e, currentList[ itemClickedId ] );
    makeIconVisible( currentList[ itemClickedId ] );

  }

})

.key( 'a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z,0,1,2,3,4,5,6,7,8,9,space', function( e ){

  if( !$(e.target).is('textarea') ){

    clearTimeout( currentGoToItemTimer );

    if( e.metaKey || e.ctrlKey || e.shiftKey ){
      return;
    }

    currentGoToItemString += e.key || String.fromCharCode( ( 96 <= e.which && e.which <= 105 ) ? e.which - 48 : e.which );
    currentGoToItemTimer   = setTimeout( clearGoToItemString, 1000 );
    var found              = false;

    if( currentLastPureClicked && currentLastPureClicked.fsnode.type === TYPE_FILE ){

      if( found = findIconWithSimilarName( currentList.filter( function( item ){ return item.fsnode.type === TYPE_FILE; }), currentGoToItemString ) ){
        selectIcon( e, found );
        return makeIconVisible( found );
      }

      if( found = findIconWithSimilarName( currentList.filter( function( item ){ return item.fsnode.type !== TYPE_FILE; }), currentGoToItemString ) ){
        selectIcon( e, found );
        return makeIconVisible( found );
      }

    }else{

      if( found = findIconWithSimilarName( currentList.filter( function( item ){ return item.fsnode.type !== TYPE_FILE; }), currentGoToItemString ) ){
        selectIcon( e, found );
        return makeIconVisible( found );
      }

      if( found = findIconWithSimilarName( currentList.filter( function( item ){ return item.fsnode.type === TYPE_FILE; }), currentGoToItemString ) ){
        selectIcon( e, found );
        return makeIconVisible( found );
      }

    }

    selectIcon( e, currentList[ currentList.length - 1 ] );
    makeIconVisible( currentList[ currentList.length - 1 ] );

  }

})

.key( 'ctrl+a, cmd+a', function( e ){

  if( !$(e.target).is('textarea') ){
    selectAllIcons()
  }

});

visualSidebarItemArea
.on( 'click', '.ui-navgroup-element', function(){
  openFolder( $(this).data('fsnode').id );
})

.on( 'contextmenu', '.ui-navgroup-element', function(){
  generateContextMenu({ fsnode : $(this).data('fsnode') }, { inSidebar : true })
})

.on( 'wz-dropenter', '.ui-navgroup-element', function( e, item ){
  $(this).addClass('dropover');
  border = 0;
})

.on( 'wz-dropleave', '.ui-navgroup-element', function( e, item ){
  $(this).removeClass('dropover');
  border = 0;
})

.on( 'wz-drop', '.ui-navgroup-element', function( e, item, list ){

  var destiny = $(this).removeClass('dropover').data('id');

  list.filter( function( item ){
    return item.fsnode.parent !== destiny && item.fsnode.id !== destiny;
  }).forEach( function( item ){

    if ( item.fsnode.parent != destiny ) {
      item.fsnode.move( destiny, function(){
        console.log( arguments );
      });
    }

  });

});

visualHistoryBack.on( 'click', historyGoBack );
visualHistoryForward.on( 'click', historyGoForward );

visualBreadcrumbs.on( 'click', '.entry:not(.current, .list-trigger)', function(){
  openFolder( $(this).data('id') );
});

visualBreadcrumbsList
.on( 'mousedown', '.entry', function( e ){
  e.stopPropagation()
})

.on( 'click', '.entry', function(){
  win.trigger('mousedown')
});

visualBreadcrumbs.on( 'click', '.list-trigger', function(){

  var position = $(this).position();

  visualBreadcrumbsList.css({
    display : 'block',
    left : parseInt( position.left ),
    top : position.top + 20
  });

  win.one( 'mousedown', function(){
    visualBreadcrumbsList.css( 'display', 'none' )
  })

});

visualCreateFolderButton.on( 'click', createFolder );

visualDeleteButton.on( 'click', function(){
  deleteAll()
});

visualDownloadButton.on( 'click', function(){
  downloadAll()
});

visualSortPreferenceButton.on( 'click', function(){

  sortOptions.css( 'display', 'block' );

  win.one( 'mousedown', function( e ){
    /*
    if ( $( e.target ).hasClass( 'sort-preference' ) || $( e.target ).parent().hasClass( 'sort-preference' ) ) {
      visualSortPreferenceButton.addClass( 'disabled' );
    }
    */
    sortOptions.css( 'display', 'none' );

  })

});

sortOptions.on( 'mousedown', function( e ){
  e.stopPropagation()
})

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
  addScroll( y );
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

  if( ( !currentList.length && !selectDragOrigin ) || selectDragOrigin ){
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

  if( itemClicked ){
    makeIconVisible( itemClicked );
  }else if( e.button === 0 && enabledMultipleSelect ){

    var offset = visualItemArea.offset();
    selectDragOrigin = { x : e.clientX - offset.left, y : e.clientY - offset.top - currentScroll };
    startListeningMove();

  }

  selectIcon( e, itemClicked );

})

.on( 'contextmenu', function( e ){
  generateContextMenu( getIconWithMouserOver( e ) )
})

.on( 'dblclick', function( e ){

  if( !currentList.length ){
    return
  }

  var itemClicked = getIconWithMouserOver( e );

  if( !itemClicked || ( disabledFileIcons && itemClicked.fsnode.type === TYPE_FILE ) ){
    return
  }

  openItem( itemClicked )

})

.on( 'wz-dropenter', function( e, item ){

  var itemOver = getIconWithMouserOver( e );

  dropActive = itemOver || true;
  border = 0;
  requestDraw();

})

.on( 'wz-dropover wz-dropmove', function( e, item, list ){

  var itemOver = getIconWithMouserOver( e );
  dropIgnore = list || [];

  if( itemOver && ( itemOver.fsnode.type === TYPE_FILE || dropIgnore.indexOf( itemOver ) !== -1 ) ){
    itemOver = true;
  }

  if( dropActive !== itemOver ){

    dropActive = itemOver || true;

    requestDraw();

  }

})

.on( 'wz-dropleave', function( e, item ){

  dropActive = false;
  dropIgnore = [];
  border = 0;
  requestDraw();

})

.on( 'wz-drop', function( e, item, list ){

  var itemOver = getIconWithMouserOver( e );

  if( item === 'fileNative' ){
    $(this).data( 'wz-uploader-destiny', itemOver && itemOver.fsnode.type !== TYPE_FILE ? itemOver.fsnode.id : currentOpened.id );
  }else{

    var destiny = itemOver && itemOver.fsnode.type !== TYPE_FILE ? itemOver.fsnode.id : currentOpened.id;

    list.filter( function( item ){
      return item.fsnode.parent !== destiny && item.fsnode.id !== destiny;
    }).forEach( function( item ){

      if ( item.fsnode.parent != destiny ) {
        item.fsnode.move( destiny, function(){
          console.log( arguments );
        });
      }

    });

  }

  dropActive = false;
  border = 0;
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
      'background'    : BLUEUI,
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
        'width'               : '17px',
        'height'              : '17px',
        'margin-right'        : '10px',
        'background-image'    : 'url(https://static.horbito.com/app/377/img/sprite.png)',
        'background-position' : '-32px 0',
        'background-size'     : '67px 18px',
        'background-repeat'   : 'no-repeat'

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
        'background-image'    : 'url(' + currentLastPureClicked.fsnode.icons.micro + ')',
        'background-position' : 'center center',
        'background-size'     : 'contain',
        'background-repeat'   : 'no-repeat'

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

visualRenameTextarea
.on( 'blur', function(){

  if( !visualRenameTextarea.hasClass('active') ){
    return;
  }

  hideRenameTextarea();

})

.on( 'paste', function(){
  visualRenameTextarea.val( visualRenameTextarea.val().replace( /(?:\r\n|\r|\n)/g, ' ' ) );
});

visualDestinyNameInput
.on( 'keydown', function( e ){
  e.stopPropagation()
})

visualAcceptButton
.on( 'click', acceptButtonHandler );

visualCancelButton
.on( 'click', cancelButtonHandler );

notificationBellButton
.on( 'click' , function(){

  if ( $( '.share-notification:not(.wz-prototype)' ).length > 0 ) {

      if( notificationBellButton.hasClass( 'disabled' ) ){

        notificationBellButton.removeClass( 'disabled' );

      }else{

        $( '.notification-list-container' ).css( 'display', 'block' );

        win.one( 'mousedown', function( e ){

          if ( $( e.target ).hasClass( 'notification-center' ) || $( e.target ).hasClass( 'notification-icon' ) ) {
            notificationBellButton.addClass( 'disabled' );
          }

          $( '.notification-list-container' ).css( 'display', 'none' );

        })

      }

  }else{

      var dialog = api.dialog();

      dialog.setTitle( lang.main.notifications );
      dialog.setText( lang.main.noNotification );
      dialog.setButton( 1, wzLang.core.dialogAccept, 'blue' );

      dialog.render(function( doIt ){

      });

  }

});

$( '.notification-list-container' ).on( 'mousedown', function( e ){
  e.stopPropagation()
})

notificationList
.on( 'click' , '.accept-sharing-button' , function( e ){
  acceptContent( $( this ).closest( '.share-notification' ).data( 'fsnode' ) );
})

.on( 'click' , '.refuse-sharing-button' , function( e ){
  refuseContent( $( this ).closest( '.share-notification' ).data( 'fsnode' ) );
});

sortOptions
.on( 'click' , '.name' ,function(){

  $('.sort-preference span').text( $(this).text() );
  currentSort = sortByName;
  currentList = currentList.sort( currentSort );
  requestDraw();
  sortOptions.css( 'display', 'none' );

})
.on( 'click' , '.size' , function(){

  $('.sort-preference span').text( $(this).text() );
  currentSort = sortBySize;
  currentList = currentList.sort( currentSort );
  requestDraw();
  sortOptions.css( 'display', 'none' );

})
.on( 'click' , '.creation' , function(){

  $('.sort-preference span').text( $(this).text() );
  currentSort = sortByCreation;
  currentList = currentList.sort( currentSort );
  requestDraw();
  sortOptions.css( 'display', 'none' );

})
.on( 'click' , '.modification' , function(){

  $('.sort-preference span').text( $(this).text() );
  currentSort = sortByModif;
  currentList = currentList.sort( currentSort );
  requestDraw();
  sortOptions.css( 'display', 'none' );

})

// Load texts
var translate = function(){

  $('.ui-header-brand').find('.name').text(lang.main.appName);
  $('.ui-input-search').find('input').attr('placeholder', lang.main.search);
  $('.ui-navgroup-title-txt').text(lang.main.favourites);
  $('.status-number').text(lang.main.uploadXFiles);
  $('.ui-confirm .accept span').text( params && params.command === 'selectSource' ? lang.main.select : lang.share.save );
  $('.ui-confirm .cancel span').text(lang.main.cancel);
  $('.ui-confirm').find('.ui-input').find('input').attr('placeholder', lang.main.fileName);
  $('.notification-list-title span').text( lang.main.activity );
  $('.accept-sharing-button span').text( lang.received.contentAccept );
  $('.refuse-sharing-button span').text( lang.received.contentRefuse );
  $('.sort-options .name').text( lang.sortByName );
  $('.sort-options .size').text( lang.sortBySize );
  $('.sort-options .creation').text( lang.sortByCreation );
  $('.sort-options .modification').text( lang.sortByModif );
  $('.sort-preference span').text( lang.sortByName );

};

// Start the app
currentSort = sortByName;
translate();
updateCanvasSize();
clearCanvas();
loadEmptyAnimationImg();
getSidebarItems().then( function( list ){
  list.forEach( appendVisualSidebarItem );
});

if( params ){

  if( params.command === 'selectSource' ||  params.command === 'selectDestiny' ){

    openFolder( params.path || 'root' );

    if( params.command === 'selectDestiny' ){
      setDestinyNameInput()
    }
    $( '.ui-header-brand .select-title' ).text( params.title );

  }else{
    openFolder( typeof params === 'object' ? parseInt( params.data ) || 'root' : params );
  }

}else{
  openFolder('root');
}
