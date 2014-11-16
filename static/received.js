    
    var win = $( this );
    
    wz.fs( params, function( error, structure ){
        
        if( error ){
            return alert( lang.error );
        }

        wz.user( structure.metadata.inbox.sender, function( error, user ){
            $( '.received-content-info.who', win ).text( lang.sentBy + ' ' + user.fullName );
        });
        
        var date = new Date( parseInt( structure.metadata.inbox.time, 10 ) );
        
        $( '.received-content-info.date', win ).text( ' ' + lang.on + ' ' + date.toLocaleDateString() );
        
        var hour = date.getHours();
            if( hour < 10 ){ hour = '0' + hour; }
        var minute = date.getMinutes();
            if( minute < 10 ){ minute = '0' + minute; }
        var second = date.getSeconds();
            if( second < 10 ){ second = '0' + second; }
        
        $( '.received-content-info.hour', win ).text( ' ' + lang.at + ' ' + hour + ':' + minute + ':' + second );
        $( '.received-content-name', win ).text( structure.name );
        $( '.received-content-size', win ).text( wz.tool.bytesToUnit( structure.size, 2 ) );
        $( '.received-content-message', win ).text( structure.metadata.inbox.message );
        
        win
        .on( 'mousedown', '.received-content-accept', function(){

            structure.accept( function( error ){

                if( error ){
                    alert( error, wz.view.remove );
                }else{

                    wz.banner()
                        .setTitle( lang.fileShareAccepted )
                        .setText( structure.name + ' ' + lang.beenAccepted )
                        .setIcon( 'https://static.inevio.com/app/1/file_accepted.png' )
                        .render();

                    wz.view.remove();

                }

            });

        })
    
        .on( 'mousedown', '.received-content-refuse', function(){

            structure.refuse( function( error ){

                if( error ){
                    alert( error, wz.view.remove );
                }else{

                    wz.banner()
                        .setTitle( lang.fileShareRefused )
                        .setText( structure.name + ' ' + lang.beenRefused )
                        .setIcon( 'https://static.inevio.com/app/1/file_denied.png' )
                        .render();

                    wz.view.remove();

                }

            });
            
        });

    });

    $( '.received-file', win ).text( lang.receivedFile );
    $( '.received-content-accept', win ).text( lang.contentAccept );
    $( '.received-content-refuse', win ).text( lang.contentRefuse );
