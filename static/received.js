
wz.app.addScript( 1, 'received', function( win, app, lang, params ){
    
    wz.structure( params, function( error, structure ){
        
        if( error ){
            alert( 'Sorry, an error occurred' );
        }else{

            wz.user.getUser( structure.metadata.received.sender, function( error, user ){
                $( '.received-content-info.who', win ).text( 'Sent by ' + user.fullName );
            });
            
            var date = new Date( parseInt( structure.metadata.received.time ) );
            
            $( '.received-content-info.date', win ).text( ' on ' + date.toLocaleDateString() );
            
            var hour = date.getHours();
                if( hour < 10 ){ hour = '0' + hour; }
            var minute = date.getMinutes();
                if( minute < 10 ){ minute = '0' + minute; }
            var second = date.getSeconds();
                if( second < 10 ){ second = '0' + second; }
            
            $( '.received-content-info.hour', win ).text( ' at ' + hour + ':' + minute + ':' + second );
            $( '.received-content-name', win ).text( structure.name );
            $( '.received-content-size', win ).text( wz.tool.bytesToUnit( structure.size, 2 ) );
            $( '.received-content-message', win ).text( structure.metadata.received.message );
            
            win
            
                .on( 'mousedown', '.received-content-accept', function(){
                    structure.accept();
                    alert( 'The file has been accepted correctly ');
                    wz.app.closeWindow( win.data( 'win' ) );
                })
            
                .on( 'mousedown', '.received-content-refuse', function(){
                    structure.refuse();
                    alert( 'The file has been refused correctly ');
                    wz.app.closeWindow( win.data( 'win' ) );
                });
                
        }
        
    });
    
});
