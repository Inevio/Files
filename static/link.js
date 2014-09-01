    
    var win       = $( this );
    var file      = {};
    var linkSpan  = $('.link-url input', win);
    var prototype = $('.wz-prototype', win);
    var linkTable = $( 'table', win );
    var previous  = $( '.previous', win );
    
    var growWindow = function(){
        
        win.clearQueue().stop();
        
        var linksOnTable = linkTable.find('tr').size() - 2;
        
        if( linksOnTable === 0 ){
            win.transition( { 'width' : '365', 'height' : '215' }, 250);
            $( '.wz-ui-header', win ).transition( { 'width' : '335' }, 250, function(){
                previous.addClass('hidden');
            });
        }else if( linksOnTable === 1 ){
            previous.removeClass('hidden');
            win.transition( { 'width' : '525', 'height' : '340' }, 250);
            $( '.wz-ui-header', win ).transition( { 'width' : '495' }, 250);
        }else if( linksOnTable === 2 ){
            win.transition( { 'height' : '376' }, 250);
        }else if( linksOnTable === 3 ){
            win.transition( { 'height' : '412' }, 250);
        }else if( linksOnTable === 4 ){
            win.transition( { 'height' : '448' }, 250);
        }else{
            win.transition( { 'height' : '485' }, 250);
        }
                
    };
        
    wz.fs( params, function( error, structure ){
        
        structure.getLinks( function( error, links ){

            if( links.length ){
                
                previous.removeClass('hidden');
                win.css({ 'width' : '525' });
                $( '.wz-ui-header', win ).css({ 'width' : '495' });
                
                if( links.length === 1 ){
                    win.css({ 'height' : '340' });
                }else if( links.length === 2 ){
                    win.css({ 'height' : '376' });
                }else if( links.length === 3 ){
                    win.css({ 'height' : '412' });
                }else if( links.length === 4 ){
                    win.css({ 'height' : '448' });
                }else{
                    win.css({ 'height' : '485' });
                }
                
                var collection = $();
                
                for( var i = 0 ; i < links.length ; i++ ){
                    
                    var userLink = prototype.clone().removeClass( 'wz-prototype' );
                    
                    if( links[i].password ){
                        userLink.find('.first-column i').addClass( 'link-lock' );
                    }else{
                        userLink.find('.first-column i').addClass( 'link-unlock' );
                    }
                    
                    if( links[i].preview ){
                        userLink.find('.second-column i').addClass( 'link-prev' );
                    }else{
                        userLink.find('.second-column i').addClass( 'link-unprev' );
                    }
                    
                    userLink.find('.link-data').val( links[i].url );
                    userLink.find('.link-views').text( links[i].visits );
                    userLink.find('.link-downloads').text( links[i].downloads );
                    userLink.find('.link-imports').text( links[i].imports );
                    userLink.find('.link-delete').data( 'id', links[i].id );
                    
                    collection = collection.add( userLink );

                }
                                
                linkTable.append( collection );
                
            }
        });

    });

    // WZ Events
    wz.fs
    .on( 'linkAdded', function( link, structure ){
                                                    
        if( win.data( 'file-id' ) === structure.id ){
                    
            var alreadyCreated = false;
            
            linkTable.find('.link-delete').each( function(){
                if( $(this).data('id') === link.id ){
                    alreadyCreated = true;
                }
            });
            
            if( !alreadyCreated ){
                            
                var newLink = prototype.clone().removeClass( 'wz-prototype' );
                
                if( link.password ){
                    newLink.find('.first-column i').addClass( 'link-lock' );
                }else{
                    newLink.find('.first-column i').addClass( 'link-unlock' );
                }
                
                if( link.preview ){
                    newLink.find('.second-column i').addClass( 'link-prev' );
                }else{
                    newLink.find('.second-column i').addClass( 'link-unprev' );
                }
                
                newLink.find('.link-data').val( link.url );
                newLink.find('.link-views').text( link.visits );
                newLink.find('.link-downloads').text( link.downloads );
                newLink.find('.link-imports').text( link.imports );
                newLink.find('.link-delete').data( 'id', link.id );
                
                linkTable.append( newLink );
                
                growWindow();
                
            }
            
        }
        
    })
    
    .on( 'linkRemoved', function( hash ){
                    
        linkTable.find('.link-delete').each( function(){
            
            if( $(this).data('id') === hash ){
                $(this).parents('tr').remove();
                return false;
            }
            
        });
        
        growWindow();
        
    });

    // DOM Events
    win
        .on( 'mouseenter', '.first-column', function( e ){

            if( $( this ).find( '.link-unlock' ).size() ){
                $( '.previous-explanation', previous ).text( lang.passwordNo );
            }else{
                $( '.previous-explanation', previous ).text( lang.passwordYes );
            }

            $( '.previous-explanation', previous ).css({

                left    : e.pageX - parseInt( win.css( 'x' ), 10 ) - parseInt( $( '#wz-taskbar' ).css( 'width' ), 10 ),
                top     : e.pageY - parseInt( win.css( 'y' ), 10 ),
                display : 'block'

            });

        })

        .on( 'mouseleave', '.first-column', function(){
            $( '.previous-explanation', previous ).css( 'display', 'none' );
        })

        .on( 'mouseenter', '.second-column', function( e ){

            if( $( this ).find( '.link-prev' ).size() ){
                $( '.previous-explanation', previous ).text( lang.previewYes );
            }else{
                $( '.previous-explanation', previous ).text( lang.previewNo );
            }

            $( '.previous-explanation', previous ).css({

                left    : e.pageX - parseInt( win.css( 'x' ), 10 ) - parseInt( $( '#wz-taskbar' ).css( 'width' ), 10 ),
                top     : e.pageY - parseInt( win.css( 'y' ), 10 ),
                display : 'block'

            });

        })

        .on( 'mouseleave', '.second-column', function(){
            $( '.previous-explanation', previous ).css( 'display', 'none' );
        })
    
        .on( 'mousedown', '.link-password button', function(){
    
            var url      = '';
            var password = $('.link-password input', win ).val();
            var preview  = !$('.link-preview input', win ).prop('checked');
            
            if( !password.length ){
                password = null;
            }
            
            wz.fs( params, function( error, structure ){

                win.data( 'file-id' , structure.id );
                linkSpan.addClass( 'filled' );

                structure.addLink( password, preview, function( error, url ){
                    linkSpan.val( url.url );
                });

            });
    
        })
        
        .on( 'mousedown', '.link-delete', function(){
            
            var id = $(this).data('id');
            
            wz.fs( params, function( error, structure ){
                structure.removeLink( id );
            });
            
        })
        
        .key( 'enter', function(e){

            if( $(e.target).is( '.link-password input' ) ){
                $( '.link-password button', win ).mousedown();
            }
            
        });

    $( '.link-title', win ).text( lang.linkTitle );
    $( '.link-question', win ).text( lang.linkQuestion );
    $( '.link-answer', win ).text( lang.linkAnswer );
    $( '.link-password span', win ).text( lang.linkPasswordSpan );
    $( '.link-password button', win ).text( lang.linkPasswordButton );
    $( '.link-preview label', win ).text( lang.linkPreview );
    $( '.link-url span', win ).text( lang.linkUrl );
    $( '.previous-title', win ).text( lang.previousTitle );
    $( '.previous-url', win ).text( lang.previousUrl );
    $( '.previous-views', win ).text( lang.previousViews );
    $( '.previous-downloads', win ).text( lang.previousDownloads );
    $( '.previous-imports', win ).text( lang.previousImports );
