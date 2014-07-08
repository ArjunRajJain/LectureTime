
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
var session;
var publisher;
var audioOnly = false;
var vidOnly = false;
token = '';
fullScreen = false;
big = false;
left = 0;
top1 = 0;

Template.postPage.created = function() {
LineStream.emit(Session.get('padId')+':getTab');

$('#chatStart').on('click',function(e) {
  $('#chatBoxYeah').toggle();
});

post = Posts.findOne();

  Meteor.call('getToken',post.sessionId,function(err,tok) {
    token = tok;
    if (OT.checkSystemRequirements() == 1) {
        // Replace sessionID with your own values:
        session = OT.initSession('25832252', post.sessionId);
        session.on("streamCreated", function(event) {
          session.subscribe(event.stream, 'otherVideo');
          session.connect(token);
          console.log('stream recieved');
        });
    }
  });
 
 
}

Template.postPage.events({
  'click #pubAud' : function(e) {
    e.stopPropagation();
    if(!audioOnly) {
      console.log('audio Off');
      publisher.publishAudio(true);
      $('#imgAudio').css('opacity',1);
      $('#pubAud').css('opacity',1);
    }
    else {
      console.log('audio on');
      publisher.publishAudio(false);
      $('#imgAudio').css('opacity',0.3);
      $('#pubAud').css('opacity',0.3);
    }
    audioOnly = !audioOnly;
  },
  'click #getBig' : function(e) {
    if(!big) {
      $('#myVideo').css('height',$('.tab-content').height()-10);
      $('#myVideo').css('width',$('.tab-content').width()-10);
      left = $('#videoForm').css('left');
      top1 = $('#videoForm').offset().top;
      $('#videoForm').css('left','0px');
      $('#videoForm').css('top','0px');
    }
    else {
      $('#myVideo').css('height',150);
      $('#myVideo').css('width',200);
      $('#videoForm').css('top',top1);
      $('#videoForm').css('left',left);
    }
    big = !big;
  },
  'dblclick #myVideo' : function(e) {
    if(!big) {
      $('#myVideo').css('height',$('.tab-content').height()-10);
      $('#myVideo').css('width',$('.tab-content').width()-10);
      left = $('#videoForm').css('left');
      top1 = $('#videoForm').offset().top;
      $('#videoForm').css('left','0px');
      $('#videoForm').css('top','0px');
    }
    else {
      $('#myVideo').css('height',150);
      $('#myVideo').css('width',200);
      $('#videoForm').css('top',top1);
      $('#videoForm').css('left',left);
    }
    big = !big;
  },
  'click #pubVid' : function(e) {
    e.stopPropagation();
    if(!vidOnly) {
      publisher.publishVideo(true);
      $('#imgVideo').css('opacity',1);
      $('#pubVid').css('opacity',1);
    }
    else {
      publisher.publishVideo(false);
      $('#imgVideo').css('opacity',0.3);
      $('#pubVid').css('opacity',0.3);
    }
    vidOnly = !vidOnly;
    console.log(vidOnly);
  },
  'click #imgVideo' : function(e) {
    e.preventDefault();
    if(!publisher) {
      

      session.connect(token, function (error) {
          if (publisher) {
              session.publish(publisher);
          }
      });

      publisher = OT.initPublisher('myVideo',{width:200, height:150,resolution: "1280x720"});
      publisher.on({
          streamCreated: function (event) {
            // $('#myVideo > span').css('display','none');
            // $('#myVideo > button').css('display','none');
            $('#myVideo').hide();
            $('#myVideo').children().hide();
            $('#myVideo > div.OT_video-container').show();
            $('.OT_video-container').after('<div id="vidCtrls" class=""><a id="pubVid"><img src="https://s3.amazonaws.com/collaborationapi/assets/vid0.png"  id="pubVid" style="width: 15px;cursor:pointer;" alt="Toggle video" title="Toggle video" class="active"></a><a id="pubAud"><img src="https://s3.amazonaws.com/collaborationapi/assets/voice0.png" id="pubAud"  style="width: 8px;margin-left: 12px;cursor:pointer;" alt="Toggle audio" title="Toggle audio" class="active"></a><a id="getBig"><img src="https://s3.amazonaws.com/collaborationapi/assets/expand_left.png"  class="toggleScreen" style="width: 15px;z-index: 222222;cursor:pointer !important; position: absolute;top: 5px;right: 25px;" alt="Toggle fullscreen" title="Toggle fullscreen"></a></div>');
            $('#myVideo').show();
            $('#myVideo').css('display','block');
            $('#assemblage-video-nostream').css('display','none');
          },
          streamDestroyed: function (event) {
            $('#assemblage-video-nostream').css('display','block');
          }
      });
      //$('#myVideo').css('display','block');
      audioOnly = true;
      vidOnly = true;
    }
  },
  'click #imgAudio' : function(e) {
    e.preventDefault();
    
    if(!publisher) {
      
      session.connect(token, function (error) {
          if (publisher) {
              session.publish(publisher);
          }
      });

      publisher = OT.initPublisher('myVideo',{width:200, height:150,resolution: "1280x720",publishAudio:true, publishVideo:false});
      publisher.on({
          streamCreated: function (event) {
            $('#myVideo').hide();
            $('#myVideo').children().hide();
            $('#myVideo > div.OT_video-container').show();
            $('.OT_video-container').after('<div id="vidCtrls" class=""><a id="pubVid"><img src="https://s3.amazonaws.com/collaborationapi/assets/vid0.png"  id="pubVid" style="width: 15px;cursor:pointer;" alt="Toggle video" title="Toggle video" class="active"></a><a id="pubAud"><img src="https://s3.amazonaws.com/collaborationapi/assets/voice0.png" id="pubAud"  style="width: 8px;margin-left: 12px;cursor:pointer;" alt="Toggle audio" title="Toggle audio" class="active"></a><img src="https://s3.amazonaws.com/collaborationapi/assets/expand_left.png"  class="toggleScreen" style="width: 15px;z-index: 222222;cursor:pointer !important; position: absolute;top: 5px;right: 25px;" alt="Toggle fullscreen" title="Toggle fullscreen"></div>');
            $('#myVideo').show();
            $('#myVideo').css('display','block');
            // $('#imgAudio').css('opacity',0.1);
            $('#pubVid').css('opacity',0.1);
            $('#assemblage-video-nostream').css('display','none');
          },
          streamDestroyed: function (event) {
            $('#assemblage-video-nostream').css('display','block');
          }
      });
      audioOnly = true;
    }
  },
  'mouseenter #myVideo' : function(e) {
    $('#vidCtrls').css('opacity',1);
  },
  'mouseleave #myVideo' : function(e) {
    $('#vidCtrls').css('opacity',0);
  }
});

Template.postPage.rendered = function() {
  $('#videoForm').draggable();
  $('#videoForm').css('top',$('.tab-content').height() - 165 + 'px');
  $('#videoForm').css('left','5px');
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