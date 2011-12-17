var CircleSelector = function(rad, tht, len, dv) {
    var r = rad;
    var r2 = rad * rad;
    var theta = -tht;
    var revL = 1.0 / len;
	var decV = dv;

    var circleSelector = this;

    /**
     * 本オブジェクトのあらはす円盤状において角度に応じたx, y, scaleを返す
     * @param angle
     */
    this.getCoor = function(angle) {
        var sina = Math.sin(angle);

        var scale = 1.0 - 2.0 * sina * Math.cos(theta) * revL;
        if (scale < 0.0) {
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
        var dis = (stPtx - finPtx) / 2;
        var dis2 = dis * dis;
        var y = Math.sqrt(r2 - dis2);
		if(r2 <= dis2) {
			if(stPtx > finPtx){
				phi = -Math.PI;
			} else {
				phi = Math.PI;
			}
		} else {
        	var phi = -Math.atan2(dis, y) * 2.0;
		}
        //console.log(stPtx + ', ' + finPtx  + '/' + (stPtx - finPtx) + ' -- ' + phi + '->' + y + ' #' + r2 + ' ' + dis2 + ' ' + (new Date()).getTime());
        return phi;
    };

    this.getR = function() {
        return r;
    };
};

(function($) {

    //DOM
    var parent;
    var children;

    //計算用のクラス
    var calcFunc;

    //静的なパラメータ
    var size;
    var harfWidth;
    var harfHeight;
	var interval = 10;

    //動的なパラメータ
    var originX;
	var beforeDAngle = 0.0;
	var dAngle = 0.0;
	var decA = 0.0;
    var touchFlg = false;

	/**
	 * domをangle + daの角度の位置に配置する．
	 * 配置変更後，角度をdom.dataに保存するが，そこにはdaは含まれない．
	 * @param dom 配置するオブジェクト
	 * @param angle 今の角度（保存対象）
	 * @param da 変化する角度（非保存対象）
	 */
    var setPos = function(dom, angle, da) {
        if (!da) {
            da = 0;
        }
        var coor = calcFunc.getCoor(angle + da);
        var w = size * coor.scale;
        var w2 = w / 2;

        dom.css('width', w + 'px');
        dom.css('height', w + 'px');
        dom.css('top', (coor.y + harfHeight) + 'px');
        dom.css('left', (coor.x + harfWidth) + 'px');
        dom.css('z-index', parseInt(coor.scale * 1000) + '');
        dom.data('angle', angle);
    };

	/**
	 * stPtxからfinPtxまでドラッグされた時のオブジェクトの配置を変更する
	 * @param stPtx
	 * @param finPtx
	 */
    var changePos = function(stPtx, finPtx) {

        //全体を回転させる角度を計算
        var da = calcFunc.getDeltaAngle(stPtx, finPtx);
		beforeDAngle = dAngle;
		dAngle = da;
        children.each(function(i, val) {
            var dom = $(val);
            setPos(dom, dom.data('angle'), da);
        });

    };

    /**
     * スマフォとPCでは座標の撮り方が異なるので．
     * @param e
     */
    var getX = function(e) {
        if (event.touches) {
			var func = function(e){
				return event.touches[0].pageX - harfWidth;
			}
			getX = func;
            return func(e);
        } else {
			var func = function(e) {
				return e.pageX - harfWidth;
			}
			getX = func;
            return func(e);
        }
    };

    var startEvent = function(e) {
        e.preventDefault();
        touchFlg = true;
        originX = getX(e);
		beforeDAngle = 0.0;
		dAngle = 0.0;
		decA = 0.0;
    };

    var moveEvent = function(e) {
        e.preventDefault();
        if (touchFlg) {
            var x = getX(e);
            changePos(originX, x);
        }
    };

    var finEvent = function(e) {
        e.preventDefault();
        touchFlg = false;

        children.each(function(i, val) {
            var dom = $(val);
            var before = dom.data('angle');
            dom.data('angle', before + dAngle);
        });
		decA = dAngle - beforeDAngle;
    };

	var decVelocity = function() {
		if(decA !== 0) {
			if(Math.abs(decA) < 0.0001) {
				decA = 0;
			}
			children.each(function(i, val) {
				var dom = $(val);
				setPos(dom, (dom.data('angle') + decA));
			});
			decA *= 0.95;
		}
	};

    var setEvent = function(parent, dom) {
        parent.on('touchstart', startEvent);
        parent.on('mousedown', startEvent);
        parent.on('touchmove', moveEvent);
        parent.on('mousemove', moveEvent);
        parent.on('touchend', finEvent);
        parent.on('mouseup', finEvent);
		setInterval(function(){
			if(!touchFlg){
				decVelocity();
			}
		}, interval);
    };

    $.fn.CircleSelector = function(r, theta, len, s) {
        calcFunc = new CircleSelector(r, theta, len);

        var body = $('body').css('visibility', 'hidden');

        parent = this;
        parent.css('z-index', '100').css('position', 'relative');
        children = parent.children();
        var num = children.length;
        size = s;

        //サイズを求める
        harfWidth = r;
        var topObj = calcFunc.getCoor(-Math.PI / 2);

        harfHeight = topObj.y;

        this.css('width', (harfWidth * 2 + size) + 'px');
        this.css('height', (harfHeight * 2 + size * topObj.scale) + 'px');


        this.blur(function(e) {
            touchFlg = false;
        });

        children.each(function(i, val) {
            var angle = Math.PI * 2 * i / num;
            var dom = $(val).css('position', 'absolute');
            dom.children().css('width', '100%').css('height', '100%');
            setPos(dom, angle);
        });
        setEvent(parent, children);
        body.css('visibility', 'visible');

    };
}(jQuery));



