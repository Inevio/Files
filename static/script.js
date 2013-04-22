/*global wz:true $:true */

wz.app.addScript( 1, 'main', function( win, app, lang, params ){

    // Variables
    var record         = [];
    var current        = null;
    var pointer        = -1;
    var controlNav     = false;
    var pressedNav     = false;
    var showSidebar    = false;
    var maximized      = false;
    var stickedSidebar = false;

    var types = [
                    'directory wz-drop-area',
                    'special-directory wz-drop-area',
                    'file',
                    'temporal-file',
                    'null',
                    'pointer',
                    'received'
                ];

    var nextButton     = $( '.weexplorer-option-next', win );
    var backButton     = $( '.weexplorer-option-back', win );
    var views          = $( '.weexplorer-menu-views', win );
    var sidebar        = $( '.weexplorer-sidebar', win );
    var sidebarElement = $( '.weexplorer-sidebar-element.prototype', sidebar );
    var fileArea       = $( '.weexplorer-file-zone', win );
    var filePrototype  = $( '.weexplorer-file.prototype', win );
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

    var renaming = $();
    var prevName = '';

    var showingSidebar = false;

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

                if( record[i] === id ){

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
        var file = filePrototype.clone().removeClass('prototype');
        
        var modifiedToday = false;
        var createdToday = false;
        var userDate = new Date();
        var userDateInfo = userDate.getDate() + '' + userDate.getMonth() + '' + userDate.getFullYear();

        var modifiedDate = new Date( structure.modified );
        if( userDateInfo !== ( modifiedDate.getDate() + '' + modifiedDate.getMonth() + '' + modifiedDate.getFullYear() ) ){
            
            var modifiedDay = modifiedDate.getDate();
                if( modifiedDay < 10 ){ modifiedDay = '0' + modifiedDay }
            var modifiedMonth = modifiedDate.getMonth() + 1;
                if( modifiedMonth < 10 ){ modifiedMonth = '0' + modifiedMonth }
                
        }else{
            
            modifiedToday = true;
            
            var modifiedHour = modifiedDate.getHours();
                if( modifiedHour < 10 ){ modifiedHour = '0' + modifiedHour }
            var modifiedMinute = modifiedDate.getMinutes();
                if( modifiedMinute < 10 ){ modifiedMinute = '0' + modifiedMinute }
            var modifiedSecond = modifiedDate.getSeconds();
                if( modifiedSecond < 10 ){ modifiedSecond = '0' + modifiedSecond }
                
        }
            
        var createdDate = new Date( structure.created );
        if( userDateInfo !== ( createdDate.getDate() + '' + createdDate.getMonth() + '' + createdDate.getFullYear() ) ){
            
            var createdDay = createdDate.getDate();
                if( createdDay < 10 ){ createdDay = '0' + createdDay }
            var createdMonth = createdDate.getMonth() + 1;
                if( createdMonth < 10 ){ createdMonth = '0' + createdMonth }
                
        }else{
            
            createdToday = true;
            
            var createdHour = createdDate.getHours();
                if( createdHour < 10 ){ createdHour = '0' + createdHour }
            var createdMinute = createdDate.getMinutes();
                if( createdMinute < 10 ){ createdMinute = '0' + createdMinute }
            var createdSecond = createdDate.getSeconds();
                if( createdSecond < 10 ){ createdSecond = '0' + createdSecond }
                
        }
        
        // Add new properties
        file.children('textarea').text( structure.name );
        
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
        
        file.find('img').attr( 'src', structure.icons.normal );
        file.addClass( types[ structure.type ] );
        if( structure.type === 3 ){
            file.addClass( 'weexplorer-file-uploading' );
        }
        file.addClass( 'weexplorer-file-' + structure.id );
        file.data( 'file-id', structure.id );
        file.data( 'file-size', structure.size );
        file.data( 'file-creation', structure.modified );
        file.data( 'file-modification', structure.created );

        if( structure.type === 5 ){

            if( !structure.permissions.accepted ){
                file.addClass( 'pointer-pending' );
            }

            file.data( 'file-pointer', structure.pointer );
            file.data( 'file-pointerType', structure.pointerType );

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
                alert( lang.errorOpenDirectory );
                return false;
            }

            /*
            if( !structure.permissions.accepted ){

                $('.weexplorer-sidebar-element.active', win).removeClass('active');
                $( '.folder-' + current, sidebar ).addClass('active');

                alert( 'Estructura no aceptada' );
                return false;
            }
            */

            // Update current
            updateCurrent( structure.id );
            recordNavigation();

            // List Structure Files
            structure.list( function( error, list ){

                if( error ){
                    alert( lang.errorOpenDirectory );
                    return false;
                }

                var length = list.length;
                var files  = $();

                // Generate File icons
                for( var i = 0; i < length; i++ ){
                    files = files.add( icon( list[ i ] ) );
                }

                // Display icons
                fileArea.children().not('.prototype').remove();
                fileArea.append( files );
                fileArea.data( 'data-wz-uploader-destiny', structure.id );

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
        
        var response = lang.deleteFile2;
        
        if( $('.weexplorer-file.active', win).size() > 1){
            response = lang.the + $('.weexplorer-file.active', win).size() + lang.deleteFile3;
        }
        
        if( confirm( lang.deleteFile + response ) ) {
        
            $('.weexplorer-file.active', win).each(function(){
                
                removeStructure( $(this).data('file-id') );
                
            });
        
        }
        
    };  
    
    var sortByName = function(a,b){
        
        if( a.children('textarea').val().toLowerCase() < b.children('textarea').val().toLowerCase() ){
            return -1;
        }
        
        if( a.children('textarea').val().toLowerCase() > b.children('textarea').val().toLowerCase() ){
            return 1;
        }
        
        return 0;
        
    };
    
    var sortBySize = function(a,b){
        
        if( a.data( 'file-size' ) < b.data( 'file-size' ) ){
            return -1;
        }
        
        if( a.data( 'file-size' ) > b.data( 'file-size' ) ){
            return 1;
        }
        
        return 0;
        
    };
    
    var sortByCreationDate = function(a,b){
        
        if( a.data( 'file-creation' ) < b.data( 'file-creation' ) ){
            return -1;
        }
        
        if( a.data( 'file-creation' ) > b.data( 'file-creation' ) ){
            return 1;
        }
        
        return 0;
        
    };
    
    var sortByModificationDate = function(a,b){
        
        if( a.data( 'file-modification' ) < b.data( 'file-modification' ) ){
            return -1;
        }
        
        if( a.data( 'file-modification' ) > b.data( 'file-modification' ) ){
            return 1;
        }
        
        return 0;
        
    };
    
    var displayIcons = function(list){
        
        fileArea.append( list );
        
        // Nullify
        list = null;
        
    };
    
    var notifications = function(){

        wz.structure( $( '.receivedFolder', sidebar ).data('file-id'), function( error, structure ){
            
            structure.list( function( error, list ){
                
                if( list.length ){
                    $( '.receivedFolder', sidebar ).addClass( 'notification' ).find( '.weexplorer-sidebar-notification' ).text( list.length );
                }else{
                    $( '.receivedFolder', sidebar ).removeClass( 'notification' );
                }
                
            });
            
        });
        
    };

    var start = function(){

        if( params ){
            openDirectory( params );
        }else{
            openDirectory( 'root' );
        }
        
        win.addClass('sidebar').css( 'width', '' );

    };

    // Events
    $( win )
    
    .on( 'wz-resize', function(){

        if( fileArea.hasClass('list') ){

            var controlTextarea = 0;
            var biggestTextarea = 0;

            fileArea.find( '.weexplorer-file' ).not( '.prototype' ).each( function(){

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

            textareaWidth = fileArea.find( '.weexplorer-file' ).not( '.prototype' ).first().width() - biggestTextarea - 35;

            fileArea.find( 'textarea' ).css({ width : textareaWidth + 'px' });

        }else{
            fileArea.find( 'textarea' ).css({ width : '' });
        }

        if( win.hasClass('wz-win-sticking') ){

            if( win.hasClass('sidebar') ){
                stickedSidebar = true;
            }else{
                stickedSidebar = false;
            }

            win.addClass('special-sidebar');

        }else if( !win.hasClass('wz-win-maximized') && !maximized ){

            if( win.hasClass('sidebar') && !stickedSidebar ){

                win
                    .add( winMenu )
                    .add( wxpMenu )
                    .add( folderMain )
                    .add( folderBar )
                    .width('+=140');

                fileArea.outerWidth('+=140');

                if( fileArea.hasClass('list') ){
                    fileArea.find( 'textarea' ).css({ width : '+=140' });
                }

            }else if( !win.hasClass('sidebar') && stickedSidebar ){
                
                win
                    .add( winMenu )
                    .add( wxpMenu )
                    .add( folderMain )
                    .add( folderBar )
                    .width('-=140');

                fileArea.outerWidth('-=140');

                if( fileArea.hasClass('list') ){
                    fileArea.find( 'textarea' ).css({ width : '-=140' });
                }

            }

            win.removeClass('special-sidebar');

        }else{

            win.removeClass('special-sidebar');

        }

        if( win.hasClass('wz-win-maximized') ){

            maximized = true;

            if( win.hasClass('sidebar') ){
                showSidebar = true;
            }else{
                showSidebar = false;
            }

        }else if( maximized ){

            maximized = false;

            if( win.hasClass('sidebar') && !showSidebar ){

                win
                    .add( winMenu )
                    .add( wxpMenu )
                    .add( folderMain )
                    .add( folderBar )
                    .width('+=140');

                fileArea.outerWidth('+=140');

                if( fileArea.hasClass('list') ){
                    fileArea.find( 'textarea' ).css({ width : '+=140' });
                }

            }else if( !win.hasClass('sidebar') && showSidebar ){
                
                win
                    .add( winMenu )
                    .add( wxpMenu )
                    .add( folderMain )
                    .add( folderBar )
                    .width('-=140');

                fileArea.outerWidth('-=140');

                if( fileArea.hasClass('list') ){
                    fileArea.find( 'textarea' ).css({ width : '-=140' });
                }

            }

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
            fileArea.append( files );
    
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

        if( current === id ){
            openDirectory( parent );
        }

        notifications();

    })
    
    .on( 'structure-rename', function(e, structure){

        if( structure.parent === current ){
            fileArea.children( '.weexplorer-file-' + structure.id ).children('textarea').val(structure.name);
        }

    })
    
    .on( 'structure-new', function(e, structure){

        if( structure.parent === current ){
            fileArea.append( icon( structure ) );
        }

    })
    
    .on( 'structure-move', function(e, structure, destinyID, originID){
        
        if( originID !== destinyID ){
            
            if( originID === current ){
                fileArea.children( '.weexplorer-file-' + structure.id ).remove();
            }else if( destinyID === current ){
                fileArea.append( icon( structure ) );
            }
        
        }
        
    })
    
    .on( 'structure-thumbnail', function(e, structure){
        $( '.weexplorer-file-' + structure.id ).find('img').attr( 'src', structure.icons.normal + '?' + Math.random() );
    })
    
    .on( 'structure-received', function(){
        notifications();
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
            $('.active.file', win).each(function(){
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
    
    .on( 'mousedown', '.weexplorer-menu-views', function(){

        if( views.hasClass('grid') ){

            views.removeClass('grid').addClass('list');     
            fileArea.removeClass('grid').addClass('list');

            if( win.hasClass( 'wz-win-sticked' ) ){

                var controlTextarea = 0;
                var biggestTextarea = 0;

                fileArea.find( '.weexplorer-file' ).not( '.prototype' ).each( function(){

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

                textareaWidth = fileArea.find( '.weexplorer-file' ).not( '.prototype' ).first().width() - biggestTextarea - 35;

                fileArea.find( 'textarea' ).css({ width : textareaWidth + 'px' });

            }

        }else{

            views.removeClass('list').addClass('grid');
            fileArea.removeClass('list').addClass('grid');

            fileArea.find( 'textarea' ).css({ width : '' });

        }

    })
    
    .on( 'click', '.weexplorer-file.active', function(e){
        
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

        uploadingElapsed.text( time + ' ' + 'left' );

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
    
    .on( 'mousedown', '.weexplorer-file:not(.active)', function( e ){
        
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

        if( !showingSidebar ){

            showingSidebar = true;

            if( win.hasClass('wz-win-maximized') || win.hasClass('special-sidebar') ){

                if( win.hasClass('sidebar') ){

                    fileArea
                        .add( folderBar )
                        .animate( { width : '+=140' }, 250 );

                    sidebar.animate( { width : 0 }, 245 );

                    if( fileArea.hasClass( 'list' ) ){
                        fileArea.find( 'textarea' ).animate( { width : '+=140' }, 250 );
                    }                    

                    folderMain.animate( { width : '+=140' }, 250, function(){
                        win.removeClass('sidebar');
                        setTimeout( function(){
                            showingSidebar = false;
                        }, 50);
                        
                    });

                }else{

                    fileArea
                        .add( folderBar )
                        .animate( { width : '-=140' }, 250 );

                    sidebar.animate( { width : 139 }, 255, function(){
                        $( this ).css( 'width', '' );
                        setTimeout( function(){
                            showingSidebar = false;
                        }, 50);
                    });

                    if( fileArea.hasClass( 'list' ) ){
                        fileArea.find( 'textarea' ).animate( { width : '-=140' }, 250 );
                    }

                    folderMain.animate( { width : '-=140' }, 250, function(){
                        win.addClass('sidebar');
                    });

                }

            }else{

                if( win.hasClass('sidebar') ){

                    winMenu.animate( { width : '-=140' }, 250 );
                    wxpMenu.animate( { width : '-=140' }, 250 );
                        
                    sidebar.animate( { width : 0 }, 245 );

                    win.animate( { width : '-=140' }, 250, function(){
                        win.removeClass('sidebar');
                        setTimeout( function(){
                            showingSidebar = false;
                        }, 50);
                    });

                }else{

                    winMenu.animate( { width : '+=140' }, 250 );
                    wxpMenu.animate( { width : '+=140' }, 250 );

                    sidebar.animate( { width : 138 }, 250, function(){
                        win.addClass('sidebar');
                        $( this ).css( 'width', '' );
                    });

                    win.animate( { width : '+=140' }, 250, function(){
                        setTimeout( function(){
                            showingSidebar = false;
                        }, 50);
                    });

                }

            }

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
            
            list = [];
            
            if( $(this).hasClass( 'weexplorer-sort-name' ) ){
                
                $( '.weexplorer-menu-sort', win ).text( lang.sortByName );
                
                $( '.weexplorer-file', win ).each(function(){
                    list.push($(this));
                });
                
                list = list.sort(sortByName);
                displayIcons(list, true);
                
            }else if( $(this).hasClass( 'weexplorer-sort-size' ) ){
                
                $( '.weexplorer-menu-sort', win ).text( lang.sortBySize );
                
                $( '.weexplorer-file', win ).each(function(){
                    list.push($(this));
                });
                
                list = list.sort(sortBySize);
                displayIcons(list, true);
                
            }else if( $(this).hasClass( 'weexplorer-sort-creation' ) ){
                
                $( '.weexplorer-menu-sort', win ).text( lang.sortByCreation );
                
                $( '.weexplorer-file', win ).each(function(){
                    list.push($(this));
                });
                
                list = list.sort(sortByCreationDate);
                displayIcons(list, true);
                
            }else{
                
                $( '.weexplorer-menu-sort', win ).text( lang.sortByModif );
                
                $( '.weexplorer-file', win ).each(function(){
                    list.push($(this));
                });
                
                list = list.sort(sortByModificationDate);
                displayIcons(list, true);
                
            }
        
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

        openDirectory( $(this).data('file-id') );
        $( '.weexplorer-sidebar-element.active', win ).removeClass('active');

    })

    .on( 'dblclick', '.weexplorer-file.pointer', function(){
        
        var pointer     = $( this ).data('file-pointer');
        var pointerType = $( this ).data('file-pointerType');

        if( pointerType === 0 || pointerType === 1 ){

            openDirectory( pointer );
            $( '.weexplorer-sidebar-element.active', win ).removeClass('active');

        }

        if( pointerType === 2 ){

            wz.structure( pointer, function( error, structure ){
                
                if( structure.permissions.accepted ){

                    structure.associatedApp( function( error, app ){

                        if( app ){
                            wz.app.createWindow( app, [ pointer ] );
                        }else{
                            alert( error );
                        }

                    });

                }else{
                    alert('Estructura no aceptada');
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
                $( '.weexplorer-option-back', win ).mousedown();
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
            $( '.weexplorer-file.last-active', fileArea ).prev().not( '.weexplorer-file.prototype' ).mousedown().mouseup();
        }       
        
    })
    
    .key( 'right', function(e){

        if( $(e.target).is('textarea') ){
            e.stopPropagation();
        }else{
            $( '.weexplorer-file.last-active', fileArea ).next().mousedown().mouseup();
        }  
        
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
          
    })
    
    .key( 'down', function(e){

        if( $(e.target).is('textarea') ){
            e.stopPropagation();
        }else if( $( '.weexplorer-file.last-active', fileArea ).size() ){
            
            var leftStart = $( '.weexplorer-file.last-active', fileArea ).position().left;
            var object = $( '.weexplorer-file.last-active', fileArea ).next();
            
            while( object.size() && leftStart !== object.position().left ){
                if(!object.next().size()){
                    break;
                }
                object = object.next();             
            }
            
            object.mousedown().mouseup();
        }
        
    })

    .on( 'contextmenu', '.weexplorer-file', function(){

        var icon = $(this);
        var menu = wz.menu();
        
        if( icon.hasClass('file') || ( icon.hasClass('pointer') && !icon.hasClass('pointer-pending') ) ){
            
            menu
                .add( lang.openFile, function(){
                    icon.dblclick();
                })
                .add( lang.createLink, function(){
                    wz.app.createWindow(1, icon.data( 'file-id' ), 'link');
                })
                .add( lang.sendTo, function(){
                    wz.app.createWindow(1, icon.data( 'file-id' ), 'send');
                })
                .add( lang.shareWith, function(){
                    wz.app.createWindow(1, icon.data( 'file-id' ), 'share');
                })
                .add( lang.download, function(){
                    $( '.weexplorer-menu-download', win ).mousedown();
                })
                .add( lang.rename, function(){
                    beginRename( icon );
                })
                .add( lang.properties, function(){
                    wz.app.createWindow(1, icon.data( 'file-id' ), 'properties');
                })
                .add( lang.remove, function(){
                    deleteAllActive();
                }, 'warning');
            
        }else if( icon.hasClass('directory') ){
            
            menu
                .add( lang.openFolder, function(){
                    icon.dblclick();
                })
                .add( lang.openInNewWindow, function(){
                    wz.app.createWindow(1, icon.data( 'file-id' ), 'main');
                })
                .add( lang.shareWith, function(){
                    wz.app.createWindow(1, icon.data( 'file-id' ), 'share');
                })
                .add( lang.rename, function(){
                    beginRename( icon );
                })
                .add( lang.properties, function(){
                    wz.app.createWindow(1, icon.data( 'file-id' ), 'properties');
                })
                .add( lang.remove, function(){
                    deleteAllActive();
                }, 'warning');
            
        }else if( icon.hasClass('received') ){
            
            menu

                .add( lang.acceptFile, function(){

                    wz.structure( icon.data( 'file-id' ), function( error, structure ){

                        structure.accept( function( error ){

                            if( error ){
                                alert( error );
                            }else{
                                notifications();
                            }
                            
                        });

                    });

                })

                .add( lang.properties, function(){
                    wz.app.createWindow(1, icon.data( 'file-id' ), 'properties');
                })

                .add( lang.refuseFile, function(){

                    wz.structure( icon.data( 'file-id' ), function( error, structure ){

                        structure.refuse( function( error ){

                            if( error ){
                                alert( error );
                            }else{
                                notifications();
                            }

                        });

                    });

                }, 'warning');
            
        }else if( icon.hasClass('pointer-pending') ){

            menu
                .add( lang.acceptFile, function(){
                    wz.structure( icon.data( 'file-id' ), function( error, structure ){
                        structure.acceptShare();
                    });
                })
                .add( lang.properties, function(){
                    wz.app.createWindow(1, icon.data( 'file-id' ), 'properties');
                })
                .add( lang.refuseFile, function(){
                    wz.structure( icon.data( 'file-id' ), function( error, structure ){
                        structure.refuseShare();
                    });
                }, 'warning');
            
        }

        menu.render();

    })

    .on( 'wz-dragstart', '.weexplorer-file', function( e, drag ){
        
        if( !($('.weexplorer-file.active', win).size() > 1) ){
            drag.ghost( $(this).cloneWithStyle() );
        }else{
            var ghost = filePrototype.clone().removeClass('prototype')
                                        .css({'width':'148px', 'height':'98px', 'background':'green', 'border-radius':'6px', 'border':'solid 1px #fff', 'font-size':'36px', 'color':'white', 'text-align':'center', 'padding-top':'50px'})
                                        .text($('.weexplorer-file.active', win).size());
            ghost.find('textarea, img, span').remove()
            drag.ghost( ghost );
        }

    })
    
    .on( 'wz-drop', '.wz-drop-area', function( e, item ){
        
        if( !$(this).hasClass('active') && ( item.parent().data('file-id') !== $(this).data('file-id') ) ){
            
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
                        if( error ){
                            alert( error );
                        }
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

    .on( 'wz-hold', '.weexplorer-option-back.active', function( e ){

        navigationMenu.children().not( '.prototype' ).remove();

        for( var i = pointer - 1 ; i >= 0 ; i-- ){

            wz.structure( record[i], function( error, structure ){
                var element = navigationMenu.find( '.prototype' ).clone().removeClass();
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

        navigationMenu.children().not( '.prototype' ).remove();

        for( var i = pointer + 1 ; i < record.length ; i++ ){

            wz.structure( record[i], function( error, structure ){
                var element = navigationMenu.find( '.prototype' ).clone().removeClass();
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
    
    start();

    wz.config( function(error, config){
        
        var elementFolder = sidebarElement.clone().removeClass('prototype');
        
        var userFolder = elementFolder.clone();
        wz.structure( config.user.rootPath, function( error, structure ){
            userFolder.data( 'file-id', structure.id ).addClass( 'active userFolder ' + 'folder-' + structure.id ).children( 'span' ).text( structure.name );
        });
        sidebar.append( userFolder );
        
        var sharedFolder = elementFolder.clone();
        wz.structure( config.user.sharedPath, function( error, structure ){
            sharedFolder.data( 'file-id', structure.id ).addClass( 'sharedFolder folder-' + structure.id ).children( 'span' ).text( structure.name );
        });
        sidebar.append( sharedFolder );
        
        var receivedFolder = elementFolder.clone();
        wz.structure( config.user.receivedPath, function( error, structure ){
            receivedFolder.data( 'file-id', structure.id ).addClass( 'receivedFolder folder-' + structure.id ).children( 'span' ).text( structure.name );
            notifications();
        });
        sidebar.append( receivedFolder );
        
    }); 

    $( '.weexplorer-menu-sort', win ).text( lang.sortByName );
    $( '.weexplorer-sidebar-title-name', sidebar ).text( lang.favourites );
    $( '.item-now-before', win ).text( lang.uploading );
    $( '.total-items-before', win ).text( lang.of );
    $( '.elapsed-time-before', win ).text( '-' );
    $( '.weexplorer-sort-name', win ).find( 'span' ).text( lang.sortByName );
    $( '.weexplorer-sort-size', win ).find( 'span' ).text( lang.sortBySize );
    $( '.weexplorer-sort-creation', win ).find( 'span' ).text( lang.sortByCreation );
    $( '.weexplorer-sort-modification', win ).find( 'span' ).text( lang.sortByModif );

});
