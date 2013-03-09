
wz.app.addScript( 1, 'share', function( win, app, lang, params ){

	var shareListUsers 		= $('.share-list-users', win);
	var shareChosenUsers	= $('.share-chosen-users', win);
	var shareUserPrototype 	= $('.share-user.prototype', win);

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
			
			/*
			wz.structure( params, function( error, structure ){
				
				sendChosenUsers.children().each( function(){
					structure.sendTo( $(this).data( 'user-id' ), ' ' );
				});
				
			});*/
			
			alert( 'OMFG IT DOESN\'T WORK!!!!' );
			
			wz.app.closeWindow( win.data( 'win' ) );

		});
		
	wz.user
			
		.friendList( function( error, list ){
			
			for( var i = 0; i < list.length; i++ ){
												
				var userCard = shareUserPrototype.clone().removeClass('prototype');
				//userCard.children('img').attr('src')
				userCard.children('span').text(list[i].fullName);
				shareListUsers.append(userCard);

			}
					
		});

});
