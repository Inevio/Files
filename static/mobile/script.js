
    // Local variables
    var win       = $( this );
    var content   = $( '#weexplorer-content', win );
    var itemProto = $( '.weexplorer-element.wz-prototype', win );
    var itemBack  = $( '.weexplorer-element.back', win );

    // Functions
    var icon = function( data ){

        // Clone prototype
        var file = itemProto.clone().removeClass('wz-prototype');

        // Insert data
        file.find('.weexplorer-element-name').text( data.name );
        file.find('.weexplorer-element-icon').attr('src',data.icons.small);
        file.data( 'id', data.id );

        console.log( data );

        // Return icon
        return file;

    };

    var iconBack = function(){
        // To Do
    };

    var openDirectory = function( id ){
        
        wz.structure( id, function( error, structure ){

            // To Do -> Error

            structure.list( function( error, list ){

                // To Do -> Error

                content.children().not( itemProto ).remove();

                var icons = $();

                for( var i in list ){
                    icons = icons.add( icon( list[ i ] ) );
                }

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

    $( '#weexplorer-content' ).on( 'tap', '.weexplorer-element', function(){

        wz.structure( $(this).data('id'), function( error, structure ){

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
