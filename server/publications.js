Meteor.publish('posts', function(options) {
  return Posts.find({}, options);
});

Meteor.publish('singlePost', function(id) {
  return id && Posts.find(id);
});

Meteor.publish('comments', function(postId) {
  return Comments.find({postId: postId});
});

Meteor.publish('notifications', function() {
  return Notifications.find({userId: this.userId});
});

Meteor.publish('documents',function(id) {
  return Documents.find({postId:id});
});

Meteor.publish('lines',function(id) {
  return Lines.find({padId:id});
});
Meteor.publish('dots',function(id) {
  return Dots.find({padId:id});
});

Meteor.publish('tabs',function(id) {
  return Tabs.find({padId:id},{sort: {submitted: -1, _id: -1}});
});