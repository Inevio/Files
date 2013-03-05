
wz.app.addScript( 1, 'link', function( win ){

    var file = {};
    var linkSpan = $('.link-url .wz-selectable', win);

    win
    .on( 'app-param', function( e, params ){

        wz.structure( params, function( error, structure ){
            file = structure;
        });

    })

    .on( 'click', '.link-password button', function(){

        var url      = '';
        var password = $('.link-password input', win ).val();
        var preview  = !$('.link-preview input', win ).prop('checked');
        
        if( !password.length ){
            password = null;
        }

        file.createLink( password, preview, function( error, url ){
            linkSpan.text( url.url );
        });

    });

});
