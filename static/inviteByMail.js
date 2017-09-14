var app           = $(this);
var addMailButton = $('.add-mail span');
var mailPrototype = $('.mail.wz-prototype');
var mailList      = $('.mail-list');
var shareButton   = $('.share-button');
var closeButton   = $('.close');
var validMails    = [];
var MAIL_REGEXP = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,4}))$/
var url;
var window = app.parents().slice( -1 )[ 0 ].parentNode.defaultView
var myUserID = api.system.user().id;

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
  if (shareButton.hasClass('valid')) {
    api.user.inviteByMail(validMails);
    api.banner()
      .setTitle( lang.invitationSentTitle )
      .setText( lang.invitationSentSubtitle )
      .setIcon( 'https://static.horbito.com/app/1/icon.png' )
      .render();
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

var generateGmailUrl = function(){

  var title;
  var description;

  api.config.getLanguages( function( error, languages, used ){

    if( used.code === "es" || used.code === "es-es" ){

      title = 'Ven%20a%20la%20nueva%20nube%20conmigo';
      description = 'He%20estado%20jugando%20un%20rato%20con%20horbito%20y%20tiene%20muy%20buena%20pinta,%20échale%20un%20ojo:%20';


    }else if( used.code === "en" || used.code === "en-us" ){
      
      title = "Come%20to%20the%20new%20Cloud%20with%20me";
      description = "I've%20been%20playing%20with%20horbito%20for%20a%20while%20and%20it%20seems%20pretty%20cool,%20check%20it%20out:%20";

    }

    url = 'https://mail.google.com/mail/?view=cm&fs=1&tf=1&su=' + title + '&body=' + description + 'https://www.horbito.com/register?sender=' + myUserID;

  });
  

}

app.on( 'click' , '.social-networks .fb-button' , function(){

  FB.ui({
    method: 'send',
    link: 'http://www.horbito.com/register?sender=' + myUserID,
  });

})

.on( 'click' , '.social-networks .google-button' , function(){
  
  var w = 700;
  var h = 600;
  var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
  var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;

  var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
  var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

  var left = ((width / 2) - (w / 2)) + dualScreenLeft;
  var top = ((height / 2) - (h / 2)) + dualScreenTop;
  console.log('abro', url);
  window.open( url , '', 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);

})

window.fbAsyncInit = function() {

  FB.init({
    appId      : '425462067838557',
    cookie     : true,  // enable cookies to allow the server to access 
                        // the session
    xfbml      : true,  // parse social plugins on this page
    version    : 'v2.9' // use graph api version 2.8
  });

};

if( typeof FB == 'undefined' ){

  // Load the SDK asynchronously 
  (function(d, s, id) { 
    var js, fjs = d.getElementsByTagName(s)[0]; 
    if (d.getElementById(id)) return; 
    js = d.createElement(s); js.id = id; 
    js.src = "//connect.facebook.net/en_US/sdk.js"; 
    fjs.parentNode.insertBefore(js, fjs); 
  }(window.document, 'script', 'facebook-jssdk')); 

}

generateGmailUrl();
initText();
