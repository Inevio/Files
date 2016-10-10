
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

    api.fs( params, function( error, structure ){

        if( error ){
            alert( lang.shared.error );
        }else{

            api.user( structure.pointerOwner, function( error, user ){

                if( structure.pointerType === 0 ){

                    $( '.received-file', win ).text( lang.shared.sharedFolderTitle );
                    $( '.received-content-info.who', win ).text( lang.shared.folderSharedBy + ' ' + user.fullName );

                }else if( structure.pointerType === 2 ){

                    $( '.received-file', win ).text( lang.shared.sharedFileTitle );
                    $( '.received-content-info.who', win ).text( lang.shared.fileSharedBy + ' ' + user.fullName );

                }else{
                    $( '.received-content-info.who', win ).text( lang.shared.sharedBy + ' ' + user.fullName );
                }

            });

            $( '.received-content-name', win ).text( structure.name );
            $( '.received-content-size', win ).text( api.tool.bytesToUnit( structure.size, 2 ) );

            permissions( structure );

            win
                .on( 'mousedown', '.received-content-accept', function(){

                    structure.acceptShare( function( error ){

                        if( error ){

                            // To Do -> Nice error content
                            alert( error, api.view.remove );

                        }else{

                            var banner = api.banner();

                            if( structure.pointerType === 0 ){
                                banner.setTitle( lang.shared.folderShareAccepted );
                            }else{
                                banner.setTitle( lang.shared.fileShareAccepted );
                            }

                            banner
                                .setText( structure.name + ' ' + lang.shared.beenAccepted )
                                .setIcon( 'https://static.inevio.com/app/1/file_accepted.png' )
                                .render();

                            api.view.remove();

                        }

                    });

                })

                .on( 'mousedown', '.received-content-refuse', function(){

                    structure.refuseShare( function( error ){

                        if( error ){
                            alert( error, function(){
                                api.view.remove();
                            }, win.data().win );
                        }else{

                            var banner = api.banner();

                            if( structure.pointerType === 0 ){
                                banner.setTitle( lang.shared.folderShareRefused );
                            }else{
                                banner.setTitle( lang.shared.fileShareRefused );
                            }

                            banner
                                .setText( structure.name + ' ' + lang.shared.beenRefused )
                                .setIcon( 'https://static.inevio.com/app/1/file_denied.png' )
                                .render();

                                api.view.remove();

                        }

                    });

                });

        }

    });

    $( '.attr', win ).text( lang.shared.attr + ':' );
    $( '.attr-link', win ).text( lang.shared.attrLink );
    $( '.attr-modify', win ).text( lang.shared.attrModify );
    $( '.attr-copy', win ).text( lang.shared.attrCopy );
    $( '.attr-download', win ).text( lang.shared.attrDownload );
    $( '.attr-share', win ).text( lang.shared.attrShare );
    $( '.attr-send', win ).text( lang.shared.attrSend );
    $( '.received-content-accept', win ).text( lang.shared.contentAccept );
    $( '.received-content-refuse', win ).text( lang.shared.contentRefuse );
