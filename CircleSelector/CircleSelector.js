var CircleSelector = function(rad, tht, len) {
    var r = rad;
    var r2 = rad * rad;
    var theta = -tht;
    var revL = 1.0 / len;

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
//        if (stPtx > r) {
//            stPtx = r;
//        } else if (stPtx < -r) {
//            stPtx = -r;
//        }
//
//        if (finPtx > r) {
//            finPtx = r;
//        } else if (finPtx < -r) {
//            finPtx = -r;
//        }
//        var y1 = Math.sqrt(r2 - stPtx * stPtx);
//        var y2 = Math.sqrt(r2 - finPtx * finPtx);
//        var phi1 = -Math.atan2(stPtx, y1);
//        var phi2 = Math.atan2(finPtx, y2);
        var dis = (stPtx - finPtx) / 2;
        var dis2 = dis * dis;
        var y1 = Math.sqrt(r2 - dis2);
        var y2 = Math.sqrt(r2 - dis2);
        var phi1 = -Math.atan2(dis, y1);
        var phi2 = Math.atan2(-dis, y2);
        
        return phi1 + phi2;
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

    //動的なパラメータ
    var originX;
    var touchFlg = false;

    var test = 0;

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
        dom.data('angle', {angle: angle, dangle: da});
    };

    var changePos = function(stPtx, finPtx) {

        //全体を回転させる角度を計算
        var da = calcFunc.getDeltaAngle(stPtx, finPtx);

        children.each(function(i, val) {
            var dom = $(val);
            setPos(dom, dom.data('angle').angle, da);
        });

    };

    /**
     * スマフォとPCでは座標の撮り方が異なるので。
     * @param e
     */
    var getX = function(e) {
        if (event.touches) {
            return event.touches[0].pageX - harfWidth;
        } else {
            return e.pageX - harfWidth;
        }
    };

    var startEvent = function(e) {
        e.preventDefault();
        touchFlg = true;
        originX = getX(e);
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
            dom.data('angle', {angle: before.angle + before.dangle, dangle: 0});
        });
    };

    var setEvent = function(parent, dom) {
        parent.on('touchstart', startEvent);
        parent.on('mousedown', startEvent);
        parent.on('touchmove', moveEvent);
        parent.on('mousemove', moveEvent);
        parent.on('touchend', finEvent);
        parent.on('mouseup', finEvent);
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



