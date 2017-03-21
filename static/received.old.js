
    var win = $( this );

    api.fs( params, function( error, structure ){

        if( error ){
            return alert( lang.recieived.error );
        }

        api.user( structure.metadata.inbox.sender, function( error, user ){
            $( '.received-content-info.who', win ).text( lang.received.sentBy + ' ' + user.fullName );
        });

        var date = new Date( parseInt( structure.metadata.inbox.time, 10 ) );

        $( '.received-content-info.date', win ).text( ' ' + lang.received.on + ' ' + date.toLocaleDateString() );

        var hour = date.getHours();
            if( hour < 10 ){ hour = '0' + hour; }
        var minute = date.getMinutes();
            if( minute < 10 ){ minute = '0' + minute; }
        var second = date.getSeconds();
            if( second < 10 ){ second = '0' + second; }

        $( '.received-content-info.hour', win ).text( ' ' + lang.received.at + ' ' + hour + ':' + minute + ':' + second );
        $( '.received-content-name', win ).text( structure.name );
        $( '.received-content-size', win ).text( api.tool.bytesToUnit( structure.size, 2 ) );
        $( '.received-content-message', win ).text( structure.metadata.inbox.message );

        win
        .on( 'mousedown', '.received-content-accept', function(){

            structure.accept( function( error ){

                if( error ){
                    alert( error, api.view.remove );
                }else{

                    api.banner()
                        .setTitle( lang.received.fileShareAccepted )
                        .setText( structure.name + ' ' + lang.received.beenAccepted )
                        .setIcon( 'https://static.horbito.com/app/1/file_accepted.png' )
                        .render();

                    api.view.remove();

                }

            });

        })

        .on( 'mousedown', '.received-content-refuse', function(){

            structure.refuse( function( error ){

                if( error ){
                    alert( error, api.view.remove );
                }else{

                    api.banner()
                        .setTitle( lang.received.fileShareRefused )
                        .setText( structure.name + ' ' + lang.received.beenRefused )
                        .setIcon( 'https://static.horbito.com/app/1/file_denied.png' )
                        .render();

                    api.view.remove();

                }

            });

        });

    });

    $( '.received-file', win ).text( lang.received.receivedFile );
    $( '.received-content-accept', win ).text( lang.received.contentAccept );
    $( '.received-content-refuse', win ).text( lang.received.contentRefuse );
