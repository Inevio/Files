    
    var win               = $( this );
    var sendListUsers     = $('.send-list-users', win);
    var sendChosenUsers   = $('.send-chosen-users', win);
    var sendUserPrototype = $('.send-user.wz-prototype', win).remove();

    win
    .on( 'mousedown', '.send-user', function(){
        
        if( $(this).parent().hasClass('send-list-users') ){
            
            if( !sendChosenUsers.find('.send-user').length ){
                sendChosenUsers.find('.empty-list').css( 'display', 'none' );
            }

            sendChosenUsers.append( this );

            if( !sendListUsers.find('.send-user').length ){
                sendListUsers.find('.empty-list').css( 'display', 'block' );
            }

        }else{
            
            if( !sendListUsers.find('.send-user').length ){
                sendListUsers.find('.empty-list').css( 'display', 'none' );
            }

            sendListUsers.append( this );

            if( !sendChosenUsers.find('.send-user').length ){
                sendChosenUsers.find('.empty-list').css( 'display', 'block' );
            }

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

        list = list.sort( function( a, b ){
            return a.fullName.localeCompare( b.fullName );
        });
        
        for( var i = 0; i < list.length; i++ ){
                                            
            var userCard = sendUserPrototype.clone().removeClass('wz-prototype');
            userCard.children( 'img' ).attr( 'src', list[i].avatar.tiny);
            userCard.children( 'span' ).text( list[i].fullName );
            userCard.data( 'user-id', list[i].id );
            sendListUsers.append( userCard );

        }

        $('.empty-list').text( lang.emptyList );

        if( list.length ){
            sendListUsers.find('.empty-list').css( 'display', 'none' );
        }
                    
    });

    $( '.send-title', win ).text( lang.sendTitle );
    $( '.send-list-title', win ).text( lang.sendListTitle );
    $( '.send-chosen-title', win ).text( lang.sendChosenTitle );
    $( '.send-how-message', win ).text( lang.sendHowMessage );
    $( '.send-how-explanation', win ).text( lang.sendHowExplanation );
    $( '.send-how-button', win ).text( lang.sendHowButton );
    $( '.empty-list', win ).text( lang.loadingList );
