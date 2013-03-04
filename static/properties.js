
wz.app.addScript( 1, 'properties', function( win ){

	var input		= $('.properties input', win);
	var type		= $('.properties .type', win);	
	var size		= $('.properties .size', win);
	var created		= $('.properties .created', win);
	var modified	= $('.properties .modified', win);
	var owner		= $('.properties .owner', win);
	var read		= $('.properties .read', win);
	var modify		= $('.properties .modify', win);
	var copy		= $('.properties .copy', win);
	var download	= $('.properties .download', win);
	var share		= $('.properties .share', win);
	var send		= $('.properties .send', win);
	var file 		= {};
	
	var properties = function( structure ){
				
		input.val( structure.name );
				
		var fileType = structure.type;
		
		if( fileType === 0 ){
			type.text( 'Directory' );
		}else if( fileType === 1 ){
			type.text( 'Special Directory' );
		}else if( fileType === 2 ){
			type.text( 'File' );
		}else if( fileType === 3 ){
			type.text( 'Temporal File' );
		}else{
			type.text( 'Unknown' );
		}
		
		size.text( wz.tool.bytesToUnit( structure.size, 2 ) );
		
		var createdDate = new Date( structure.created );
		var createdDay = createdDate.getDate();
			if( createdDay < 10 ){ createdDay = '0' + createdDay }
		var createdMonth = createdDate.getMonth() + 1;
			if( createdMonth < 10 ){ createdMonth = '0' + createdMonth }
		var createdHour = createdDate.getHours();
			if( createdHour < 10 ){ createdHour = '0' + createdHour }
		var createdMinute = createdDate.getMinutes();
			if( createdMinute < 10 ){ createdMinute = '0' + createdMinute }
		var createdSecond = createdDate.getSeconds();
			if( createdSecond < 10 ){ createdSecond = '0' + createdSecond }
		
		var modifiedDate = new Date( structure.modified );
		var modifiedDay = modifiedDate.getDate();
			if( modifiedDay < 10 ){ modifiedDay = '0' + modifiedDay }
		var modifiedMonth = modifiedDate.getMonth() + 1;
			if( modifiedMonth < 10 ){ modifiedMonth = '0' + modifiedMonth }
		var modifiedHour = modifiedDate.getHours();
			if( modifiedHour < 10 ){ modifiedHour = '0' + modifiedHour }
		var modifiedMinute = modifiedDate.getMinutes();
			if( modifiedMinute < 10 ){ modifiedMinute = '0' + modifiedMinute }
		var modifiedSecond = modifiedDate.getSeconds();
			if( modifiedSecond < 10 ){ modifiedSecond = '0' + modifiedSecond }
		
		created.text( createdMonth + '/' + createdDay + '/' +  createdDate.getFullYear() + ', ' + createdHour + ':' + createdMinute + ':' + createdSecond );
		modified.text( modifiedMonth + '/' + modifiedDay + '/' +  modifiedDate.getFullYear() + ', ' + modifiedHour + ':' + modifiedMinute + ':' + modifiedSecond );
		
		wz.user.getUser( structure.owner, function( error, user ){
			owner.text( user.fullName );
		});
		
		var permissions = structure.permissions;
		
		if( permissions.read === 0 ){
			read.addClass('no');
		}else{
			read.addClass('yes');
		}
		
		if( permissions.modify === 0 ){
			modify.addClass('no');
		}else{
			modify.addClass('yes');
		}
		
		if( permissions.copy === 0 ){
			copy.addClass('no');
		}else{
			copy.addClass('yes');
		}
		
		if( permissions.download === 0 ){
			download.addClass('no');
		}else{
			download.addClass('yes');
		}
		
		if( permissions.share === 0 ){
			share.addClass('no');
		}else{
			share.addClass('yes');
		}
		
		if( permissions.send === 0 ){
			send.addClass('no');
		}else{
			send.addClass('yes');
		}
		
	}
	
	win
	
		.on( 'app-param', function( e, params ){
			
			wz.structure( params, function( error, structure ){
				
				file = structure;
				
				properties(structure);
				
			});
			
		})
		
		.key( 'enter', function(){
			
			input.blur();
			
		});
		
	input
	
		.on( 'blur', function(){
			
			if( !(input.val() === file.name) ){
				file.rename(input.val(), function(error){})
			}
			
		});
		
});
