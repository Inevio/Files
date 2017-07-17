var SHARED_FOLDER = 0;
var window = $(this)[0];

var setBadge = function(){

  SHARED_FOLDER.list( function( e , files ){

    wz.app.setBadge( files.length );

  });

}

var checkRecieved = function(){

  if ( SHARED_FOLDER === 0 ) {
    api.fs( 'root', function( error, fsnode ){

      fsnode.list( function( error, folders ){

        folders = folders.filter( function( folder ){
          return folder.type === 1 && folder.name === 'Received';
        })

        SHARED_FOLDER  = folders[0];
        setBadge();

      });

    });
  }else{
    setBadge();
  }

}

var addArrow = function( appName, text, position ){

  var arrow = $( '<div class="onboarding-arrow"><figure></figure><span></span></div>' );
  arrow.find( 'span' ).text( text );
  arrow.addClass( 'arrow-' + appName );

  var top = 32 + position*44 - 20;

  arrow.css({

    'position': 'absolute',
    'top': top,
    'left': $( '#wz-taskbar', window.document ).width(),
    'margin-left' : '10px',
    'box-sizing': 'border-box',
    'z-index' : -1;

  });

  arrow.find('figure').css({

    'width': '55px',
    'height' : '43px',
    'background-image' : 'url("https://static.horbito.com/app/357/flecha-dock.png")',
    'background-size' : '55px 43px',
    'float' : 'left'

  })

  arrow.find('span').css({

    'margin-left': '16px',
    'margin-top' : '4px',
    'font-family' : 'Lato',
    'font-size' : '21px',
    'font-weight' : 'bold',
    'color' : '#fff',
    'float' : 'left',
    'text-shadow' : '0 5px 10px rgba(0,0,0,.3)'

  })

  $( 'body', window.document ).append( arrow );

}

wql.isFirstOpen( [ api.system.user().id ] , function( e , o ){

  if ( o.length === 0 ){

    addArrow( 'files', lang.main.arrow ,1 )

  }

});

api.fs
.on( 'new', function( fsnode ){

  checkRecieved();

})
.on( 'move', function( fsnode, finalDestiny, originalSource ){

  checkRecieved();

})
.on( 'remove', function( fsnodeId, quota, parent ){

  checkRecieved();

})

checkRecieved();
