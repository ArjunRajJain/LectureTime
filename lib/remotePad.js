if(!Meteor.isClient) return;
this.RemotePad = function RemotePad(padId, pad) {
var users = {};


//listening on the dragstart event for the given padId
 LineStream.on(padId + ':dragstart', function(nickname, position, color) {
	//display the nickname pointer on the screen as remote user draws on the pad
	var pointer = $("<span class='nickname'>nickname</span>");
	 pointer.text(nickname);
	 positionPointer(pointer, position);
	 //$('body').append(pointer);
	 users[nickname] = {
	 color: color, 
	 from: position,
	 pointer: pointer
	 };
 });


//listening on the dragend event for the given padId
 LineStream.on(padId + ':dragend', function(nickname) {
//cleaning at the dragend
	var user = users[nickname];
	if(user) {
	 user.pointer.remove();
	 users[nickname] = undefined;
	}
 });

 LineStream.on(padId + ':tabChange',function(target) {
 	if(target == '#notepadli') {
 		$('#blackboardli').css('background-color','');
 		$('#notepadli').css('background-color','wheat');
 		$('#videoli').css('background-color','');
 	}
 	else if(target == '#blackboardli'){
 		$('#blackboardli').css('background-color','wheat');
 		$('#notepadli').css('background-color','');
 		$('#videoli').css('background-color','');
 	}
 	else {
 		$('#videoli').css('background-color','wheat');
 		$('#notepadli').css('background-color','');
 		$('#blackboardli').css('background-color','');
 	}
 });

  LineStream.on(padId + ':getTab',function() {
  	LineStream.emit(padId+':tabChange','#' + $('.active.yoyo')[0].id);
 });



//listening on the drag event for the given padId
 LineStream.on(padId + ':drag', function(nickname, to) {
var user = users[nickname];
if(user) {
//when remote user is dragging, do the same here and re-position the nickname pointer
 pad.drawLine(user.from, to, user.color);
 positionPointer(user.pointer, to);
 user.from = to;
 }
 });

 LineStream.on(padId + ':tap', function(at, col) {
 	pad.drawCircle(at, col);
 });

// listening on the wipe event and wipe the blackboard
 LineStream.on(padId + ':wipe', function(nickname) {
 pad.wipe();
 });


function positionPointer(pointer, position) {
	pointer.css({
	top: position.y + 10 + $('canvas')[0].offsetTop + $('canvas').parent().scrollTop(),
	left: position.x + 10 - $('canvas')[0].offsetLeft + $('canvas').parent().scrollLeft()
	});
}


this.close = function() {
//remove all the listeners, when closing
 LineStream.removeAllListeners(padId + ':dragstart');
 LineStream.removeAllListeners(padId + ':dragend');
 LineStream.removeAllListeners(padId + ':drag');
 LineStream.removeAllListeners(padId + ':wipe');
 LineStream.removeAllListeners(padId + ':tap');
 };
}