var canvasPainter = {
    drawLine: function(context, startX, startY, endX, endY, color, lineThickness, dashPattern=[]) {
        context.beginPath();
        context.setLineDash(dashPattern);
        context.moveTo(startX + 0.5, startY + 0.5);
        context.lineTo(endX + 0.5, endY + 0.5);
        context.strokeStyle = color;
        context.lineWidth = lineThickness;        
        context.stroke();
        context.setLineDash([]);
    },
    drawArc: function(context, startX, startY, radius, startAngle, endAngle, lineColor, lineThickness) {
        context.beginPath();
        context.arc(startX + 0.5, startY + 0.5, radius, Math.PI * (2 - (startAngle / 180)), Math.PI * (2 - (endAngle / 180)), true);
        context.strokeStyle = lineColor;
        context.lineWidth = lineThickness;
        context.stroke();
    },
    drawSolidArc: function(context, startX, startY, radius, startAngle, endAngle, lineColor, lineThickness, fillColor) {
        context.beginPath();
        context.arc(startX + 0.5, startY + 0.5, radius, Math.PI * (2 - (startAngle / 180)), Math.PI * (2 - (endAngle / 180)), true);
        context.lineWidth = lineThickness;
        context.fillStyle = fillColor;
        context.fill();
        context.strokeStyle = lineColor;
        context.stroke();
    },
    drawSolidArcSection: function(context, startX, startY, radius, startAngle, endAngle, lineColor, lineThickness, fillColor) {
        context.beginPath();
        context.arc(startX + 0.5, startY + 0.5, radius, Math.PI * startAngle / 180, Math.PI * endAngle / 180);
        context.lineTo(startX + 0.5, startY + 0.5);
        context.lineWidth = lineThickness;
        context.globalAlpha = 0.7;
        context.fillStyle = fillColor;
        context.fill();
        context.strokeStyle = lineColor;
        context.stroke();
        context.globalAlpha = 1;
    },
    drawTriangle: function(context, firstPoint, secondPoint, thirdPoint, lineColor="#000", lineThickness=3, fillColor="#fff", opacity=1) {

        context.beginPath();
        context.moveTo(firstPoint.x + 0.5, firstPoint.y + 0.5);
        context.lineTo(secondPoint.x + 0.5, secondPoint.y + 0.5);
        context.lineTo(thirdPoint.x + 0.5, thirdPoint.y + 0.5);
        context.closePath();
        context.strokeStyle = lineColor;
        context.lineWidth = lineThickness;
        context.stroke();
        if (fillColor) {
            context.globalAlpha = opacity ? opacity : 1;
            context.fillStyle = fillColor;
            context.fill();
            context.globalAlpha = opacity;
        }

    },
    drawBar: function(context, startX, startY, radius, height, lineColor, lineThickness, fillColor) {
        context.beginPath();
        context.arc(startX + 0.5, startY + (height / 2) + 0.5, radius, 0, Math.PI);
        context.lineTo(startX - radius + 0.5, startY - height / 2 + 0.5);
        context.arc(startX + 0.5, startY - (height / 2) + 0.5, radius, Math.PI, 0);
        context.lineTo(startX + radius + 0.5, startY + height / 2 + 0.5);
        context.lineWidth = lineThickness;
        context.globalAlpha = 0.7;
        if (fillColor) {
            context.fillStyle = fillColor;
            context.fill();
        }
        context.strokeStyle = lineColor;
        context.stroke();
        context.globalAlpha = 1;
    },
    drawSolidBar: function(context, centerX, centerY, radius, lineColor, lineThickness, fillColor) {
        this.drawBar(context, centerX, centerY, radius, radius * 6, lineColor, lineThickness, fillColor);
    },
    drawCircle: function(context, centerX, centerY, radius, lineColor, lineThickness) {
        this.drawArc(context, centerX, centerY, radius, 0, 360, lineColor, lineThickness);
    },
    drawSolidCircle: function(context, centerX, centerY, radius, lineColor, lineThickness, fillColor='#fff') {
        if (fillColor)
            this.drawSolidArc(context, centerX, centerY, radius, 0, 360, lineColor, lineThickness, fillColor);
        else
            this.drawArc(context, centerX, centerY, radius, 0, 360, lineColor, lineThickness);
    },
    drawArrow: function(context, center, topPoint, arrowHeadLength, arrowHeadWidth, lineColor="#000", lineThickness, fillColor="#000", opacity=1) {
        var angle = Math.atan2(topPoint.y - center.y, topPoint.x - center.x);

        var leftEndPoint = new Point(topPoint.x - (arrowHeadLength * Math.cos(angle)) - (arrowHeadWidth * Math.sin(angle) / 2),
                                     topPoint.y - (arrowHeadLength * Math.sin(angle)) + (arrowHeadWidth * Math.cos(angle) / 2));

        var rightEndPoint = new Point(topPoint.x - (arrowHeadLength * Math.cos(angle)) + (arrowHeadWidth * Math.sin(angle) / 2),
                                      topPoint.y - (arrowHeadLength * Math.sin(angle)) - (arrowHeadWidth * Math.cos(angle) / 2));

        this.drawLine(context, center.x, center.y, topPoint.x, topPoint.y, lineColor, lineThickness, [4,4]);
        this.drawTriangle(context, topPoint, leftEndPoint, rightEndPoint, lineColor, lineThickness, fillColor, opacity);
    },
    drawRectangle: function(context, center, width, height, angle, color, lineThickness, fillColor="#fff") {
        context.beginPath();
        context.moveTo(center.x - (width * Math.sin(angle) / 2) + 0.5, center.y + (width * Math.cos(angle) / 2) + 0.5);
        context.lineTo(center.x + (width * Math.sin(angle) / 2) + 0.5, center.y - (width * Math.cos(angle) / 2) + 0.5);
        context.lineTo(center.x + (width * Math.sin(angle) / 2) + (height * Math.cos(angle)) + 0.5, center.y + (height * Math.sin(angle)) - (width * Math.cos(angle) / 2) + 0.5);
        context.lineTo(center.x - (width * Math.sin(angle) / 2) + (height * Math.cos(angle)) + 0.5, center.y + (height * Math.sin(angle)) + (width * Math.cos(angle) / 2) + 0.5);
        context.closePath();
        context.strokeStyle = color;
        context.lineWidth = lineThickness;
        context.fillStyle = fillColor;
        context.fill();
        context.stroke();
    },
    drawLink: function(context, start, length, angle, linkWidth, fillColor = '#fff') {
        this.drawRectangle(context, start, linkWidth, length, -helper.toRad(angle), '#000', 1, fillColor);
        this.drawSolidArc(context, start.x, start.y, linkWidth / 2, angle + 87, angle - 87, '#000', 1, fillColor);
        this.drawSolidCircle(context, start.x, start.y, linkWidth / 5, '#000', 2);
        var finPoint = helper.getHomogenousTransform(angle, start).dot([length, 0, 1]).toPoint();
        this.drawSolidArc(context, finPoint.x, finPoint.y, linkWidth / 2, angle - 93, angle + 93, '#000', 1, fillColor);
        this.drawSolidCircle(context, finPoint.x, finPoint.y, linkWidth / 5, '#000', 2);
    },
    drawTarget: function(context, content, color='#000', lineThickness, fillColor='#fff'){
        
        context.strokeStyle = color;
        context.lineWidth = lineThickness;
        context.fillStyle = fillColor;
        context.fill(content);
        context.stroke(content);
    },
    drawClosedShape: function(context, origin, orientation, vertices, color, lineThickness, fillColor, scale=1) {

        var H1 = [
            [Math.cos(orientation), -Math.sin(orientation), origin.x],
            [Math.sin(orientation), Math.cos(orientation), origin.y],
            [0, 0, 1]
        ];
        
        var H2 = [
            [1,0,0],
            [0,1,0],
            [0,0,scale]
        ]

        var initalPoint = H1.dot(H2).dot(vertices[0]).toPoint();

        context.beginPath();
        context.moveTo(initalPoint.x + 0.5, initalPoint.y + 0.5);
        vertices.forEach(function(vertex, index) {
            if (index != 0) {
                var vert = H1.dot(H2).dot(vertex).toPoint();
                context.lineTo(vert.x + 0.5, vert.y + 0.5);
            }
        });
        context.closePath();
        context.strokeStyle = color;
        context.lineWidth = lineThickness;
        context.fillStyle = fillColor;
        context.fill();
        context.stroke();
    },
    drawGripperClosed: function(context, origin, orientation, radius) {
        var points = [
            [-15, 10, 1],
            [-39, 39, 1],
            [-39, 63, 1],
            [-25, 80, 1],
            [-25, 86, 1],
            [-45, 63, 1],
            [-45, 34, 1],
            [-25, 2, 1],
            [25, 2, 1],
            [45, 34, 1],
            [45, 63, 1],
            [25, 86, 1],
            [25, 80, 1],
            [39, 63, 1],
            [39, 39, 1],
            [15, 10, 1]
        ];

        var rect = [
            [-25, 15, 1],
            [25, 15, 1],
            [25, -15, 1],
            [-25, -15, 1]
        ];

        this.drawClosedShape(context, origin, -helper.toRad(orientation + 90), points, '#000', 3, '#bdc3c7', 1.6);
        this.drawClosedShape(context, origin, -helper.toRad(orientation + 90), rect, '#000', 3, '#bdc3c7', 1.6);
        this.drawSolidCircle(context, origin.x, origin.y, radius, '#000', 4, '#fff');
    },
    drawGripperOpen: function(context, origin, orientation, radius) {
        var points = [
            [-16.5, 7, 1],
            [-45, 32, 1],
            [-49, 55, 1],
            [-39, 74.5, 1],
            [-40, 80, 1],
            [-55, 54, 1],
            [-50, 26, 1],
            [-25, -2.5, 1],
            [25, -2.5, 1],
            [50, 26, 1],
            [55, 54, 1],
            [40, 80, 1],
            [39, 74.5, 1],
            [49, 55, 1],
            [45, 32., 1],
            [16.5, 7, 1]
        ];

        var rect = [
            [-25, 15, 1],
            [25, 15, 1],
            [25, -15, 1],
            [-25, -15, 1]
        ];

        this.drawClosedShape(context, origin, -helper.toRad(orientation + 90), points, '#000', 3, '#bdc3c7', 1.6);
        this.drawClosedShape(context, origin, -helper.toRad(orientation + 90), rect, '#000', 3, '#bdc3c7', 1.6);
        this.drawSolidCircle(context, origin.x, origin.y, radius, '#000', 4, '#fff');
    },

}