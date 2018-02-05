
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

// Events
main.on('update', function(e, data){
  update( data.totalProgress, data.completedItems, data.totalItems, data.eta )
  sourceDom.text( data.origin )
  destinyDom.text( data.destiny.name )
})

main.on('error', function(e, data){

  if (data.error.conflicts) {

    data.error.conflicts.forEach(function(conflict){

      var dialog = api.dialog();

      dialog.setTitle( lang.alreadyExists );
      dialog.setText( lang.whatToDo );
      dialog.setButton( 0, lang.omit, 'black' );
      dialog.setButton( 1, lang.replace, 'blue' );
      dialog.setButton( 2, lang.dontReplace, 'blue' );

      dialog.render(function( doIt ){

        params.callback( params.toMove, params.destiny.id, {origin: params.origin, destiny: params.destiny.name, replacementPolicy: doIt+1},params.destiny.account, function (err, taskProgressId) {

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

            api.app.removeView( $('.progress-container-' + data.id).parent() )

          })

      })

    })

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
update( params.porcentage, params.completedItems, params.totalItems )
