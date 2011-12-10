
var CircleSelector = function(rad, tht, len){
	var r = rad;
	var theta = -tht;
	var revL = 1.0 / len;

	this.getCoor = function(angle) {
		var sina = Math.sin(angle);

		var scale = 1.0 - 2.0 * sina * Math.cos(theta) * revL;
		if(scale < 0.0) {
			scale = 0;
		}
		return {
			x: r * Math.cos(angle),
			y: r * Math.sin(theta) * sina,
			scale: scale
		};
	};
};

(function($){
	var calcFunc;
	var size;

	var setPos = function(dom, angle){
		var coor = calcFunc.getCoor(angle);
		var w = size * coor.scale;
		var w2 = w / 2;
		dom.css('width', w + 'px');
		dom.css('height', w + 'px');
		dom.css('top', (coor.y - w / 2 + 200) + 'px');
		dom.css('left', (coor.x - w / 2 + 200) + 'px');
		dom.css('z-index', parseInt(coor.scale * 1000) + '');
	};

	$.fn.CircleSelector = function(r, theta, len, s) {
		calcFunc = new CircleSelector(r, theta, len);
		var children = this.children();
		var num = children.length;
		size = s;
		
		children.each(function(i, val){

			var angle = Math.PI * 2 * i / num;
			setPos($(val), angle);
			
		});
	};
}(jQuery));



