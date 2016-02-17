
    // Local variables
    var win            = $( this );
    var content        = $( '#weexplorer-content', win );
    var itemProto      = $( '.weexplorer-element.wz-prototype', win );
    var itemBack       = $( '.weexplorer-element.back', win );
    var title          = $( '#weexplorer-menu-name', win );
    var sidebar        = $( '#weexplorer-sidebar', win );
    var sidebarElement = $( '.weexplorer-sidebar-element.wz-prototype', sidebar );
    var record         = [];

    // Functions
    var icon = function( data ){

        // Clone prototype
        var file = itemProto.clone().removeClass('wz-prototype');

        // Insert data
        file.find('.weexplorer-element-name').text( data.name );
        file.find('.weexplorer-element-data').text( api.tool.bytesToUnit( data.size ) );
        file.find('.weexplorer-element-icon').attr('src',data.icons.small);
        file.data( 'id', data.id );

        if( data.type < 2 ){
            file.addClass('directory');
        }else{
            file.addClass('file');
        }

        // Return icon
        return file;

    };

    var iconBack = function(){

        if( record.length < 2 ){
            itemBack.css( 'display', 'none' );
        }else{

            itemBack
                .css( 'display', 'block' )
                .children( '#weexplorer-back-text' )
                    .text( 'Back to ' + record[ 1 ].name );

        }

    };

    var openDirectory = function( id, jump, clear ){

        api.fs( id, function( error, structure ){

            if( !jump ){

                if( clear ){
                    record = [];
                }

                record.unshift( { id : structure.id, name : structure.name } );

            }

            // To Do -> Error

            title.text( structure.name );
            sidebar
                .children()
                    .removeClass('active')
                    .filter('.folder-' + structure.id )
                        .addClass('active');

            structure.list( function( error, list ){

                // To Do -> Error

                content.children().not( itemProto ).not( itemBack ).remove();

                var icons = $();

                for( var i in list ){
                    icons = icons.add( icon( list[ i ] ) );
                }

                iconBack();
                content.append( icons );

            });

        });

    };

    // Events
    $( '#weexplorer-menu-sidebar' ).on( 'tap', function(){

        $( '#weexplorer-sidebar' ).transition({ left : 0 }, 200, function(){
            win.addClass( 'sidebar' );
        });

    });

    $( '#weexplorer-sidebar' ).on( 'tap', function( e ){
        e.stopPropagation();
    });

    $( '#weexplorer-content' )
    .on( 'tap', '.weexplorer-element', function(){

        api.fs( $(this).data('id'), function( error, structure ){

            if( error ){
                return false; // To Do -> Error
            }

            // Abrir directorios
            if( structure.type <= 1 ){
                openDirectory( structure.id );
            }else{

                structure.open( function( error ){
                    // To Do -> Error
                });

            }

        });

    })

    .on( 'tap', '.weexplorer-element-options', function( e ){

        e.stopPropagation();

        console.log( $(this).parent().data() );

        api.fs( $(this).parent().data('id'), function( error, structure ){
            console.log( structure );
        });

    });

    itemBack.on( 'tap', function(){

        record.shift();
        openDirectory( record[ 0 ].id, true );

    });

    sidebar.on( 'tap', '.weexplorer-sidebar-element', function(){

        if( !$(this).hasClass('active') ){
            openDirectory( $(this).data('fileId'), false, true );
        }

        win.trigger('tap');

    });

    win.on( 'tap', function(){

        if( win.hasClass( 'sidebar' ) ){

            $( '#weexplorer-sidebar' ).transition({ left : '-80%' }, 200, function(){
                win.removeClass( 'sidebar' );
            });

        }

    });

