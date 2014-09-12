
// Global variables
var win              = $( this );
var waitingChange    = false;
var linksTableHeader = $('.link-table-header');
var linksTableList   = $('.link-table-list');

// Functions
var appendLink = function( info, search ){

    if( search ){

        var stop = false;

        linksTableList.find('tr').each( function(){
            
            stop = $(this).data('id') === info.id;

            if( stop ){
                return false;
            }

        });

        if( stop ){
            return false;
        }

    }

    win.addClass('show-list');

    var line = linksTableList.find('.wz-prototype').clone().removeClass('wz-prototype');

    line.data( 'id', info.id );
    line.find('.link-table-cell-url').text( info.url );
    line.find('.link-table-cell-views').text( info.visits );
    line.find('.link-table-cell-downloads').text( info.downloads );
    line.find('.link-table-cell-imports').text( info.imports );

    if( info.password ){
        line.find('.link-table-cell-password').addClass('active');
    }

    if( info.preview ){
        line.find('.link-table-cell-preview').addClass('active');
    }

    linksTableList.append( line );

    return true;

};

var checkViewSize = function(){

    var height = 0;

    win.children().not('.wz-dialog').each( function(){
        height += $(this).outerHeight( true );
    });

    if( height !== win.height() ){
        wz.view.setSize( win.width(), height );
    }

};

var start = function(){

    // Load file information
    wz.fs( params, function( error, node ){

        node.getLinks( function( error, links ){

            if( error || !links.length ){
                return;
            }

            for( var i = 0; i < links.length; i++ ){
                appendLink( links[ i ] );
            }

            checkViewSize();

        });

        $('.file-icon').attr( 'src', node.icons.normal );
        $('.file-name').text( node.name );

    });

    // Translate UI
    $('.link-title').text( lang.linkTitle );
    $('.link-preview span').text( lang.linkPreview );
    $('.link-password span').text( lang.linkPassword );
    $('.link-password-input').attr( 'placeholder', lang.inputPassword );
    $('.link-generate').text( lang.linkGenerate );
    $( '.link-table-cell-url', linksTableHeader ).text( lang.previousUrl );
    $( '.link-table-cell-views', linksTableHeader ).text( lang.previousViews );
    $( '.link-table-cell-downloads', linksTableHeader ).text( lang.previousDownloads );
    $( '.link-table-cell-imports', linksTableHeader ).text( lang.previousImports );

};

// Events
win
.on( 'change', '.link-password input', function(){

    waitingChange = true;

    if( $(this).attr('checked') ){
        
        win.addClass('show-password');
        $('.link-password-input').focus();

    }else{

        win.removeClass('show-password');
        $('.link-password-input').blur();

    }

})

.on( 'mousedown', function(){
    waitingChange = false;
})

.on( 'mouseup', function(){

    if( waitingChange ){

        waitingChange = false;

        if( win.hasClass('show-password') ){
            $('.link-password-input').focus();
        }else{
            $('.link-password-input').blur();
        }

    }

})

.on( 'click', '.link-generate', function(){

    // Load file information
    wz.fs( params, function( error, node ){

        node.addLink( $('.link-password input').attr('checked') && $('.link-password-input').val() ? $('.link-password-input').val() : null, !!$('.link-preview input').attr('checked'), function( error, link ){

            if( error ){
                alert( error );
                return;
            }

            if( appendLink( link, true ) ){
                checkViewSize();
            }

            var dialog = wz.dialog();

            dialog.setTitle( lang.newLink );
            dialog.setText( lang.newLinkSteps );
            dialog.setButton( 0, lang.accept );
            dialog.setInput( 0, link.url, 'text' );

            dialog.render();

            var input = $('.wz-dialog input');

            input
                .attr( 'readonly', 'readonly' )
                .val( link.url );

            input[ 0 ].setSelectionRange( 0, input[ 0 ].value.length );

        });

    });

})

.on( 'click', '.link-table-cell-delete span', function(){

    var id = $(this).closest('tr').data('id');

    wz.fs( params, function( error, node ){

        if( error ){
            return;
        }

        node.removeLink( id );

    });
    
})

wz.fs
.on( 'linkAdded', function( link, structure ){
                                                    
    if( params !== structure.id ){
        return;
    }

    if( appendLink( link, true ) ){
        checkViewSize();
    }

})
    
.on( 'linkRemoved', function( hash ){
                
    linksTableList.find('tr').each( function(){
        
        if( $(this).data('id') === hash ){

            $(this).remove();

            if( linksTableList.find('tr').length ){
                win.removeClass('show-list');
            }

            checkViewSize();

            return false;

        }
        
    });
    
});

start();
