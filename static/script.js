/*global wz:true $:true */

wz.app.addScript( 1, 'common', function( win ){

    // Variables
    var record = [];
    var current = null;
    var pointer = -1;
    var controlNav = false;
    
    var types   = [
                    'directory',
                    'special-directory',
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
        pointer++;
        record[pointer] = id;
        
        if(controlNav){
            
            record = record.slice(0,pointer+1);
            controlNav = false;
            
        }
        
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

    var icon = function( id, name, type ){

        // Clone prototype
        var file = filePrototype.clone().removeClass('prototype');

        // Add new properties
        file.children('textarea').text( name );
        file.find('img').attr( 'src', 'https://download.weezeel.com/' + id + '/thumbnail/normal' );
        file.addClass( types[ type ] );
        file.addClass( 'weexplorer-file-' + id );
        file.data( 'file-id', id );

        // Return icon
        return file;

    };

    var openDirectory = function( id ){

        // Update current
        updateCurrent(id);
        
        recordNavigation();

        // Get Structure Info
        wz.structure( id, function( error, structure ){

            if( error ){
                return false;
            }
            
            // List Structure Files
            structure.list( function( error, list ){
                
                // To Do -> Error

                var length = list.length;
                var files  = $();

                // Generate File icons
                for( var i = 0; i < length; i++ ){
                    files = files.add( icon( list[ i ].id, list[ i ].name, list[ i ].type ) );
                }

                // Display icons
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
        
        $( 'textarea', icon).removeAttr('readonly').focus().select();

    };
    
    var finishRename = function(){
        
        var icon = renaming;
        renaming = $();
        
        wz.structure(icon.data('file-id'), function( error, structure ){
            structure.rename( $( 'textarea', icon ).attr('readonly','readonly').blur().val(), function(error){})
        });
        
    }
    
    var createDirectory = function(){

        wz.structure( current, function( error, structure ){

            // To Do -> Error

            structure.createDirectory( null, function( error, newDirectory ){
                fileArea.append( icon( newDirectory.id, newDirectory.name, newDirectory.type ) );
            });

        });

    };

    var removeStructure = function( id ){

        wz.structure( id, function( error, structure ){

            // To Do -> Error
            console.log(error);
            
            structure.remove( function( error, quota ){
                
                console.log( error, quota );

                if( error ){
                    // To Do -> Error
                    console.log(error);
                }else{
                    fileArea.children( '.weexplorer-file-' + id ).remove();
                }
                console.log('resultado', error, quota);
            });

        });

    };

    // Events
    $( win )
    	
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
        fileArea.append( icon( structure.id, structure.name, structure.type ) );
    })
    
    .on( 'mousedown', '.weexplorer-file:not(.active)', function( e ){
        
        e.stopPropagation();
        
        if(e.ctrlKey || e.metaKey){
            
            $( this ).addClass('active');
            $( '.weexplorer-file.last-active', fileArea ).removeClass('last-active');
            $( this ).addClass('last-active');
            
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
            $( '.weexplorer-file.last-active', fileArea ).removeClass('last-active');
            $( this ).addClass('last-active');
        }
        
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
    
    .on( 'dblclick', '.weexplorer-file', function(){

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
    
    .key( 'enter', function(){
        
        if( renaming.size() ){
            finishRename(); 
        }else{
            $( '.weexplorer-file.active' , fileArea ).dblclick();
        }
        
    })
    
    .key( 'backspace,delete', function(){
        
        removeStructure( $(this).data('file-id') );
        
    })

    .on( 'contextmenu', '.weexplorer-file', function(){

        var icon = $(this);
        var menu = wz.menu();

        menu
            .add('Renombrar', function(){
                beginRename( icon );
            })
            .add('Borrar', function(){
                removeStructure( icon.data('file-id') );
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

        drag.ghost( $(this).cloneWithStyle().attr('id','wz-drop') );

    })

    .on( 'wz-dropenter', '.wz-drop-area', function( e, item ){
        console.log('enter', item );
    })

    .on( 'wz-dropmove', '.wz-drop-area', function( e, item ){
        console.log('move', item );
    })

    .on( 'wz-dropleave', '.wz-drop-area', function( e, item ){
        console.log('leave', item );
    })

    .on( 'wz-drop', '.wz-drop-area', function( e, item ){
        console.log('drop', item );
    });
       

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

    // Start Window
    openDirectory( 'root' );

});
