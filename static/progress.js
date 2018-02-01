
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
api.taskProgress
.on( 'update', function( data ){

  if( data.id === params.id ){
    update( data.totalProgress, data.completedItems, data.totalItems, data.eta )
  }

})
.on( 'error', function( data ){
  console.log( data )
})
.on( 'finish', function( data ){
  api.app.removeView( win )
  console.log( data )
})

// Initial data
sourceDom.text('Origen')
toDom.text( lang.progress.to )
destinyDom.text( params.destiny )
remainingDom.text( lang.progress.remaining )
update( 0, 0, params.totalItems )
