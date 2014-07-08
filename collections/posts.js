Posts      = new Meteor.Collection('posts');
Documents  = new Meteor.Collection('documents');
Lines      = new Meteor.Collection('lines');
Dots       = new Meteor.Collection('dots');
Tabs        = new Meteor.Collection('tabs');
LineStream = new Meteor.Stream('lines');

var openTokClient;

if(Meteor.isServer) {
 LineStream.permissions.read(function() {
return true;
 });
 LineStream.permissions.write(function() {
return true;
 });
}

Lines.allow({
  insert: function() {return true;},
  update: function() {return true;},
  remove: function() {return true;}
});

Dots.allow({
  insert: function() {return true;},
  update: function() {return true;},
  remove: function() {return true;}
});

Tabs.allow({
  insert: function() {return true;},
  update: function() {return true;},
  remove: function() {return true;}
});


Posts.allow({
  update: ownsDocument,
  remove: ownsDocument
});

Posts.deny({
  update: function(userId, post, fieldNames) {
    // may only edit the following two fields:
    return (_.without(fieldNames, 'url', 'title').length > 0);
  }
});

Meteor.methods({
  getLines : function(id) {
    return Lines.find({padId:id, erased:false}).fetch();
  },
  getDots : function(id) {
    return Dots.find({padId:id, erased:false}).fetch();
  },
  removeLines : function(id) {
    Lines.update({padId:id},{$set:{erased:true}},{multi:true});
    Dots.update({padId:id},{$set:{erased:true}},{multi:true});
  },
  getToken : function(id) {
    var openTokClient = new OpenTokClient('25832252', 'd4e8df12cb972e95db1d082c813f3de4ff4c35d1');
    var sessionId = id;
    var options = {
        role: 'publisher', //The role for the token. Each role defines a set of permissions granted to the token
        data: "userId:" + Meteor.userId(), 
        expireTime: Math.round(new Date().getTime() / 1000) + 86400 // (24 hours) The expiration time for the token, in seconds since the UNIX epoch. The maximum expiration time is 30 days after the creation time. The default expiration time of 24 hours after the token creation time.
    };

    var token = openTokClient.generateToken(sessionId, options);
    return token;
  },
  post: function(postAttributes) {
    var user = Meteor.user(),
      postWithSameLink = Posts.findOne({url: postAttributes.url});
    
    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to post new stories");
    
    // ensure the post has a title
    if (!postAttributes.title)
      throw new Meteor.Error(422, 'Please fill in a headline');
    
    // check that there are no previous posts with the same link
    if (postAttributes.url && postWithSameLink) {
      throw new Meteor.Error(302, 
        'This link has already been posted', 
        postWithSameLink._id);
    }

    var openTokClient = new OpenTokClient('25832252', 'd4e8df12cb972e95db1d082c813f3de4ff4c35d1');
    var options = {
      mediaMode: 'routed', //Options are 'routed' (through openTok servers) and 'relayed' (Peer to Peer)
      location: '127.0.0.1' //An IP address that the OpenTok servers will use to situate the session in the global OpenTok network.
    };
    var session = openTokClient.createSession(options);
    // pick out the whitelisted keys
    var post = _.extend(_.pick(postAttributes, 'title'), {
      userId: user._id, 
      sessionId: session,
      author: user.username, 
      submitted: new Date().getTime(),
      commentsCount: 0,
      upvoters: [], votes: 0
    });
    
    var postId = Posts.insert(post);

    Documents.insert({
      title: postAttributes.title, postId :postId
    });


    
    return postId;
  },
  
  upvote: function(postId) {
    var user = Meteor.user();
    // ensure the user is logged in
    if (!user)
      throw new Meteor.Error(401, "You need to login to upvote");
    
    Posts.update({
      _id: postId, 
      upvoters: {$ne: user._id}
    }, {
      $addToSet: {upvoters: user._id},
      $inc: {votes: 1}
    });
  }
});