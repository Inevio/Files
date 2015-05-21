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
	var moreInfoExpandable		= true;

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
			if(moreInfoExpandable){

				if( !moreInfo.hasClass( 'extended' ) ){

					win.height(win.height()+76);

				}else{

					win.height(win.height()-76);

				}
				moreInfo.toggleClass( 'extended' );

			}
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

		var extensionText = lang.directory;
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


		var createMoreInfo = function (i, contentName, text, alternativeReturn){

			if( contentName ){

				var moreInfoSection = infoPrototype.clone().removeClass('wz-prototype').addClass('info'+(i));

				if( i===0 ){
					moreInfoSection.insertAfter( infoPrototype );
				}else{
					moreInfoSection.insertAfter( $('.info' +(i-1)) );
				}

				var moreInfoTitle = $('.info'+(i) + ' .title',win);
				var moreInfoContent = $('.info'+(i) + ' .content',win);

				moreInfoTitle.text( text );

				if(alternativeReturn === undefined){
					moreInfoContent.text ( contentName );
				}else{
					moreInfoContent.text ( alternativeReturn );
				}
				i++;

			}
			return i;
		}


		wz.fs(params, function( error, structure ){

			//console.log(structure);

			file = structure;
      properties( structure );

			if( structure.metadata ){

				var i = 0;

				if( structure.metadata.exif ){

					type.text( lang.imageType );
					i = createMoreInfo( i,structure.metadata.exif.imageSize,lang.imageSize );
					i = createMoreInfo( i,structure.metadata.exif.profileDescription,lang.colorProfile );
					i = createMoreInfo( i,structure.metadata.exif.yResolution,lang.resolutionPpi, structure.metadata.exif.yResolution+' ppi' );
					i = createMoreInfo( i,structure.metadata.exif.fileType, lang.fileTypeTitle );

				}else if( structure.metadata.id3 ){

					type.text( lang.audioType );
					i = createMoreInfo( i,structure.metadata.id3.title,lang.title );

					if( structure.metadata.id3.artist ){
						i = createMoreInfo( i,structure.metadata.id3.artist[0],lang.artist );
					}

					i = createMoreInfo( i,structure.metadata.id3.album,lang.album );

					if( structure.metadata.media && structure.metadata.media.audio ){
    			  i = createMoreInfo( i,structure.metadata.media.audio.codec,lang.codec );
					}


				}else if( structure.metadata.media && structure.metadata.media.video ){

						type.text( lang.videoType );
						i = createMoreInfo( i,structure.metadata.media.video.resolution,lang.resolutionPpi, structure.metadata.media.video.resolution.w + 								'x' + structure.metadata.media.video.resolution.h );
						i = createMoreInfo( i,structure.metadata.media.video.aspectString,lang.aspectRatio );
						i = createMoreInfo( i,structure.metadata.media.video.fps,'FPS:' );
						i = createMoreInfo( i,structure.metadata.media.video.codec,lang.codec );

				}else{
					moreInfoExpandable = false;
					moreInfo.css ('display', 'none' );
					win.height( win.height()-40 );
				}

			}
			else{

				moreInfoExpandable = false;
				moreInfo.css ('display', 'none' );
				win.height( win.height()-40 );

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
							permissionText.text ( lang.propertiesOwner );
							$( userx ).toggleClass( 'owner' );

						}

						userxNameField = $(userx + ' .username',win);
						userxAvatarField = $(userx + ' i',win);
						userxNameField.text( owner[i].fullName );
						userxAvatarField.css( "background-image",'url("'+owner[i].avatar.small+'")' );

						if( owner[i].id == wz.system.user().id ){
							userxNameField.text( userxNameField.text() + ' ' + lang.propertiesFileOwner );
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
					permissionText.text ( lang.propertiesOwner );
					userxNameField.text( userxNameField.text() + ' ' + lang.propertiesFileOwner );

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

   /* win.key( 'enter', function(){
        input.blur();
    });*/

	$( '.file-type-title',win ).text ( lang.fileTypeTitle );
	$( '.duration-title',win ).text ( lang.durationTitle );
	$( '.location-title',win ).text ( lang.locationTitle );
	$( '.created-title',win ).text ( lang.createdTitle );
	$( '.modified-title',win ).text ( lang.modifiedTitle );
	$( '.permissions-title',win ).text ( lang.permissionsTitle );

	$( '.permission-link-title',win ).text ( lang.permissionLinkTitle );
	$( '.permission-download-title',win ).text ( lang.permissionDownloadTitle );
	$( '.permission-modify-title',win ).text ( lang.permissionModifyTitle );
	$( '.permission-share-title',win ).text ( lang.permissionShareTitle );
	$( '.permission-copy-title',win ).text ( lang.permissionCopyTitle );
	$( '.permission-send-title',win ).text ( lang.permissionSendTitle );

	$( '.users-section-title',win ).text ( lang.usersSectionTitle );
	$( '.moreinfo-section-title',win ).text ( lang.moreinfoSectionTitle );

  $( '.properties-title', win ).text( lang.propertiesTitle );
  $( '.attr', win ).text( '· ' +  lang.attr + ':' );
  $( '.attr-link', win ).text( lang.attrLink );
  $( '.attr-modify', win ).text( lang.attrModify );
  $( '.attr-copy', win ).text( lang.attrCopy );
  $( '.attr-download', win ).text( lang.attrDownload );
  $( '.attr-share', win ).text( lang.attrShare );
  $( '.attr-send', win ).text( lang.attrSend );
