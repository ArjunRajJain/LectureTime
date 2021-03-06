Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  waitOn: function() { 
    return [Meteor.subscribe('notifications')]
  }
});

PostsListController = RouteController.extend({
  template: 'postsList',
  increment: 5, 
  limit: function() { 
    return parseInt(this.params.postsLimit) || this.increment; 
  },
  findOptions: function() {
    return {sort: this.sort, limit: this.limit()};
  },
  waitOn: function() {
    return Meteor.subscribe('posts', this.findOptions());
  },
  posts: function() {
    return Posts.find({}, this.findOptions());
  },
  data: function() {
    return {
      posts: this.posts()
    };
  }
});

NewPostsListController = PostsListController.extend({
  sort: {submitted: -1, _id: -1}
});

BestPostsListController = PostsListController.extend({
  sort: {votes: -1, submitted: -1, _id: -1}
});

Router.map(function() {
  this.route('home', {
    path: '/',
    controller: NewPostsListController
  });
  
  this.route('postPage', {
    path: '/room/:_id',
    waitOn: function() {
      return [
        Meteor.subscribe('documents',this.params._id),
        Meteor.subscribe('lines',this.params._id),
        Meteor.subscribe('dots',this.params._id),
        Meteor.subscribe('singlePost',this.params._id)
      ];
    },
    onBeforeAction : function() {
       Session.set('padId', this.params._id);
    },
    data: function() { return Documents.findOne({postId:this.params._id}); }
  });

  this.route('postEdit', {
    path: '/room/:_id/edit',
    waitOn: function() { 
      return Meteor.subscribe('singlePost', this.params._id);
    },
    data: function() { return Posts.findOne(this.params._id); }
  });
  
  this.route('postSubmit', {
    path: '/submit',
    progress: {enabled: false}
  });
});


var requireLogin = function(pause) {
  if (! Meteor.userId()) {
    if (Meteor.loggingIn())
      this.render(this.loadingTemplate);
    else
      this.render('accessDenied');
      return pause();
  }
}

Router.onBeforeAction('loading');
Router.onBeforeAction(requireLogin);
Router.onBeforeAction(function() { clearErrors() });
