Template.header.helpers({
  activeRouteClass: function(/* route names */) {
    var args = Array.prototype.slice.call(arguments, 0);
    args.pop();
    
    var active = _.any(args, function(name) {
      return Router.current() && Router.current().route.name === name
    });
    
    return active && 'active';
  },
  domain: function() {
    return window.location.href
  },
  properPage : function() {
    if(Router.current()) {
      return Router.current().route.name == "postPage";
    }
    return false;
  }
});