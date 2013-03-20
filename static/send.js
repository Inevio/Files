
wz.app.addScript( 1, 'send', function( win, app, lang, params ){

    var sendListUsers       = $('.send-list-users', win);
    var sendChosenUsers     = $('.send-chosen-users', win);
    var sendUserPrototype   = $('.send-user.prototype', win);

    win
        
        .on( 'mousedown', '.send-user', function(){
            
            if( $(this).parent().hasClass('send-list-users') ){
                sendChosenUsers.append($(this));
            }else{
                sendListUsers.append($(this));
            }
            
        })
        
        .on( 'mousedown', 'button', function(){
            
            if( sendChosenUsers.children().size() ){

                wz.structure( params, function( error, structure ){
                
                    sendChosenUsers.children().each( function(){
                        structure.sendTo( $(this).data( 'user-id' ), $( '.send-message', win).val() );
                    });
                
                });
            
                alert( 'Your file has been sent!' );
            
                wz.app.closeWindow( win.data( 'win' ) );

            }

        });
        
    wz.user
            
        .friendList( function( error, list ){
            
            for( var i = 0; i < list.length; i++ ){
                                                
                var userCard = sendUserPrototype.clone().removeClass('prototype');
                //userCard.children('img').attr('src')
                userCard.children('span').text(list[i].fullName);
                userCard.data( 'user-id', list[i].id );
                sendListUsers.append(userCard);

            }
                    
        });

});
