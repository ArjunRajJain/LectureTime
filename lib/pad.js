if(!Meteor.isClient) return;

this.Pad = function Pad(id) {
  var canvas = $('canvas');
  var ctx = canvas[0].getContext('2d');
  var drawing = false;
  var from;
  var skipCount = 0;
  var nickname ="";
  var color;

  ctx.strokeStyle = color;
  ctx.fillStyle = '#000000';
  ctx.lineCap = 'round';
  ctx.lineWidth = 3;
  
  ctx.fillRect(0, 0, canvas.width(), canvas.height());

  user = ChatworksUsers.findOne();
  if(user) {
    setNickname(ChatworksUsers.findOne().handle);
  }
  console.log('called');
  
  var pad = canvas.attr({
    width: "2000px",
    height: "2000px"
  }).hammer()

  function drawLine(from, to, color) {
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineWidth = 4;
    ctx.lineTo(to.x, to.y);
    ctx.closePath();
    ctx.stroke();
  }

  function setNickname(name) {
    nickname = name;
    localStorage.setItem('nickname', nickname);

    color = localStorage.getItem('color-' + nickname);
    if(!color) {
      color = getRandomColor();
      localStorage.setItem('color-' + nickname, color);
    }

  }
  
  function wipe(emitAlso) {
    ctx.beginPath();
    ctx.clearRect(0,0,canvas.width(),canvas.height());
    ctx.fillRect(0, 0, canvas.width(), canvas.height());
    ctx.closePath();
    if(emitAlso) {
      LineStream.emit(id + ':wipe', nickname);
      Meteor.call('removeLines',id);
    }
  }

  function getColor() {
    return color;
  }

    pad.on('dragstart', onDragStart);
  pad.on('dragend', onDragEnd);
  pad.on('drag', onDrag);
  pad.on('tap',tap);

  function tap(event) {
    console.log('tapped');
    at = getPosition(event);
    Dots.insert({padId:id, at:at,color:color,erased: false, submitted: new Date().getTime()});
    drawCircle(at,color);
  }

  function drawCircle(at,col) {
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(at.x,at.y,4,0,Math.PI*2,true)
    LineStream.emit(id + ':tap', at, col);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#000000';
    console.log(at);
    console.log(col);
  }

  function onDrag(event) {  
    if(drawing) {
      var to = getPosition(event);
      drawLine(from, to, color);
      LineStream.emit(id + ':drag', nickname, to);
      Lines.insert({padId:id, from:from,to:to,color:color,erased:false, submitted : new Date().getTime()});
      from = to;
      skipCount = 0;
    }
  }

  function onDragStart(event) {
    drawing = true;
    from = getPosition(event);
    LineStream.emit(id + ':dragstart', nickname, from, color);
  }

  function onDragEnd() {  
    drawing = false;  
    LineStream.emit(id + ':dragend', nickname);
  }

  function getPosition(event) {
    return {x: parseInt(event.gesture.center.pageX - $('canvas')[0].offsetLeft + $('canvas').parent().scrollLeft()), y: parseInt(event.gesture.center.pageY)-$('canvas')[0].offsetTop + $('canvas').parent().scrollTop()};
  }
   this.close = function() {
    pad.off('dragstart', onDragStart);
    pad.off('dragend', onDragEnd);
    pad.off('drag', onDrag);
    pad.off('tap',tap);
  };
  
  

  // Stop iOS from doing the bounce thing with the screen
  document.ontouchmove = function(event){
    event.preventDefault();
  }

  //expose API
  this.drawLine = drawLine;
  this.drawCircle = drawCircle;
  this.wipe = wipe;
  this.setNickname = setNickname;
}



function getRandomColor() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
      color += letters[Math.round(Math.random() * 15)];
  }
  return color;
}