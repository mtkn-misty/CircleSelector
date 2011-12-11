
var CircleSelector = function(rad, tht, len){
	var r = rad;
	var theta = -tht;
	var revL = 1.0 / len;

	var circleSelector = this;

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

	this.changeCoor = function(angle, dx) {
		var da = -Math.atan2(dx, Math.sqrt(r * r - dx * dx));
		console.log((da * 180 / Math.PI))
		return circleSelector.getCoor(angle + da);
	};
};

(function($){
	var parent;
	var children;

	var calcFunc;
	var size;
	var originX;
	var touchFlg = false;

	var test = 0;

	var setPos = function(dom, angle){
		var coor = calcFunc.getCoor(angle);
		var w = size * coor.scale;
		var w2 = w / 2;
		dom.css('width', w + 'px');
		dom.css('height', w + 'px');
		dom.css('top', (coor.y - w / 2 + 200) + 'px');
		dom.css('left', (coor.x - w / 2 + 200) + 'px');
		dom.css('z-index', parseInt(coor.scale * 1000) + '');
		dom.data('angle', angle);
	};

	var changePos = function(dom, dx) {
		console.log(test + ', ' + dx);
		var angle = dom.data('angle');
		var coor = calcFunc.changeCoor(angle, dx);
		var w = size * coor.scale;
		var w2 = w / 2;
		dom.css('width', w + 'px');
		dom.css('height', w + 'px');
		dom.css('top', (coor.y - w / 2 + 200) + 'px');
		dom.css('left', (coor.x - w / 2 + 200) + 'px');
		dom.css('z-index', parseInt(coor.scale * 1000) + '');
		dom.data('angle', angle);
	};

	var getX = function(e) {
		return e.pageX - size / 2;
	};

	var startEvent = function(e) {
		touchFlg = true;
		//beforeX = $(this).css('left');//getX(e);
	};

	var moveEvent = function(e) {
		if(touchFlg) {
			var x = getX(e);
			//$(this).css('left', x + 'px');
			var dx = originX - x;

			children.each(function(i, val){
				var dom = $(val);
				changePos(dom, dx);
			});

			beforeX = x;
		}
	};

	var finEvent = function(e) {
		touchFlg = false;
	};

	var setEvent = function(parent, dom){
//		parent.on('touchstart', 'div', startEvent);
//		parent.on('mousedown', 'div', startEvent);
//		parent.on('touchmove', 'div',moveEvent);
//		parent.on('mousemove', 'div',moveEvent);
//		parent.on('touchend', 'div',finEvent);
//		parent.on('mouseup', 'div',finEvent);
		parent.bind('touchstart', startEvent);
		parent.bind('mousedown', startEvent);
		parent.bind('touchmove', moveEvent);
		parent.bind('mousemove', moveEvent);
		parent.bind('touchend', finEvent);
		parent.bind('mouseup', finEvent);
	};

	$.fn.CircleSelector = function(r, theta, len, s) {
		calcFunc = new CircleSelector(r, theta, len);

		parent = this;
		children = parent.children();
		var num = children.length;
		size = s;

		this.blur(function(e){
			touchFlg = false;
		});

		children.each(function(i, val){

			var angle = Math.PI * 2 * i / num;
			setPos($(val), angle);
		});
		setEvent(parent, children);
	};
}(jQuery));



