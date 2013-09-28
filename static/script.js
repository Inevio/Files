
    // Variables
    var app            = this;
    var record         = [];
    var current        = null;
    var pointer        = -1;
    var controlNav     = false;
    var pressedNav     = false;
    var showSidebar    = false;
    var maximized      = false;
    var stickedSidebar = false;
    var channel        = null;

    var types = [
                    'directory wz-drop-area',
                    'special-directory wz-drop-area',
                    'file',
                    'temporal-file',
                    'received',
                    'pointer'/*,
                    'null'*/
                ];

    var nextButton     = $( '.weexplorer-option-next', win );
    var backButton     = $( '.weexplorer-option-back', win );
    var views          = $( '.weexplorer-menu-views', win );
    var downloadFiles  = $( '.weexplorer-menu-download', win );
    var sidebar        = $( '.weexplorer-sidebar', win );
    var sidebarElement = $( '.weexplorer-sidebar-element.wz-prototype', sidebar );
    var fileArea       = $( '.weexplorer-file-zone', win );
    var filePrototype  = $( '.weexplorer-file.wz-prototype', win );
    var folderName     = $( '.weexplorer-folder-name', win );
    var folderMain     = $( '.weexplorer-main', win );
    var uploadButton   = $( '.weexplorer-menu-upload', win );
    var winMenu        = $( '.wz-win-menu', win );
    var wxpMenu        = $( '.weexplorer-menu', win );
    var folderBar      = $( '.weexplorer-folder', win );
    var navigationMenu = $( '.weexplorer-navigation', win );

    var uploading        = $( '.weexplorer-uploading', win );
    var uploadingBar     = $( '.weexplorer-uploading-bar', uploading );
    var uploadingItem    = $( '.item-now', uploading );
    var uploadingItems   = $( '.total-items', uploading );
    var uploadingElapsed = $( '.elapsed-time', uploading );
    var uploadingPercent = $( '.uploaded-percent', uploading );

    var renaming = $();
    var prevName = '';

    var sortType       = app.sortType || 0;
    var viewType       = app.viewType || 0;
    var showingSidebar = app.sidebar  || false;
    var firstTime      = true;

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

        if( !controlNav && !pressedNav ){

            pointer++;
            record = record.slice( 0, pointer + 1 );

        }else if( pressedNav ){

            for( var i = 0 ; i < record.length ; i++ ){

                if( record[ i ] === id ){
                    pointer = i;
                }

            }

        }

        fileArea.data( 'file-id', id );

        record[ pointer ] = id;

        controlNav = false;
        pressedNav = false;

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

    var icon = function( structure ){

        // Clone prototype
        var file = filePrototype.clone().removeClass('wz-prototype');
        
        var modifiedToday = false;
        var createdToday  = false;
        var userDate      = new Date();
        var userDateInfo  = userDate.getDate() + '' + userDate.getMonth() + '' + userDate.getFullYear();

        var createdDate  = new Date( structure.created );
        var modifiedDate = new Date( structure.modified );

        if( userDateInfo !== ( modifiedDate.getDate() + '' + modifiedDate.getMonth() + '' + modifiedDate.getFullYear() ) ){
            
            var modifiedDay   = modifiedDate.format('d');
            var modifiedMonth = modifiedDate.format('m');
                
        }else{
            
            modifiedToday = true;
            
            var modifiedHour   = modifiedDate.format('H');
            var modifiedMinute = modifiedDate.format('i');
            var modifiedSecond = modifiedDate.format('s');

        }
        
        if( userDateInfo !== ( createdDate.getDate() + '' + createdDate.getMonth() + '' + createdDate.getFullYear() ) ){
            
            var createdDay   = createdDate.format('d');
            var createdMonth = createdDate.format('m');
                
        }else{
            
            createdToday = true;
            
            var createdHour   = createdDate.format('H');
            var createdMinute = createdDate.format('i');
            var createdSecond = createdDate.format('s');
                
        }
        
        // Add new properties
        file.children('textarea').text( structure.name );

        if( ( structure.type !== 0 && structure.type !== 1 && structure.type !== 5 ) || ( structure.type === 5 && structure.pointerType !== 0 && structure.pointerType !== 1 ) ){

            if( structure.size === null ){
                file.children('.weexplorer-file-size').text( '--' );
            }else{
                file.children('.weexplorer-file-size').text( wz.tool.bytesToUnit( structure.size, 2 ) );
            }
            
            if( modifiedToday ){
                file.children('.weexplorer-file-date-modification').text( lang.modified + modifiedHour + ':' + modifiedMinute + ':' + modifiedSecond  );
            }else{
                file.children('.weexplorer-file-date-modification').text( lang.modified + modifiedMonth + '/' + modifiedDay + '/' +  modifiedDate.getFullYear() );
            }
            
            /*
            if( createdToday ){
                file.children('.weexplorer-file-date-creation').text( createdHour + ':' + createdMinute + ':' + createdSecond  );
            }else{
                file.children('.weexplorer-file-date-creation').text(  createdMonth + '/' + createdDay + '/' +  createdDate.getFullYear() );
            }
            */

        }else{

            file.children('.weexplorer-file-size').text( '--' );
            file.children('.weexplorer-file-date-modification').text( '--' );

        }
        
        file.find('img').attr( 'src', structure.icons.normal + ( ( structure.type === 3 ) ? '?upload' : '' ) );
        file.addClass( types[ structure.type ] );
        if( structure.type === 3 ){
            file.addClass( 'weexplorer-file-uploading' );
        }

        if( structure.type === 5 ){

            if( structure.pointerType === 2 ){
                file.addClass( 'pointer-file' );
            }else{
                file.addClass( 'pointer-directory' );
            }

        }

        file.addClass( 'weexplorer-file-' + structure.id );

        file.data( {

            'file-id'           : structure.id,
            'file-size'         : structure.size,
            'file-creation'     : structure.modified,
            'file-modification' : structure.created,
            'permissions'       : structure.permissions

        } );

        if( structure.type === 0 ){

            file
                .addClass('wz-uploader-drag')
                .data( 'wz-uploader-destiny', structure.id );

        }
        
        if( structure.type === 5 ){

            if( structure.status !== 1 ){
                file.addClass( 'pointer-pending' );
            }

            file.data( 'file-pointer', structure.pointer );
            file.data( 'file-pointerType', structure.pointerType );

        }

        if( structure.sharedRoot ){
            file.addClass( 'shared' );
        }

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

                alert( lang.errorOpenDirectory, null, win.data().win );
                return false;

            }

            /*
            if( !structure.status === 1 ){

                $('.weexplorer-sidebar-element.active', win).removeClass('active');
                $( '.folder-' + current, sidebar ).addClass('active');

                alert( 'Estructura no aceptada', null, win.data().win );
                return false;
            }
            */

            // Update current
            updateCurrent( structure.id );
            recordNavigation();

            // List Structure Files
            structure.list( function( error, list ){

                if( error ){

                    alert( lang.errorOpenDirectory, null, win.data().win );
                    return false;

                }

                var length = list.length;
                var files  = $();

                // Generate File icons
                for( var i = 0; i < length; i++ ){
                    files = files.add( icon( list[ i ] ) );
                }

                // Display icons
                fileArea.children().not('.wz-prototype').remove();

                if( sortType === 1 ){
                    files.sort( sortBySize );
                }else if( sortType === 2 ){
                    files.sort( sortByCreationDate );
                }else if( sortType === 3 ){
                    files.sort( sortByModificationDate );
                }else{
                    files.sort( sortByName );
                }
                
                displayIcons( files );

                fileArea.data( 'wz-uploader-destiny', structure.id );

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

        if( $( 'textarea', icon ).val() !== prevName ){

            wz.structure( icon.data('file-id'), function( error, structure ){

                if( error ){
                    alert( error, null, win.data().win );
                }else{

                    structure.rename( $( 'textarea', icon ).attr( 'readonly', 'readonly' ).blur().addClass( 'wz-dragger' ).val(), function( error ){

                        if( error ){

                            if( error === 'NAME ALREADY EXISTS' ){
                                alert( lang.nameExists, null, win.data().win );
                            }else{
                                alert( error, null, win.data().win );
                            }

                            $( 'textarea', icon ).val( structure.name ).text( structure.name );

                        }

                    });

                }
                
            });

        }else{

            $( 'textarea', icon ).attr( 'readonly', 'readonly' ).blur().addClass( 'wz-dragger' );

        }

    };

    var createDirectory = function(){

        wz.structure( current, function( error, structure ){

            // To Do -> Error

            structure.createDirectory( null, function( error, newDirectory ){

                setTimeout( function(){

                    beginRename( $( '.weexplorer-file-' + newDirectory.id, fileArea ) );

                }, 100);

                //To Do -> Error  

            });

        });

    };
    
    var deleteAllActive = function(){
        
        var response = lang.deleteFile2;
        
        if( $('.weexplorer-file.active', win).size() > 1){
            response = lang.the + $('.weexplorer-file.active', win).size() + lang.deleteFile3;
        }

        confirm( lang.deleteFile + response, function( response ){

            if( response ){

                var notEnoughPermissions = false;
        
                $('.weexplorer-file.active', win).each(function(){

                    wz.structure( $(this).data( 'file-id' ), function( error, structure ){

                        if( error ){

                            alert( error, null, win.data().win );

                        }else if( structure.owner === wz.info.userId() || structure.permissions.modify === 1 ){

                            structure.remove( function( error, quota ){

                                if( error ){

                                    alert( error, null, win.data().win );

                                }

                            });

                        }else{

                            notEnoughPermissions = true;

                        }
           
                    });
                                    
                });

                if( notEnoughPermissions ){

                    alert( lang.notEnoughPermissions, null, win.data().win );

                }

            }

        }, win.data().win );
        
    };
    
    var sortByName = function(a,b){
        
        a = $( a );
        b = $( b );

        if( a.children('textarea').val().toLowerCase() < b.children('textarea').val().toLowerCase() ){
            return -1;
        }
        
        if( a.children('textarea').val().toLowerCase() > b.children('textarea').val().toLowerCase() ){
            return 1;
        }
        
        return 0;
        
    };
    
    var sortBySize = function(a,b){

        a = $( a );
        b = $( b );
        
        if( a.data( 'file-size' ) < b.data( 'file-size' ) ){
            return -1;
        }
        
        if( a.data( 'file-size' ) > b.data( 'file-size' ) ){
            return 1;
        }
        
        return 0;
        
    };
    
    var sortByCreationDate = function(a,b){

        a = $( a );
        b = $( b );
        
        if( a.data( 'file-creation' ) < b.data( 'file-creation' ) ){
            return -1;
        }
        
        if( a.data( 'file-creation' ) > b.data( 'file-creation' ) ){
            return 1;
        }
        
        return 0;
        
    };
    
    var sortByModificationDate = function(a,b){

        a = $( a );
        b = $( b );
        
        if( a.data( 'file-modification' ) < b.data( 'file-modification' ) ){
            return -1;
        }
        
        if( a.data( 'file-modification' ) > b.data( 'file-modification' ) ){
            return 1;
        }
        
        return 0;
        
    };
    
    var displayIcons = function(list){
        
        $( list ).filter( '.directory' ).each( function(){
            fileArea.append( this ).append('\n');
        });

        $( list ).not( '.directory' ).each( function(){
            fileArea.append( this ).append('\n');
        });
        
        // Nullify
        list = null;
        
    };
    
    var notifications = function(){

        wz.structure( 'inbox', function( error, structure ){
            
            structure.list( function( error, list ){
                
                if( list.length ){
                    $( '.receivedFolder', sidebar ).addClass( 'notification' ).find( '.weexplorer-sidebar-notification' ).text( list.length );
                }else{
                    $( '.receivedFolder', sidebar ).removeClass( 'notification' );
                }
                
            });
            
        });
        
    };

    /*
    var sharedNotifications = function(){

        wz.structure( 'shared', function( error, structure ){
            
            structure.list( function( error, list ){
                
                if( list.length ){
                    $( '.sharedFolder', sidebar ).addClass( 'notification' ).find( '.weexplorer-sidebar-notification' ).text( list.length );
                }else{
                    $( '.sharedFolder', sidebar ).removeClass( 'notification' );
                }
                
            });
            
        });
        
    };
    */

    var downloadComprobation = function(){

        if( $( '.weexplorer-file.active' ).not( '.directory' ).size() ){

            $( '.weexplorer-file.active' ).not( '.directory' ).each( function(){

                if( $( this ).data( 'permissions' ).download ){
                    downloadFiles.addClass( 'active' );
                    return false;
                }else{
                    downloadFiles.removeClass( 'active' );
                }

            });
                   
        }else{
            downloadFiles.removeClass( 'active' );
        }

    };

    var changeBaseWidth = function( list, width ){

        var length = list.length;
        var tmp    = null;

        while( length-- ){

            tmp = list[ length ].data( 'wz-fit-base-width' );

            if( tmp ){
                list[ length ].data( 'wz-fit-base-width', tmp + width );
            }

        }

    };

    var changeBaseOuterWidth = function( list, width ){

        var length = list.length;
        var tmp    = null;

        while( length-- ){

            tmp = list[ length ].data( 'wz-fit-base-outerWidth' );

            if( tmp ){
                list[ length ].data( 'wz-fit-base-outerWidth', tmp + width );
            }

        }

    };

    var saveBaseWidth = function( list, width ){

        var length = list.length;

        while( length-- ){
            list[ length ].data( 'wz-fit-base-width', list[ length ].width() );
        }

    };

    var saveBaseOuterWidth = function( list, width ){

        var length = list.length;

        while( length-- ){
            list[ length ].data( 'wz-fit-base-outerWidth', wz.tool.outerFullWidth( list[ length ], true ) );
        }

    };

    var translateUi = function(){

        $( '.weexplorer-menu-sort span', win ).text( lang.sortByName );
        $( '.weexplorer-sidebar-title-name', sidebar ).text( lang.favourites );
        $( '.item-now-before', win ).text( lang.uploading );
        $( '.total-items-before', win ).text( lang.of );
        $( '.elapsed-time-before', win ).text( '-' );
        $( '.weexplorer-sort-name', win ).find( 'span' ).text( lang.sortByName );
        $( '.weexplorer-sort-size', win ).find( 'span' ).text( lang.sortBySize );
        $( '.weexplorer-sort-creation', win ).find( 'span' ).text( lang.sortByCreation );
        $( '.weexplorer-sort-modification', win ).find( 'span' ).text( lang.sortByModif );

    };

    var setSortType = function( type ){

        if( type === 0 ){
            $( '.weexplorer-sort-name', win ).mousedown();
        }else if( type === 1 ){
            $( '.weexplorer-sort-size', win ).mousedown();
        }else if( type === 2 ){
            $( '.weexplorer-sort-creation', win ).mousedown();
        }else if( type === 3 ){
            $( '.weexplorer-sort-modification', win ).mousedown();
        }

    };

    var setViewType = function( type ){

        if( type ){
            views.mousedown();
        }

    };

    var isInSidebar = function( id, name ){
        return sidebar.find( '.folder-' + id ).length;
    };

    var addToSidebar = function( id, name ){

        wql.addFolder( [ id, 0 ], function( error, result ){

            // To Do -> Error
            if( !error && result.affectedRows ){

                addToSidebarUi( id, name );

                if( channel === null ){

                    wz.channel.create( function( error, chn ){

                        channel = chn;
                        channel.send( { action : 'addToTaskbar', id : id, name : name } );

                    });

                }else{
                    channel.send( { action : 'addToTaskbar', id : id, name : name } );
                }

            }
            
        });

    };

    var addToSidebarUi = function( id, name ){

        if( isInSidebar( id ) ){
            return false;
        }

        var controlFolder = sidebarElement.clone().removeClass('wz-prototype');

        controlFolder
            .data( 'file-id', id )
            .addClass( 'wz-drop-area folder-' + id )
            .children( 'span' )
                .text( name );

        sidebar.append( controlFolder );

    };

    var removeFromSidebar = function( id ){

        wql.removeFolder( id, function( error, result ){
            
            // To Do -> Error
            if( !error && result.affectedRows ){

                removeFromSidebarUi( id );

                if( channel === null ){

                    wz.channel.create( function( error, chn ){

                        channel = chn;
                        channel.send( { action : 'removeFromTaskbar', id : id } );

                    });

                }else{
                    channel.send( { action : 'removeFromTaskbar', id : id } );
                }

            }

        });

    };

    var removeFromSidebarUi = function( id ){
        return sidebar.find( '.folder-' + id ).remove();
    };

    // Events
    $( win )
    
    .on( 'message', function( e, info, message ){

        message = message[ 0 ];

        if( message.action === 'addToTaskbar' ){
            addToSidebarUi( message.id, message.name );
        }else if( message.action === 'removeFromTaskbar' ){
            removeFromSidebarUi( message.id );
        }

    })

    .on( 'wz-resize wz-maximize wz-unmaximize', function(){

        if( viewType ){

            var controlTextarea = 0;
            var biggestTextarea = 0;

            fileArea.find( '.weexplorer-file' ).not( '.wz-prototype' ).each( function(){

                var textareaWidth = 0;

                $(this).first().children().not( 'textarea, article' ).each( function(){

                    textareaWidth += $(this).outerWidth( true );

                    if( textareaWidth > controlTextarea ){
                        controlTextarea = textareaWidth;
                    }

                });

                if( controlTextarea > biggestTextarea ){
                    biggestTextarea = controlTextarea;
                }

            });

            textareaWidth = fileArea.find( '.weexplorer-file' ).not( '.wz-prototype' ).first().width() - biggestTextarea - 35; // To Do -> Estos 35 deben ser obtenidos de algun sitio, no manuales

            fileArea.find( 'textarea' ).css({ width : textareaWidth + 'px' });

        }
        
    })

    .on( 'upload-enqueue', function( e, list ){
        
        if( list[0].parent === current ){
            
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
                uploadingElapsed.text( lang.calculating );
    
            }else{
    
                uploadingItems.text( parseInt( uploadingItems.text(), 10 ) + list.length );
                uploadingElapsed.text( lang.calculating );
    
            }
            
            // Generate File icons
            for( var i = 0; i < length; i++ ){
                files = files.add( icon( list[ i ] ).addClass('weexplorer-file-uploading') );
            }
            
            // Display icons
            displayIcons( files );
    
            // Nullify
            files = null;
        
        }
        
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
        sidebar.children( '.folder-' + id ).remove();

        if( current === id ){
            openDirectory( parent );
        }

    })
    
    .on( 'structure-rename', function(e, structure){

        if( structure.parent === current ){
            fileArea.children( '.weexplorer-file-' + structure.id ).children( 'textarea' ).val( structure.name );
        }else if( structure.id === current ){
            $( '.weexplorer-folder-name', win ).text( structure.name );
        }

        $( '.folder-' + structure.id + ' .weexplorer-sidebar-element-name', sidebar ).text( structure.name );

    })
    
    .on( 'structure-new', function(e, structure){

        if( structure.parent === current ){
            displayIcons( icon( structure ) );
        }

    })
    
    .on( 'structure-move', function(e, structure, destinyID, originID){
        
        if( originID !== destinyID ){
            
            if( originID === current ){
                fileArea.children( '.weexplorer-file-' + structure.id ).remove();
            }else if( destinyID === current ){
                displayIcons( icon( structure ) );
            }
        
        }
        
    })
    
    .on( 'structure-thumbnail', function(e, structure){
        $( '.weexplorer-file-' + structure.id ).find('img').attr( 'src', structure.icons.normal + '?' + Math.random() );
    })
    
    .on( 'structure-inbox' +
         ' structure-accepted' +
         ' structure-refused' +
         ' structure-shared' +
         ' structure-sharedAccepted' +
         ' structure-sharedRefused',

        function(){
            console.log('weeXplorer structure-inbox');
            notifications();
        }

    )

    .on( 'structure-sharedStart', function( e, structure ){

        $( '.weexplorer-file-' + structure.id, win ).addClass( 'shared' );

    })

    .on( 'structure-sharedStop', function( e, structure ){

        $( '.weexplorer-file-' + structure.id, win ).removeClass( 'shared' );

    })

    .on( 'structure-conversionStart', function( event, structure ){
        
        $( '.weexplorer-file-' + structure + ' article', fileArea )
            .addClass('weexplorer-conversion-bar');
        
    })

    .on( 'structure-conversionProgress', function( event, structure, progress ){

        $( '.weexplorer-file-' + structure + ' article', fileArea )
            .addClass('weexplorer-conversion-bar')
            .clearQueue()
            .stop()
            .transition( { width: ( progress * 100 ) + '%' }, 150 );

    })

    .on( 'structure-conversionEnd', function( event, structure, progress ){

        $( '.weexplorer-file-' + structure + ' article', fileArea )
            .addClass('weexplorer-conversion-bar')
            .transition( { opacity : 0 }, 150, function(){

                $( this )
                    .removeClass('weexplorer-conversion-bar')
                    .removeAttr('style');

            });

    })
    
    .on( 'wz-blur', function(){
        $( '.weexplorer-sort', win ).removeClass( 'show' );
    })
        
    .on( 'mousedown', '.weexplorer-menu-download', function(){
        if( current !== $( '.sharedFolder', sidebar ).data( 'file-id' ) && current !== $( '.receivedFolder', sidebar ).data( 'file-id' ) ){

            $( '.active.file, .active.pointer-file', win ).each( function(){
                wz.structure($(this).data('file-id'), function(e,st){
                    st.download();
                });
            });
        }  
    })
    
    .on( 'click', '.weexplorer-option-next', function(){
        if( nextButton.hasClass('active') && !navigationMenu.hasClass( 'show' ) ){
            recordNext();       
        }
    })
    
    .on( 'click', '.weexplorer-option-back', function(){
        if( backButton.hasClass('active') && !navigationMenu.hasClass( 'show' ) ){
            recordBack();       
        }
    })

    .on( 'click', function(){
        downloadComprobation();
    })
    
    .on( 'mousedown', '.weexplorer-menu-views', function(){

        if( views.hasClass('grid') ){

            views.removeClass('grid').addClass('list');     
            fileArea.removeClass('grid').addClass('list');

            viewType = 1;

            wql.changeView( 1 );

            // Si es la primera vez que se produce este evento ignoramos la invocación del evento resize
            if( !firstTime ){

                win.trigger('wz-resize');

                firstTime = false;

            }

        }else{

            views.removeClass('list').addClass('grid');
            fileArea.removeClass('list').addClass('grid');

            viewType = 0;

            wql.changeView( 0 );

            fileArea.find( 'textarea' ).css({ width : '' });

        }

    })
    
    .on( 'click', '.weexplorer-file.active', function(e){

        if( renaming.size() ){
            finishRename();
        }
        
        navigationMenu.removeClass( 'show' );

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
            uploadingElapsed.text( lang.calculating );
            return false;
        }

        if( time > 59 ){
            time = parseInt( time/60, 10 ) + lang.minutes;
        }else{
            time = time + lang.seconds;
        }

        uploadingElapsed.text( time + ' ' + lang.left );
        uploadingPercent.text( '( ' + parseInt( queueProgress * 100, 10 ) + '% )' );

    })

    .on( 'upload-end', function( e, structure ){

        var icon = fileArea.children( '.weexplorer-file-' + structure.id );

        icon.children('article')
            .removeClass('weexplorer-progress-bar');

        icon
            .removeClass('weexplorer-file-uploading temporal-file')
            .addClass('file');
            
    })
    
    .on( 'mousedown', function(){
        $( '.weexplorer-sort', win ).removeClass( 'show' );
    })

    .on( 'click', 'textarea:not([readonly])', function( e ){
        e.stopPropagation();
    })
    
    .on( 'mousedown', '.weexplorer-file:not(.active)', function( e ){
        
        if(e.ctrlKey || e.metaKey){
            
            $( this ).addClass('active');
            $( '.weexplorer-file.last-active', fileArea ).removeClass('last-active hidden');
            $( this ).addClass('last-active');
            
        }else if(e.shiftKey){
            
            var icons = $( '.weexplorer-file', win );
            var beginRow = icons.index( this );
            var finalRow = icons.index( icons.filter( '.last-active' ) );
            var row      = null;
            
            if( beginRow < finalRow ){
                row = icons.slice( beginRow, finalRow + 1 ).addClass( 'active' );
            }else{
                row = icons.slice( finalRow, beginRow + 1 ).addClass( 'active' );
            }
            
            icons.not( row ).removeClass( 'active' );
            
        }else{
            
            $( this ).addClass('active').siblings('.active').removeClass('active');
            $( '.weexplorer-file.last-active', fileArea ).removeClass('last-active hidden');
            $( this ).addClass('last-active');
            
        }
        
        navigationMenu.removeClass( 'show' );
        $( '.weexplorer-sort', win ).removeClass( 'show' );
        e.stopPropagation();
        
    })
    
    .on( 'mousedown', '.weexplorer-file.active', function( e ){
        
        $( '.weexplorer-sort', win ).removeClass( 'show' );
        e.stopPropagation();
        
        if(e.ctrlKey || e.metaKey){
            $( this ).removeClass('active');
        }else if(e.shiftKey){
            
            var icons = $( '.weexplorer-file', win );
            var begin = icons.index(this);
            var end   = icons.index(icons.filter( '.last-active' ));
            var row   = null;

            if( begin < end ){
                row = icons.slice( begin, end + 1 ).addClass('active');
            }else{
                row = icons.slice( end, begin + 1 ).addClass('active');
            }
            
            icons.not( row ).removeClass('active');
            
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
            /*if( $(this).parent().hasClass('active') ){
                beginRename( $(this).parent() );
            }*/
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

        if( win.hasClass('toggle-sidebar') ){
            return false;
        }

        // Para garantizar que las dos animaciones han terminado usamos promesas
        var folderPromise  = $.Deferred();
        var sidebarPromise = $.Deferred();
        var sidebarWidth   = 0;

        if( showingSidebar ){
            
            wql.changeSidebar( 0 );

            sidebarWidth      = sidebar.width();
            sidebarOuterWidth = sidebar.outerWidth( true );

            win.addClass('toggle-sidebar');
            
            // Transición del sidebar
            sidebar.transition( { width : 0 }, 238, function(){
                sidebarPromise.resolve();
            });

            // Transición de la zona de iconos
            folderMain.add( folderBar ).add( fileArea ).transition( { width : '+=' + sidebarOuterWidth }, 250, function(){
                folderPromise.resolve();
            });

            // Cuando terminan las dos animaciones
            $.when( folderPromise, sidebarPromise ).done( function(){

                showingSidebar = false;

                win.removeClass('sidebar toggle-sidebar');
                sidebar.width( sidebarWidth, true );

            });

        }else{

            wql.changeSidebar( 1 );

            sidebarWidth      = sidebar.width();
            sidebarOuterWidth = sidebar.outerWidth( true );

            sidebar.width( 0 );

            win.addClass('toggle-sidebar sidebar');
            
            // Transición del sidebar
            sidebar.transition( { width : sidebarWidth }, 250, function(){
                sidebarPromise.resolve();
            });

            // Transición de la zona de iconos
            folderMain.add( folderBar ).add( fileArea ).transition( { width : '-=' + sidebarOuterWidth }, 238, function(){
                folderPromise.resolve();
            });

            // Cuando terminan las dos animaciones
            $.when( folderPromise, sidebarPromise ).done( function(){

                showingSidebar = true;

                win.removeClass('toggle-sidebar');

            });

        }

    })
    
    .on( 'mousedown', '.weexplorer-sidebar-element', function(){
        if( !$(this).hasClass('active') ){
            openDirectory($(this).data('file-id'));
        }
    })
    
    .on( 'mousedown', '.weexplorer-menu-sort', function( e ){

        navigationMenu.removeClass( 'show' );
        
        if( !$( '.weexplorer-sort', win ).hasClass( 'show' ) ){
            $( '.weexplorer-sort', win ).addClass( 'show' );
            e.stopPropagation();
        }
        
    })
    
    .on( 'mousedown', '.weexplorer-sort li', function(){
        
        if( !$(this).hasClass( 'active' ) ){
            
            $( '.weexplorer-sort li.active', win ).removeClass( 'active' );
            $( this ).addClass( 'active' );
            
            list = $();
            
            if( $(this).hasClass( 'weexplorer-sort-name' ) ){
                
                $( '.weexplorer-menu-sort span', win ).text( lang.sortByName );
                
                $( '.weexplorer-file', win ).each(function(){
                    list = list.add($(this));
                });
                
                list = list.sort(sortByName);
                displayIcons(list);

                wql.changeSort(0);
                
            }else if( $(this).hasClass( 'weexplorer-sort-size' ) ){
                
                $( '.weexplorer-menu-sort span', win ).text( lang.sortBySize );
                
                $( '.weexplorer-file', win ).each(function(){
                    list = list.add($(this));
                });
                
                list = list.sort(sortBySize);
                displayIcons(list);

                wql.changeSort(1);
                
            }else if( $(this).hasClass( 'weexplorer-sort-creation' ) ){
                
                $( '.weexplorer-menu-sort span', win ).text( lang.sortByCreation );
                
                $( '.weexplorer-file', win ).each(function(){
                    list = list.add($(this));
                });
                
                list = list.sort(sortByCreationDate);
                displayIcons(list);

                wql.changeSort(2);
                
            }else{
                
                $( '.weexplorer-menu-sort span', win ).text( lang.sortByModif );
                
                $( '.weexplorer-file', win ).each(function(){
                    list = list.add($(this));
                });
                
                list = list.sort(sortByModificationDate);
                displayIcons(list, true);

                wql.changeSort(3);
                
            }
        
        }
  
    })
    
    .on( 'dblclick', '.weexplorer-file.received', function(){
        wz.app.createWindow(1, $(this).data( 'file-id' ), 'received');
    })

    .on( 'dblclick', '.weexplorer-file.pointer-pending', function(){
        wz.app.createWindow(1, $(this).data( 'file-id' ), 'shared');
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
                    alert( error, null, win.data().win );
                }

            });
            
        });
        
    })
    
    .on( 'dblclick', '.weexplorer-file.directory', function(){

        openDirectory( $(this).data('file-id') );
        $( '.weexplorer-sidebar-element.active', win ).removeClass('active');

    })

    .on( 'dblclick', '.weexplorer-file.pointer:not( .pointer-pending )', function(){
        
        var pointer     = $( this ).data('file-pointer');
        var pointerType = $( this ).data('file-pointerType');

        if( pointerType === 0 || pointerType === 1 ){

            openDirectory( pointer );
            $( '.weexplorer-sidebar-element.active', win ).removeClass('active');

        }

        if( pointerType === 2 ){

            wz.structure( pointer, function( error, structure ){
                
                if( structure.status === 1 ){

                    structure.associatedApp( function( error, app ){

                        if( app ){
                            wz.app.createWindow( app, [ pointer ] );
                        }else{
                            alert( error, null, win.data().win );
                        }

                    });

                }else{
                    alert( 'Estructura no aceptada', null, win.data().win );
                }
                
            });
            
        }
        
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

        downloadFiles.removeClass( 'active' );
  
    })
    
    .key( 'delete', function(e){
        
        if( $(e.target).is('textarea') ){
            e.stopPropagation();
        }else{
            if( $('.weexplorer-file.active', win).size() ){
                deleteAllActive();
            }
        }

        downloadFiles.removeClass( 'active' );
        
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

        downloadComprobation();
        
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
            $( '.weexplorer-file.last-active', fileArea ).prev().not( '.weexplorer-file.wz-prototype' ).mousedown().mouseup();
        }

        downloadComprobation();
        
    })
    
    .key( 'right', function(e){

        if( $(e.target).is('textarea') ){
            e.stopPropagation();
        }else{
            $( '.weexplorer-file.last-active', fileArea ).next().mousedown().mouseup();
        }

        downloadComprobation();
        
    })
    
    .key( 'up', function(e){

        if( $(e.target).is('textarea') ){
            e.stopPropagation();
        }else if( $( '.weexplorer-file.last-active', fileArea ).size() ){

            var leftStart = $( '.weexplorer-file.last-active', fileArea ).position().left;
            var object = $( '.weexplorer-file.last-active', fileArea ).prev();
        
            while( object.size() && leftStart !== object.position().left ){
                object = object.prev();
            }
        
            object.mousedown().mouseup();
        }

        downloadComprobation();
          
    })
    
    .key( 'down', function(e){

        if( $(e.target).is('textarea') ){
            e.stopPropagation();
        }else if( $( '.weexplorer-file.last-active', fileArea ).size() ){

            var leftStart = $( '.weexplorer-file.last-active', fileArea ).position().left;
            var object = $( '.weexplorer-file.last-active', fileArea ).next();
            
            while( object.size() && leftStart !== object.position().left ){

                if( !object.next().size() ){
                    break;
                }

                object = object.next();

            }
            
            object.mousedown().mouseup();
        }

        downloadComprobation();
        
    })

    .on( 'contextmenu', '.weexplorer-file', function(){

        var icon = $(this);
        var menu = wz.menu();
        var permissions = icon.data( 'permissions' );
        
        if( icon.hasClass('file') || ( icon.data( 'filePointerType' ) === 2 && !icon.hasClass('pointer-pending') ) ){
            
            menu.add( lang.openFile, function(){
                icon.dblclick();
            });

            if( permissions.link ){

                menu.add( lang.createLink, function(){
                    wz.app.createWindow(1, icon.data( 'file-id' ), 'link');
                });

            }

            if( permissions.send ){

                menu.add( lang.sendTo, function(){
                    wz.app.createWindow(1, icon.data( 'file-id' ), 'send');
                });

            }

            if( permissions.share ){

                menu.add( lang.shareWith, function(){
                    wz.app.createWindow(1, icon.data( 'file-id' ), 'share');
                });

            }
            
            if( permissions.download ){

                menu.add( lang.download, function(){
                    downloadFiles.mousedown();
                });

            }

            menu.add( lang.properties, function(){
                wz.app.createWindow( 1, icon.data( 'file-id' ), 'properties' );
            });
            
            if( permissions.modify ){

                menu.add( lang.rename, function(){
                    beginRename( icon );
                });

            }

            menu.add( lang.remove, function(){
                deleteAllActive();
            }, 'warning');
            
        }else if( icon.hasClass('directory') || ( icon.data( 'filePointerType' ) === 0 && !icon.hasClass('pointer-pending') ) ){
            
            menu

                .add( lang.openFolder, function(){
                    icon.dblclick();
                })

                .add( lang.openInNewWindow, function(){
                    wz.app.createWindow(1, icon.data( 'file-id' ), 'main');
                });

            if( permissions.share ){

                menu.add( lang.shareWith, function(){
                    wz.app.createWindow(1, icon.data( 'file-id' ), 'share');
                });

            }

            if( isInSidebar( icon.data('file-id') ) ){

                menu.add( lang.removeFromSidebar, function(){
                    removeFromSidebar( icon.data( 'file-id' ) );
                });

            }else{

                menu.add( lang.addToSidebar, function(){
                    addToSidebar( icon.data( 'file-id' ), icon.find('textarea').val() );
                });

            }

            menu.add( lang.properties, function(){
                wz.app.createWindow( 1, icon.data( 'file-id' ), 'properties' );
            });

            if( permissions.modify ){

                menu.add( lang.rename, function(){
                    beginRename( icon );
                });

            }

            menu.add( lang.remove, function(){
                deleteAllActive();
            }, 'warning');
            
        }else if( icon.hasClass('received') ){
            
            menu

                .add( lang.acceptFile, function(){

                    wz.structure( icon.data( 'file-id' ), function( error, structure ){

                        structure.accept( function( error ){

                            if( error ){
                                alert( error, null, win.data().win );
                            }else{

                                wz.banner()
                                    .title( lang.fileShareAccepted )
                                    .text( structure.name + ' ' + lang.beenAccepted )
                                    .icon( structure.icons.tiny )
                                    .render();

                            }
                            
                        });

                    });

                })

                .add( lang.properties, function(){
                    wz.app.createWindow( 1, icon.data( 'file-id' ), 'properties' );
                })

                .add( lang.refuseFile, function(){

                    wz.structure( icon.data( 'file-id' ), function( error, structure ){

                        structure.refuse( function( error ){

                            if( error ){
                                alert( error, null, win.data().win );
                            }else{

                                wz.banner()
                                    .title( lang.fileShareRefused )
                                    .text( structure.name + ' ' + lang.beenRefused )
                                    .icon( 'https://static.weezeel.com/app/1/refuse.png' )
                                    .render();

                            }

                        });

                    });

                }, 'warning');
            
        }else if( icon.hasClass( 'pointer-pending' ) ){

            menu

                .add( lang.acceptFile, function(){

                    wz.structure( icon.data( 'file-id' ), function( error, structure ){

                        structure.acceptShare( function( error ){

                            if( error ){
                                alert( error, null, win.data().win );
                            }else{

                                var banner = wz.banner();

                                if( structure.pointerType === 0 ){
                                    banner.title( lang.folderShareAccepted );
                                }else{
                                    banner.title( lang.fileShareAccepted );
                                }

                                banner
                                    .text( structure.name + ' ' + lang.beenAccepted )
                                    .icon( structure.icons.tiny )
                                    .render();

                            }

                        });

                    });

                })

                .add( lang.properties, function(){
                    wz.app.createWindow( 1, icon.data( 'file-id' ), 'properties' );
                })

                .add( lang.refuseFile, function(){

                    wz.structure( icon.data( 'file-id' ), function( error, structure ){

                        structure.refuseShare( function( error ){

                            if( error ){
                                alert( error, null, win.data().win );
                            }else{

                                var banner = wz.banner();

                                if( structure.pointerType === 0 ){
                                    banner.title( lang.folderShareRefused );
                                }else{
                                    banner.title( lang.fileShareRefused );
                                }

                                banner
                                    .text( structure.name + ' ' + lang.beenRefused )
                                    .icon( 'https://static.weezeel.com/app/1/refuse.png' )
                                    .render();

                            }

                        });

                    });

                }, 'warning');
            
        }

        menu.render();

    })

    .on( 'wz-dragstart', '.weexplorer-file', function( e, drag ){
                
        if( $( '.weexplorer-file.active', win ).size() <= 1 ){

            drag.ghost(

                $( this )
                    .cloneWithStyle()
                    .css( {

                        margin : 0,
                        top    : 'auto',
                        left   : 'auto',
                        bottom : 'auto',
                        right  : 'auto'

                    } )

            );

        }else{

            var ghost = filePrototype.clone().removeClass( 'wz-prototype' );

            ghost.css({

                'width'         : '148px',
                'height'        : '93px',
                'background'    : '#7EBE30',
                'border-radius' : '3px',
                'border'        : 'solid 1px #4E9C21',
                'font-size'     : '36px',
                'color'         : '#FFF',
                'text-align'    : 'center',
                'padding-top'   : '55px'

            }).text( $( '.weexplorer-file.active', win ).size() );

            ghost.find( 'textarea, img, span' ).remove();

            drag.ghost( ghost );

            // Nullify
            ghost = null;

        }

    })
    
    .on( 'wz-drop', '.wz-drop-area', function( e, item ){
        
        if( !$( this ).hasClass( 'active' ) &&
            ( item.data( 'file-id' ) !== $( this ).data( 'file-id' ) ) &&
            ( item.parent().data( 'file-id' ) !== $( this ).data( 'file-id' ) ) &&
            ( item.data( 'file-id' ) !== $( this ).parent().data( 'file-id' ) ) &&
            ( !( item.hasClass( 'shared' ) && $( this ).hasClass( 'shared' ) ) )
            ){
            
            e.stopPropagation();
            
            var dest = 0;

            if( $(this).hasClass('directory') ){
                dest = $(this).data('file-id');
            }else if( $(this).hasClass('weexplorer-sidebar-element') ){
                dest = $(this).data('fileId');
            }else{
                dest = current;
            }
                    
            item.siblings('.active').add( item ).each( function(){
                            
                wz.structure( $(this).data('file-id'), function( error, structure ){

                    if( error ){
                        alert( error, null, win.data().win );
                        return false;
                    }

                    structure.move( dest, null, function( error ){
                        if( error ){
                            alert( error, null, win.data().win );
                        }
                    });
                    
                });

            });

        }

    })

    .on( 'wz-dropenter', '.weexplorer-file.directory', function( e, file ){

        if( file === 'fileNative' ){
            $(this).addClass('weexplorer-directory-over');
        }else if( ( file.data( 'file-id' ) !== $( this ).data( 'file-id' ) ) &&
            ( file.parent().data( 'file-id' ) !== $( this ).data( 'file-id' ) ) &&
            ( file.data( 'file-id' ) !== $( this ).parent().data( 'file-id' ) ) &&
            ( !( file.hasClass( 'shared' ) && $( this ).hasClass( 'shared' ) ) )
         ){
            $(this).addClass('weexplorer-directory-over');
        }

    })

    .on( 'wz-dropleave', '.weexplorer-file.directory', function(){
        $(this).removeClass('weexplorer-directory-over');
    })

    .on( 'wz-dropenter', '.weexplorer-sidebar-element', function( e, file ){

        if( file === 'fileNative' ){
            $(this).addClass('weexplorer-directory-over');
        }else if( file.parent().data( 'file-id' ) !== $( this ).data( 'file-id' ) ){
            $( this ).addClass( 'weexplorer-sidebar-element-over' );
        }

    })

    .on( 'wz-dropleave', '.weexplorer-sidebar-element', function(){
        $( this ).removeClass( 'weexplorer-sidebar-element-over' );
    })

    .on( 'wz-hold', '.weexplorer-option-back.active', function( e ){

        navigationMenu.children().not( '.wz-prototype' ).remove();

        for( var i = pointer - 1 ; i >= 0 ; i-- ){

            wz.structure( record[i], function( error, structure ){

                var element = navigationMenu.find( '.wz-prototype' ).clone().removeClass();

                element.data( 'id', structure.id ).find( 'span' ).text( structure.name );
                navigationMenu.append( element );

            });

        }

        navigationMenu.removeClass( 'next' );

        if( !navigationMenu.hasClass( 'show' ) ){
            navigationMenu.addClass( 'show' );
            e.stopPropagation();
        }
        
    })

    .on( 'wz-hold', '.weexplorer-option-next.active', function( e ){

        navigationMenu.children().not( '.wz-prototype' ).remove();

        for( var i = pointer + 1 ; i < record.length ; i++ ){

            wz.structure( record[i], function( error, structure ){

                var element = navigationMenu.find( '.wz-prototype' ).clone().removeClass();

                element.data( 'id', structure.id ).find( 'span' ).text( structure.name );
                navigationMenu.append( element );

            });

        }

        navigationMenu.addClass( 'next' );

        if( !navigationMenu.hasClass( 'show' ) ){
            navigationMenu.addClass( 'show' );
            e.stopPropagation();
        }

    })

    .on( 'mousedown', '.weexplorer-navigation li', function(){

        pressedNav = true;
        openDirectory( $(this).data( 'id' ) );

    })

    .on( 'mousedown', function(){
        navigationMenu.removeClass( 'show' );
    })

    .on( 'wz-blur', function(){

        if( renaming.size() ){
            finishRename();
        }

        navigationMenu.removeClass( 'show' );

    });

    fileArea.on( 'contextmenu', function(){

        if( current !== $( '.sharedFolder', sidebar ).data( 'file-id' ) && current !== $( '.receivedFolder', sidebar ).data( 'file-id' ) ){
            
            wz.menu()
            .add( lang.upload, function(){
                uploadButton.click();
            })
            .add( lang.newDirectory, function(){
                createDirectory();
            })
            .render();
            
        }

    });

    uploadButton.on( 'click', function(){

        if( current !== $( '.sharedFolder', sidebar ).data( 'file-id' ) && current !== $( '.receivedFolder', sidebar ).data( 'file-id' ) ){
            $(this).data( 'destiny', current );
        }else{
            $(this).removeData( 'destiny' );
        }
        
    });

    /* START APP */
    translateUi();
    setSortType( app.sortType );
    setViewType( app.viewType );
    
    if( params ){
        openDirectory( params );
    }else{
        openDirectory( 'root' );
    }

    /* GENERATE SIDEBAR */

    // Esta parte la comento porque usa promesas y puede resultar un poco rara si no se han usado nunca
    // Sacamos las estructuras del sidebar asíncronamente
    // Para ello primero generamos 5 promesas
    var rootPath   = $.Deferred(); // Para la carpeta del usuario
    var hiddenPath = $.Deferred(); // Para las carpetas escondidas
    var inboxPath  = $.Deferred(); // Para la carpeta de inbox
    var sharedPath = $.Deferred(); // Para la carpeta de compartidos
    var customPath = $.Deferred(); // Para las carpetas que haya añadido el usuario

    // Y determinamos que pasará cuando se cumplan esas promesas, en este caso, generamos el sidebar
    $.when( rootPath, hiddenPath, inboxPath, sharedPath, customPath ).then( function( rootPath, hiddenPath, inboxPath, sharedPath, customPath ){

        // AVISO -> hiddenPath es un array
        // Ponemos al principio rootPath, inboxPath y sharedPath
        hiddenPath.unshift( rootPath, inboxPath, sharedPath );

        // Y concatenamos con el listado de carpetas personalizadas
        hiddenPath = hiddenPath.concat( customPath );

        // Y generamos el sidebar
        hiddenPath.forEach( function( element ){

            var controlFolder = sidebarElement.clone().removeClass('wz-prototype');

            controlFolder
                .data( 'file-id', element.id )
                .addClass( 'wz-drop-area folder-' + element.id )
                .children( 'span' )
                    .text( element.name );

            if( element.id === wz.info.user().rootPath ){
                controlFolder.addClass( 'userFolder active' );
            }else if( element.id === wz.info.user().inboxPath ){
                controlFolder.addClass( 'receivedFolder' );
                notifications();
            }else if( element.id === 'shared' ){
                controlFolder.addClass( 'sharedFolder' );
            }

            sidebar.append( controlFolder );

        });

    } );

    // Ahora que ya tenemos definido que va a pasar ejecutamos las peticiones para cumplir las promesas
    wz.structure( 'root', function( error, structure ){

        // Ya tenemos la carpeta del usuario, cumplimos la promesa
        rootPath.resolve( structure );
    
        structure.list( true, function( error, list ){

            // Vamos a filtrar la lista para quedarnos solo con las carpetas ocultas, es decir, de tipo 7
            list = list.filter( function( item ){
                return item.type === 7;
            });

            // Ya tenemos las carpetas ocultas, cumplimos la promesa
            hiddenPath.resolve( list );

        });

    });

    wz.structure( 'inbox', function( error, structure ){
        
        // Ya tenemos la carpeta de recibidos, cumplimos la promesa
        inboxPath.resolve( structure );

    });

    wz.structure( 'shared', function( error, structure ){
        
        // Ya tenemos la carpetas de compartidos, cumplimos la promesa
        sharedPath.resolve( structure );

    });

    wql.getSidebar( function( error, rows ){

        // Si hay algún error o no hay carpetas damos la promesa por cumplida
        if( error || !rows.length ){
            customPath.resolve( [] );
            return false;
        }

        // Si hay carpetas las cargamos asíncronamente, hacemos un array con promesas
        // Estas promesas se irán cumpliendo según se hayan devuelto todos los datos del servidor
        var folders = [];

        rows.forEach( function( item ){

            var promise = $.Deferred();

            // Añadimos la promesa al array
            folders.push( promise );

            wz.structure( item.folder, function( error, structure ){

                if( error ){
                    promise.resolve( null );
                }else{
                    promise.resolve( structure );
                }

            });

        });

        // Definimos que ocurrirá cuando todas las promesas de listar los directorios ocurran
        $.when.apply( null, folders ).done( function(){

            // Como el resultado puede cambiar de número tenemos que hacernos un recorrido de arguments
            // IMPORTANTE arguments no es un array aunque tiene ciertos comportamientos similares
            // Hay que convertir arguments a un array, y de paso, descartamos las estructuras incorrectas

            var folders = [];

            for( var i in arguments ){

                if( arguments[ i ] !== null ){
                    folders.push( arguments[ i ] );
                }

            }

            // Y damos como cumplida la promesa de cargar los directorios personalizados del usuario
            customPath.resolve( folders );

        });

    });
