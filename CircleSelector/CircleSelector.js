
var CircleSelector = function(rad, tht, len){
	var r = rad;
	var theta = -tht;
	var revL = 1.0 / len;

	var circleSelector = this;

	/**
	 * 本オブジェクトのあらはす円盤状において角度に応じたx, y, スケールを返す
	 * @param angle
	 */
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

	/**
	 *
	 * @param angle
	 * @param dx
	 */
	this.getDeltaAngle = function(stPtx, finPtx) {
		if(stPtx > r) {
			stPtx = r;
		} else if (stPtx < -r) {
			stPtx = -r;
		}

		if(finPtx > r) {
			finPtx = r;
		} else if (finPtx < -r) {
			finPtx = -r;
		}
		var y1 = Math.sqrt(r * r - stPtx * stPtx);
		var y2 = Math.sqrt(r * r - finPtx * finPtx);
		var phi1 = -Math.atan2(stPtx, y1);
		var phi2 = Math.atan2(finPtx, y2);
		return phi1 + phi2;
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

	var setPos = function(dom, angle, da){
		if(!da) {
			da = 0;
		}
		var coor = calcFunc.getCoor(angle + da);
		var w = size * coor.scale;
		var w2 = w / 2;
		dom.css('width', w + 'px');
		dom.css('height', w + 'px');
		dom.css('top', (coor.y - w / 2 + 200) + 'px');
		dom.css('left', (coor.x - w / 2 + 200) + 'px');
		dom.css('z-index', parseInt(coor.scale * 1000) + '');
		dom.data('angle', {angle: angle, dangle: da});
	};

	var changePos = function(stPtx, finPtx) {

		//全体を回転させる角度を計算
		var da = calcFunc.getDeltaAngle(stPtx, finPtx);

		children.each(function(i, val){
			var dom = $(val);
			setPos(dom, dom.data('angle').angle, da);
		});

	};

	var getX = function(e) {
		return e.pageX - size / 2 - 200;
	};

	var startEvent = function(e) {
		touchFlg = true;
		originX = getX(e);
	};

	var moveEvent = function(e) {
		if(touchFlg) {
			var x = getX(e);
			changePos(originX, x);
		}
	};

	var finEvent = function(e) {
		touchFlg = false;

		children.each(function(i, val){
			var dom = $(val);
			var before = dom.data('angle');
			dom.data('angle', {angle: before.angle + before.dangle, dangle: 0});
		});
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



