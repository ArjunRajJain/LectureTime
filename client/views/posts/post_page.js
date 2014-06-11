
Template.postPage.docid = function() {
  return this._id;
};

Template.postPage.config = function() {
  return function(ace) {
    ace.setShowPrintMargin(false);
    return ace.getSession().setUseWrapMode(true);
  };
};
currentActive = 'n';

Template.postPage.created = function() {
console.log('start');
LineStream.emit(Session.get('padId')+':getTab');

var session;
var connectionCount = 0;
 
OT.setLogLevel(OT.DEBUG);
OT.on("exception", function exceptionHandler(event) {
    console.log(event)
});

var session;
var publisher;

post = Posts.findOne();

Meteor.call('getToken',post.sessionId,function(err,token) {
  if (!err) {
    if (OT.checkSystemRequirements() == 1) {
        // Replace sessionID with your own values:
        session = OT.initSession('44830582', post.sessionId);
        session.connect(token, function (error) {
            if (publisher) {
                session.publish(publisher);
            }
        });

        publisher = OT.initPublisher('myVideo',{width:400, height:300});
        publisher.on({
            streamCreated: function (event) {

            },
            streamDestroyed: function (event) {

            }
        });
        session.on("streamCreated", function(event) {
          session.subscribe(event.stream, 'otherVideo');
          session.connect(token);
        });
    } else {
        OT.log("The client does not support WebRTC.");
    }
  }
});
 

 
}

Template.postPage.rendered = function() {
  padId = Session.get('padId');
    Deps.autorun(function() {
    if(pad) {
      pad.close();
      remotePad.close();
    }
    console.log('yis');
    pad = new Pad(padId);
    remotePad = new RemotePad(padId, pad);
    //remoteTabs = new RemoteTabs(padId, tabs);
  });
$('body').on('click', '#wipe', function() {
    pad.wipe(true);
  });

  
  // function checkActive() {
  //   console.log('called');
  //   if($('#blackboardli').hasClass('active')) {
  //      LineStream.emit(padId + ':tabChange','#blackboardli');
  //   }
  //   if($('#notepadli').hasClass('active')) {
  //      LineStream.emit(padId + ':tabChange','#notepadli');
  //   }
  // }

  function checkActiveB(target) {
    LineStream.emit(padId + ':tabChange','#'+target);
  }

  $('#tabsGalore').on('click',function(event) {
      console.log('c - ' + event.target.id);
      checkActiveB(event.target.id);
  });
  // setInterval(checkActive,10000);

Meteor.call('getLines',padId, function(err,linesTo){
      for(i = 0; i < linesTo.length;i++) {
        pad.drawLine(linesTo[i].from,linesTo[i].to,linesTo[i].color);
      }
    });
Meteor.call('getDots',padId, function(err,dots){
      for(i = 0; i < dots.length;i++) {
        pad.drawCircle(dots[i].at,dots[i].color);
      }
    });
}

var pad;
var remotePad;