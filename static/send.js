    
    var win               = $( this );
    var sendListUsers     = $('.send-list-users', win);
    var sendChosenUsers   = $('.send-chosen-users', win);
    var sendUserPrototype = $('.send-user.wz-prototype', win);

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

                wz.fs( params, function( error, structure ){

                    var promises = [];
                
                    sendChosenUsers.children().each( function(){

                        var deferred  = $.Deferred();
                    
                        promises.push( deferred.promise() );

                        structure.sendTo( $(this).data( 'user-id' ), $( '.send-message', win).val(), function( error ){
                            deferred.resolve( error );
                        });

                    });

                    $.when.apply( null, promises ).then( function(){

                        wz.banner()
                            .setTitle( lang.fileSent )
                            .setText( structure.name + ' ' + lang.fileSentCorrectly )
                            .setIcon( structure.icons.tiny )
                            .render();
                                
                        wz.view.remove();

                    });
                
                });

            }

        });
        
    wz.user.friendList( false, function( error, list ){
        
        for( var i = 0; i < list.length; i++ ){
                                            
            var userCard = sendUserPrototype.clone().removeClass('wz-prototype');
            userCard.children( 'img' ).attr( 'src', list[i].avatar.tiny);
            userCard.children( 'span' ).text( list[i].fullName );
            userCard.data( 'user-id', list[i].id );
            sendListUsers.append( userCard );

        }
                    
    });

    $( '.send-title', win ).text( lang.sendTitle );
    $( '.send-list-title', win ).text( lang.sendListTitle );
    $( '.send-chosen-title', win ).text( lang.sendChosenTitle );
    $( '.send-how-message', win ).text( lang.sendHowMessage );
    $( '.send-how-explanation', win ).text( lang.sendHowExplanation );
    $( '.send-how-button', win ).text( lang.sendHowButton );
