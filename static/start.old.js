
var win                    = $( this );
var getSystemConfiguration = $.Deferred();
var getAppConfiguration    = $.Deferred();

api.config.getConfiguration( function( error, result ){

    // To Do -> Error
    getSystemConfiguration.resolve( result );

});

wql.getConfig( function( error, result ){

    // To Do -> Error
    getAppConfiguration.resolve( result );

});

$.when( getSystemConfiguration, getAppConfiguration ).done( function( systemConfig, appConfig ){

    // Importamos la configuración del sistema
    api.app.storage( 'displayExtensions', systemConfig.displayExtensions );

    // Importamos la configuración de la cuenta
    if( appConfig.length ){

        appConfig = appConfig[ 0 ];

        // Guardamos la configuración
        api.app.storage( 'sortType', appConfig.sort );
        api.app.storage( 'viewType', appConfig.view );
        api.app.storage( 'sidebar', !!appConfig.sidebar );

    }else{

        wql.insertConfig();

        // Guardamos la configuración
        api.app.storage( 'sortType', 0 );
        api.app.storage( 'viewType', 0 );
        api.app.storage( 'sidebar', true );

        appConfig = {

            height : win.height(),
            width  : win.width()

        };

    }

    // Añadimos el sidebar si está activado
    if( api.app.storage('sidebar') ){

        win.addClass('sidebar');

        var sidebarWidth = $( '.weexplorer-sidebar', win ).outerWidth( true );

        $( '.weexplorer-main', win ).width( '-=' + sidebarWidth + 'px' ).width();
        $( '.weexplorer-folder', win ).width( '-=' + sidebarWidth + 'px' ).width();
        $( '.weexplorer-file-zone', win ).width( '-=' + sidebarWidth + 'px' ).width();

    }

    // Redimensionamos la ventana
    api.fit( win, appConfig.width - win.width(), appConfig.height - win.height() );

    start();

});
