
wz.app.addScript( 1, 'link', function( win, app, lang, params ){

    var file	 	= {};
    var linkSpan 	= $('.link-url .wz-selectable', win);
	var prototype 	= $('.prototype', win);
		
	wz.structure( params, function( error, structure ){
		
		structure.getLinks( function( error, links ){
			
			if( links.length ){
				
				$( '.previous', win ).removeClass('hidden');
				win.css({ 'width' : '525' });
				$( '.wz-win-menu', win ).css({ 'width' : '495' });
				
				if( links.length === 1 ){
					win.css({ 'height' : '340' });		
				}else if( links.length === 2 ){
					win.css({ 'height' : '376' });
				}else if( links.length === 3 ){
					win.css({ 'height' : '412' });
				}else if( links.length === 4 ){
					win.css({ 'height' : '448' });
				}else{
					win.css({ 'height' : '485' });
				}
				
				var collection = $();
				
				for( var i = 0 ; i < links.length ; i++ ){
					
					var userLink = prototype.clone().removeClass( 'prototype' );
					
					if( links[i].password ){
						userLink.find('.first-column i').addClass( 'link-lock' );
					}else{
						userLink.find('.first-column i').addClass( 'link-unlock' );
					}
					
					if( links[i].preview ){
						userLink.find('.second-column i').addClass( 'link-prev' );
					}else{
						userLink.find('.second-column i').addClass( 'link-unprev' );
					}
					
					userLink.find('.link-data').text( links[i].url );
					userLink.find('.link-views').text( links[i].visits );
					userLink.find('.link-downloads').text( links[i].downloads );
					userLink.find('.link-imports').text( links[i].imports );
					userLink.find('.link-delete').data( 'id', links[i].id );
					
					collection = collection.add( userLink );

				}
								
				$( 'table', win ).append( collection );
				
			}
		});
	});	

    win
	
		.on( 'mousedown', '.link-password button', function(){
	
			var url      = '';
			var password = $('.link-password input', win ).val();
			var preview  = !$('.link-preview input', win ).prop('checked');
			
			if( !password.length ){
				password = null;
			}
			
			wz.structure( params, function( error, structure ){
				structure.createLink( password, preview, function( error, url ){
					linkSpan.text( url.url );
				});
			});		
	
		})
		
		.on( 'mousedown', '.link-delete', function(){
			
			var id = $(this).data('id');
			
			wz.structure( params, function( error, structure ){
				structure.removeLink( id, function( error, deleted ){	
					if( error || !deleted ){
					}else{
						alert( 'The link has been deleted succesfully' );
					}
				});
			});	
			
		});

});
