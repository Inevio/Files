
    // Local variables
    var win       = $( this );
    var content   = $( '#weexplorer-content', win );
    var itemProto = $( '.weexplorer-element.wz-prototype', win );
    var itemBack  = $( '.weexplorer-element.back', win );
    var title     = $( '#weexplorer-menu-name', win );
    var record    = [];

    // Functions
    var icon = function( data ){

        // Clone prototype
        var file = itemProto.clone().removeClass('wz-prototype');

        // Insert data
        file.find('.weexplorer-element-name').text( data.name );
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
        
        wz.structure( id, function( error, structure ){

            if( !jump ){

                if( clear ){
                    record = [];
                }

                record.unshift( { id : id, name : structure.name } );

            }

            // To Do -> Error

            title.text( structure.name );
            
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

    itemBack.on( 'tap', function(){
        
        record.shift();
        openDirectory( record[ 0 ].id, true );

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
