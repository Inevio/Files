/*global wz:true $:true */

wz.app.addScript( 1, 'common', function( win ){

    // Variables
    var history = [];
    var current = 'root';
    var types   = [
                    'weexplorer-file-type-directory',
                    'weexplorer-file-type-special-directory',
                    'weexplorer-file-type-file',
                    'weexplorer-file-type-temporal-file'
                  ];

    // Areas
    var fileArea      = $( '.weexplorer-file-area', win );
    var filePrototype = $( '.weexplorer-file.prototype', win );

    // Menu Buttons
    var uploadButton = $( '.weexplorer-option-upload', win );

    // Functions
    var addToHistory = function( id ){
        // To Do
    };

    var historyBack = function(){
        // To Do
    };

    var historyNext = function(){
        // To Do
    };

    var icon = function( id, name, type ){

        // Clone prototype
        var file = filePrototype.clone().removeClass('prototype');

        // Add new properties
        file.children('textarea').text( name );
        file.addClass( types[ type ] );
        file.addClass( 'weexplorer-file-' + id );
        file.data( 'file-id', id );

        // Return icon
        return file;

    };

    var openDirectory = function( id ){

        // Update current
        current = id;

        // Get Structure Info
        wz.structure( id, function( error, structure ){

            if( error ){
                return false;
            }

            addToHistory( id );
            
            // List Structure Files
            structure.list( function( error, list ){
                                
                var length = list.length;
                var files  = $();

                // Generate File icons
                for( var i = 0; i < length; i++ ){
                    files = files.add( icon( list[ i ].id, list[ i ].name, list[ i ].type ) );
                }

                // Display icons
                fileArea.append( files );

                // Nullify
                files = null;

            });

        });

    };

    var createDirectory = function(){

        wz.structure( current, function( error, structure ){

            // To Do -> Error

            structure.createDirectory( null, function( error, newDirectory ){
                fileArea.append( icon( newDirectory.id, newDirectory.name, newDirectory.type ) );
            });

        });

    };

    var removeStructure = function( id ){

        wz.structure( id, function( error, structure ){

            // To Do -> Error
            
            structure.remove( function( error, quota ){

                if( error ){
                    // To Do -> Error
                }else{
                    fileArea.children( '.weexplorer-file-' + id ).remove();
                }
                console.log('resultado', error, quota);
            });

        });

    };

    // Events
    $( win )

    .on( 'upload-start', function( e, structure ){
        console.log('start',structure);
        //fileArea.append( icon( structure.id, structure.name, structure.type ) );
    })

    .on( 'upload-progress', function( e, structureID, progress ){
        console.log('upload-progress', progress );
        //fileArea.append( icon( structure.id, structure.name, structure.type ) );
    })

    .on( 'upload-end', function( e, structure ){
        console.log('end',structure);
        fileArea.append( icon( structure.id, structure.name, structure.type ) );
    })

    .on( 'dblclick', '.weexplorer-file', function(){

        var id = $(this).data('file-id');

        wz.structure( id, function( error, structure ){

            console.log( structure.formats );

            structure.associatedApp( function( error, app ){

                if( app ){
                    wz.app.createWindow( app, [ id ] );
                }else{
                    alert( error );
                }

            });
            
        });
        
    })

    .on( 'contextmenu', '.weexplorer-file', function( /*e*/ ){

        var icon = $(this);

        wz.menu()
            .add('Renombrar')
            .add('Borrar', function(){
                removeStructure( icon.data('file-id') );
            })
            .render();

    })

    .on( 'mousedown', '.weexplorer-file:not(.active)', function(){
        $( this ).addClass('active');
    });

    fileArea.on( 'contextmenu', function( /*e*/ ){

        wz.menu()
            .add('Subir archivo', function(){
                uploadButton.click();
            })
            .add('Nuevo directorio', function(){
                createDirectory();
            })
            .separator()
            .add('Obtener información')
            .render();

    });

    uploadButton.on( 'click', function( /*e*/ ){
        $(this).data( 'destiny', current );
    });

    // Start Window
    openDirectory( current );

});
