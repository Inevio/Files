
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

        console.log( data );

        // Return icon
        return file;

    };

    var iconBack = function(){

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

    win.on( 'tap', function(){

        if( win.hasClass( 'sidebar' ) ){

            $( '#weexplorer-sidebar' ).transition({ left : '-80%' }, 200, function(){
                win.removeClass( 'sidebar' );
            });

        }

    });

    wz.structure( 'root', function( error, structure ){

        structure.list( function( error, list ){

            content.children().not( itemProto ).remove();

            console.log( content );

            var icons = $();

            for( var i in list ){
                icons = icons.add( icon( list[ i ] ) );
            }

            content.append( icons );

        });

    });
