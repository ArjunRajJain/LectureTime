
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
LineStream.emit(Session.get('padId')+':getTab');

var session;
var connectionCount = 0;

var session;
var publisher;

post = Posts.findOne();

$('#chatStart').on('click',function(e) {
  $('#chatBoxYeah').toggle();
});

$("#videoStart").on('click',function(e){
  Meteor.call('getToken',post.sessionId,function(err,token) {

  if (!err) {
    OT.setLogLevel(OT.DEBUG);
    OT.on("exception", function exceptionHandler(event) {
        console.log(event)
    });
    if (OT.checkSystemRequirements() == 1) {
        // Replace sessionID with your own values:
        session = OT.initSession('44830582', post.sessionId);
        session.connect(token, function (error) {
            if (publisher) {
                session.publish(publisher);
            }
        });

        publisher = OT.initPublisher('myVideo',{width:200, height:150});
        publisher.on({
            streamCreated: function (event) {

            },
            streamDestroyed: function (event) {

            }
        });
        session.on("streamCreated", function(event) {
          session.subscribe(event.stream, 'otherVideo');
          session.connect(token);
          console.log('stream recieved');
          // $('#otherVideo').css('height','600px');
          // $('#otherVideo').css('width','800px');
        });
    } else {
        OT.log("The client does not support WebRTC.");
    }
  }
  $('#myOverVideo').draggable();
});
});
 
 
}

Template.postPage.events({
  'click #resizeVideo' : function(e) {
    if($('#resizeVideo').html() == "Small") {
      $('#resizeVideo').html("Medium");
      $("#myVideo").css('height','300px');
      $('#myVideo').css('width','400px');
    }
    else if($('#resizeVideo').html() == "Medium"){
      $('#resizeVideo').html("Large");
      $("#myVideo").css('height','600px');
      $('#myVideo').css('width','800px');
    }
    else {
      $('#resizeVideo').html("Small");
      $("#myVideo").css('height','150px');
      $('#myVideo').css('width','200px');
    }
  }
});

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


  function checkActiveB(target) {
    LineStream.emit(padId + ':tabChange','#'+target);
  }

  $('#tabsGalore').on('click',function(event) {
      checkActiveB(event.target.id);
  });

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
   $( "#resizable" ).resizable({
      animate: true
    });
}

var pad;
var remotePad;