var app           = $(this);
var addMailButton = $('.add-mail span');
var mailPrototype = $('.mail.wz-prototype');
var mailList      = $('.mail-list');
var shareButton   = $('.share-button');
var closeButton   = $('.close');
var validMails    = [];
var MAIL_REGEXP = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,4}))$/

var initText = function(){
  $('.title').text(lang.linkByMail);
  $('.description').text(lang.linkByMailDesc);
  $('.add-mail-text').text(lang.addMail);
  $('.share-text').text(lang.sendInvitations);
  $('.mail').attr('placeholder', lang.mailExample);
}

var addMail = function(){
  var mail = mailPrototype.clone();
  mail.removeClass('wz-prototype');
  mailList.append(mail);
  mailList.stop().clearQueue().animate( { scrollTop : mailList[0].offsetTop }, 400  );
}

var share = function(){
  if (shareButton.hasClass('valid')) {

    api.fs( params, function( err, fsnode ){
      console.log( err )
      fsnode.sendLinkByMail( validMails, console.log.bind( console ) )
    })

    api.banner()
    .setTitle( lang.linkSentTitle )
    .setText( lang.linkSentSubtitle )
    .setIcon( 'https://static.horbito.com/app/1/icon.png' )
    .render()

    wz.app.removeView( app );

  }

}

var checkMails = function(){
  $('.wrong').removeClass('wrong');
  shareButton.removeClass('valid');
  validMails = []
  mailList.find('.mail:not(.wz-prototype)').each( function(){
    if ( $(this).val() != '' ) {
      if( $(this).val().length && MAIL_REGEXP.test( $(this).val() ) ){
        validMails.push( $(this).val() )
        shareButton.addClass('valid');
      }else{
        $(this).addClass('wrong');
      }
    }
  });
}

addMailButton.on( 'click' , function(){
  addMail();
});

shareButton.on( 'click' , function(){
  share();
});

closeButton.on( 'click' , function(){
  wz.app.removeView(app);
});

app.on( 'blur input' , '.mail' , function(){
  checkMails();
});

initText();
