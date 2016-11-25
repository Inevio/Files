var SHARED_FOLDER = 0;

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
console.log( $, window, document);
