
wz.app.addScript( 1, 'share', function( win, app, lang, params ){

    var shareListUsers      = $('.share-list-users', win);
    var shareChosenUsers    = $('.share-chosen-users', win);
    var shareUserPrototype  = $('.share-user.prototype', win);

    win
        .on( 'mousedown', '.share-how article', function(){
            
            var button = $(this).children('figure');
            
            if(button.hasClass('yes')){
                button.removeClass('yes');
                button.addClass('no');
                button.children('span').text('NO');
            }else{
                button.removeClass('no');
                button.addClass('yes');
                button.children('span').text('YES');
            }
            
        })
        
        .on( 'mousedown', '.share-user', function(){
            
            if( $(this).parent().hasClass('share-list-users') ){
                shareChosenUsers.append($(this));
            }else{
                shareListUsers.append($(this));
            }
            
        })
        
        .on( 'mousedown', 'button', function(){
            
            wz.structure( params, function( error, structure ){
                
                shareChosenUsers.children().each( function(){
                    structure.sendTo( $(this).data( 'user-id' ), '' );
                });

                wz.app.closeWindow( win.data( 'win' ) );
                
            });

        });
        
    wz.user
        .friendList( function( error, list ){
            
            for( var i = 0; i < list.length; i++ ){
                                                
                var userCard = shareUserPrototype.clone().removeClass('prototype');
                //userCard.children('img').attr('src')
                userCard.data( 'user-id', list[ i ].id );
                userCard.children('span').text(list[i].fullName);
                shareListUsers.append(userCard);

            }
                    
        });

    $( '.share-title', win ).text( lang.shareTitle );
    $( '.share-list-title', win ).text( lang.shareListTitle );
    $( '.share-chosen-title', win ).text( lang.shareChosenTitle );
    $( '.share-how-permissions', win ).text( lang.shareHowPermissions );
    $( '.share-how-explanation', win ).text( lang.shareHowExplanation );
    $( '.share-how-default', win ).text( lang.shareHowDefault );
    $( '.share-how-yes', win ).text( lang.shareHowYes );
    $( '.share-how-no', win ).text( lang.shareHowNo );
    $( '.share-how-read', win ).text( lang.shareHowRead );
    $( '.share-how-modify', win ).text( lang.shareHowModify );
    $( '.share-how-copy', win ).text( lang.shareHowCopy );
    $( '.share-how-download', win ).text( lang.shareHowDownload );
    $( '.share-how-share', win ).text( lang.shareHowShare );
    $( '.share-how-send', win ).text( lang.shareHowSend );
    $( '.share-save', win ).text( lang.shareSave );

});
