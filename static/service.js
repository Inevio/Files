var SHARED_PATH = 0;

var updateBadge = function( num , add ){

  var actualBadge = wz.app.getBadge();

  if ( add ) {
    wz.app.setBadge( parseInt(actualBadge) + num  );
  }else{
    wz.app.setBadge( parseInt(actualBadge) - num  );
  }


};

var updateNotificationBadge = function( fsnode , options ){

  var fsnodeId = options.onlyId ? fsnode : fsnode.id;

  if ( options.isNew && SHARED_PATH === fsnode.parent ) {

    updateBadge( 1 , true );

  }else{

    if ( options.parent && options.parent === SHARED_PATH ) {

      updateBadge( 1 , false );

    }else if( options.origin && options.origin === SHARED_PATH ){

      updateBadge( 1 , false );

    }

  }

}

var checkRecieved = function(){

  api.fs( 'root', function( error, fsnode ){

    fsnode.list( function( error, folders ){

      folders = folders.filter( function( folder ){
        return folder.type === 1 && folder.name === 'Received';
      })

      SHARED_PATH  = folders[0].id;
      folders[0].list( function( e , files ){

        files.forEach( function(){

          updateBadge( 1 , true );

        });

      });

    });

  });

}

api.fs
.on( 'new', function( fsnode ){

  updateNotificationBadge( fsnode , { isNew: true , onlyId: false } );

})
.on( 'move', function( fsnode, finalDestiny, originalSource ){

  updateNotificationBadge( fsnode , { isNew: false , onlyId: false , origin: originalSource } );

})
.on( 'remove', function( fsnodeId, quota, parent ){

  updateNotificationBadge( fsnodeId , { isNew: false , onlyId: true , parent: parent } );

})

checkRecieved();
console.log( $, window, document);
