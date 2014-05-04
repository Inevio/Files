
var win = $( this );

var _fit_baseWidth = function( object, newValue ){

    object = $( object );

    if( typeof newValue !== 'undefined' ){
        object.data( 'wz-fit-base-width', newValue );
        return;
    }

    var value = object.data('wz-fit-base-width');

    if( !value ){
        
        value = object.width();

        object.data( 'wz-fit-base-width', value );

    }

    return value;

};

var _fit_baseHeight = function( object, newValue ){

    object = $( object );

    if( typeof newValue !== 'undefined' ){
        object.data( 'wz-fit-base-height', newValue );
        return;
    }

    var value = object.data('wz-fit-base-height');

    if( !value ){
        
        value = object.height();

        object.data( 'wz-fit-base-height', value );

    }

    return value;

};

var _fit_baseOuterWidth = function( object, newValue ){

    object = $( object );

    if( typeof newValue !== 'undefined' ){
        object.data( 'wz-fit-base-outerWidth', newValue );
        return;
    }

    var value = object.data('wz-fit-base-outerWidth');

    if( !value ){
        
        value = _fn.tool.outerFullWidth( object );

        object.data( 'wz-fit-base-outerWidth', value );

    }

    return value;

};

var _fit_baseOuterHeight = function( object, newValue ){

    object = $( object );

    if( typeof newValue !== 'undefined' ){
        object.data( 'wz-fit-base-outerHeight', newValue );
        return;
    }

    var value = object.data('wz-fit-base-outerHeight');

    if( !value ){
        
        value = _fn.tool.outerFullHeight( object );

        object.data( 'wz-fit-base-outerHeight', value );

    }

    return value;

};

wql.getConfig( function( error, result ){

    if( result.length ){

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

    // Redimensionamos la ventana
    console.log( result, result.width - win.width(), result.height - win.height() );
    wz.fit( win, result.width - win.width(), result.height - win.height() );

    // Añadimos el sidebar si está activado
    if( wz.app.storage('sidebar') ){

        win.addClass('sidebar');

        var sidebarWidth = $( '.weexplorer-sidebar', win ).outerWidth( true );

        _fit_baseWidth( $( '.weexplorer-main', win ), $( '.weexplorer-main', win ).width( '-=' + sidebarWidth + 'px' ).width() );
        _fit_baseWidth( $( '.weexplorer-folder', win ), $( '.weexplorer-folder', win ).width( '-=' + sidebarWidth + 'px' ).width() );
        _fit_baseWidth( $( '.weexplorer-file-zone', win ), $( '.weexplorer-file-zone', win ).width( '-=' + sidebarWidth + 'px' ).width() );

    }

    // wz.fit( win, result.width - win.width(), result.height - win.height() );

    start();

});
