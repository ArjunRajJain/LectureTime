
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

$('#chatStart').on('click',function(e) {
  $('#chatBoxYeah').toggle();
});

 
 
}

Template.postPage.events({
  'click #imgVideo' : function(e) {
    console.log('yis');
    $('#assemblage-video-nostream').css('display','none');

    var session;
    var connectionCount = 0;

    var session;
    var publisher;

    post = Posts.findOne();

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

        publisher = OT.initPublisher('myVideo',{width:200, height:150,resolution: "1280x720"});
        publisher.on({
            streamCreated: function (event) {
              $('#myVideo > span').css('display','none');
              $('#myVideo > button').css('display','none');
              $('#myVideo > div.OT_bar.OT_edge-bar-item.OT_mode-auto').css('display','none');
            },
            streamDestroyed: function (event) {
              $('#assemblage-video-nostream').css('display','block');
            }
        });
        $('#myVideo').css('display','block');



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
});
  },
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
  $('#videoForm').draggable();
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