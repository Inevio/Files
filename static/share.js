    
    var params             = null;
    var win                = $( this );
    var shareListUsers     = $('.share-list-users', win);
    var shareChosenUsers   = $('.share-chosen-users', win);
    var shareUserPrototype = $('.share-user.wz-prototype', win);
    var initialUsers       = [];
    var initialPermissions = {};
    var state              = $( '.share-how', win );
    var owner              = 0;
    var loading            = false;

    var main = function(){

        shareListUsers.children().not( '.share-chosen-title, .empty-list' ).remove();
        shareChosenUsers.children().not( '.share-chosen-title, .empty-list' ).remove();
        state.addClass( 'default' ).find( 'figure' ).removeClass( 'no' ).addClass( 'yes' ).find( 'span' ).text( lang.shareHowYes );

        // Local Functions
        var getFriendList = function(){

            var deferred = $.Deferred();
            
            wz.user.friendList( false, function( error, list ){
                deferred.resolve( [ error, list ] );
            });

            return deferred.promise();

        };

        var getSharedList = function(){

            var deferred = $.Deferred();

            wz.fs( params, function( error, structure ){
                
                structure.sharedWith( true, function( error, list, permissions ){
                    deferred.resolve( [ error, structure, list, permissions ] );
                });

            });

            return deferred.promise();

        };

        $.when( getFriendList(), getSharedList() ).then( function( friendList, sharedList ){

            owner              = sharedList[ 1 ].owner;
            initialPermissions = sharedList[ 3 ];

            loading = true;

            for( var i in initialPermissions ){

                if( !initialPermissions[ i ] ){
                    $( '.share-how-' + i, state ).mousedown();
                }

                if( owner !== wz.system.user().id ){
                    state.addClass( 'blocked' );
                }
                
            }

            loading = false;

            friendList = friendList[ 1 ].sort( function( a, b ){
                return a.fullName.localeCompare( b.fullName );
            });

            sharedList = sharedList[ 2 ].sort( function( a, b ){
                return a.fullName.localeCompare( b.fullName );
            });

            var userCard = null;

            var i = 0;
            var j = 0;

            for( i = 0; i < sharedList.length; i++ ){

                if( sharedList[ i ].id !== owner ){

                    userCard = shareUserPrototype.clone().removeClass('wz-prototype');
                    userCard.children( 'img' ).attr( 'src', sharedList[ i ].avatar.tiny );
                    userCard.data( 'userId', sharedList[ i ].id );
                    userCard.children( 'span' ).text( sharedList[ i ].fullName );
                    shareChosenUsers.append( userCard );

                    initialUsers.push( sharedList[ i ].id );

                }

                for( j = 0; j < friendList.length; j++ ){

                    if( friendList[ j ] !== null && friendList[ j ].id === sharedList[ i ].id ){
                        friendList[ j ] = null;
                        break;
                    }

                }

            }

            shareChosenUsers.find('.empty-list').text( lang.emptyList );

            if( sharedList.length ){
                shareChosenUsers.find('.empty-list').css( 'display', 'none' );
            }

            for( i = 0; i < friendList.length; i++ ){

                if( friendList[ i ] !== null ){

                    userCard = shareUserPrototype.clone().removeClass('wz-prototype');
                    userCard.children( 'img' ).attr( 'src', friendList[ i ].avatar.tiny );
                    userCard.data( 'userId', friendList[ i ].id );
                    userCard.children( 'span' ).text( friendList[ i ].fullName );
                    shareListUsers.append( userCard );

                }

            }

            shareListUsers.find('.empty-list').text( lang.emptyList );

            if( friendList.length ){
                shareListUsers.find('.empty-list').css( 'display', 'none' );
            }

        });

    };

    var comparePermissions = function( first, second ){

        for( var i in first ){

            if( first[ i ] !== second[ i ] ){
                return false;
            }

        }

        return true;

    };

    // WZ Events
    wz.fs.on( 'sharedChanged', main );

    // DOM Events
    win
    .on( 'mousedown', '.share-how article', function(){

        if( owner === wz.system.user().id || loading ){

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

        }
        
    })
    
    .on( 'mousedown', '.share-user', function(){
        
        if( $( this ).parent().hasClass('share-list-users') ){

            if( !shareChosenUsers.find('.share-user').length ){
                shareChosenUsers.find('.empty-list').css( 'display', 'none' );
            }

            shareChosenUsers.append( this );

            if( !shareListUsers.find('.share-user').length ){
                shareListUsers.find('.empty-list').css( 'display', 'block' );
            }

        }else{

            if( !shareListUsers.find('.share-user').length ){
                shareListUsers.find('.empty-list').css( 'display', 'none' );
            }

            shareListUsers.append( this );

            if( !shareChosenUsers.find('.share-user').length ){
                shareChosenUsers.find('.empty-list').css( 'display', 'block' );
            }
            
        }
        
    })

    .on( 'mousedown', 'button', function(){

        var filePermissions = {

            'link'     : ( $( '.share-how-link', state ).siblings().hasClass( 'yes' ) ) ? 1 : 0,
            'modify'   : ( $( '.share-how-modify', state ).siblings().hasClass( 'yes' ) ) ? 1 : 0,
            'copy'     : ( $( '.share-how-copy', state ).siblings().hasClass( 'yes' ) ) ? 1 : 0,
            'download' : ( $( '.share-how-download', state ).siblings().hasClass( 'yes' ) ) ? 1 : 0,
            'share'    : ( $( '.share-how-share', state ).siblings().hasClass( 'yes' ) ) ? 1 : 0,
            'send'     : ( $( '.share-how-send', state ).siblings().hasClass( 'yes' ) ) ? 1 : 0

        };
        
        wz.fs( params, function( error, structure ){

            var promises = [];
            
            shareChosenUsers.children().not('.empty-list').each( function(){

                var userId = $( this ).data('userId');
                var index  = initialUsers.indexOf( userId );

                if( index === -1 ){

                    var deferred  = $.Deferred();
                    
                    promises.push( deferred.promise() );

                    structure.addShare( userId, filePermissions, function( error ){
                        deferred.resolve( error );
                    });

                }else{
                    initialUsers[ index ] = null;
                }
                
            });

            initialUsers.map( function( userId ){

                if( userId !== null ){

                    var deferred = $.Deferred();

                    promises.push( deferred.promise() );

                    structure.removeShare( userId, function( error ){
                        deferred.resolve( error );
                    });
                   
                }

            });

            if( shareChosenUsers.length && !comparePermissions( initialPermissions, filePermissions ) ){

                console.log('compara');

                var deferred = $.Deferred();

                promises.push( deferred.promise() );

                structure.changePermissions( filePermissions, function( error ){
                    deferred.resolve( error );
                });

            }

            $.when.apply( null, promises )
                .then( function(){

                    // To Do -> Hacer cosas con las respuestas de las promesas

                    wz.banner()
                        .setTitle( lang.fileShared )
                        .setText( lang.fileSharedStart + ' ' + structure.name + ' ' + lang.fileSharedEnd )
                        .setIcon( structure.icons.tiny )
                        .render();

                    wz.view.remove();

                });
            
        });

    });

    win.on( 'app-param', function( e, evtParams ){

        params = evtParams;

        main();

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
    $( '.empty-list', win ).text( lang.loadingList );
