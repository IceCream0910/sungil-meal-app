var box = $("#main");

var allowMouse = true;
var minVelocity = 600;
var minDistance = 10;

var startTime, lastTime, vx, vy;

Draggable.create($("<div>"), {
  trigger: box,
  cursor: "pointer",
  onPress: function(event) {    
    if (!allowMouse && (event.pointerType == "mouse" || event.type == "mousedown")) {
      this.endDrag(event);
    }
  },
  onDragStart: function() {    
    startTime = +Date.now() / 1000;
    lastTime = vx = vy = 0;
  },
  onDrag: function() {
    
    var time = +Date.now() / 1000;
    var deltaTime = time - lastTime;
        
    vx = this.deltaX / deltaTime;
    vy = this.deltaY / deltaTime;
        
    lastTime = time;
  },
  onDragEnd: function() {
    
    var dx = this.x - this.startX;
    var dy = this.y - this.startY;
    var x  = Math.abs(dx);
    var y  = Math.abs(dy);

    
    
    if (x > y && x > minDistance && Math.abs(vx) > minVelocity) {
      dx > 0 ? backDate() : forwardDate();
    } else if (y > x && y > minDistance && Math.abs(vy) > minVelocity) {
      //box.text(dy > 0 ? "swipe down" : "swipe up");
    } else {
      //box.text("");
    }
  }
});



 