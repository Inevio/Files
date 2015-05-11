  var win       						= $( this );
  var input     					  = $('.file-name div', win);
	var extension 					  = $('.file-extension div', win);
  var type      						= $('.file-type', win);
  var size      						= $('.properties .size', win);
  var created   						= $('.created-date', win);
  var modified  						= $('.modified-date', win);
	var duration						  = $('.duration-text',win);
	var filePermission				= $('.permission', win);
	var propertiesButton 		  = $('.properties-button',win);
	var historicButton 				= $('.historic-button',win);
	var propertiesTab 				= $('.properties-tab',win);
	var propertiesWindow 			= $('.properties', win);

	var pathLevelPrototype		= $('.location .level.wz-prototype',win);

	var filePerm							= $('.file-permissions', win);
	var expandFilePerm				= $('.file-permissions .permissions-header', win);

	var usersPerm							= $('.users-permissions', win);
	var expandUsersPerm				= $('.users-permissions .users-header', win);
	var userPrototype					= $('.user.wz-prototype',win);

	var moreInfo							= $('.more-info', win);
	var expandMoreInfo				= $('.more-info .more-info-header', win);
	var infoPrototype					= $('.info.wz-prototype',win);

	var thumbnail 						= $('.preview i',win);
  var owner     						= $('.properties .owner', win);
  var link      						= $('.properties .link', win);
  var modify    						= $('.properties .modify', win);
  var copy      						= $('.properties .copy', win);
  var download  						= $('.properties .download', win);
  var share     						= $('.properties .share', win);
  var send      						= $('.properties .send', win);
	var user4									= $('.user4 .user',win);
  var file      						= {};
  var renaming  						= false;

		expandFilePerm.on( 'click', function(){

			if( !filePerm.hasClass('extended') ){

				win.height(win.height()+55);

			}else{

				win.height(win.height()-55);

			}
			filePerm.toggleClass( 'extended' );
		});

		expandUsersPerm.on( 'click', function(){

			if( !usersPerm.hasClass('extended') ){

				win.height(win.height()+146);

			}else{

				win.height(win.height()-146);

			}
			usersPerm.toggleClass( 'extended' );
		});

		expandMoreInfo.on( 'click', function(){

			if( !moreInfo.hasClass( 'extended' ) ){

				win.height(win.height()+146);

			}else{

				win.height(win.height()-146);

			}
			moreInfo.toggleClass( 'extended' );
		});


		propertiesButton.on( 'click', function(){

			if( !this.hasClass('active') ){

				historicButton.toggleClass( 'active' );
				propertiesButton.toggleClass( 'active' );
				propertiesTab.toggleClass( 'hide' );
				propertiesWindow.toggleClass( 'historic' );
				win.height(510);

			}

		});

		historicButton.on( 'click', function(){

			if( !this.hasClass('active') ){

				propertiesButton.toggleClass( 'active' );
				historicButton.toggleClass( 'active' );
				propertiesTab.toggleClass( 'hide' );
				propertiesWindow.toggleClass( 'historic' );
				win.height( 385 );

			}

		});

		filePermission.on('click', function(){
			$(this).toggleClass('enabled');
		});

    var addZero = function( value ){

        if( value < 10 ){
            return '0' + value;
        }else{
            return value;
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

		/* Return file extension */

		var _getExtension = function(structure){
        return structure.name.split('.').slice(-1)[0];
    }


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

        var nameNoExt = _cropExtension(structure);
        input.text( nameNoExt );

				var extensionText = 'Directorio';

        var fileType = structure.type;

        if( fileType === 0 && !structure.shared ){
            type.text( lang.directory );
        }else if( fileType === 1 ){
            type.text( lang.specialDirectory );
        }else if( fileType === 2 && !structure.shared ){
            type.text( lang.file );
						extensionText ='.' + _getExtension(structure);
        }else if( fileType === 3 ){
            type.text( lang.temporalFile );
						extensionText ='.' + _getExtension(structure);
        }else if( fileType === 4 ){
            type.text( lang.receivedFile );
						extensionText ='.' + _getExtension(structure);
        }else if( ( fileType === 2 && structure.shared ) || ( fileType === 5 && structure.pointerType === 2 ) ){
            type.text( lang.sharedFile );
						extensionText ='.' +  _getExtension(structure);
        }else if( ( fileType === 0 && structure.shared ) || ( fileType === 5 && structure.pointerType === 0 ) ){
            type.text( lang.sharedFolder );
        }else{
            type.text( lang.unknown );
        }

				extension.text( extensionText );

				thumbnail.css( 'background-image','url("'+structure.icons.normal+'")' );

				if ( structure.metadata){
					if ( structure.metadata.media ){
						if ( structure.metadata.media.duration ){
							duration.text( structure.metadata.media.duration.raw );
						}
					}
				}

        var createdDate  = new Date( structure.created );
        var modifiedDate = new Date( structure.modified );

        if( ( fileType !== 0 && fileType !== 1 && fileType !== 5 ) || ( fileType === 5 && structure.pointerType !== 0 && structure.pointerType !== 1 ) ){

            if( structure.size === null ){
                size.text( '--' );
            }else{
                size.text( wz.tool.bytesToUnit( structure.size, 2 ) );
            }

            // To Do -> Usar la función format
            created.text(

                addZero( createdDate.getMonth() + 1 ) + '/' +
                addZero( createdDate.getDate() ) + '/' +
                createdDate.getFullYear() + ', ' +
                addZero( createdDate.getHours() ) + ':' +
                addZero( createdDate.getMinutes() ) + ':' +
                addZero( createdDate.getSeconds() )

            );

            // To Do -> Usar la función format
            modified.text(

                addZero( modifiedDate.getMonth() + 1 ) + '/' +
                addZero( modifiedDate.getDate() ) + '/' +
                modifiedDate.getFullYear() + ', ' +
                addZero( modifiedDate.getHours() ) + ':' +
                addZero( modifiedDate.getMinutes() ) + ':' +
                addZero( modifiedDate.getSeconds() )

            );

        }else{

            size.text( '--' );

            // To Do -> Usar la función format
            created.text(

                addZero( createdDate.getMonth() + 1 ) + '/' +
                addZero( createdDate.getDate() ) + '/' +
                createdDate.getFullYear() + ', ' +
                addZero( createdDate.getHours() ) + ':' +
                addZero( createdDate.getMinutes() ) + ':' +
                addZero( createdDate.getSeconds() )

            );

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

    };

    wz.fs( params, function( error, structure ){

        file = structure;
        properties( structure );

    });


		wz.fs(params, function( error, structure ){
			//console.log(arguments);
		console.log(structure);

			if( structure.metadata ){

				if( structure.metadata.exif ){

					//var user = userPrototype.clone().removeClass('wz-prototype').addClass('user'+(i+1));
					//console.log ( structure.metadata.exif.imageSize );

				}

			}

			structure.getPath( function( error, list ){

				var path = list.map( function( item ){
					return item.name;
				});

				for ( var i=0; i < path.length-1; i++ ){

					var level = pathLevelPrototype.clone().removeClass('wz-prototype').addClass('level'+(i+1));

					if( i === 0 ){
							level.insertAfter(pathLevelPrototype);
					}else{
							level.insertAfter( $('.level' + (i)) );
					}

					$('.level' + (i+1) + ' .level-name').text( path[i] );

					if( i === (path.length-2) ){
						$('.level' + (i+1) + ' i').css( 'display','none' );
					}

				}

			});

    	structure.sharedWith( true, function( error, owner, permissions, users ){

				//console.log(arguments);
				if( owner.length != 0 ){

					var userxNameField;
					var userxAvatarField;
					var permissionText;

					for ( var i = 0; i < owner.length; i++ ) {

						var user = userPrototype.clone().removeClass('wz-prototype').addClass('user'+(i+1));

						if( i===0 ){

							user.insertAfter(userPrototype);

						}else{

							user.insertAfter( $('.user' + (i)) );

						}

						var userx ='.user'+ (i+1);

						if( owner[i].id == structure.owner ){

							permissionText = $(userx + ' .change-permission',win);
							permissionText.text ( 'Owner' );
							$( userx ).toggleClass( 'owner' );

						}

						userxNameField = $(userx + ' .username',win);
						userxAvatarField = $(userx + ' i',win);
						userxNameField.text( owner[i].fullName );
						userxAvatarField.css( "background-image",'url("'+owner[i].avatar.small+'")' );

						if( owner[i].id == wz.system.user().id ){
							userxNameField.text( userxNameField.text() + ' (Me)' );
						}

					}

				}else{

					var user = userPrototype.clone().removeClass('wz-prototype').addClass('user1').insertAfter(userPrototype);

					var userx ='.user1';
					$( userx ).toggleClass( 'owner' );
					var userxNameField = $( userx + ' .username',win );
					var userxAvatarField = $( userx + ' i',win );
					userxNameField.text( wz.system.user().fullName );
					userxAvatarField.css( "background-image",'url("'+wz.system.user().avatar.small+'")' );
					permissionText = $( userx + ' .change-permission',win );
					permissionText.text ( 'Owner' );
					userxNameField.text( userxNameField.text() + ' (Me)' );

				}

    	});
		});

    // WZ Events
    wz.fs
    .on( 'remove', function( id ){

            if( id === params ){
                wz.view.remove();
            }

    })

    .on( 'rename', function( structure ){

        if( structure.id === params ){

            renaming = true;
            /*input.blur();*/
            file = structure;

            var nameNoExt = _cropExtension(structure);
            /*input.val( nameNoExt );*/
        }

    })

    .on( 'permissions', function( id, newPermissions, allPermissions ){

        if( id === params ){
            permissions( allPermissions );
        }

    });

    win.key( 'enter', function(){
        /*input.blur();*/
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
