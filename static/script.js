/*global wz:true $:true */

wz.app.addScript( 1, 'main', function( win, app, lang, params ){

    // Variables
    var record = [];
    var current = null;
    var pointer = -1;
    var controlNav = false;

    var types = [
                    'directory wz-drop-area',
                    'special-directory wz-drop-area',
                    'file',
                    'temporal-file',
					'null',
					'null',
					'received'
                ];

    var nextButton    	= $( '.weexplorer-option-next', win );
    var backButton    	= $( '.weexplorer-option-back', win );
    var views         	= $( '.weexplorer-menu-views', win );
	var sidebar       	= $( '.weexplorer-sidebar', win );
	var sidebarElement 	= $( '.weexplorer-sidebar-element.prototype', sidebar );
    var fileArea      	= $( '.weexplorer-file-zone', win );
    var filePrototype 	= $( '.weexplorer-file.prototype', win );
    var folderName    	= $( '.weexplorer-folder-name', win );
    var uploadButton  	= $( '.weexplorer-menu-upload', win );

    var uploading        = $( '.weexplorer-uploading', win );
    var uploadingBar     = $( '.weexplorer-uploading-bar', uploading );
    var uploadingItem    = $( '.item-now', uploading );
    var uploadingItems   = $( '.total-items', uploading );
    var uploadingElapsed = $( '.elapsed-time', uploading );

    var renaming = $();
	var prevName = '';

    // Functions
    var recordNavigation = function(){

        if( record[ pointer + 1 ] ){
            nextButton.addClass('active');
        }else{
            nextButton.removeClass('active');
        }

        if( record[ pointer - 1 ] ){
            backButton.addClass('active');
        }else{
            backButton.removeClass('active');
        }

    };

    var updateCurrent = function( id ){

        current = id;

        if( !controlNav ){
            pointer++;
            record = record.slice( 0, pointer + 1 );
        }

        record[ pointer ] = id;
        controlNav = false;

    };

    var recordBack = function(){

        pointer--;
        controlNav = true;
        openDirectory( record[ pointer ]);

    };

    var recordNext = function(){

        pointer++;
        controlNav = true;
        openDirectory( record[ pointer ] );

    };

    var icon = function( id, name, type, size, modified, created ){

        // Clone prototype
        var file = filePrototype.clone().removeClass('prototype');

        // Add new properties
        file.children('textarea').text( name );
        file.children('.weexplorer-file-size').text( size );
        file.children('.weexplorer-file-date-modification').text( modified );
        file.children('.weexplorer-file-date-creation').text( created );
        file.find('img').attr( 'src', 'https://download.weezeel.com/' + id + '/icon/normal' );
        file.addClass( types[ type ] );
        file.addClass( 'weexplorer-file-' + id );
        file.data( 'file-id', id );

        // Return icon
        return file;

    };

    var openDirectory = function( id ){

		if( $( '.folder-' + id, sidebar ).size() ){
			$('.weexplorer-sidebar-element.active', win).removeClass('active');
			$( '.folder-' + id, sidebar ).addClass('active');
		}else{
			$('.weexplorer-sidebar-element.active', win).removeClass('active');
		}
		
        // Get Structure Info
        wz.structure( id, function( error, structure ){

            if( error ){
                alert('No ha sido posible abrir el directorio');
                return false;
            }

            // Update current
            updateCurrent( structure.id );
            recordNavigation();

            // List Structure Files
            structure.list( function( error, list ){

                if( error ){
                    alert('No ha sido posible abrir el directorio');
                    return false;
                }

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
				
				// When a new window opens we activate the first file as last-active 
				files.first().addClass('last-active hidden');
		
                // Nullify
                files = null;

            });

        });	

    };

    var beginRename = function( icon ){

        renaming = icon;
		prevName = $( 'textarea', icon).val();
		
        $( 'textarea', icon)
            .removeAttr('readonly')
            .focus()
            .select()
            .removeClass('wz-dragger');

    };

    var finishRename = function(){

        var icon = renaming;
        renaming = $();

        wz.structure( icon.data('file-id'), function( error, structure ){
            structure.rename( $( 'textarea', icon ).attr( 'readonly', 'readonly' ).blur().addClass('wz-dragger').val(), function( error ){});
        });

    };

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
        
        if( $('.weexplorer-file.active', win).size() > 1){
            response = ' los ' + $('.weexplorer-file.active', win).size() + ' archivos seleccionados? Si lo haces jamás podrás recuperarlos.';
        }
        
        if (confirm('¿Seguro que quieres eliminar' + response)) {
        
            $('.weexplorer-file.active', win).each(function(){
                
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
		
    .on( 'upload-enqueue', function( e, list ){
        
        var length = list.length;
        var files  = $();
        
        if( !length ){
            return false;
        }

        // Display Message
        if( !uploading.hasClass('uploading') ){

            uploading
                .addClass('uploading')
                .clearQueue()
                .stop()
                .transition({ height : '+=33' }, 500 );

            fileArea
                .clearQueue()
                .stop()
                .transition({ height : '-=33' }, 500 );
				
			sidebar
                .clearQueue()
                .stop()
                .transition({ height : '-=33' }, 500 );

            uploadingBar.width(0);

            uploadingItem.text( 0 );
            uploadingItems.text( list.length );
            uploadingElapsed.text( 'Calculating...' );

        }else{

            uploadingItems.text( parseInt( uploadingItems.text(), 10 ) + list.length );
            uploadingElapsed.text( 'Calculating...' );

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

    .on( 'upload-queue-end', function( e ){

        uploading
                .removeClass('uploading')
                .clearQueue()
                .stop()
                .transition({ height : '-=33' }, 500 );

            fileArea
                .clearQueue()
                .stop()
                .transition({ height : '+=33' }, 500 );
				
			sidebar
                .clearQueue()
                .stop()
                .transition({ height : '+=33' }, 500 );

    })
    
    .on( 'structure-remove', function(e, id, quota, parent){
        
        fileArea.children( '.weexplorer-file-' + id ).remove();

        if( current === id ){
            openDirectory( parent );
        }

    })
    
    .on( 'structure-rename', function(e, structure){

        if( structure.parent === current ){
            fileArea.children( '.weexplorer-file-' + structure.id ).children('textarea').val(structure.name);
        }

    })
    
    .on( 'structure-new', function(e, structure){

        if( structure.parent === current ){
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
	
	.on( 'wz-blur', function(){
		$( '.weexplorer-sort', win ).removeClass( 'show' );
	})
        
    .on( 'click', '.weexplorer-menu-download', function(){
        $('.active.file', win).each(function(){
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
            $(this).addClass('last-active').siblings('.active').removeClass('active last-active hidden');
        }
        
    })

    .on( 'upload-start', function( e, structure ){
        uploadingItem.text( parseInt( uploadingItem.text(), 10 ) + 1 );
        //fileArea.append( icon( structure.id, structure.name, structure.type ) );
    })

    .on( 'upload-progress', function( e, structureID, progress, queueProgress, time ){

        fileArea.children( '.weexplorer-file-' + structureID ).children('article')
            .addClass('weexplorer-progress-bar')
            .clearQueue()
            .stop()
            .transition( { width: ( progress * 100 ) + '%' }, 150 );

        uploadingBar
            .clearQueue()
            .stop()
            .transition( { width: ( queueProgress * 100 ) + '%' }, 150 );

        time = parseInt( time, 10 );

        if( isNaN( time ) ){
            uploadingElapsed.text( 'Calculating...' );
            return false;
        }

        if( time > 59 ){
            time = parseInt( time/60, 10 ) + ' minutes';
        }else{
            time = time + ' seconds';
        }

        uploadingElapsed.text( time + ' ' + 'left' );

    })

    .on( 'upload-end', function( e, structure ){

        var icon = fileArea.children( '.weexplorer-file-' + structure.id );

        icon.children('article')
            .removeClass('weexplorer-progress-bar');

        icon
            .removeClass('weexplorer-file-uploading temporal-file')
            .addClass('file')
            .find('img')
            .attr('src', structure.icons.normal + '?' + new Date().getTime() );
            
    })
	
	.on( 'mousedown', function(){
		$( '.weexplorer-sort', win ).removeClass( 'show' );	
	})
    
    .on( 'mousedown', '.weexplorer-file:not(.active)', function( e ){
        
        e.stopPropagation();
        
        if(e.ctrlKey || e.metaKey){
            
            $( this ).addClass('active');
            $( '.weexplorer-file.last-active', fileArea ).removeClass('last-active hidden');
            $( this ).addClass('last-active');
            
        }else if(e.shiftKey){
            
            var icons = $( '.weexplorer-file', win );
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
            $( '.weexplorer-file.last-active', fileArea ).removeClass('last-active hidden');
            $( this ).addClass('last-active');
            
        }       
        
    })
    
    .on( 'mousedown', '.weexplorer-file.active', function( e ){
        
        e.stopPropagation();
        
        if(e.ctrlKey || e.metaKey){
            $( this ).removeClass('active');
        }else if(e.shiftKey){
            
            var icons = $( '.weexplorer-file', win );
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
    
    .on( 'mousedown', 'textarea', function(e){
        
		if( $(this).attr('readonly') ){
			e.preventDefault();
			if( $(this).parent().hasClass('active') ){
            	beginRename( $(this).parent() );
        	}
		}       
        
    })
	
	.on( 'mousedown', '.weexplorer-file', function(){
		if( $(this).children('textarea').attr('readonly') ){
			if( renaming.size() ){
            	finishRename(); 
        	}
		}
	})
	
	.on( 'mousedown', '.weexplorer-menu-toggle', function(){
		if( win.hasClass('sidebar') ){
			win.transition({ width : 544 }, 250 );
			$('.weexplorer-menu', win).transition({ width : 268 }, 250);
			$('.weexplorer-sidebar', win).transition({ width : 0 }, 250);
			win.removeClass('sidebar');
		}else{
			win.transition({ width : 684 }, 250, function(){
				win.addClass('sidebar');
			});
			$('.weexplorer-menu', win).transition({ width : 408 }, 250);
			$('.weexplorer-sidebar', win).transition({ width : 139 }, 250);
		}
	})
	
	.on( 'mousedown', '.weexplorer-sidebar-element', function(){
		if( !$(this).hasClass('active') ){
			openDirectory($(this).data('file-id'));
		}
	})
	
	.on( 'mousedown', '.weexplorer-menu-sort', function( e ){
        
		if( !$( '.weexplorer-sort', win ).hasClass( 'show' ) ){
			$( '.weexplorer-sort', win ).addClass( 'show' );
			e.stopPropagation();
		}	
        
    })
	
	.on( 'mousedown', '.weexplorer-sort li', function(){
        
        $( '.weexplorer-sort li.active', win ).removeClass( 'active' );
		$( this ).addClass( 'active' );
		
		list = [];
		
		if( $(this).hasClass( 'weexplorer-sort-name' ) ){
			
			$( '.weexplorer-file', win ).each(function(){
                list.push($(this));
            });
			
            list = list.sort(sortByName);
            displayIcons(list, true);
			
		}else if( $(this).hasClass( 'weexplorer-sort-size' ) ){
			
			$( '.weexplorer-file', win ).each(function(){
                list.push($(this));
            });
			
            list = list.sort(sortBySize);
            displayIcons(list, true);
			
		}else if( $(this).hasClass( 'weexplorer-sort-creation' ) ){
			
			$( '.weexplorer-file', win ).each(function(){
                list.push($(this));
            });
			
            list = list.sort(sortByCreationDate);
            displayIcons(list, true);
			
		}else{
			
			$( '.weexplorer-file', win ).each(function(){
                list.push($(this));
            });
			
            list = list.sort(sortByModificationDate);
            displayIcons(list, true);
			
		}	
        
    })
	
	.on( 'dblclick', '.weexplorer-file.received', function(){
		wz.app.createWindow(1, $(this).data( 'file-id' ), 'received');
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
		$('.weexplorer-sidebar-element.active', win).removeClass('active');
    })
	
	.key( 'enter', function(e){
		
		if( $(e.target).is('textarea') ){
			e.preventDefault();
			finishRename();
		}else{
			$( '.weexplorer-file.active' , fileArea ).dblclick();
		}
		
	})
    
    .key( 'backspace', function(e){
        
		if( $(e.target).is('textarea') ){
			e.stopPropagation();
		}else{
			e.preventDefault();
			if( $('.weexplorer-file.active', win).size() ){
            	deleteAllActive();
        	}else{
            	$( '.weexplorer-option-back', win ).click();
        	}
		}
  
    })
    
    .key( 'delete', function(e){
		
		if( $(e.target).is('textarea') ){
			e.stopPropagation();
		}else{
			if( $('.weexplorer-file.active', win).size() ){
				deleteAllActive();
			}
		}
		
    })
	
	.key( 'esc', function(e){       
		
		if( $(e.target).is('textarea') ){
			e.preventDefault();
			var icon = renaming;
        	renaming = $();
			$( 'textarea', icon ).attr( 'readonly', 'readonly' ).blur().addClass('wz-dragger').val( prevName );
		}else{
			$( '.weexplorer-file.active' , fileArea ).removeClass('active');
		}
		
    })
	
	.key( 'ctrl + enter', function(){
		
		if( $( '.weexplorer-file.active.last-active', fileArea ).hasClass('directory') ){
			wz.app.createWindow(1, $( '.weexplorer-file.active.last-active', fileArea ).data( 'file-id' ), 'main');
		}
			
	})
	
	.key( 'f2', function(){
		beginRename( $( '.weexplorer-file.active.last-active', fileArea ) );
	})
    
    .key( 'left', function(e){
		
		if( $(e.target).is('textarea') ){
			e.stopPropagation();
		}else{
			$( '.weexplorer-file.last-active', fileArea ).prev().not( '.weexplorer-file.prototype' ).mousedown();
		}       
        
    })
    
    .key( 'right', function(e){
        
		if( $(e.target).is('textarea') ){
			e.stopPropagation();
		}else{
			$( '.weexplorer-file.last-active', fileArea ).next().mousedown();
		}  
        
    })
    
    .key( 'up', function(e){
		
		if( $(e.target).is('textarea') ){
			e.stopPropagation();
		}else{
			var leftStart = $( '.weexplorer-file.last-active', fileArea ).position().left;
        	var object = $( '.weexplorer-file.last-active', fileArea ).prev();
        
			while( object.size() && leftStart !== object.position().left ){
				object = object.prev(); 
			}
        
        	object.mousedown();
		}  
          
    })
    
    .key( 'down', function(e){
		
		if( $(e.target).is('textarea') ){
			e.stopPropagation();
		}else{
			var leftStart = $( '.weexplorer-file.last-active', fileArea ).position().left;
			var object = $( '.weexplorer-file.last-active', fileArea ).next();
			
			while( leftStart !== object.position().left ){
				if(!object.next().size()){
					break;
				}
				object = object.next();             
			}
			
			object.mousedown();
		}
        
    })

    .on( 'contextmenu', '.weexplorer-file', function(){

        var icon = $(this);
        var menu = wz.menu();
		
		if(icon.hasClass('file')){
			
			menu
				.add('Rename', function(){
					beginRename( icon );
				})
				.add('Create link', function(){
                	wz.app.createWindow(1, icon.data( 'file-id' ), 'link');
            	})
				.add('Send to...', function(){
					wz.app.createWindow(1, icon.data( 'file-id' ), 'send');
				})
				.add('Share with...', function(){
					wz.app.createWindow(1, icon.data( 'file-id' ), 'share');
				})
				.add('Download', function(){
                	$( '.weexplorer-menu-download', win ).click();
            	})
				.add('Properties', function(){
                	wz.app.createWindow(1, icon.data( 'file-id' ), 'properties');
            	})
            	.add('Delete', function(){
                	deleteAllActive();
            	}, 'warning');
			
		}else if(icon.hasClass('directory')){
			
			menu
				.add('Rename', function(){
					beginRename( icon );
				})
				.add('Send to...', function(){
					wz.app.createWindow(1, icon.data( 'file-id' ), 'send');
				})
				.add('Share with...', function(){
					wz.app.createWindow(1, icon.data( 'file-id' ), 'share');
				})
				.add('Open in a new window', function(){
                	wz.app.createWindow(1, icon.data( 'file-id' ), 'main');
            	})
				.add('Properties', function(){
                	wz.app.createWindow(1, icon.data( 'file-id' ), 'properties');
            	})
            	.add('Delete', function(){
            	    deleteAllActive();
            	}, 'warning');
			
		}else if(icon.hasClass('received')){
			
			menu
				.add('Properties', function(){
                	wz.app.createWindow(1, icon.data( 'file-id' ), 'properties');
            	})
				.add('Accept', function(){
					wz.structure( icon.data( 'file-id' ), function( error, structure ){
						structure.accept();
					});
            	})
				.add('Refuse', function(){
                	wz.structure( icon.data( 'file-id' ), function( error, structure ){
						structure.refuse();
					});
            	}, 'warning');
			
		}

        menu.render();

    })

    .on( 'wz-dragstart', '.weexplorer-file', function( e, drag ){
        
        if( !($('.weexplorer-file.active', win).size() > 1) ){
            drag.ghost( $(this).cloneWithStyle() );
        }else{
            var ghost = filePrototype.clone()
                                        .css({'width':'148px', 'height':'98px', 'background':'green', 'border-radius':'7px', 'border':'solid 1px #fff', 'font-size':'36px', 'color':'white', 'text-align':'center', 'padding-top':'50px'})
                                        .text($('.weexplorer-file.active', win).size());
            ghost.find('textarea, img, span').remove()
            drag.ghost( ghost );
        }

    })
    
    .on( 'wz-drop', '.wz-drop-area', function( e, item ){
        
        if( item.data('file-id') !== $(this).data('file-id') ){
            
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
        }

    })

    .on( 'wz-dropenter', '.weexplorer-file.directory', function(e, file){
        if(file.data('file-id') !== $(this).data('file-id')){
            $(this).addClass('weexplorer-directory-over');
        }
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
	
	if( params ){
		openDirectory( params );
	}else{
		openDirectory( 'root' );
	}
	
	win.addClass('sidebar');

	wz.config( function(error, config){
		
		var elementFolder = sidebarElement.clone().removeClass('prototype');
		
		var userFolder = elementFolder.clone();
		wz.structure( config.user.rootPath, function( error, structure ){
			userFolder.data( 'file-id', structure.id ).addClass( 'active ' + 'folder-' + structure.id ).children( 'span' ).text( structure.name );
		});
		sidebar.append( userFolder );
		
		var sharedFolder = elementFolder.clone();
		wz.structure( config.user.sharedPath, function( error, structure ){
			sharedFolder.data( 'file-id', structure.id ).addClass( 'folder-' + structure.id ).children( 'span' ).text( structure.name );
		});
		sidebar.append( sharedFolder );
		
		var receivedFolder = elementFolder.clone();
		wz.structure( config.user.receivedPath, function( error, structure ){
			receivedFolder.data( 'file-id', structure.id ).addClass( 'folder-' + structure.id ).children( 'span' ).text( structure.name );
		});
		sidebar.append( receivedFolder );
		
	});
	
});
