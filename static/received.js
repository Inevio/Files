    
    wz.fs( params, function( error, structure ){
        
        if( error ){
            alert( lang.error, null, win.data().win );
        }else{

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
                            alert( error, function(){
                                wz.view.remove();
                            }, win.data().win );
                        }else{

                            wz.banner()
                                    .title( lang.fileShareAccepted )
                                    .text( structure.name + ' ' + lang.beenAccepted )
                                    .icon( structure.icons.tiny )
                                    .render();

                            wz.view.remove();

                        }

                    });

                })
            
                .on( 'mousedown', '.received-content-refuse', function(){

                    structure.refuse( function( error ){

                        if( error ){
                            alert( error, function(){
                                wz.view.remove();
                            }, win.data().win );
                        }else{

                            wz.banner()
                                    .title( lang.fileShareRefused )
                                    .text( structure.name + ' ' + lang.beenRefused )
                                    .icon( 'https://static.weezeel.com/app/1/refuse.png' )
                                    .render();

                            wz.view.remove();

                        }

                    });
                    
                });
                
        }
        
    });

    $( '.received-file', win ).text( lang.receivedFile );
    $( '.received-content-accept', win ).text( lang.contentAccept );
    $( '.received-content-refuse', win ).text( lang.contentRefuse );
