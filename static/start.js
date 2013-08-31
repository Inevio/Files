
var app = this;

wql.getConfig( function( error, result ){

    if( result.length ){

        result = result[ 0 ];

        // Redimensionamos la ventana
        wz.fit( win, result.width - win.width(), result.height - win.height() );

        // Guardamos la configuración
        app.sortType = result.sort;
        app.sidebar  = Boolean( result.sidebar );

        // Añadimos el sidebar si está activado
        if( result.sidebar ){

            win.addClass('sidebar');

            var sidebarWidth = $( '.weexplorer-sidebar', win ).outerWidth( true );

            $( '.weexplorer-main', win ).width( '-=' + sidebarWidth + 'px' );
            $( '.weexplorer-folder', win ).width( '-=' + sidebarWidth + 'px' );
            $( '.weexplorer-file-zone', win ).width( '-=' + sidebarWidth + 'px' );

            app.sortType = result.sort;


            /*
            saveBaseWidth( [ win, winMenu, wxpMenu, fileArea, folderMain, folderBar ] );
            saveBaseOuterWidth( [ win, winMenu, wxpMenu, fileArea, folderMain, folderBar ] );
            */
		
        }

        /*
        if( result[0].view ){
            views.mousedown();
        }

        if( result[0].sort === 0 ){
            $( '.weexplorer-sort-name', win ).mousedown();
        }else if( result[0].sort === 1 ){
            $( '.weexplorer-sort-size', win ).mousedown();
        }else if( result[0].sort === 2 ){
            $( '.weexplorer-sort-creation', win ).mousedown();
        }else if( result[0].sort === 3 ){
            $( '.weexplorer-sort-modification', win ).mousedown();
        }
        */

    }else{

        wql.insertConfig();

    }

    start();

});
