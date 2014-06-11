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
    var openTokClient = new OpenTokClient('44830582', '9242e5928e440da73ef6c2874f6609c2f4a1982f');
    var location = '127.0.0.1';
    var options = {'p2p.preference':'enabled'};
    var session = id
    var role = OpenTokClient.roles.PUBLISHER;
    var params = {connection_data:Meteor.userId()};
    var token = openTokClient.generateToken(session, role, params);
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

    var openTokClient = new OpenTokClient('44830582', '9242e5928e440da73ef6c2874f6609c2f4a1982f');
    var location = '127.0.0.1';
    var options = {'p2p.preference':'enabled'};
    var session = openTokClient.createSession(location, options);
    var role = OpenTokClient.roles.PUBLISHER;
    var params = {connection_data:"userId:42"};
    var token = openTokClient.generateToken(session, role, params);
    
    // pick out the whitelisted keys
    var post = _.extend(_.pick(postAttributes, 'title'), {
      userId: user._id, 
      sessionId: session,
      token: token,
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