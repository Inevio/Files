    
    wz.structure( params, function( error, structure ){
        
        if( error ){
            alert( lang.error, null, win.data().win );
        }else{

            wz.user( structure.metadata.received.sender, function( error, user ){
                $( '.received-content-info.who', win ).text( lang.sentBy + ' ' + user.fullName );
            });
            
            var date = new Date( parseInt( structure.metadata.received.time ) );
            
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
            $( '.received-content-message', win ).text( structure.metadata.received.message );
            
            win
            
                .on( 'mousedown', '.received-content-accept', function(){

                    structure.accept( function( error ){

                        if( error ){
                            alert( error, function(){
                                wz.app.closeWindow( win.data( 'win' ) );
                            }, win.data().win );
                        }else{

                            wz.banner()
                                    .title( lang.fileShareAccepted )
                                    .text( structure.name + ' ' + lang.beenAccepted )
                                    .image( structure.icons.tiny )
                                    .render();

                            wz.app.closeWindow( win.data( 'win' ) );

                        }

                    });   

                })
            
                .on( 'mousedown', '.received-content-refuse', function(){

                    structure.refuse( function( error ){

                        if( error ){
                            alert( error, function(){
                                wz.app.closeWindow( win.data( 'win' ) );
                            }, win.data().win );
                        }else{

                            wz.banner()
                                    .title( lang.fileShareRefused )
                                    .text( structure.name + ' ' + lang.beenRefused )
                                    .image( 'https://static.weezeel.com/app/1/refuse.png' )
                                    .render();

                            wz.app.closeWindow( win.data( 'win' ) );

                        }

                    });
                    
                });
                
        }
        
    });

    $( '.received-file', win ).text( lang.receivedFile );
    $( '.received-content-accept', win ).text( lang.contentAccept );
    $( '.received-content-refuse', win ).text( lang.contentRefuse );
