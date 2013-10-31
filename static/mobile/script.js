
var win = $( this );

$( '#weexplorer-menu-sidebar' ).on( 'tap', function(){

    $( '#weexplorer-sidebar' ).transition({ left : 0 }, 200, function(){
        win.addClass( 'sidebar' );
    });

});

$( '#weexplorer-sidebar' ).on( 'tap', function( e ){
    e.stopPropagation();
});

win.on( 'tap', function(){

    if( win.hasClass( 'sidebar' ) ){

        $( '#weexplorer-sidebar' ).transition({ left : '-80%' }, 200, function(){
            win.removeClass( 'sidebar' );
        });

    }

});

