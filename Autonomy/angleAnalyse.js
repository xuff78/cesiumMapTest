/*
* author: 赵雪丹
* description: AngleAnalyse-角度分析
* day: 2017-11-09
*/
define( [], function(){
function AngleAnalyse(globe){
	var self = this;
	this._globe = globe;
	this._viewer = globe._viewer;
	this._globeId = globe._globeId;
	//两点角度
	this._angle_manager = {draw:false, selectSpoint:false, spoint:null, epoint:null, subset:[]};
	
	//私有注册事件
	this._handler = new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas);
	//LEFT_CLICK 左键点击事件
	this._handler.setInputAction(function (e) {
		var lonlat = self._globe.getLonLatByPosition(e.position);
		if(self._angle_manager.draw){
			if(self._angle_manager.selectSpoint){
				self._angle_manager.spoint = lonlat;
				var m_pos = self._viewer.entities.add({
		            position : Cesium.Cartesian3.fromDegrees(lonlat.lon, lonlat.lat, lonlat.alt),
		            point : {
		                color : Cesium.Color.RED,
		                pixelSize : 10,
	        			disableDepthTestDistance : Number.POSITIVE_INFINITY
		            }
		        });
		        self._angle_manager.subset[self._angle_manager.subset.length] = m_pos;
			}else{
				self._angle_manager.epoint = lonlat;
				self._drawAngleByPoints();
			}
    	}
	}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

/*
 * 选取原点
 * @author zhaoxd
 * @method selectSpoint
 * @for AngleAnalyse
 * @param {null} null
 * @return {null} null
 */
AngleAnalyse.prototype.selectSpoint = function(){
	var self = this;
	self._angle_manager.draw = true;
	self._angle_manager.selectSpoint = true;
	self._angle_manager.spoint = null;
	self._angle_manager.epoint = null;
}

/*
 * 选取终点
 * @author zhaoxd
 * @method selectEpoint
 * @for AngleAnalyse
 * @param {null} null
 * @return {null} null
 */
AngleAnalyse.prototype.selectEpoint = function(){
	var self = this;
	if(self._angle_manager.draw && self._angle_manager.spoint){
		self._angle_manager.selectSpoint = false;
		self._angle_manager.epoint = null;
	}else{
		alert("请先选取原点");
	}
}

/*
 * 清除
 * @author zhaoxd
 * @method clear
 * @for AngleAnalyse
 * @param {null} null
 * @return {null} null
 */
AngleAnalyse.prototype.clear = function(){
	var self = this;
	self._angle_manager.draw = false;
	self._angle_manager.selectSpoint = false;
	for(var i = self._angle_manager.subset.length - 1; i >= 0; i--){
		self._viewer.entities.remove(self._angle_manager.subset[i]);
		self._angle_manager.subset.pop();
	}
}

/*
 * 绘制
 * @author zhaoxd
 * @method _drawAngleByPoints
 * @for AngleAnalyse
 * @param {null} null
 * @return {null} null
 */
AngleAnalyse.prototype._drawAngleByPoints = function(){
	var self = this;
	var spoint = self._angle_manager.spoint;
	var epoint = self._angle_manager.epoint;
	var angle = CommonFunc.getAngle(spoint.lon,spoint.lat,epoint.lon,epoint.lat);
//	var dist = CommonFunc.getDistance(spoint.lon,spoint.lat,epoint.lon,epoint.lat);
	var npoint = CommonFunc.destinationVincenty(spoint.lon,spoint.lat,spoint.alt,0,0,3000);
	var horizontalOrigin = Cesium.HorizontalOrigin.LEFT;
	var pixelOffset = new Cesium.Cartesian2(10, 0);
	var m_npos = self._viewer.entities.add({
        position : Cesium.Cartesian3.fromDegrees(npoint.lon, npoint.lat, npoint.alt),
        point : {
            color : Cesium.Color.BLUE,
            pixelSize : 10,
	        disableDepthTestDistance : Number.POSITIVE_INFINITY
        },
	    label:{
	    	text: "北",
	    	horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
	    	pixelOffset: pixelOffset,
	    	horizontalOrigin: horizontalOrigin,
	    	verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
	    	font:"15pt Lucida Console",
	        disableDepthTestDistance : Number.POSITIVE_INFINITY
	    }
    });
    self._angle_manager.subset[self._angle_manager.subset.length] = m_npos;
	var pointList = [npoint,spoint,epoint];
	var m_array = new Array();
    for(var i = 0; i < pointList.length; i++){
    	m_array.push(pointList[i].lon);
    	m_array.push(pointList[i].lat);
		m_array.push(pointList[i].alt);
    }
	var positions = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
	var m_polyline = self._viewer.entities.add({
		polyline: {
		    positions: positions,
		    width: 5,
		    material: Cesium.Color.GREEN.withAlpha(1),
	        disableDepthTestDistance : Number.POSITIVE_INFINITY
		}
	});
	self._angle_manager.subset[self._angle_manager.subset.length] = m_polyline;
	if(angle > 180){
		angle = angle - 360;
	}
	if(angle < 0){
		horizontalOrigin = Cesium.HorizontalOrigin.RIGHT;
		pixelOffset = new Cesium.Cartesian2(-10, 0);
	}
	var m_pos = self._viewer.entities.add({
        position : Cesium.Cartesian3.fromDegrees(epoint.lon, epoint.lat, epoint.alt),
        point : {
            color : Cesium.Color.BLUE,
            pixelSize : 10,
	        disableDepthTestDistance : Number.POSITIVE_INFINITY
        },
	    label:{
	    	text: angle.toFixed(2) + "°",
	    	pixelOffset: pixelOffset,
	    	horizontalOrigin: horizontalOrigin,
	    	verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
	    	font:"15pt Lucida Console",
	        disableDepthTestDistance : Number.POSITIVE_INFINITY
	    }
    });
    self._angle_manager.subset[self._angle_manager.subset.length] = m_pos;
}

return AngleAnalyse;
})