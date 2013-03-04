
wz.app.addScript( 1, 'link', function( win ){
	
	var file = {};
	var linkSpan = $('.link-url .wz-selectable', win);

	win
	
		.on( 'app-param', function( e, params ){
			
			wz.structure( params, function( error, structure ){
				
				file = structure;
				
			});
			
		})
	
		.on( 'click', '.link-password button', function(){
				
			var url 		= '';
			var password 	= $('.link-password input', win).val();
			
			file.getLinks( function( error, list ){
				
				if( password.length || !list.length ){
										
					file.createLink( password, true, function( error, url ){
						
						linkSpan.text( url.url );
						
					})
					
				}else{
					
					if( list[0].password ){
												
						file.createLink( null, true, function( error, url ){
						
							linkSpan.text( url.url );
						
						})
						
					}else{
												
						linkSpan.text( list[0].url );
						
					}
					
				}
				
			})
			
		});

});
