
// DOM
var win = $(this)
var percentageDom = $('.percentage')
var operationDom = $('.operation')
var sourceDom = $('.source-text')
var toDom = $('.to')
var destinyDom = $('.destiny-text')
var loadingDom = $('.loading-layer')
var timeDom = $('.time')
var remainingDom = $('.time-remaining')
var main = $('.progress-container')

// Functions
var update = function( percentage, completedItems, totalItems, eta ){

  percentage = parseFloat( ( percentage * 100 ).toFixed( 2 ) )
  percentageDom.text( lang.progress.percentage.replace( '%d', percentage ) )
  loadingDom.width( percentage + '%' )

  if( totalItems === 1 ){
    operationDom.text( lang.progress.copyingSingle.replace( '%d', totalItems ) )
  }else{
    operationDom.text( lang.progress.copyingMultiple.replace( '%d', completedItems + 1 ).replace( '%d', totalItems ) )
  }

  if( typeof eta !== 'undefined' ){
    timeDom.text( toHumanTime( eta ) )
  }else{
    timeDom.text( lang.progress.calculating )
  }

}

var toHumanTime = function( ms ){

  var s = Math.ceil( ms / 1000 )
  var seconds = parseInt( s % 60 )
  var minutes = parseInt( s / 60 )
  var hours   = parseInt( s / 3600 )
  var res     = ''

  if( hours ){
    res += hours + ' ' + (hours === 1 ? lang.progress.hour : lang.progress.hours )
    if( minutes ){ res += ' ' + minutes + ' ' + (minutes === 1 ? lang.progress.minute : lang.progress.minutes ) }
  }else if( minutes ){
    res += minutes + ' ' + (minutes === 1 ? lang.progress.minute : lang.progress.minutes )
    if( seconds ){ res += ' ' + seconds + ' ' + (seconds === 1 ? lang.progress.second : lang.progress.seconds ) }
  }else{
    res += seconds + ' ' + (seconds === 1 ? lang.progress.second : lang.progress.seconds )
  }

  return res

}

var asyncEach = function( list, step, callback ){

  var position = 0;
  var closed   = false;
  var checkEnd = function( error ){

    if( closed ){
      return;
    }

    position++;

    if( position === list.length || error ){

      closed = true;

      callback( error );

      // Nullify
      list = step = callback = position = checkEnd = closed = null;

    }

  };

  if( !list.length ){
    return callback();
  }

  list.forEach( function( item ){
    step( item, checkEnd );
  });

}

var resendTransferation = function(conflictsSolution){

  api.app.removeView( $('.progress-container-' + params.id).parent() )

  params.callback( params.toMove, params.destiny.dropbox === true ? params.destiny.path_display : params.destiny.id, {origin: params.origin, destiny: params.destiny, replacementPolicy: conflictsSolution},params.destiny.account, function (err, taskProgressId) {

      api.app.createView({
        id : taskProgressId,
        totalItems : params.totalItems,
        destiny : params.destiny,
        porcentage: params.porcentage,
        completedItems: params.completedItems,
        origin: params.origin,
        callback: params.callback,
        toMove: params.toMove
      }, 'progress' )

    });

}

var checkConflicts = function(conflicts){

  var conflictsSolution = {};

  api.view.setSize( 525, 274 )
  $('.conflict-container').transition({
    'transform'  : 'translate(0, 0)'
  }, 200, 'ease');

  asyncEach(conflicts, function(conflict, finish){

    var conflictDom = $('.conflict.wz-prototype').clone().removeClass('wz-prototype');

    if (conflict.type === 'file') {
      conflictDom.find('.destination-conflict').text(lang.destinationConflictFile)
    }else{
      conflictDom.find('.destination-conflict').text(lang.destinationConflictFolder)
    }

    conflictDom.find('.number-conflict').text(lang.conflict + ' ' + (conflicts.indexOf(conflict)+1) + ' ' + lang.of + ' ' + conflicts.length )
    conflictDom.find('.conflict-file .text').text(conflict.name)
    conflictDom.find('.conflict-file').attr('title', $('.destiny').attr('title') + '/' + conflict.name)
    conflictDom.find('.for-all').text(lang.forAll)
    conflictDom.find('.replace-button span').text(lang.replace)
    conflictDom.find('.mantain-button span').text(lang.dontReplace)
    conflictDom.find('.skip-button span').text(lang.skip)

    $('.conflict-container').prepend(conflictDom)

    conflictDom.find('.replace-button span').on('click', function(){

      if ($('.apply-all').hasClass('active')) {
        conflicts.forEach(function(conflict){
          conflictsSolution[conflict.id] = 2
        })
        resendTransferation(conflictsSolution)
        return;
      }

      conflictsSolution[conflict.id] = 2;
      conflictDom.remove();
      finish();
    })

    conflictDom.find('.mantain-button span').on('click', function(){

      if ($('.apply-all').hasClass('active')) {
        conflicts.forEach(function(conflict){
          conflictsSolution[conflict.id] = 3
        })
        resendTransferation(conflictsSolution)
        return;
      }

      conflictsSolution[conflict.id] = 3;
      conflictDom.remove();
      finish();
    })

    conflictDom.find('.skip-button span').on('click', function(){

      if ($('.apply-all').hasClass('active')) {
        conflicts.forEach(function(conflict){
          conflictsSolution[conflict.id] = 1
        })
        resendTransferation(conflictsSolution)
        return;
      }

      conflictsSolution[conflict.id] = 1;
      conflictDom.remove();
      finish();
    })

  }, function(){

    resendTransferation(conflictsSolution)

  })
}


