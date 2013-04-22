
wz.app.addScript( 1, 'share', function( win, app, lang, params ){

    var shareListUsers     = $('.share-list-users', win);
    var shareChosenUsers   = $('.share-chosen-users', win);
    var shareUserPrototype = $('.share-user.prototype', win);
    var initialUsers       = [];
    var filePermissions    = {};
    var state              = $( '.share-how', win ); 

    win
        .on( 'mousedown', '.share-how article', function(){
            
            var button = $(this).find( 'figure' );

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

        filePermissions = {

            'link'     : ( $( '.share-how-link', state ).siblings().hasClass( 'yes' ) ) ? 1 : 0,
            'modify'   : ( $( '.share-how-modify', state ).siblings().hasClass( 'yes' ) ) ? 1 : 0,
            'copy'     : ( $( '.share-how-copy', state ).siblings().hasClass( 'yes' ) ) ? 1 : 0,
            'download' : ( $( '.share-how-download', state ).siblings().hasClass( 'yes' ) ) ? 1 : 0,
            'share'    : ( $( '.share-how-share', state ).siblings().hasClass( 'yes' ) ) ? 1 : 0,
            'send'     : ( $( '.share-how-send', state ).siblings().hasClass( 'yes' ) ) ? 1 : 0

        };
        
        wz.structure( params, function( error, structure ){

            var changed = false;

            var promises = [];
            
            shareChosenUsers.children().each( function(){

                var userId = $( this ).data('user-id');
                var index  = $.inArray( userId, initialUsers );

                if( index === -1 ){

                    var promiseId = promises.push( $.Deferred().promise() );

                    structure.addShare( userId, filePermissions, function( error ){
                        promises[ promiseId ].resolve( error );
                    });

                    changed = true;

                }else{
                    initialUsers[ index ] = null;
                }
                
            });

            for( var i in initialUsers ){

                if( initialUsers[ i ] !== null ){

                    ( function(){
                        
                        var promiseId = promises.push( $.Deferred().promise() );

                        structure.removeShare( initialUsers[ i ], function( error ){
                            promises[ promiseId ].resolve( error );
                        });

                    })();
                   
                }

            }

            if( !changed ){

                var promiseId = promises.push( $.Deferred().promise() );

                structure.changePermissions( filePermissions, function( error ){
                    promises[ promiseId ].resolve( error );
                });

            }

            $.when( promises )
                .then( function( input ){

                    console.log( input );
                    wz.app.closeWindow( win.data( 'win' ) );

                });
            
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

            for( var i in permissions ){ 

                if( !permissions[i] ){
                    $( '.share-how-' + i, win ).mousedown();
                }
                
            }

            friendList = friendList[ 1 ];
            sharedList = sharedList[ 3 ];

            var userCard = null;

            var i = 0;
            var j = 0;

            for( i = 0; i < sharedList.length; i++ ){

                userCard = shareUserPrototype.clone().removeClass('prototype');
                //userCard.children('img').attr('src')
                userCard.data( 'user-id', sharedList[ i ].id );
                userCard.children('span').text( sharedList[ i ].fullName );
                shareChosenUsers.append( userCard );

                initialUsers.push( sharedList[ i ].id );

                for( j = 0; j < friendList.length; j++ ){

                    if( friendList[ j ] !== null && friendList[ j ].id === sharedList[ i ].id ){
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
    $( '.share-how-link', win ).text( lang.shareHowLink );
    $( '.share-how-modify', win ).text( lang.shareHowModify );
    $( '.share-how-copy', win ).text( lang.shareHowCopy );
    $( '.share-how-download', win ).text( lang.shareHowDownload );
    $( '.share-how-share', win ).text( lang.shareHowShare );
    $( '.share-how-send', win ).text( lang.shareHowSend );
    $( '.share-save', win ).text( lang.shareSave );

});
