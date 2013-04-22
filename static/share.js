
wz.app.addScript( 1, 'share', function( win, app, lang, params ){

    var shareListUsers     = $('.share-list-users', win);
    var shareChosenUsers   = $('.share-chosen-users', win);
    var shareUserPrototype = $('.share-user.prototype', win);
    var initialUsers       = null;

    win
        .on( 'mousedown', '.share-how article', function(){
            
            var button = $(this).find( 'figure' );
            var state = $(this).parent( '.share-how' );

            if( button.hasClass( 'default' ) ){

                if( button.hasClass('yes') ){

                    state.removeClass( 'default' );
                    button.removeClass('yes');
                    button.addClass('no');
                    button.find('span').text( lang.shareHowNo );

                }else{

                    state.addClass( 'default' );
                    $( this ).siblings( 'article' ).find( 'figure' ).removeClass('no').addClass( 'yes' ).find( 'span' ).text( lang.shareHowYes );
                    button.removeClass('no');
                    button.addClass('yes');
                    button.find('span').text( lang.shareHowYes );

                }

            }else{

                if( button.hasClass('yes') ){

                    state.removeClass( 'default' );
                    $( this ).siblings( 'article' ).find( '.default' ).removeClass('yes').addClass('no').find( 'span' ).text( lang.shareHowNo );
                    button.removeClass('yes');
                    button.addClass('no');
                    button.find('span').text( lang.shareHowNo );

                }else{

                    if( !$(this).siblings( 'article' ).find( 'figure' ).not( '.default' ).hasClass( 'no' ) ){
                        state.addClass( 'default' );
                        $( this ).siblings( 'article' ).find( '.default' ).removeClass('no').addClass('yes').find( 'span' ).text( lang.shareHowYes );
                    }

                    button.removeClass('no');
                    button.addClass('yes');
                    button.find('span').text( lang.shareHowYes );

                }

            }
            
        })
        
    .on( 'mousedown', '.share-user', function(){
        
        if( $( this ).parent().hasClass('share-list-users') ){
            shareChosenUsers.append( this );
        }else{
            shareListUsers.append( this );
        }
        
    })
    
    .on( 'mousedown', 'button', function(){
        
        wz.structure( params, function( error, structure ){
            
            shareChosenUsers.children().each( function(){

                var userId = $( this ).data('user-id');
                var index  = $.inArray( userId, initialUsers );

                if( index === -1 ){
                    structure.addShare( userId, { global : 1 } );
                }else{
                    initialUsers[ index ] = null;
                }
                
            });

            for( var i in initialUsers ){

                if( initialUsers[ i ] !== null ){
                    structure.removeShare( initialUsers[ i ] );
                }

            }

            wz.app.closeWindow( win.data( 'win' ) );
            
        });

    });
    
    // Local Functions
    var getFriendList = function(){

        var deferred = $.Deferred();
        
        wz.user.friendList( function( error, list ){
            deferred.resolve( [ error, list ] );
        });

        return deferred.promise();

    };

    var getSharedList = function(){

        var deferred = $.Deferred();

        wz.structure( params, function( error, structure ){
            
            structure.sharedWith( function( error, owner, permissions, list ){
                deferred.resolve( [ error, owner, permissions, list ] );
            });

        });

        return deferred.promise();

    };

    $.when( getFriendList(), getSharedList() )
        .then( function( friendList, sharedList ){

            var owner       = sharedList[ 1 ];
            var permissions = sharedList[ 2 ];

            // To Do -> Cambiar interruptores de permisos

            friendList = friendList[ 1 ];
            sharedList = sharedList[ 3 ];

            var users    = [];
            var userCard = null;

            var i = 0;
            var j = 0;

            for( i = 0; i < sharedList.length; i++ ){

                userCard = shareUserPrototype.clone().removeClass('prototype');
                //userCard.children('img').attr('src')
                userCard.data( 'user-id', sharedList[ i ].id );
                userCard.children('span').text( sharedList[ i ].fullName );
                shareChosenUsers.append( userCard );

                users.push( sharedList[ i ].id );

                for( j = 0; j < friendList.length; j++ ){

                    if( friendList[ j ].id === sharedList[ i ].id ){
                        friendList[ j ] = null;
                        break;
                    }

                }

            }

            for( i = 0; i < friendList.length; i++ ){

                if( friendList[ i ] !== null ){

                    userCard = shareUserPrototype.clone().removeClass('prototype');
                    //userCard.children('img').attr('src')
                    userCard.data( 'user-id', friendList[ i ].id );
                    userCard.children('span').text( friendList[ i ].fullName );
                    shareListUsers.append( userCard );

                }

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
