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
        $( this ).addClass('active').siblings('.active').removeClass('active');
		
    })
	
	.on( 'mousedown', '.weexplorer-file.active', function( e ){
		e.stopPropagation();		
    })
	
	.on( 'mousedown', '.weexplorer-file-zone', function(){
		
        $( '.weexplorer-file.active' ).removeClass('active');
		
    })

    .on( 'dblclick', '.weexplorer-file', function(){

        var id = $(this).data('file-id');

        wz.structure( id, function( error, structure ){

            console.log( structure.formats );

            structure.associatedApp( function( error, app ){

                if( app ){
                    wz.app.createWindow( app, [ id ] );
                }else{
                    alert( error );
                }

            });
            
        });
        
    })

    .on( 'contextmenu', '.weexplorer-file', function(){

        var icon = $(this);
		var menu = wz.menu();

        menu
            .add('Renombrar')
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
