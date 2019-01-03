
// Variables
    var win        = $( this );
    var record     = [];
    var current    = null;
    var pointer    = -1;
    var controlNav = false;
    var pressedNav = false;
    var minMargin  = 5;

    var types = [
                    'directory wz-drop-area',
                    'special-directory wz-drop-area',
                    'file',
                    'temporal-file'
                ];

    var nextButton     = $('.weexplorer-option-next');
    var backButton     = $('.weexplorer-option-back');
    var views          = $('.weexplorer-menu-views');
    var sidebar        = $('.weexplorer-sidebar');
    var sidebarElement = $('.weexplorer-sidebar-element.wz-prototype', sidebar );
    var fileArea       = $('.weexplorer-file-zone');
    var filePrototype  = $('.weexplorer-file.wz-prototype');
    var folderName     = $('.weexplorer-folder-name');
    var folderBar      = $('.weexplorer-folder');
    var navigationMenu = $('.weexplorer-navigation');
    var acceptButton   = $('.accept');
    var cancelButton   = $('.cancel');

    var renaming = $();
    var prevName = '';

    var sortType = api.app.storage('sortType') || 0;
    var viewType = api.app.storage('viewType') || 0;

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

    var _cropExtension = function(structure){

        var nameNoExt = structure.name;

        if ( structure.type !== 0 && structure.type !== 1 ){
            nameNoExt = /(.+?)(\.[^\.]+$|$)/.exec(structure.name)[1];
        }

        return nameNoExt;
    }

    var _addExtension = function(nameNoExt, structure){

        var nameExt = nameNoExt;

        if (structure.type !== 0 && structure.type !== 1){
            nameExt = nameNoExt + /(.+?)(\.[^\.]+$|$)/.exec(structure.name)[2];
        }

        return nameExt;
    }

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
        var userDate      = new Date();
        var userDateInfo  = userDate.getDate() + '' + userDate.getMonth() + '' + userDate.getFullYear();
        var modifiedDate  = new Date( structure.modified );

        if( userDateInfo !== ( modifiedDate.getDate() + '' + modifiedDate.getMonth() + '' + modifiedDate.getFullYear() ) ){

            var modifiedDay   = modifiedDate.format('d');
            var modifiedMonth = modifiedDate.format('m');

        }else{

            modifiedToday = true;

            var modifiedHour   = modifiedDate.format('H');
            var modifiedMinute = modifiedDate.format('i');
            var modifiedSecond = modifiedDate.format('s');

        }

        //Do not show extension
        //TO-DO, allow showing extensions

        file.children('textarea').text( _cropExtension(structure) );

        if( ( structure.type !== 0 && structure.type !== 1 && structure.type !== 5 ) || ( structure.type === 5 && structure.pointerType !== 0 && structure.pointerType !== 1 ) ){

            if( structure.size === null ){
                file.children('.weexplorer-file-size').text( '--' );
            }else{
                file.children('.weexplorer-file-size').text( api.tool.bytesToUnit( structure.size, 2 ) );
            }

            if( modifiedToday ){
                file.children('.weexplorer-file-date-modification').text( lang.modified + modifiedHour + ':' + modifiedMinute + ':' + modifiedSecond  );
            }else{
                file.children('.weexplorer-file-date-modification').text( lang.modified + modifiedMonth + '/' + modifiedDay + '/' +  modifiedDate.getFullYear() );
            }

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
                file.addClass( 'pointer-directory wz-drop-area' );
            }

        }

        if( !structure.status ){
            file.addClass('received');
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

        /*
        if( structure.type === 5 ){

            if( structure.status !== 1 ){
                file.addClass( 'pointer-pending' );
            }

            file.data( 'file-pointer', structure.pointer );
            file.data( 'file-pointerType', structure.pointerType );

        }
        */

        if( structure.id === structure.shareRoot ){

            file.addClass( 'shared' );

            if( structure.status !== 1 ){
                file.addClass( 'shared-pending' );
            }

            /*
            file.data( 'file-pointer', structure.pointer );
            file.data( 'file-pointerType', structure.pointerType );
            */

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
        api.fs( id, function( error, structure ){

            if( error ){
                alert( lang.errorOpenDirectory );
                return false;
            }

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

                if( structure.id === api.system.workspace().rootPath ){
                    folderBar.removeClass( 'folder music photo video doc' ).addClass( 'user' );
                }else if( structure.name === 'Documents' || structure.name === 'Documentos' ){
                    folderBar.removeClass( 'folder music photo video user' ).addClass( 'doc' );
                }else if( structure.name === 'Music' || structure.name === 'Música' ){
                    folderBar.removeClass( 'folder doc photo video user' ).addClass( 'music' );
                }else if( structure.name === 'Images' || structure.name === 'Imágenes' ){
                    folderBar.removeClass( 'folder music doc video user' ).addClass( 'photo' );
                }else if( structure.name === 'Video' || structure.name === 'Vídeos' ){
                    folderBar.removeClass( 'folder music photo doc user' ).addClass( 'video' );
                }else{
                    folderBar.removeClass( 'music photo video doc user' ).addClass( 'folder' );
                }

                // Update Folder info
                folderName.text( structure.name );

                // When a new window opens we activate the first file as last-active
                files.first().addClass('last-active hidden');

                // Nullify
                files = null;

                validFileComprobation();

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

            api.fs( icon.data('file-id'), function( error, structure ){

                console.log(structure);

                if( error ){
                    alert( error );
                }else{

                    var nameNoExt = $( 'textarea', icon ).attr( 'readonly', 'readonly' ).blur().addClass( 'wz-dragger' ).val();
                    var nameExt = _addExtension(nameNoExt, structure);

                    structure.rename( nameExt, function( error ){

                        if( error ){

                            if( error === 'NAME ALREADY EXISTS' ){
                                alert( lang.nameExists );
                            }else{
                                alert( error );
                            }

                            var nameNoExt = _cropExtension(structure);

                            $( 'textarea', icon ).val( nameNoExt ).text( nameNoExt );

                        }

                    });

                }

            });

        }else{

            $( 'textarea', icon ).attr( 'readonly', 'readonly' ).blur().addClass( 'wz-dragger' );

        }

    };

    var createDirectory = function(){

        api.fs( current, function( error, structure ){

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

                    api.fs( $(this).data( 'file-id' ), function( error, structure ){

                        if( error ){
                            alert( error );
                        }else if( structure.owner === api.system.workspace().idWorkspace || structure.permissions.modify === 1 ){

                            structure.remove( function( error, quota ){

                                if( error ){
                                    alert( error );
                                }

                            });

                        }else{
                            notEnoughPermissions = true;
                        }

                    });

                });

                if( notEnoughPermissions ){
                    alert( lang.notEnoughPermissions );
                }

            }

        });

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

        centerIcons();

        // Nullify
        list = null;

    };

    var notifications = function(){

        api.fs( 'inbox', function( error, structure ){

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

        api.fs( 'shared', function( error, structure ){

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

    var validFileComprobation = function(){

        if(
            ( params.command === 'selectPath' && current !== 'shared'  && !sidebar.find('.receivedFolder').hasClass('active') ) ||
            ( params.command !== 'selectPath' && $('.weexplorer-file.active').not('.directory').size() )
        ){
            acceptButton.removeClass('disabled');
        }else{
            acceptButton.addClass('disabled');
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

    var isInSidebar = function( id ){
        return sidebar.find( '.folder-' + id ).length;
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

    var removeFromSidebarUi = function( id ){
        return sidebar.find( '.folder-' + id ).remove();
    };

    var centerIcons = function(){

        $( '.weexplorer-false-file', fileArea ).remove();

        if( viewType ){

            $( '.weexplorer-file', fileArea ).css({

                'margin-left'  : 0,
                'margin-right' : 0

            });

            return false;

        }

        /*
        var anchuraPantalla = fileArea.width();
        var anchuraIcono    = filePrototype.outerWidth( true );
        var iconosxLinea    = parseInt( ( anchuraPantalla / anchuraIcono ), 10 );
        var numeroElementos = $( '.weexplorer-file', fileArea ).not( '.wz-prototype' ).size();
        var addIcons        = iconosxLinea - ( numeroElementos % iconosxLinea );
        */

        var iconsRow = parseInt( ( fileArea.width() / ( filePrototype.width() + minMargin * 2 ) ), 10 );
        var addIcons = iconsRow - ( $( '.weexplorer-file', fileArea ).not( '.wz-prototype' ).size() % iconsRow );

        if( addIcons === iconsRow ){
            addIcons = 0;
        }

        for( var i = 0 ; i < addIcons ; i++ ){
            fileArea.append( '<div class="weexplorer-false-file"></div>' );
        }

        /*
        var leftspace  = anchuraPantalla - filePrototype.width() * iconosxLinea - 12;
        var iconMargin = leftspace / iconosxLinea / 2;
        */

        var iconMargin = parseInt( ( fileArea.width() - filePrototype.width() * iconsRow - 18 ) / iconsRow / 2, 10 );

        $( '.weexplorer-file', fileArea ).css({ 'margin-left': iconMargin, 'margin-right': iconMargin });
        $( '.weexplorer-false-file', fileArea ).css({ 'margin-left': iconMargin, 'margin-right': iconMargin });

    };

    // WZ Events
    api.fs
    .on( 'accepted inbox refused shared sharedAccepted sharedRefused', function(){
        notifications();
    })

    .on( 'conversionEnd', function( structure ){

        $( '.weexplorer-file-' + structure + ' article', fileArea )
            .addClass('weexplorer-conversion-bar')
            .transition( { opacity : 0 }, 150, function(){

                $( this )
                    .removeClass('weexplorer-conversion-bar')
                    .removeAttr('style');

            });

    })

    .on( 'conversionProgress', function( structure, progress ){

        $( '.weexplorer-file-' + structure + ' article', fileArea )
            .addClass('weexplorer-conversion-bar')
            .clearQueue()
            .stop()
            .transition( { width: ( progress * 100 ) + '%' }, 150 );

    })

    .on( 'conversionStart', function( structure ){

        $( '.weexplorer-file-' + structure + ' article', fileArea )
            .addClass('weexplorer-conversion-bar');

    })

    .on( 'move', function( structure, destinyID, originID ){

        if( originID !== destinyID ){

            if( originID === current ){
                fileArea.children( '.weexplorer-file-' + structure.id ).remove();
            }else if( destinyID === current ){
                displayIcons( icon( structure ) );
            }

        }

    })

    .on( 'new', function( structure ){

        if( structure.parent === current ){
            displayIcons( icon( structure ) );
        }

    })

    .on( 'remove', function( id, quota, parent ){

        fileArea.children( '.weexplorer-file-' + id ).remove();
        sidebar.children( '.folder-' + id ).remove();

        if( current === id ){
            openDirectory( parent );
        }

    })

    .on( 'rename', function( structure ){

        if( structure.parent === current ){
            fileArea.children( '.weexplorer-file-' + structure.id ).children( 'textarea' ).val( structure.name );
        }else if( structure.id === current ){
            $( '.weexplorer-folder-name', win ).text( structure.name );
        }

        $( '.folder-' + structure.id + ' .weexplorer-sidebar-element-name', sidebar ).text( structure.name );

    })

    .on( 'sharedStart', function( structure ){

        $( '.weexplorer-file-' + structure.id, win ).addClass( 'shared' );

    })

    .on( 'sharedStop', function( structure ){

        $( '.weexplorer-file-' + structure.id, win ).removeClass( 'shared' );

    })

    .on( 'thumbnail', function( structure ){
        $( '.weexplorer-file-' + structure.id ).find('img').attr( 'src', structure.icons.normal + '?' + Date.now() );
    });

    api.upload
    .on( 'fsnodeProgress', function( structureId, progress ){

        var icon = fileArea.children( '.weexplorer-file-' + structureID );

        if( !icon.hasClass('weexplorer-file-uploading') ){
            return;
        }

        icon.children('article')
            .addClass('weexplorer-progress-bar')
            .clearQueue()
            .stop()
            .transition( { width: ( progress * 100 ) + '%' }, 150 );

    })

    .on( 'fsnodeEnd', function( structure ){

        var icon = fileArea.children( '.weexplorer-file-' + structure.id );

        icon.children('article')
            .removeClass('weexplorer-progress-bar');

        icon
            .removeClass('weexplorer-file-uploading temporal-file')
            .addClass('file')
            .find('img')
                .attr( 'src', structure.icons.normal );

    });

    // DOM Events
    $( win )
    .on( 'message', function( e, info, message ){

        message = message[ 0 ];

        if( message.action === 'addToTaskbar' ){
            addToSidebarUi( message.id, message.name );
        }else if( message.action === 'removeFromTaskbar' ){
            removeFromSidebarUi( message.id );
        }

    })

    .on( 'ui-view-resize ui-view-maximize ui-view-unmaximize', function(){

        centerIcons();

        if( viewType ){

            // Tenemos que hacer el cálculo teniendo el cuenta el width del padre porque
            // no siempre vamos a tener elementos en los que basarnos y el prototype tiene
            // como width() 100, que quiere decir 100%.

            var items    = fileArea.find('.weexplorer-file');
            var item     = items.first();
            var textarea = item.children('textarea');
            var width    = parseInt( item.css('border-left-width'), 10 )
                            + parseInt( item.css('border-right-width'), 10 )
                            + parseInt( textarea.css('margin-left'), 10 )
                            + parseInt( textarea.css('border-left-width') )
                            + parseInt( textarea.css('border-right-width'), 10 );

            item.children().not('textarea').each( function(){
                width += $( this ).outerWidth( true );
            });

            $( 'textarea', items ).width( fileArea.width() - width );

        }

    })

    .on( 'ui-view-blur', function(){
        $( '.weexplorer-sort', win ).removeClass( 'show' );
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
        validFileComprobation();
    })

    .on( 'mousedown', '.weexplorer-menu-views', function(){

        if( views.hasClass('grid') ){

            views.removeClass('grid').addClass('list');
            fileArea.removeClass('grid').addClass('list');

            viewType = 1;

            wql.changeView( 1 );

        }else{

            views.removeClass('list').addClass('grid');
            fileArea.removeClass('list').addClass('grid');

            viewType = 0;

            wql.changeView( 0 );

            fileArea.find( 'textarea' ).css({ width : '' });

        }

        win.trigger('wz-resize');

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

    .on( 'mousedown', '.weexplorer-sidebar-element', function(){

        if( !$(this).hasClass('active') ){
            openDirectory( $(this).data('file-id') );
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
        api.app.createView( $(this).data( 'file-id' ), 'received');
    })

    .on( 'dblclick', '.weexplorer-file.pointer-pending', function(){
        api.app.createView( $(this).data( 'file-id' ), 'shared');
    })

    .on( 'dblclick', 'textarea:not([readonly])', function( e ){
        e.stopPropagation();
    })

    .on( 'dblclick', '.weexplorer-file.file', function(){

        var files = $('.weexplorer-file.active', $(this).parent() );
        var list  = [];

        files.map( function(){
            list.push( $(this).data('file-id') );
        });

        params.callback( null, list );
        api.app.removeView( win );

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

            api.fs( pointer, function( error, structure ){

                if( structure.status === 1 ){

                    structure.associatedApp( function( error, app ){

                        if( app ){
                            alert('ABRIR OTRAS APPS NO ESTÁ IMPLEMENTADO');
                            // To Do -> api.app.createView( app, [ pointer ] );
                        }else{
                            alert( error );
                        }

                    });

                }else{
                    alert( 'Estructura no aceptada' );
                }

            });

        }

    })

    .key( 'enter', function(e){

        if( $(e.target).is('textarea') ){
            e.preventDefault();
            finishRename();
        }else{
            $( '.weexplorer-file.active' , fileArea ).first().dblclick();
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

        acceptButton.addClass('disabled');

    })

    .key( 'delete', function(e){

        if( $(e.target).is('textarea') ){
            e.stopPropagation();
        }else{
            if( $('.weexplorer-file.active', win).size() ){
                deleteAllActive();
            }
        }

        acceptButton.addClass('disabled');

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

        validFileComprobation();

    })

    .key( 'ctrl + enter', function(){

        if( $( '.weexplorer-file.active.last-active', fileArea ).hasClass('directory') ){
            api.app.createView( $( '.weexplorer-file.active.last-active', fileArea ).data( 'file-id' ), 'main');
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

        validFileComprobation();

    })

    .key( 'right', function(e){

        if( $(e.target).is('textarea') ){
            e.stopPropagation();
        }else{
            $( '.weexplorer-file.last-active', fileArea ).next().mousedown().mouseup();
        }

        validFileComprobation();

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

        validFileComprobation();

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

        validFileComprobation();

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

            if( $(this).hasClass('directory') || $(this).hasClass('pointer-directory') ){
                dest = $(this).data('file-id');
            }else if( $(this).hasClass('weexplorer-sidebar-element') ){
                dest = $(this).data('fileId');
            }else{
                dest = current;
            }

            item.siblings('.active').add( item ).each( function(){

                api.fs( $(this).data('file-id'), function( error, structure ){

                    if( error ){
                        alert( error );
                        return false;
                    }

                    structure.move( dest, null, function( error ){

                        if( error ){
                            alert( error );
                        }

                    });

                });

            });

        }

    })

    .on( 'wz-dropenter', '.weexplorer-file.directory, .weexplorer-file.pointer-directory', function( e, file ){

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

    .on( 'wz-dropleave', '.weexplorer-file.directory, .weexplorer-file.pointer-directory', function(){
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

            api.fs( record[i], function( error, structure ){

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

            api.fs( record[i], function( error, structure ){

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

    .on( 'ui-view-blur', function(){

        if( renaming.size() ){
            finishRename();
        }

        navigationMenu.removeClass( 'show' );

    });

    acceptButton.on( 'click', function(){

        console.log('acepta');

        if( params.command === 'selectPath'  && current !== 'shared' && !sidebar.find('.receivedFolder').hasClass('active') ){

            params.callback( null, current );
            api.app.removeView( win );

        }else if( !acceptButton.hasClass('disabled') ){
            $( '.weexplorer-file.active' , fileArea ).first().dblclick();
        }

    });

    cancelButton.on( 'click', function(){

        params.callback('USER ABORT');
        api.app.removeView( win );

    });

    /* START APP */
    translateUi();
    setSortType( api.app.storage('sortType') );
    setViewType( api.app.storage('viewType') );

    if( params.path ){
        openDirectory( params.path );
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

            if( element.alias === 'root' ){
                controlFolder.removeClass( 'folder' ).addClass( 'userFolder user active' );
            }else if( element.alias === 'inbox' ){
                controlFolder.addClass( 'receivedFolder' );
                notifications();
            }else if( element.id === 'shared' ){
                controlFolder.addClass( 'sharedFolder' );
            }

            if( element.alias === 'documents' ){
                controlFolder.removeClass( 'folder' ).addClass( 'doc' );
            }else if( element.alias === 'music' ){
                controlFolder.removeClass( 'folder' ).addClass( 'music' );
            }else if( element.alias === 'images' ){
                controlFolder.removeClass( 'folder' ).addClass( 'photo' );
            }else if( element.alias === 'videos' ){
                controlFolder.removeClass( 'folder' ).addClass( 'video' );
            }

            sidebar.append( controlFolder );

        });

    } );

    // Ahora que ya tenemos definido que va a pasar ejecutamos las peticiones para cumplir las promesas
    api.fs( 'root', function( error, structure ){

        // Ya tenemos la carpeta del usuario, cumplimos la promesa
        rootPath.resolve( structure );

        structure.list( true, function( error, list ){

            // Vamos a filtrar la lista para quedarnos solo con las carpetas especiales, es decir, de tipo 1
            list = list.filter( function( item ){
                return item.type === 1;
            });

            // Ya tenemos las carpetas ocultas, cumplimos la promesa
            hiddenPath.resolve( list );

        });

    });

    api.fs( 'inbox', function( error, structure ){

        // Ya tenemos la carpeta de recibidos, cumplimos la promesa
        inboxPath.resolve( structure );

    });

    api.fs( 'shared', function( error, structure ){

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

            api.fs( item.folder, function( error, structure ){

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