// Start app
    openDirectory( 'root' );

    /* GENERATE SIDEBAR */

    // Esta parte la comento porque usa promesas y puede resultar un poco rara si no se han usado nunca
    // Sacamos las estructuras del sidebar asíncronamente
    // Para ello primero generamos 5 promesas
    var rootPath   = $.Deferred(); // Para la carpeta del usuario
    var hiddenPath = $.Deferred(); // Para las carpetas escondidas
    var inboxPath  = $.Deferred(); // Para la carpeta de inbox
    var sharedPath = $.Deferred(); // Para la carpeta de compartidos
    var customPath = $.Deferred(); // Para las carpetas que haya añadido el usuario

    // Y determinamos que pasará cuando se cumplan esas promesas, en este caso, generamos el sidebar
    $.when( rootPath, hiddenPath, inboxPath, sharedPath, customPath ).then( function( rootPath, hiddenPath, inboxPath, sharedPath, customPath ){

        // AVISO -> hiddenPath es un array
        // Ponemos al principio rootPath, inboxPath y sharedPath
        hiddenPath.unshift( rootPath, inboxPath, sharedPath );

        // Y concatenamos con el listado de carpetas personalizadas
        hiddenPath = hiddenPath.concat( customPath );

        // Y generamos el sidebar
        hiddenPath.forEach( function( element ){

            var controlFolder = sidebarElement.clone().removeClass('wz-prototype');

            controlFolder
                .data( 'file-id', element.id )
                .addClass( 'wz-drop-area folder-' + element.id )
                .find( 'span' )
                    .text( element.name );

            if( element.id === api.system.user().rootPath ){
                controlFolder.removeClass( 'folder' ).addClass( 'userFolder user' );
            }else if( element.id === api.system.user().inboxPath ){
                controlFolder.addClass( 'receivedFolder' );
                //notifications();
            }else if( element.id === 'shared' ){
                controlFolder.addClass( 'sharedFolder' );
            }

            if( element.name === 'Documents' || element.name === 'Documentos' ){
                controlFolder.removeClass( 'folder' ).addClass( 'doc' );
            }else if( element.name === 'Music' || element.name === 'Música' ){
                controlFolder.removeClass( 'folder' ).addClass( 'music' );
            }else if( element.name === 'Images' || element.name === 'Imágenes' ){
                controlFolder.removeClass( 'folder' ).addClass( 'photo' );
            }else if( element.name === 'Video' || element.name === 'Vídeos' ){
                controlFolder.removeClass( 'folder' ).addClass( 'video' );
            }

            sidebar.append( controlFolder );

        });

        sidebar.find( '.folder-' + record[ 0 ].id ).addClass('active');

    } );

    // Ahora que ya tenemos definido que va a pasar ejecutamos las peticiones para cumplir las promesas
    api.fs( 'root', function( error, structure ){

        // Ya tenemos la carpeta del usuario, cumplimos la promesa
        rootPath.resolve( structure );

        structure.list( true, function( error, list ){

            // Vamos a filtrar la lista para quedarnos solo con las carpetas ocultas, es decir, de tipo 7
            list = list.filter( function( item ){
                return item.type === 7;
            });

            // Ya tenemos las carpetas ocultas, cumplimos la promesa
            hiddenPath.resolve( list );

        });

    });

    api.fs( 'inbox', function( error, structure ){

        // Ya tenemos la carpeta de recibidos, cumplimos la promesa
        inboxPath.resolve( structure );

    });

    api.fs( 'shared', function( error, structure ){

        // Ya tenemos la carpetas de compartidos, cumplimos la promesa
        sharedPath.resolve( structure );

    });

    wql.getSidebar( function( error, rows ){

        // Si hay algún error o no hay carpetas damos la promesa por cumplida
        if( error || !rows.length ){
            customPath.resolve( [] );
            return false;
        }

        // Si hay carpetas las cargamos asíncronamente, hacemos un array con promesas
        // Estas promesas se irán cumpliendo según se hayan devuelto todos los datos del servidor
        var folders = [];

        rows.forEach( function( item ){

            var promise = $.Deferred();

            // Añadimos la promesa al array
            folders.push( promise );

            api.fs( item.folder, function( error, structure ){

                if( error ){
                    promise.resolve( null );
                }else{
                    promise.resolve( structure );
                }

            });

        });

        // Definimos que ocurrirá cuando todas las promesas de listar los directorios ocurran
        $.when.apply( null, folders ).done( function(){

            // Como el resultado puede cambiar de número tenemos que hacernos un recorrido de arguments
            // IMPORTANTE arguments no es un array aunque tiene ciertos comportamientos similares
            // Hay que convertir arguments a un array, y de paso, descartamos las estructuras incorrectas

            var folders = [];

            for( var i in arguments ){

                if( arguments[ i ] !== null ){
                    folders.push( arguments[ i ] );
                }

            }

            // Y damos como cumplida la promesa de cargar los directorios personalizados del usuario
            customPath.resolve( folders );

        });

    });
