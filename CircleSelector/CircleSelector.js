/**
 * DOMを円形に並べてぐりぐり回せるjQueryプラグイン（α版）．
 * スマフォ用．ライブアライブの主人公選択画面風です．各DOMにイベント付加することもできます．
 *	Copyright	mtkn (@mtknnktm)
 *	License		MIT / http://bit.ly/mit-license
 *	Version		0.1.1
 */

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
    var size = 32;
    var harfWidth;
    var harfHeight;
	var interval = 10;
	var decRate = 0.9;

	var clickCallBack;

    //動的なパラメータ
    var originX;
	var beforeDAngle = 0.0;
	var dAngle = 0.0;
	var decA = 0.0;
    var touchFlg = false;
	var moveFlg = false;

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
		moveFlg = false;
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
			if(Math.abs(dAngle) > 0.01) {
				moveFlg = true;
			}
        }
    };

    var finEvent = function(e) {
        e.preventDefault();
        touchFlg = false;

		setTimeout(function(){
			if(!moveFlg && !$(e.target).hasClass('__CircleSelector__')) {
				clickCallBack.apply($(e.target), [e]);
				moveFlg = false;
			}
		}, 0);

        children.each(function(i, val) {
            var dom = $(val);
            var before = dom.data('angle');
            dom.data('angle', before + dAngle);
        });
		decA = dAngle - beforeDAngle;
    };

	var decVelocity = function() {
		if(decA !== 0)
		{
			if(Math.abs(decA) < 0.0001) {
				decA = 0;
			}
			children.each(function(i, val) {
				var dom = $(val);
				setPos(dom, (dom.data('angle') + decA));
			});
			decA *= decRate;
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

	/**
	 * 生成関数
	 * @param r 円の半径
	 * @param theta 円の傾きの角度（ラジアン）．0ならば水平で，PI/2ならば垂直．
	 * @param len パースを引いた時の手前のオブジェクトから消失点までの距離．値が大きいと前後のオブジェクトの大きさが違い，小さいと前後の大きさの違いがなくなる．
	 * @param s オブジェクトのサイズ．真ん中にあるもの（角度 = 0, PI）がこのサイズになり，位置とlenによりサイズが変わる．
	 * @param dr オブジェクトを回した時の減速率．0.0-1.0
	 * @param callBack オブジェクトをクリックした時のコールバックイベント．thisでクリックされたオブジェクトのjQueryオブジェクトが取得可能．
	 */
    $.fn.CircleSelector = function(r, theta, len, s, dr, callBack) {
        calcFunc = new CircleSelector(r, theta, len);

        var body = $('body').css('visibility', 'hidden');

        parent = this;
        parent.addClass('__CircleSelector__').css('position', 'relative');
        children = parent.children();
        var num = children.length;
        size = s;
		clickCallBack = callBack;

        //サイズを求める
        harfWidth = r;
        var topObj = calcFunc.getCoor(-Math.PI / 2);

        harfHeight = topObj.y;

		decRate = dr;

        this.css('width', (harfWidth * 2 + size) + 'px');
        this.css('height', (harfHeight * 2 + size * topObj.scale) + 'px');

        children.each(function(i, val) {
            var angle = Math.PI * 2 * i / num;
            var dom = $(val).css('position', 'absolute');
            dom.children().css('width', '100%').css('height', '100%');
            setPos(dom, angle);
        });
        setEvent(parent, children);
        body.css('visibility', 'visible');

    };
	$.fn.getCircleSelectorStatus = function() {
		return 	{
			move: moveFlg
		};
	};
}(jQuery));



