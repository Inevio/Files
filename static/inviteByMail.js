var app           = $(this);
var addMailButton = $('.add-mail span');
var mailPrototype = $('.mail.wz-prototype');
var mailList      = $('.mail-list');
var shareButton   = $('.share-button');
var closeButton   = $('.close');

addMailButton.on( 'click' , function(){
  addMail();
});

shareButton.on( 'click' , function(){
  share();
});

closeButton.on( 'click' , function(){
  wz.app.removeView(app);
});

var initText = function(){
  $('.title').text(lang.inviteByMail);
  $('.description').text(lang.inviteByMailDesc);
  $('.add-mail-text').text(lang.addMail);
  $('.share-text').text(lang.sendInvitations);
  $('.mail').attr('placeholder' , lang.mailExample);
}

var addMail = function(){
  var mail = mailPrototype.clone();
  mail.removeClass('wz-prototype');
  mailList.append(mail);
  mailList.stop().clearQueue().animate( { scrollTop : mailList[0].offsetTop }, 400  );
}

var share = function(){
  var mails = [];
  var list = mailList.find('.mail:not(.wz-prototype)');
  $.each( list , function( i , mail ){
    var mail = $(mail);
    if (mail.val() != '') {
      mails.push(mail.val());
    }
  });
  if (mails.length > 0) {
    api.user.inviteByMail(mails);
  }
  wz.app.removeView( app );
}

initText();
