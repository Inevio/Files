
// Constants
var SORT_NAME         = 0;
var SORT_SIZE         = 1;
var SORT_CREATION     = 2;
var SORT_MODIFICATION = 3;
var EXTENSIONS_HIDE   = 0;
var EXTENSIONS_SHOW   = 1;

// Variables
    var win            = $( this );
    var record         = [];
    var current        = {};
    var pointer        = -1;
    var controlNav     = false;
    var pressedNav     = false;
    var showSidebar    = false;
    var maximized      = false;
    var stickedSidebar = false;
    var channel        = null;
    var minMargin      = 5;
    var sortStatus     = SORT_NAME;

    var types = [

        'directory wz-drop-area',
        'special-directory wz-drop-area',
        'file',
        'temporal-file'

    ];

    var nextButton      = $( '.weexplorer-option-next', win );
    var backButton      = $( '.weexplorer-option-back', win );
    var views           = $( '.weexplorer-menu-views', win );
    var downloadFiles   = $( '.weexplorer-menu-download', win );
    var sidebar         = $( '.weexplorer-sidebar', win );
    var sidebarElement  = $( '.weexplorer-sidebar-element.wz-prototype', sidebar );
    var fileArea        = $( '.weexplorer-file-zone', win );
    var filePrototype   = $( '.weexplorer-file.wz-prototype', win );
    var folderName      = $( '.weexplorer-folder-name', win );
    var folderMain      = $( '.weexplorer-main', win );
    var uploadButton    = $( '.weexplorer-menu-upload', win );
    var winMenu         = $( '.wz-ui-header', win );
    var wxpMenu         = $( '.weexplorer-menu', win );
    var folderBar       = $( '.weexplorer-folder', win );
    var navigationMenu  = $( '.weexplorer-navigation', win );
    var directoryStatus = $('.directory-status');

    var uploading        = $( '.weexplorer-uploading', win );
    var uploadingBar     = $( '.weexplorer-uploading-bar', uploading );
    var uploadingItem    = $( '.item-now', uploading );
    var uploadingItems   = $( '.total-items', uploading );
    var uploadingElapsed = $( '.elapsed-time', uploading );
    var uploadingPercent = $( '.uploaded-percent', uploading );

    var renaming = $();
    var prevName = '';

    var sortType          = wz.app.storage('sortType') || SORT_NAME;
    var viewType          = wz.app.storage('viewType') || 0;
    var showingSidebar    = wz.app.storage('sidebar') || false;
    var displayExtensions = wz.app.storage('displayExtensions') || EXTENSIONS_HIDE;

    // Functions
    var _fit_baseWidth = function( object, newValue ){

        object = $( object );

        if( typeof newValue !== 'undefined' ){
            object.data( 'wz-fit-base-width', newValue );
            return;
        }

        var value = object.data('wz-fit-base-width');

        if( !value ){

            value = object.width();

            object.data( 'wz-fit-base-width', value );

        }

        return value;

    };

    var _cropExtension = function(structure){

        var nameNoExt = structure.name;

        if(

            !displayExtensions &&
            structure.type !== 0 &&
            structure.type !== 1

        ){
            nameNoExt = nameNoExt.split(/(.+?)(\.[^\.]+$|$)/)[ 1 ];
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

    var _fit_baseHeight = function( object, newValue ){

        object = $( object );

        if( typeof newValue !== 'undefined' ){
            object.data( 'wz-fit-base-height', newValue );
            return;
        }

        var value = object.data('wz-fit-base-height');

        if( !value ){

            value = object.height();

            object.data( 'wz-fit-base-height', value );

        }

        return value;

    };

    var _fit_baseOuterWidth = function( object, newValue ){

        object = $( object );

        if( typeof newValue !== 'undefined' ){
            object.data( 'wz-fit-base-outerWidth', newValue );
            return;
        }

        var value = object.data('wz-fit-base-outerWidth');

        if( !value ){

            value = object.outerWidth( true );

            object.data( 'wz-fit-base-outerWidth', value );

        }

        return value;

    };

    var _fit_baseOuterHeight = function( object, newValue ){

        object = $( object );

        if( typeof newValue !== 'undefined' ){
            object.data( 'wz-fit-base-outerHeight', newValue );
            return;
        }

        var value = object.data('wz-fit-base-outerHeight');

        if( !value ){

            value = object.outerHeight( true );

            object.data( 'wz-fit-base-outerHeight', value );

        }

        return value;

    };

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

    var updateCurrent = function( structure ){

        current = structure;

        if( !controlNav && !pressedNav ){

            pointer++;
            record = record.slice( 0, pointer + 1 );

        }else if( pressedNav ){

            for( var i = 0 ; i < record.length ; i++ ){

                if( record[ i ] === current.id ){
                    pointer = i;
                }

            }

        }

        fileArea.data( 'file-id', current.id );

        record[ pointer ] = current.id;

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

        //Do not show extension
        //TO-DO, allow showing extensions

        file.children('textarea').text( _cropExtension( structure ) );

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
        wz.fs( id, function( error, structure ){

            if( error ){
                alert( lang.errorOpenDirectory );
                return;
            }

            // Update current
            updateCurrent( structure );
            recordNavigation();

            // List Structure Files
            structure.list( function( error, list ){

                if( error ){
                    return alert( lang.errorOpenDirectory );
                }

                var length = list.length;
                var files  = $();

                // Generate File icons
                for( var i = 0; i < length; i++ ){
                    files = files.add( icon( list[ i ] ) );
                }

                // Display icons
                fileArea.children().not('.wz-prototype').not( directoryStatus ).remove();

                displayIcons( files );

                fileArea.data( 'wz-uploader-destiny', structure.id );

                if( structure.id === wz.system.user().rootPath ){
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

            });

        });

    };

    var beginRename = function( icon ){

        renaming = icon;
        prevName = $( 'textarea', icon).val();

        /*var nameLength = 0;

        if( /\.tar\.gz$/ig.test( prevName ) ){
            nameLength = prevName.lastIndexOf('.tar.gz');
        }else if( /\.tar\.bz2$/ig.test( prevName ) ){
            nameLength = prevName.lastIndexOf('.tar.bz2');
        }else{
            nameLength = prevName.lastIndexOf('.');
        }

        if( nameLength <= 0 ){
            nameLength = prevName.length;
        }*/

        $( 'textarea', icon)
            .removeAttr('readonly')
            .focus()
            .selection( 0, prevName.length )
            .removeClass('wz-dragger wz-contextmenu-native-ignore');

    };

    var finishRename = function(){

        var icon     = renaming;
        var textarea = $( 'textarea', icon );
        renaming     = $();

        if( textarea.val() !== prevName ){

            wz.fs( icon.data('file-id'), function( error, structure ){

                if( error ){
                    return alert( error );
                }

                textarea
                    .attr( 'readonly', 'readonly' )
                    .blur()
                    .addClass('wz-dragger wz-contextmenu-native-ignore');

                var nameExt = _addExtension( textarea.val(), structure );

                structure.rename( nameExt, function( error ){

                    if( error ){

                        if( error === 'NAME ALREADY EXISTS' ){
                            alert( lang.nameExists );
                        }else{
                            alert( error );
                        }

                        var nameNoExt = _cropExtension(structure);

                        textarea.val( nameNoExt ).text( nameNoExt ); // To Do -> Realmente hace falta el .text? No es suficiente con el .val?

                    }

                });

            });

        }else{

            textarea
                .attr( 'readonly', 'readonly' )
                .blur()
                .addClass('wz-dragger wz-contextmenu-native-ignore');

        }

    };

    var createDirectory = function(){

        wz.fs( current.id, function( error, structure ){

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

                $('.weexplorer-file.active', win).each(function(){

                    wz.fs( $(this).data( 'file-id' ), function( error, structure ){

                        if( error ){
                            return alert( error );
                        }

                        if(
                            structure.owner === wz.system.user().id ||
                            structure.permissions.modify === 1 ||
                            structure.id === structure.shareRoot
                        ){

                            structure.remove( function( error, quota ){

                                if( error ){
                                    alert( error );
                                }

                            });

                        }else{
                            alert( lang.notEnoughPermissions );
                        }

                    });

                });

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

    var appendIcon = function( icon ){

        var protoIcon = fileArea.find('.weexplorer-file.wz-prototype');
        var iconList  = fileArea.find('.weexplorer-file').not( protoIcon );
        var sort;

        if( sortStatus === SORT_NAME ){
            sort = sortByName;
        }else if( sortStatus === SORT_SIZE ){
            sort = sortBySize;
        }else if( sortStatus === SORT_CREATION ){
            sort = sortByCreationDate;
        }else if( sortStatus === SORT_MODIFICATION ){
            sort = sortByModificationDate;
        }

        var index = -1;
        var tmp;

        if( iconList.length ){

            for( var i = 0; i < iconList.length; i++ ){

                tmp = sort( icon, iconList.eq( i ) );

                if( tmp != -1 ){

                    index = i;
                    break;

                }

            }

        }

        if( index === -1 ){
            fileArea.prepend( icon.after('\n') );
        }else{
            iconList.eq( index ).after( icon.after('\n') );
        }

        updateFolderStatusMessage();

        centerIcons();

    };

    var displayIcons = function(list, noSort ){

        $( list ).filter( '.directory' ).each( function(){
            fileArea.append( this ).append('\n');
        });

        $( list ).not( '.directory' ).each( function(){
            fileArea.append( this ).append('\n');
        });

        updateFolderStatusMessage();


        if( !noSort ){
            sortIcons();
        }


        centerIcons();

        // Nullify
        list = null;

    };

    var updateFolderStatusMessage = function(){

        if( !fileArea.find('.weexplorer-file').not('.wz-prototype').length ){

            if( current.alias === 'inbox' ){
                directoryStatus.find('.big').text( lang.inboxEmpty );
                directoryStatus.find('.small').text( lang.inboxEmptyExplain );
            }else if( current.id === 'shared' ){
                directoryStatus.find('.big').text( lang.sharedEmpty );
                directoryStatus.find('.small').text( lang.sharedEmptyExplain );
            }else{
                directoryStatus.find('.big').text( lang.directoryEmpty );
                directoryStatus.find('.small').text('');
            }

            directoryStatus
                .css( 'display', 'block' )
                .css( 'margin-top', ( ( fileArea.height() - parseInt( fileArea.css('padding-top'), 10 ) ) / 2 ) - directoryStatus.height() );

        }else{
            directoryStatus.css( 'display', 'none' );
        }

    };

    var notifications = function(){

        wz.fs( 'inbox', function( error, structure ){

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

        wz.fs( 'shared', function( error, structure ){

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

                    wz.channel( function( error, chn ){

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

                    wz.channel( function( error, chn ){

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

    var sortIcons = function( list, sort ){

        if( typeof sort === 'undefined' ){
            sort = sortStatus;
        }

        if( typeof list === 'undefined' ){
          list = $('.weexplorer-file').not('.wz-prototype');
        }

        if( sort === SORT_NAME ){
            list = list.sort( sortByName );
        }else if( sort === SORT_SIZE ){
            list = list.sort( sortBySize );
        }else if( sort === SORT_CREATION ){
            list = list.sort( sortByCreationDate );
        }else if( sort === SORT_MODIFICATION ){
            list = list.sort( sortByModificationDate );
        }

        if( list.length ){
            displayIcons( list, true );
        }

        sortStatus = sort;

        wql.changeSort( sort );

        return list;

    };

    // WZ Events
    wz.fs
    .on( 'accepted inbox refused shared sharedAccepted sharedRefused sharedOut', function(){
        notifications();
    })

    .on( 'conversionEnd', function( structure, progress ){

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

            if( originID === current.id ){

                fileArea.children( '.weexplorer-file-' + structure.id ).remove();
                centerIcons();
                updateFolderStatusMessage();

            }else if( destinyID === current.id ){
                displayIcons( icon( structure ) );
            }

        }

    })

    .on( 'new', function( structure ){

        if( structure.parent === current.id ){
            appendIcon( icon( structure ) );
        }

    })

    .on( 'modified', function( structure ){

        if( structure.parent === current.id ){

            var file =  fileArea.find('.weexplorer-file-' + structure.id );

            if( file.hasClass('temporal-file') && structure.type !== 3 ){

                file
                    .removeClass('temporal-file weexplorer-file-uploading')
                    .addClass('file')
                    .find('img')
                        .attr( 'attr', file.find('img').attr('src').replace( '?upload', '' ) );


            }

        }

    })

    .on( 'remove', function( id, quota, parent ){

        fileArea.children( '.weexplorer-file-' + id ).remove();
        sidebar.children( '.folder-' + id ).remove();

        if( current.id === id ){
            openDirectory( parent );
        }else{
            updateFolderStatusMessage();
            centerIcons();
        }

    })

    .on( 'rename', function( structure ){

        if( structure.parent === current.id ){

            fileArea.children( '.weexplorer-file-' + structure.id ).children( 'textarea' ).val( _cropExtension( structure ) );
            sortIcons( fileArea.find('.weexplorer-file') );

        }else if( structure.id === current.id ){
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

    wz.upload
    .on( 'fsnodeEnqueue', function( list ){

        // Display Message
        if( !uploading.hasClass('uploading') ){

            uploading
                .addClass('uploading')
                .finish()
                .transition({ height : '+=33' }, 500 );

            fileArea
                .finish()
                .transition({ height : '-=33' }, 500 );

            sidebar
                .finish()
                .transition({ height : '-=33' }, 500 );

            uploadingBar.width(0);

            uploadingItem.text( 0 );
            uploadingItems.text( list.length );
            uploadingElapsed.text( lang.calculating );

        }else{

            uploadingItems.text( parseInt( uploadingItems.text(), 10 ) + list.length );
            uploadingElapsed.text( lang.calculating );

        }

    })

    .on( 'fsnodeQueueEnd', function(){

        uploading
                .removeClass('uploading')
                .finish()
                .transition({ height : '-=33' }, 500 );

            fileArea
                .finish()
                .transition({ height : '+=33' }, 500 );

            sidebar
                .finish()
                .transition({ height : '+=33' }, 500 );

    })

    .on( 'fsnodeStart', function( structure ){
        uploadingItem.text( parseInt( uploadingItem.text(), 10 ) + 1 );
        //fileArea.append( icon( structure.id, structure.name, structure.type ) );
    })

    .on( 'fsnodeProgress', function( structureID, progress, queueProgress, time ){

        var icon = fileArea.children( '.weexplorer-file-' + structureID );

        /*
        if( !icon.hasClass('weexplorer-file-uploading') ){
            return;
        }
        */

        icon.children('article')
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

    wz.config.on( 'displayExtensionsChanged', function( display ){

        wz.app.storage( 'displayExtensions', display );

        displayExtensions = display;

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

        if( directoryStatus.css('display') === 'block' ){
            directoryStatus.css( 'margin-top', ( ( fileArea.height() - parseInt( fileArea.css('padding-top'), 10 ) ) / 2 )  - directoryStatus.height() );
        }

    })

    .on( 'ui-view-blur', function(){
        $( '.weexplorer-sort', win ).removeClass( 'show' );
    })

    .on( 'mousedown', '.weexplorer-menu-download', function(){

        if( current.id !== $( '.sharedFolder', sidebar ).data( 'file-id' ) && current.id !== $( '.receivedFolder', sidebar ).data( 'file-id' ) ){

            $( '.active.file, .active.pointer-file', win ).each( function(){

                wz.fs($(this).data('file-id'), function(e,st){
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

        }else{

            views.removeClass('list').addClass('grid');
            fileArea.removeClass('list').addClass('grid');

            viewType = 0;

            wql.changeView( 0 );

            fileArea.find( 'textarea' ).css({ width : '' });

        }

        win.trigger('ui-view-resize');

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

            // Actualizamos los tamaños de referencia
            _fit_baseWidth( folderBar, _fit_baseWidth( folderBar ) + sidebarOuterWidth );
            _fit_baseWidth( folderMain, _fit_baseWidth( folderMain ) + sidebarOuterWidth );
            _fit_baseWidth( fileArea, _fit_baseWidth( fileArea ) + sidebarOuterWidth );

            _fit_baseOuterWidth( folderBar, _fit_baseOuterWidth( folderBar ) + sidebarOuterWidth );
            _fit_baseOuterWidth( folderMain, _fit_baseOuterWidth( folderMain ) + sidebarOuterWidth );
            _fit_baseOuterWidth( fileArea, _fit_baseOuterWidth( fileArea ) + sidebarOuterWidth );

            // Transición de la zona de iconos
            folderMain.add( folderBar ).add( fileArea ).transition( { width : '+=' + sidebarOuterWidth }, 250, function(){
                folderPromise.resolve();
                centerIcons();
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

            // Actualizamos los tamaños de referencia
            _fit_baseWidth( folderBar, _fit_baseWidth( folderBar ) - sidebarOuterWidth );
            _fit_baseWidth( folderMain, _fit_baseWidth( folderMain ) - sidebarOuterWidth );
            _fit_baseWidth( fileArea, _fit_baseWidth( fileArea ) - sidebarOuterWidth );

            _fit_baseOuterWidth( folderBar, _fit_baseOuterWidth( folderBar ) - sidebarOuterWidth );
            _fit_baseOuterWidth( folderMain, _fit_baseOuterWidth( folderMain ) - sidebarOuterWidth );
            _fit_baseOuterWidth( fileArea, _fit_baseOuterWidth( fileArea ) - sidebarOuterWidth );

            // Transición de la zona de iconos
            folderMain.add( folderBar ).add( fileArea ).transition( { width : '-=' + sidebarOuterWidth }, 238, function(){
                folderPromise.resolve();
                centerIcons();
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

            if( $(this).hasClass( 'weexplorer-sort-name' ) ){

                $( '.weexplorer-menu-sort span', win ).text( lang.sortByName );
                sortIcons( fileArea.find('.weexplorer-file'), SORT_NAME );

            }else if( $(this).hasClass( 'weexplorer-sort-size' ) ){

                $( '.weexplorer-menu-sort span', win ).text( lang.sortBySize );
                sortIcons( fileArea.find('.weexplorer-file'), SORT_SIZE );

            }else if( $(this).hasClass( 'weexplorer-sort-creation' ) ){

                $( '.weexplorer-menu-sort span', win ).text( lang.sortByCreation );
                sortIcons( fileArea.find('.weexplorer-file'), SORT_CREATION );

            }else{

                $( '.weexplorer-menu-sort span', win ).text( lang.sortByModif );
                sortIcons( fileArea.find('.weexplorer-file'), SORT_MODIFICATION );

            }

        }

    })

    .on( 'dblclick', '.weexplorer-file.received', function(){
        wz.app.createView( $(this).data( 'file-id' ), 'received');
    })

    .on( 'dblclick', '.weexplorer-file.pointer-pending', function(){
        wz.app.createView( $(this).data( 'file-id' ), 'shared');
    })

    .on( 'dblclick', 'textarea:not([readonly])', function( e ){
        e.stopPropagation();
    })

    .on( 'dblclick', '.weexplorer-file.file:not(.received)', function(){

        var id = $(this).data('file-id');

        wz.fs( id, function( error, structure ){

            // To Do -> Error

            structure.open( fileArea.find('.file').map( function(){ return $(this).data('file-id') }).get(), function( error ){

                if( error ){
                    alert( lang.noApp );
                }

            });

        });

    })

    .on( 'dblclick', '.weexplorer-file.directory:not(.received)', function(){

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

            wz.fs( pointer, function( error, structure ){

                if( structure.status === 1 ){

                    structure.associatedApp( function( error, app ){

                        if( app ){
                            alert('ABRIR OTRAS APPS NO ESTÁ IMPLEMENTADO');
                            // To Do -> wz.app.createView( app, [ pointer ] );
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
            $( 'textarea', icon ).attr( 'readonly', 'readonly' ).blur().addClass('wz-dragger wz-contextmenu-native-ignore').val( prevName );
        }else{
            $( '.weexplorer-file.active' , fileArea ).removeClass('active');
        }

        downloadComprobation();

    })

    .key( 'ctrl + enter', function(){

        if( $( '.weexplorer-file.active.last-active', fileArea ).hasClass('directory') ){
            wz.app.createView( $( '.weexplorer-file.active.last-active', fileArea ).data( 'file-id' ), 'main');
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

    .on( 'contextmenu', '.weexplorer-file', function(e){

        var icon     = $(this);
        var textarea = $( e.target ).closest('textarea');

        if( textarea.length && !textarea.attr('readonly') ){
            return;
        }

        var menu        = wz.menu();
        var permissions = icon.data( 'permissions' );

        if( icon.hasClass( 'shared-pending' ) ){

            menu
            .addOption( lang.acceptFile, function(){

                wz.fs( icon.data( 'file-id' ), function( error, structure ){

                    structure.accept( function( error ){

                        if( error ){
                            alert( error );
                            return;
                        }

                        var banner = wz.banner();

                        if( structure.pointerType === 0 ){
                            banner.setTitle( lang.folderShareAccepted );
                        }else{
                            banner.setTitle( lang.fileShareAccepted );
                        }

                        banner
                            .setText( structure.name + ' ' + lang.beenAccepted )
                            .setIcon( 'https://static.inevio.com/app/1/file_accepted.png' )
                            .render();

                    });

                });

            })

            .addOption( lang.properties, function(){
                wz.app.createView( icon.data( 'file-id' ), 'properties' );
            })

            .addOption( lang.refuseFile, function(){

                wz.fs( icon.data( 'file-id' ), function( error, structure ){

                    structure.refuse( function( error ){

                        if( error ){
                            alert( error );
                            return;
                        }

                        var banner = wz.banner();

                        if( structure.pointerType === 0 ){
                            banner.setTitle( lang.folderShareRefused );
                        }else{
                            banner.setTitle( lang.fileShareRefused );
                        }

                        banner
                            .setText( structure.name + ' ' + lang.beenRefused )
                            .setIcon( 'https://static.inevio.com/app/1/file_denied.png' )
                            .render();

                    });

                });

            }, 'warning');

        }else if( icon.hasClass('received') ){

            menu
                .addOption( lang.acceptFile, function(){

                    wz.fs( icon.data( 'file-id' ), function( error, structure ){

                        structure.accept( function( error ){

                            if( error ){
                                alert( error );
                            }else{

                                wz.banner()
                                    .setTitle( lang.fileShareAccepted )
                                    .setText( structure.name + ' ' + lang.beenAccepted )
                                    .setIcon( 'https://static.inevio.com/app/1/file_accepted.png' )
                                    .render();

                            }

                        });

                    });

                })

                .addOption( lang.properties, function(){
                    wz.app.createView( icon.data( 'file-id' ), 'properties' );
                })

                .addOption( lang.refuseFile, function(){

                    wz.fs( icon.data( 'file-id' ), function( error, structure ){

                        structure.refuse( function( error ){

                            if( error ){
                                alert( error );
                            }else{

                                wz.banner()
                                    .setTitle( lang.fileShareRefused )
                                    .setText( structure.name + ' ' + lang.beenRefused )
                                    .setIcon( 'https://static.inevio.com/app/1/file_denied.png' )
                                    .render();

                            }

                        });

                    });

                }, 'warning');

        }else if( icon.hasClass('file') || ( icon.data( 'filePointerType' ) === 2 && !icon.hasClass('pointer-pending') ) ){

            menu.addOption( lang.openFile, function(){
                icon.dblclick();
            });

            menu.addOption( lang.openFileLocal, function(){

              wz.fs( icon.data('file-id'), function( error, object ){
                object.openLocal();
              });

            });

            if( permissions.link ){

                menu.addOption( lang.createLink, function(){
                    wz.app.createView( icon.data( 'file-id' ), 'link');
                });

            }

            if( permissions.send ){

                menu.addOption( lang.sendTo, function(){
                    wz.app.createView( icon.data( 'file-id' ), 'send');
                });

            }

            if( permissions.share ){

                menu.addOption( lang.shareWith, function(){
                    wz.app.createView( icon.data( 'file-id' ), 'share');
                });

            }

            if( permissions.download ){

                menu.addOption( lang.download, function(){
                    downloadFiles.mousedown();
                });

            }

            menu.addOption( lang.properties, function(){
                wz.app.createView( icon.data( 'file-id' ), 'properties' );
            });

            if( permissions.modify ){

                menu.addOption( lang.rename, function(){
                    beginRename( icon );
                });

            }

            menu.addOption( lang.remove, function(){
                deleteAllActive();
            }, 'warning');

        }else if( icon.hasClass('directory') || ( icon.data( 'filePointerType' ) === 0 && !icon.hasClass('pointer-pending') ) ){

            menu
                .addOption( lang.openFolder, function(){
                    icon.dblclick();
                })

                .addOption( lang.openInNewWindow, function(){
                    wz.app.createView( icon.data( 'file-id' ), 'main');
                });

            if( permissions.send ){

                menu.addOption( lang.sendTo, function(){
                    wz.app.createView( icon.data( 'file-id' ), 'send');
                });

            }

            if( permissions.share ){

                menu.addOption( lang.shareWith, function(){
                    wz.app.createView( icon.data( 'file-id' ), 'share');
                });

            }

            if( isInSidebar( icon.data('file-id') ) ){

                menu.addOption( lang.removeFromSidebar, function(){
                    removeFromSidebar( icon.data( 'file-id' ) );
                });

            }else{

                menu.addOption( lang.addToSidebar, function(){

                    if( icon.data('filePointer') ){
                        addToSidebar( icon.data( 'filePointer' ), icon.find('textarea').val() );
                    }else{
                        addToSidebar( icon.data( 'file-id' ), icon.find('textarea').val() );
                    }

                });

            }

            menu.addOption( lang.properties, function(){
                wz.app.createView( icon.data( 'file-id' ), 'properties' );
            });

            if( permissions.modify ){

                menu.addOption( lang.rename, function(){
                    beginRename( icon );
                });

            }

            menu.addOption( lang.remove, function(){
                deleteAllActive();
            }, 'warning');

        }else if( icon.hasClass( 'pointer-pending' ) ){
            // To Do
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

            if( $(this).hasClass('directory') || $(this).hasClass('pointer-directory') ){
                dest = $(this).data('file-id');
            }else if( $(this).hasClass('weexplorer-sidebar-element') ){
                dest = $(this).data('fileId');
            }else{
                dest = current.id;
            }

            item.siblings('.active').add( item ).each( function(){

                wz.fs( $(this).data('file-id'), function( error, structure ){

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

            wz.fs( record[i], function( error, structure ){

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

            wz.fs( record[i], function( error, structure ){

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

    fileArea.on( 'contextmenu', function( e ){

        if(
            !$( e.target ).closest('.weexplorer-file').length &&
            current.id !== $( '.sharedFolder', sidebar ).data( 'file-id' ) &&
            current.id !== $( '.receivedFolder', sidebar ).data( 'file-id' )
        ){

            wz.menu()
            .addOption( lang.upload, function(){
                uploadButton.click();
            })
            .addOption( lang.newDirectory, function(){
                createDirectory();
            })
            .render();

        }

    });

    uploadButton.on( 'click', function(){

        if( current.id !== $( '.sharedFolder', sidebar ).data( 'file-id' ) && current.id !== $( '.receivedFolder', sidebar ).data( 'file-id' ) ){
            $(this).data( 'destiny', current.id );
        }else{
            $(this).removeData( 'destiny' );
        }

    });

    /* START APP */
    translateUi();
    setSortType( wz.app.storage('sortType') );
    setViewType( wz.app.storage('viewType') );

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
    wz.fs( 'root', function( error, structure ){

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

    wz.fs( 'inbox', function( error, structure ){

        // Ya tenemos la carpeta de recibidos, cumplimos la promesa
        inboxPath.resolve( structure );

    });

    wz.fs( 'shared', function( error, structure ){

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

            wz.fs( item.folder, function( error, structure ){

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
