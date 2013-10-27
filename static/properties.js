    
    var win       = $( this );
    var input     = $('.properties input', win);
    var type      = $('.properties .type', win);
    var size      = $('.properties .size', win);
    var created   = $('.properties .created', win);
    var modified  = $('.properties .modified', win);
    var owner     = $('.properties .owner', win);
    var link      = $('.properties .link', win);
    var modify    = $('.properties .modify', win);
    var copy      = $('.properties .copy', win);
    var download  = $('.properties .download', win);
    var share     = $('.properties .share', win);
    var send      = $('.properties .send', win);
    var file      = {};
    var renaming  = false;

    var permissions = function( permissions ){

        if( permissions.link === 1 ){
            link.addClass('yes');
        }else{
            link.addClass('no');
        }
        
        if( permissions.modify === 1 ){
            modify.addClass('yes');
        }else{
            modify.addClass('no');
        }
        
        if( permissions.copy === 1 ){
            copy.addClass('yes');
        }else{
            copy.addClass('no');
        }
        
        if( permissions.download === 1 ){
            download.addClass('yes');
        }else{
            download.addClass('no');
        }
        
        if( permissions.share === 1 ){
            share.addClass('yes');
        }else{
            share.addClass('no');
        }
        
        if( permissions.send === 1 ){
            send.addClass('yes');
        }else{
            send.addClass('no');
        }

    };
    
    var properties = function( structure ){
                
        input.val( structure.name );
                
        var fileType = structure.type;
        
        if( fileType === 0 && !structure.shared ){
            type.text( lang.directory );
        }else if( fileType === 1 ){
            type.text( lang.specialDirectory );
        }else if( fileType === 2 && !structure.shared ){
            type.text( lang.file );
        }else if( fileType === 3 ){
            type.text( lang.temporalFile );
        }else if( fileType === 4 ){
            type.text( lang.receivedFile );
        }else if( ( fileType === 2 && structure.shared ) || ( fileType === 5 && structure.pointerType === 2 ) ){
            type.text( lang.sharedFile );
        }else if( ( fileType === 0 && structure.shared ) || ( fileType === 5 && structure.pointerType === 0 ) ){
            type.text( lang.sharedFolder );
        }else{
            type.text( lang.unknown );
        }
        
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

        if( ( fileType !== 0 && fileType !== 1 && fileType !== 5 ) || ( fileType === 5 && structure.pointerType !== 0 && structure.pointerType !== 1 ) ){

            if( structure.size === null ){
                size.text( '--' );
            }else{
                size.text( wz.tool.bytesToUnit( structure.size, 2 ) );
            }
            
            created.text( createdMonth + '/' + createdDay + '/' +  createdDate.getFullYear() + ', ' + createdHour + ':' + createdMinute + ':' + createdSecond );
            modified.text( modifiedMonth + '/' + modifiedDay + '/' +  modifiedDate.getFullYear() + ', ' + modifiedHour + ':' + modifiedMinute + ':' + modifiedSecond );

        }else{

            size.text( '--' );
            created.text( createdMonth + '/' + createdDay + '/' +  createdDate.getFullYear() + ', ' + createdHour + ':' + createdMinute + ':' + createdSecond );
            modified.text( '--' );

        }
        
        if( fileType === 5 ){

            wz.user( structure.pointerOwner, function( error, user ){
                owner.text( user.fullName );
            });

        }else{

            wz.user( structure.owner, function( error, user ){
                owner.text( user.fullName );
            });

        }

        permissions( structure.permissions );
        
    }

    wz.structure( params, function( error, structure ){
                
        file = structure;
        properties( structure );
        
    });
    
    win

        .on( 'structure-remove', function( e, id ){

            if( id === params ){
                wz.app.closeWindow( win );
            }

        })

        .on( 'structure-rename', function( e, structure ){

            if( structure.id === params ){

                renaming = true;
                input.blur();
                file = structure;
                input.val( file.name );

            }

        })

        .on( 'structure-permissions', function( e, id, newPermissions, allPermissions ){

            if( id === params ){
                permissions( allPermissions );
            }

        })
        
        .key( 'enter', function(){
            
            input.blur();
            
        });
        
    input
    
        .on( 'blur', function(){
            
            if( input.val() !== file.name && !renaming ){

                file.rename( input.val(), function( error ){

                    if( error ){

                        if( error === 'NAME ALREADY EXISTS' ){
                            alert( lang.nameExists, null, win.data().win );
                        }else{
                            alert( error, null, win.data().win );
                        }

                        input.val( file.name );

                    }

                });

            }

            renaming = false;
            
        });
        
    $( '.properties-title', win ).text( lang.propertiesTitle );
    $( '.properties-name', win ).text( '· ' +  lang.propertiesName + ':' );
    $( '.properties-type', win ).text( '· ' +  lang.propertiesType + ':' );
    $( '.properties-size', win ).text( '· ' +  lang.propertiesSize + ':' );
    $( '.properties-created', win ).text( '· ' +  lang.propertiesCreated + ':' );
    $( '.properties-modified', win ).text( '· ' +  lang.propertiesModified + ':' );
    $( '.properties-owner', win ).text( '· ' +  lang.propertiesOwner + ':' );
    $( '.attr', win ).text( '· ' +  lang.attr + ':' );
    $( '.attr-link', win ).text( lang.attrLink );
    $( '.attr-modify', win ).text( lang.attrModify );
    $( '.attr-copy', win ).text( lang.attrCopy );
    $( '.attr-download', win ).text( lang.attrDownload );
    $( '.attr-share', win ).text( lang.attrShare );
    $( '.attr-send', win ).text( lang.attrSend );
