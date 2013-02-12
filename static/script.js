/*global wz:true $:true */

wz.app.addScript( 1, 'common', function( win ){

    // Variables
    var record = [];
    var current = null;
    var pointer = -1;
    var controlNav = false;
    
    var types   = [
                    'directory wz-drop-area',
                    'special-directory wz-drop-area',
                    'file',
                    'temporal-file'
                  ];

    var nextButton    = $( '.weexplorer-option-next', win );
    var backButton    = $( '.weexplorer-option-back', win );
    var views         = $( '.weexplorer-menu-views', win );
    var fileArea      = $( '.weexplorer-file-zone', win );
    var filePrototype = $( '.weexplorer-file.prototype', win );
    var folderName    = $( '.weexplorer-folder-name', win );
    var uploadButton  = $( '.weexplorer-menu-upload', win );
    
    var renaming = $();
    
    // Functions
    var recordNavigation = function(){
						
        if(record[pointer+1]){
            nextButton.addClass('active');
        }else{
            nextButton.removeClass('active');
        }
        
        if(record[pointer-1]){
            backButton.addClass('active');
        }else{
            backButton.removeClass('active');
        }
        
    }           
            
    var updateCurrent = function(id){
        
        current = id;
        
        if(!controlNav){
			pointer++;
            record = record.slice(0,pointer+1);
        }
		
		record[pointer] = id;
		controlNav = false;
        
    };

    var recordBack = function(){
        pointer--;
        controlNav = true;
        openDirectory(record[pointer]);     
    };

    var recordNext = function(){
        pointer++;
        controlNav = true;  
        openDirectory(record[pointer]); 
    };

    var icon = function( id, name, type, size, modified, created ){

        // Clone prototype
        var file = filePrototype.clone().removeClass('prototype');

        // Add new properties
        file.children('textarea').text( name );
		file.children('.weexplorer-file-size').text( size );
		file.children('.weexplorer-file-date-modification').text( modified );
		file.children('.weexplorer-file-date-creation').text( created );
        file.find('img').attr( 'src', 'https://download.weezeel.com/' + id + '/thumbnail/normal' );
        file.addClass( types[ type ] );
        file.addClass( 'weexplorer-file-' + id );
        file.data( 'file-id', id );

        // Return icon
        return file;

    };

    var openDirectory = function( id ){

        // Get Structure Info
        wz.structure( id, function( error, structure ){

            if( error ){
                return false;
            }
			
			// Update current
        	updateCurrent( structure.id );
			recordNavigation();
			            
            // List Structure Files
            structure.list( function( error, list ){
                
                // To Do -> Error

                var length = list.length;
                var files  = $();

                // Generate File icons
                for( var i = 0; i < length; i++ ){
                    files = files.add( icon( list[ i ].id, list[ i ].name, list[ i ].type, list[ i ].size, list[ i ].modified, list[ i ].created ) );
                }

                // Display icons
                fileArea.children().not('.prototype').remove();
				fileArea.append( files );

                // Update Folder info
                folderName.text( structure.name );

                // Nullify
                files = null;

            });

        });

    };
    
    var beginRename = function( icon ){
        
        renaming = icon;
        
        $( 'textarea', icon)
			.removeAttr('readonly')
			.focus()
			.select()
			.removeClass('wz-dragger');
			
    };
    
    var finishRename = function(){
        
        var icon = renaming;
        renaming = $();
        
        wz.structure(icon.data('file-id'), function( error, structure ){
            structure.rename( $( 'textarea', icon ).attr('readonly','readonly').blur().addClass('wz-dragger').val(), function(error){})
        });
        
    }
    
    var createDirectory = function(){

        wz.structure( current, function( error, structure ){

            // To Do -> Error

            structure.createDirectory( null, function( error, newDirectory ){
				//To Do -> Error          
            });

        });

    };

    var removeStructure = function( id ){

        wz.structure( id, function( error, structure ){

            // To Do -> Error
            structure.remove( function( error, quota ){
				// To Do -> Error
			});

        });

    };
	
	var deleteAllActive = function(){
		
		var response = ' el archivo seleccionado? Si lo haces jamás podrás recuperarlo.';
		
		if( $('.weexplorer-file.active').size() > 1){
			response = ' los ' + $('.weexplorer-file.active').size() + ' archivos seleccionados? Si lo haces jamás podrás recuperarlos.';
		}
		
		if (confirm('¿Seguro que quieres eliminar' + response)) {
		
			$('.weexplorer-file.active').each(function(){
				
				removeStructure( $(this).data('file-id') );
				
			});
		
		}
		
	};	
	
	var sortByName = function(a,b){
		
		if(a.children('textarea').val().toLowerCase() < b.children('textarea').val().toLowerCase() ){
			return -1;
		}
		
		if(a.children('textarea').val().toLowerCase() > b.children('textarea').val().toLowerCase() ){
			return 1;
		}
		
		return 0;
		
	};
	
	var sortBySize = function(a,b){
		
		if(a.children('.weexplorer-file-size').text() < b.children('.weexplorer-file-size').text()){
			return -1;
		}
		
		if(a.children('.weexplorer-file-size').text() > b.children('.weexplorer-file-size').text()){
			return 1;
		}
		
		return 0;
		
	};
	
	var sortByCreationDate = function(a,b){
		
		if(a.children('.weexplorer-file-date-creation').text() < b.children('.weexplorer-file-date-creation').text()){
			return -1;
		}
		
		if(a.children('.weexplorer-file-date-creation').text() > b.children('.weexplorer-file-date-creation').text()){
			return 1;
		}
		
		return 0;
		
	};
	
	var sortByModificationDate = function(a,b){
		
		if(a.children('.weexplorer-file-date-modification').text() < b.children('.weexplorer-file-date-modification').text()){
			return -1;
		}
		
		if(a.children('.weexplorer-file-date-modification').text() > b.children('.weexplorer-file-date-modification').text()){
			return 1;
		}
		
		return 0;
		
	};
	
	var displayIcons = function(list){
		
		fileArea.append( list );
		
		// Nullify
		list = null;
		
	};

    // Events
    $( win )
	
	.on( 'upload-enqueue', function(e, list){
		
		var length = list.length;
		var files  = $();
		
		if( !length || list[ 0 ].parent !== current ){
			return false;
		}
		
		// Generate File icons
		for( var i = 0; i < length; i++ ){
			files = files.add( icon( list[ i ].id, list[ i ].name, list[ i ].type, list[ i ].size, list[ i ].modified, list[ i ].created ).addClass('weexplorer-file-uploading') );
		}
		
		// Display icons
		fileArea.append( files );

		// Nullify
		files = null;
				
	})
	
	.on( 'contextmenu', '.weexplorer-menu-sort', function(){
		
		var icon = $(this);
        var menu = wz.menu();
		var list = [];

        menu
            .add('Sort By Name', function(){
				$( '.weexplorer-file' ).each(function(){
					list.push($(this));
				});
                list = list.sort(sortByName);
				displayIcons(list, true);
            })
            .add('Sort by Size', function(){
                $( '.weexplorer-file' ).each(function(){
					list.push($(this));
				});
				list = list.sort(sortBySize);
				displayIcons(list, true);
            })
			.add('Sort By Creation Date', function(){
                $( '.weexplorer-file' ).each(function(){
					list.push($(this));
				});
				list = list.sort(sortByCreationDate);
				displayIcons(list, true);
            })
            .add('Sort By Modification Date', function(){
                $( '.weexplorer-file' ).each(function(){
					list.push($(this));
				});
				list = list.sort(sortByModificationDate);
				displayIcons(list, true);
            });

            menu.render();
		
	})
	
	.on( 'structure-remove', function(e, id){
			fileArea.children( '.weexplorer-file-' + id ).remove();
	})
	
	.on( 'structure-rename', function(e, structure){
		if( structure.parent === current ){
			fileArea.children( '.weexplorer-file-' + structure.id ).children('textarea').val(structure.name);
		}		
	})
	
	.on( 'structure-new', function(e, structure){
		
		if( structure.parent === current ){
			console.log('Bang!');
			fileArea.append( icon( structure.id, structure.name, structure.type, structure.size, structure.modified, structure.created ) );
		}
		
	})
	
	.on( 'structure-move', function(e, structure, destinyID, originID){
				
		if( originID === current ){
			fileArea.children( '.weexplorer-file-' + structure.id ).remove();
		}else if( destinyID === current ){
			fileArea.append( icon( structure.id, structure.name, structure.type, structure.size, structure.modified, structure.created ) );
		}
		
	})
    	
	.on( 'click', '.weexplorer-menu-download', function(){
		$('.active.file',win).each(function(){
			wz.structure($(this).data('file-id'), function(e,st){
				st.download();
			});
		});
	})
	
	.on( 'click', '.weexplorer-option-next', function(){
		if(nextButton.hasClass('active')){
			recordNext();		
		}
	})
	
	.on( 'click', '.weexplorer-option-back', function(){
		if(backButton.hasClass('active')){
			recordBack();		
		}
	})
	
	.on( 'click', '.weexplorer-menu-views', function(){
		if(views.hasClass('grid')){
			views.removeClass('grid').addClass('list');		
			fileArea.removeClass('grid').addClass('list');
		}else{
			views.removeClass('list').addClass('grid');
			fileArea.removeClass('list').addClass('grid');
		}
	})
	
	.on( 'click', '.weexplorer-file.active', function(e){
		
		if( !e.shiftKey && !e.ctrlKey && !e.metaKey ){
			$(this).addClass('last-active').siblings('.active').removeClass('active last-active');
		}
		
	})

    .on( 'upload-start', function( e, structure ){
        console.log('start',structure);
        //fileArea.append( icon( structure.id, structure.name, structure.type ) );
    })

    .on( 'upload-progress', function( e, structureID, progress ){
        console.log('upload-progress', progress );
        //fileArea.append( icon( structure.id, structure.name, structure.type ) );
    })

    .on( 'upload-end', function( e, structure ){
        console.log('end',structure);
		$( '.weexplorer-file-' + structure.id ).removeClass('weexplorer-file-uploading').find('img').attr('src', structure.thumbnails.normal );
    })
    
    .on( 'mousedown', '.weexplorer-file:not(.active)', function( e ){
        
        e.stopPropagation();
        
        if(e.ctrlKey || e.metaKey){
            
            $( this ).addClass('active');
            
        }else if(e.shiftKey){
            
            var icons = $( '.weexplorer-file' );
            var begin = icons.index(this);
            var final = icons.index(icons.filter( '.last-active' ));
            
            if(begin < final){
                var row = icons.slice(begin,final+1).addClass('active');
            }else{
                var row = icons.slice(final,begin+1).addClass('active');
            }
            
            icons.not(row).removeClass('active');
            
        }else{
            $( this ).addClass('active').siblings('.active').removeClass('active');
        }
		
		$( '.weexplorer-file.last-active', fileArea ).removeClass('last-active');
        $( this ).addClass('last-active');
        
    })
    
    .on( 'mousedown', '.weexplorer-file.active', function( e ){
        
        e.stopPropagation();
        
        if(e.ctrlKey || e.metaKey){
            $( this ).removeClass('active');
        }else if(e.shiftKey){
            
            var icons = $( '.weexplorer-file' );
            var begin = icons.index(this);
            var final = icons.index(icons.filter( '.last-active' ));
            
            if(begin < final){
                var row = icons.slice(begin,final+1).addClass('active');
            }else{
                var row = icons.slice(final,begin+1).addClass('active');
            }
            
            icons.not(row).removeClass('active');
            
        }
    
    })
    
    .on( 'mousedown', '.weexplorer-file-zone', function(){
        
        if( renaming.size() ){
            finishRename(); 
        }
            $( '.weexplorer-file.active' , fileArea ).removeClass('active');
        
    })
    
    .on( 'mousedown', 'textarea', function(){
        
        if( $(this).parent().hasClass('active') ){
            beginRename( $(this).parent() );
        }
        
    })
    
    .on( 'dblclick', 'textarea:not([readonly])', function( e ){
        e.stopPropagation();
    })
    
    .on( 'dblclick', '.weexplorer-file.file', function(){

        var id = $(this).data('file-id');

        wz.structure( id, function( error, structure ){
            
            structure.associatedApp( function( error, app ){

                if( app ){
                    wz.app.createWindow( app, [ id ] );
                }else{
                    alert( error );
                }

            });
            
        });
        
    })
	
	.on( 'dblclick', '.weexplorer-file.directory', function(){
        openDirectory($(this).data('file-id'));
    })
    
    .key( 'enter', function(){
        
        if( renaming.size() ){
            finishRename(); 
        }else{
            $( '.weexplorer-file.active' , fileArea ).dblclick();
        }
        
    })
    
    .key( 'backspace,delete', function(){
		
		if( $('.weexplorer-file.active').size() ){
			deleteAllActive();
		}else{
			$( '.weexplorer-option-back' ).click();
		}
        
    })
	
	.key( 'left', function(){
		
		$( '.weexplorer-file.last-active' ).prev().not( '.weexplorer-file.prototype' ).mousedown();
        
    })
	
	.key( 'right', function(){
		
		$( '.weexplorer-file.last-active' ).next().mousedown();
        
    })
	
	.key( 'up', function(){
		
		var leftStart = $( '.weexplorer-file.last-active' ).position().left;
		var object = $( '.weexplorer-file.last-active' ).prev();
		
		while( object.size() && leftStart !== object.position().left ){
			object = object.prev();	
		}
		
		object.mousedown();
		
    })
	
	.key( 'down', function(){
        
		var leftStart = $( '.weexplorer-file.last-active' ).position().left;
		var object = $( '.weexplorer-file.last-active' ).next();
		
		while( leftStart !== object.position().left ){
			if(!object.next().size()){
				break;
			}
			object = object.next();				
		}
		
		object.mousedown();
		
    })

    .on( 'contextmenu', '.weexplorer-file', function(){

        var icon = $(this);
        var menu = wz.menu();

        menu
            .add('Renombrar', function(){
                beginRename( icon );
            })
            .add('Borrar', function(){
                deleteAllActive();
            });

            if(icon.hasClass('directory')){
                menu.add('Soy un directorio');
            }

            if(icon.hasClass('special-directory')){
                menu.add('Soy un directorio especial');
            }

            if(icon.hasClass('file')){
                menu.add('Soy un archivo');
            }

            if(icon.hasClass('temporal-file')){
                menu.add('Soy un archivo temporal');
            }

            menu.render();

    })

    .on( 'wz-dragstart', '.weexplorer-file', function( e, drag ){
		
		if( !($('.weexplorer-file.active').size() > 1) ){
			drag.ghost( $(this).cloneWithStyle() );
		}else{
			var ghost = filePrototype.clone()
										.css({'width':'148px', 'height':'98px', 'background':'green', 'border-radius':'7px', 'border':'solid 1px #fff', 'font-size':'36px', 'color':'white', 'text-align':'center', 'padding-top':'50px'})
										.text($('.weexplorer-file.active').size());
			ghost.find('textarea, img, span').remove()
			drag.ghost( ghost );
		}

    })
	
	.on( 'wz-drop', '.wz-drop-area', function( e, item ){
		
		e.stopPropagation();
		
		if( $(this).hasClass('directory') ){
			var dest = $(this).data('file-id');
		}else{
			var dest = current;
		}
				
		item.siblings('.active').add( item ).each( function(){
						
			wz.structure( $(this).data('file-id'), function( error, structure ){
				
				//To Do -> Error

				structure.move( dest, null, function( error ){
					// To Do -> Error
				});
				
			});
		});

    })

    .on( 'wz-dropenter', '.weexplorer-file.directory', function(){
        $(this).addClass('weexplorer-directory-over');
    })

    .on( 'wz-dropleave', '.weexplorer-file.directory', function(){
		$(this).removeClass('weexplorer-directory-over');
    })       

    fileArea.on( 'contextmenu', function(){

        wz.menu()
            .add('Subir archivo', function(){
                uploadButton.click();
            })
            .add('Nuevo directorio', function(){
                createDirectory();
            })
            .separator()
            .add('Obtener información')
            .render();

    });

    uploadButton.on( 'click', function(){
        $(this).data( 'destiny', current );
    });

    openDirectory( 'root' );

});
