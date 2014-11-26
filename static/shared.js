    
    var win      = $( this );
    var link     = $('.link', win);
    var modify   = $('.modify', win);
    var copy     = $('.copy', win);
    var download = $('.download', win);
    var share    = $('.share', win);
    var send     = $('.send', win);

    var permissions = function( structure ){

        var permissions = structure.permissions;

        if( permissions.link === 1 ){
            link.addClass('yes');
        }else{
            link.addClass('no');
        }
        
        if( permissions.modify === 1 ){
            modify.addClass('yes');
        }else{
            modify.addClass('no');
        }
        
        if( permissions.copy === 1 ){
            copy.addClass('yes');
        }else{
            copy.addClass('no');
        }
        
        if( permissions.download === 1 ){
            download.addClass('yes');
        }else{
            download.addClass('no');
        }
        
        if( permissions.share === 1 ){
            share.addClass('yes');
        }else{
            share.addClass('no');
        }
        
        if( permissions.send === 1 ){
            send.addClass('yes');
        }else{
            send.addClass('no');
        }

    };

    win.on( 'app-param', function( e, evtParams ){

        params = evtParams;

        wz.fs( params, function( error, structure ){
        
            if( error ){
                return alert( lang.error );
            }

            wz.user( structure.pointerOwner, function( error, user ){

                if( structure.pointerType === 0 ){

                    $( '.received-file', win ).text( lang.sharedFolderTitle );
                    $( '.received-content-info.who', win ).text( lang.folderSharedBy + ' ' + user.fullName );

                }else if( structure.pointerType === 2 ){

                    $( '.received-file', win ).text( lang.sharedFileTitle );
                    $( '.received-content-info.who', win ).text( lang.fileSharedBy + ' ' + user.fullName );
                    
                }else{
                    $( '.received-content-info.who', win ).text( lang.sharedBy + ' ' + user.fullName );
                }
             
            });
                        
            $( '.received-content-name', win ).text( structure.name );
            $( '.received-content-size', win ).text( wz.tool.bytesToUnit( structure.size, 2 ) );

            permissions( structure );
            
            win
                .on( 'mousedown', '.received-content-accept', function(){

                    structure.acceptShare( function( error ){

                        if( error ){
                            
                            // To Do -> Nice error content
                            alert( error, wz.view.remove );

                        }else{

                            var banner = wz.banner();

                            if( structure.pointerType === 0 ){
                                banner.setTitle( lang.folderShareAccepted );
                            }else{
                                banner.setTitle( lang.fileShareAccepted );
                            }

                            banner
                                .setText( structure.name + ' ' + lang.beenAccepted )
                                .setIcon( 'https://static.inevio.com/app/1/file_accepted.png' )
                                .render();

                            wz.view.remove();

                        }

                    });

                })
            
                .on( 'mousedown', '.received-content-refuse', function(){

                    structure.refuseShare( function( error ){

                        if( error ){
                            alert( error, function(){
                                wz.view.remove();
                            }, win.data().win );
                        }else{

                            var banner = wz.banner();

                            if( structure.pointerType === 0 ){
                                banner.setTitle( lang.folderShareRefused );
                            }else{
                                banner.setTitle( lang.fileShareRefused );
                            }

                            banner
                                .setText( structure.name + ' ' + lang.beenRefused )
                                .setIcon( 'https://static.inevio.com/app/1/file_denied.png' )
                                .render();

                                wz.view.remove();

                        }

                    });
                    
                });
                
        });
        
    });

    $( '.attr', win ).text( lang.attr + ':' );
    $( '.attr-link', win ).text( lang.attrLink );
    $( '.attr-modify', win ).text( lang.attrModify );
    $( '.attr-copy', win ).text( lang.attrCopy );
    $( '.attr-download', win ).text( lang.attrDownload );
    $( '.attr-share', win ).text( lang.attrShare );
    $( '.attr-send', win ).text( lang.attrSend );
    $( '.received-content-accept', win ).text( lang.contentAccept );
    $( '.received-content-refuse', win ).text( lang.contentRefuse );
