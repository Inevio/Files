
// DOM
var win = $(this)
var percentageDom = $('.percentage')
var operationDom = $('.operation')
var sourceDom = $('.source')
var toDom = $('.to')
var destinyDom = $('.destiny')
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

};

var resendTransferation = function(conflictsSolution){

  params.callback( params.toMove, params.destiny.id, {origin: params.origin, destiny: params.destiny.name, replacementPolicy: conflictsSolution},params.destiny.account, function (err, taskProgressId) {

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

      api.app.removeView( $('.progress-container-' + params.id).parent() )
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
    conflictDom.find('.conflict-file').text(conflict.name)
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
        api.app.removeView( $('.progress-container-' + params.id).parent() )
        return;
      }

      conflictsSolution[conflict.id] = 1;
      conflictDom.remove();
      finish();
    })

  }, function(){

    // Si todos omitidos no llamar de nuevo
    var solutions = Object.values(conflictsSolution)
    if (solutions.indexOf(2) === -1 && solutions.indexOf(3) === -1) {
      api.app.removeView( $('.progress-container-' + params.id).parent() )
      return
    }

    resendTransferation(conflictsSolution)

  })
}

// Events
main.on('update', function(e, data){
  update( data.totalProgress, data.completedItems, data.totalItems, data.eta )
  sourceDom.text( data.origin )
  destinyDom.text( data.destiny.name )
})

main.on('error', function(e, data){

  if (data.error.conflicts) {
    checkConflicts(data.error.conflicts)
  }else if(data.error.quota){
    alert(lang.noQuota);
    api.app.removeView( $('.progress-container-' + data.id).parent() )
  }else{
    console.error(data)
    api.app.removeView( $('.progress-container-' + data.id).parent() )
  }

})

// Initial data
sourceDom.text( params.origin )
toDom.text( lang.progress.to )
destinyDom.text( params.destiny.name )
remainingDom.text( lang.progress.remaining )
main.addClass( 'progress-container-' + params.id )
win.parent().addClass('with-transition')
update( params.porcentage, params.completedItems, params.totalItems )
