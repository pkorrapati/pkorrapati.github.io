var hand = {
    center: [],
    orientation: 0,
    lineColor: '#000',
    fillColor: '#f9ca24',    
    path: null,
    imgSize: [],
    scale: 0.7,
    showArrows: true,
    init: function(x,y,a){
        this.center = [x,y];
        this.orientation = a;

        var img = new Image();
        img.src = "./webicons/hand.svg";  

        this.path = new Path2D(handSVG);
        this.imgSize = [img.width, img.height];
    },
    setLocation: function(x,y){
        this.center = [x,y];
        if (this.showArrows){ 
            this.showArrows = false;
        }
    },    
    getLocation: function() {
        [cx,cy] = this.center;
        return new Point(cx,cy);
    },
    setAngle: function(a){
        this.orientation = (a +360) % 360;
    },
    draw: function(space){
        [cx,cy] = this.center;
        [w,h] = this.imgSize;

        var c = this.getLocation();
        var er1 = new Point(cx + 40, cy);         
        var er2 = new Point(cx + 80, cy); 
        var eb1 = new Point(cx, cy + 40);
        var eb2 = new Point(cx, cy + 80);
        var m = new DOMMatrix();
        var T = m.translateSelf(cx-w/2,cy-h/2).rotateSelf(-this.orientation).scaleSelf(this.scale).translateSelf(-14,-12);

        var p = new Path2D();
        p.addPath(this.path, T);

        canvasPainter.drawTarget(space, p, this.lineColor, 2, this.fillColor);
        if (this.showArrows){            
//            canvasPainter.drawArrow(space, er1, er2, 18, 10, "#01a3a4", 3, "#01a3a4");        
//            canvasPainter.drawArrow(space, eb1, eb2, 18, 10, "#01a3a4", 3, "#01a3a4");
            canvasPainter.drawArrow(space, er1, er2, 18, 10, "#eee", 3, "#eee");        
            canvasPainter.drawArrow(space, eb1, eb2, 18, 10, "#eee", 3, "#eee");
        }
    }
};

var manipulator = {
    origin: [0, 0],
    angles: [0, 0],
    lengths: [150, 120, 50],        
    linkWidths: [25, 25],
    isHolding: true,
    gripperLen: 80,
    workspace: [0, 0],
    fillColor: '#ee5253',
    ground: [],

    hold: function() {
        this.isHolding = true;
    }, 
    release: function() {
        this.isHolding = false;
    },
    init: function(x, y, a0, a1){
        this.release();
        this.origin = [x, y];
        this.angles = [a0, a1];
        var rMin = Math.abs(this.lengths[0] - (this.lengths[1] + this.lengths[2]));
        var rMax = 0;
        this.lengths.forEach(function(o){
            rMax+=o;
        });        
        this.workspace = [rMin, rMax];
        this.ground = [new Point(x, y), new Point(x-16, y+20), new Point(x+16, y+20)]
    },
    draw: function(space) {
        [x,y] = this.origin;

        var linkAngle = 0;
        var startPoint = new Point(x, y);

        canvasPainter.drawTriangle(space, this.ground[0], this.ground[1], this.ground[2], "#000", 5);

        for (var i = 0; i < 2; i++) {
            linkAngle = (linkAngle + this.angles[i]) % 360;
            var linkLength = this.lengths[i];

            canvasPainter.drawLink(space, startPoint, linkLength, linkAngle, this.linkWidths[i], this.fillColor);

            [x,y] = [x + (linkLength * Math.cos(helper.toRad(linkAngle))), 
                     y - (linkLength * Math.sin(helper.toRad(linkAngle)))];

            startPoint = new Point(x, y);
        }

        this.isHolding ? canvasPainter.drawGripperClosed(space, startPoint, linkAngle, 10) : canvasPainter.drawGripperOpen(space, startPoint, linkAngle, 10);

    },
    calculateInverse: function(target) {
        [x,y] = this.origin;
        var origin = new Point(x, y)
        var distance = target.getDistanceFrom(origin);
        this.release();

        if (distance >= this.workspace[1]) {
            this.angles[1] = 0;
        } else if (distance <= this.workspace[0]) {
            this.angles[1] = 180;
        } else {
            var cos1 = (Math.pow(target.x - x, 2) + Math.pow(target.y - y, 2) - Math.pow(this.lengths[0], 2) - Math.pow(this.lengths[1] + this.lengths[2], 2)) /
                (2 * this.lengths[0] * (this.lengths[1] + this.lengths[2]));
            this.angles[1] = -helper.toDeg(Math.atan2(-Math.sqrt(1 - Math.pow(cos1, 2)), cos1));
            this.hold();
        }

        this.angles[0] = origin.getAngleTo(target) - helper.toDeg(Math.atan2((this.lengths[1] + this.lengths[2]) * Math.sin(helper.toRad(this.angles[1])), this.lengths[0] + (this.lengths[1] + this.lengths[2]) * Math.cos(helper.toRad(this.angles[1]))));
    },
    getEndAngle: function(){
        var a=0;
        this.angles.forEach(function(o){
            a+=o;
        });
        return a;
    }

};

var robotSpace = {
    elementId: "shake",
    instance: null,
    spaceDim: [],
    spaceCenter: [],
    reshapeCanvas: function(){
        var canvas = document.getElementById(this.elementId);
        var parent = document.getElementById("shakeContainer");

        [w, h] = [parent.offsetWidth, parent.offsetHeight];

        canvas.width = w;
        canvas.offsetWidth = w;
        canvas.height = h;
        canvas.offsetHeight = h; 

        this.spaceDim = [w, h];
        this.spaceCenter = [w, h];
        this.instance = canvas.getContext("2d");        
    },
    reposition: function(){
        [x,y] = this.spaceCenter;
        [mX, mY] = [-100, 25];
        [mA1, mA2] = [120, 90];

        [hX, hY] = [80, 130];
        hA = 0;

        manipulator.init(x+mX,y-mY, mA1, mA2);
        hand.init(hX, hY, hA);
        //        hand.setImage();
    },
    repositionObject: function(hX, hY){
        [x,y] = this.spaceCenter;        
        hA = 0;

        hand.setLocation(hX, hY);
    },
    draw: function() {
        [w, h] = this.spaceDim;
        this.instance.clearRect(0, 0, w, h);

        manipulator.draw(this.instance);
        hand.draw(this.instance);
    }
};

var move = function(x=null,y=null){
    if (x && y) {
        robotSpace.repositionObject(x,y);
    }
    manipulator.calculateInverse(hand.getLocation());
    hand.setAngle(manipulator.getEndAngle() + 180);
    robotSpace.draw();            
};

robotSpace.reshapeCanvas();
robotSpace.reposition();

var touchCore = {
    handleEvent: function(o, e){
        var p = o.offset();
        [pX, pY] = [p.left, p.top];            
        move((e.pageX - pX), (e.pageY - pY));
    },
    registerEvents: function() {        
        $("#shake").on("mousedown", function(e) {
            if(e.originalEvent && e.originalEvent.buttons && e.originalEvent.buttons==1){
                e.preventDefault();
                touchCore.handleEvent($(this), e);
            }
        }).on("mousemove", function(e) {
            if(e.originalEvent && e.originalEvent.buttons && e.originalEvent.buttons==1){
                e.preventDefault();
                touchCore.handleEvent($(this), e);
            }            
        }).on("touchstart", function(e) {            
            touchCore.handleEvent($(this), e);
        }).on("touchmove", function(e) {
            touchCore.handleEvent($(this), e);
        });
    }
};

touchCore.registerEvents();
move();