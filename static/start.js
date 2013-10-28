
//var app            = this;
// To Do -> Real app var
var app = {};
var win = $( this );

wql.getConfig( function( error, result ){

    if( result.length ){

        result = result[ 0 ];

        // Guardamos la configuración
        app.sortType = result.sort;
        app.sidebar  = Boolean( result.sidebar );
        app.viewType = result.view;

    }else{

        wql.insertConfig();

        // Guardamos la configuración
        app.sortType = 0;
        app.sidebar  = 1;
        app.viewType = 0;

        result = {

            height : win.height(),
            width  : win.width()

        };

    }

    // Redimensionamos la ventana
    wz.fit( win, result.width - win.width(), result.height - win.height() );

    // Añadimos el sidebar si está activado
    if( app.sidebar ){

        win.addClass('sidebar');

        var sidebarWidth = $( '.weexplorer-sidebar', win ).outerWidth( true );

        $( '.weexplorer-main', win ).width( '-=' + sidebarWidth + 'px' );
        $( '.weexplorer-folder', win ).width( '-=' + sidebarWidth + 'px' );
        $( '.weexplorer-file-zone', win ).width( '-=' + sidebarWidth + 'px' );

    }

    start();

});
