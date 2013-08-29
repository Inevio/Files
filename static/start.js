
wql.getConfig( function( error, result ){

	console.log( error, result );

    if( result.length ){

    	result = result[ 0 ];

    	win
    		.width( result.width )
    		.height( result.height );

    	if( result.sidebar ){
	    	win.addClass('sidebar');
	    }

    	/*
        win.addClass('sidebar').css( 'width', '' );

        saveBaseWidth( [ win, winMenu, wxpMenu, fileArea, folderMain, folderBar ] );
        saveBaseOuterWidth( [ win, winMenu, wxpMenu, fileArea, folderMain, folderBar ] );

        if( result[0].sidebar ){
            $( '.weexplorer-menu-toggle', wxpMenu ).mousedown();
            setTimeout( function(){
                wz.fit( win, result[0].width - win.width(), result[0].height - win.height() );
            }, 300 );
        }else{
            wz.fit( win, result[0].width - win.width(), result[0].height - win.height() );
        }

        if( result[0].view ){
            views.mousedown();
        }

        sortType = result[0].sort;

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

    console.log(1);

});

wql.getSidebar( function( error, result ){

	/*
    var elementFolder = sidebarElement.clone().removeClass('wz-prototype');

    result.forEach( function( result ){

        var controlFolder = elementFolder.clone();

        wz.structure( result.folder, function( error, structure ){

            controlFolder.data( 'file-id', structure.id ).addClass( 'wz-drop-area folder-' + structure.id ).children( 'span' ).text( structure.name );

            if( structure.id === wz.info.user().rootPath ){
                controlFolder.addClass( 'userFolder' );
            }else if( structure.id === wz.info.user().receivedPath ){
                controlFolder.addClass( 'sharedFolder' );
                sharedNotifications();
            }else if( structure.id === wz.info.user().sharedPath ){
                controlFolder.addClass( 'receivedFolder' );
                notifications();
            }

            if( result.order === 0 ){
                controlFolder.addClass( 'active' );
            }

            sidebar.append( controlFolder );

        });

    });
	*/

    console.log(2);

});

start();
