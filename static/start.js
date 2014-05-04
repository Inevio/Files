
var win = $( this );

wql.getConfig( function( error, result ){

    if( !error && result.length ){

        result = result[ 0 ];

        // Guardamos la configuración
        wz.app.storage( 'sortType', result.sort );
        wz.app.storage( 'viewType', result.view );
        wz.app.storage( 'sidebar', !!result.sidebar );

    }else{

        wql.insertConfig();

        // Guardamos la configuración
        wz.app.storage( 'sortType', 0 );
        wz.app.storage( 'viewType', 0 );
        wz.app.storage( 'sidebar', true );

        result = {

            height : win.height(),
            width  : win.width()

        };

    }

    // Añadimos el sidebar si está activado
    if( wz.app.storage('sidebar') ){

        win.addClass('sidebar');

        var sidebarWidth = $( '.weexplorer-sidebar', win ).outerWidth( true );

        $( '.weexplorer-main', win ).width( '-=' + sidebarWidth + 'px' ).width();
        $( '.weexplorer-folder', win ).width( '-=' + sidebarWidth + 'px' ).width();
        $( '.weexplorer-file-zone', win ).width( '-=' + sidebarWidth + 'px' ).width();

    }

    // Redimensionamos la ventana
    wz.fit( win, result.width - win.width(), result.height - win.height() );

    start();

});