var setTexts = function(data){

  sourceDom.text( data.origin.name )
  toDom.text( lang.progress.to )
  destinyDom.text( data.destiny.name )
  remainingDom.text( lang.progress.remaining )

  // --- Origin ---
  // Dropbox
  if (data.origin.dropbox) {
    api.integration.dropbox( data.origin.account, function( err, account ){

      $('.source .icon').addClass('dropbox')

      if (data.origin.name === 'Dropbox') {
        $('.source').attr('title', account.email + '/' + data.origin.name)
      }else{
        $('.source').attr('title', account.email + pathToString(data.origin.path))
      }

    })
  // Gdrive
  }else if(data.origin.gdrive){
    api.integration.gdrive( data.origin.account, function( err, account ){

      $('.source .icon').addClass('gdrive')

      if (data.origin.name === 'Gdrive') {
        $('.source').attr('title', account.email + '/' + data.origin.name)
      }else{
        $('.source').attr('title', account.email + pathToString(data.origin.path))
      }

    })
  // Onedrive
  }else if(data.origin.onedrive){
    api.integration.onedrive( data.origin.account, function( err, account ){

      $('.source .icon').addClass('onedrive')

      if (data.origin.name === 'OneDrive') {
        $('.source').attr('title', account.email + '/' + data.origin.name)
      }else{
        $('.source').attr('title', account.email + pathToString(data.origin.path))
      }

    })
  // Horbito
  }else{
    $('.source .icon').addClass('horbito')
    $('.source .hover-text span').text(pathToString(data.origin.path))
  }

  // --- Destiny ---
  // Dropbox
  if (data.destiny.dropbox) {
    api.integration.dropbox( data.destiny.account, function( err, account ){

      $('.destiny .icon').addClass('dropbox')

      if (data.destiny.name === 'Dropbox') {
        $('.destiny').attr('title', account.email + '/' + data.destiny.name)
      }else{
        $('.destiny').attr('title', account.email + pathToString(data.destiny.path))
      }

    })
  // Gdrive
  }else if(data.destiny.gdrive){
    api.integration.gdrive( data.destiny.account, function( err, account ){

      $('.destiny .icon').addClass('gdrive')

      if (data.destiny.name === 'Gdrive') {
        $('.destiny').attr('title', account.email + '/' + data.destiny.name)
      }else{
        $('.destiny').attr('title', account.email + pathToString(data.destiny.path))
      }

    })
  // Onedrive
  }else if(data.destiny.onedrive){
    api.integration.onedrive( data.destiny.account, function( err, account ){

      $('.destiny .icon').addClass('onedrive')

      if (data.destiny.name === 'OneDrive') {
        $('.destiny').attr('title', account.email + '/' + data.destiny.name)
      }else{
        $('.destiny').attr('title', account.email + pathToString(data.destiny.path))
      }

    })
  // Horbito
  }else{
    $('.destiny .icon').addClass('horbito')
    $('.destiny .hover-text span').text(pathToString(data.destiny.path))
  }

}

var pathToString = function(path){
  var stringPath = '';
  path.forEach(function(item, index){
    if (index > -1) {
      stringPath += '/' + item.name;
    }
  })
  return stringPath
}

// Events
main.on('update', function(e, data){
  update( data.totalProgress, data.completedItems, data.totalItems, data.eta )
  setTexts(data)
})

main.on('error', function(e, data){

  if (data.error.conflicts) {
    checkConflicts(data.error.conflicts)
  }else if(data.error.quota){

    var dialog = api.dialog();

    dialog.setText( lang.noQuota );
    dialog.setButton( 1, wzLang.core.dialogAccept, 'blue' );

    dialog.render(function( doIt ){
      api.app.removeView( $('.progress-container-' + data.id).parent() )
    });
  }else{
    console.error(data)
    api.app.removeView( $('.progress-container-' + data.id).parent() )
  }

})

// Initial data

setTexts(params);
main.addClass( 'progress-container-' + params.id )
win.parent().addClass('height-transition')
update( params.porcentage, params.completedItems, params.totalItems )
