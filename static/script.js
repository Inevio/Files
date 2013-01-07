/*global wz:true $:true */

wz.app.addScript( 1, 'common', function( win ){

    // Variables
    var history = [];

    var fileArea      = $( '.weexplorer-file-area', win );
    var filePrototype = $( '.weexplorer-file.prototype', win );

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

    var openDirectory = function( id ){

        // Get Structure Info
        wz.structure( id, function( error, structure ){

            if( error ){
                return false;
            }

            addToHistory( id );
            
            // List Structure Files
            structure.list( function( error, list ){
                
                var length = list.length;
                var file   = null;
                var files  = $();

                // Generate File icons
                for( var i = 0; i < length; i++ ){

                    // Clone prototype
                    file = filePrototype.clone().removeClass('prototype');

                    // Add new properties
                    file.children('textarea').text( list[ i ].name );

                    // Add new file to list
                    files = files.add( file );

                }

                // Display icons
                fileArea.append( files );

            });

        });

    };

    // Events
    $( win )
    .on( 'contextmenu', '.weexplorer-file', function(e){

        wz.menu()
            .add('Opción 1')
            .separator()
            .add(Math.random())
            .render();

    });

    // Start Window
    openDirectory( 'root' );

});
