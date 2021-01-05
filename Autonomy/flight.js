/*
* author: 赵雪丹
* description: Flight-飞行浏览
* day: 2017-11-22
*/
define( [ ], function( ){
function Flight(globe){
	this._globe = globe;
	this._viewer = globe._viewer;
	this._globeId = globe._globeId;
}

/*
 * 根据点集合飞行浏览
 * @author zhaoxd
 * @method flyByPoints
 * @for Flight
 * @param {Object} pointList-点集合
 * @return {null} null
 */
Flight.prototype.flyByPoints = function(pointList){
	var self = this;
	var list = [];
	for(var i = 1; i < pointList.length; i++){
		var spoint = pointList[i-1];
		var epoint = pointList[i];
		var inlist = self._getInList(spoint,epoint);
		for(var k = 0; k < inlist.length; k++){
			var lonlat = inlist[k];
			list[list.length] = Cesium.Cartesian3.fromDegrees(lonlat.lon, lonlat.lat, lonlat.alt);
			list[list.length - 1].angle = lonlat.angle;
		}
	}
	self._flyEntity = self._viewer.entities.add({
	    position : new Cesium.CallbackProperty(function(){ return self._flyPoint; }, false),
	    orientation : new Cesium.CallbackProperty(function(){ return self._flyOrientation; }, false),
	    model : {
	        uri : self._globe.urlConfig.CTS + 'Autonomy/models/CesiumAir/Cesium_Air.gltf',
	        minimumPixelSize : 64
	    }
	});

	self._viewer.trackedEntity = self._flyEntity;
	self._flyEnd = false;
	self._flyPause = false;
	self._getFlyPointByI(list,0);
}

/*
 * 根据点集合飞行
 * @author zhaoxd
 * @method _getFlyPointByI
 * @for Flight
 * @param {list} pointList：点集合
 * @param {int} i：点索引
 * @return {null} null
 */
Flight.prototype._getFlyPointByI = function(pointList,i){
	var self = this;
	if(self._flyEnd){
		return;
	}
	if(i == pointList.length){
		self.flyToEnd();
	}else{
		self._flyPoint = pointList[i];
		var cartographic = Cesium.Cartographic.fromCartesian(pointList[i]);
		var longitude = Cesium.Math.toDegrees(cartographic.longitude);
		var latitude = Cesium.Math.toDegrees(cartographic.latitude);
		var position = Cesium.Cartesian3.fromDegrees(longitude, latitude);
		self._flyOrientation = Cesium.Transforms.headingPitchRollQuaternion(position, new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(pointList[i].angle-90), 0, 0));
		setTimeout(function(){
			if(self._flyPause){
				self._getFlyPointByI(pointList,i);
			}else{
				self._getFlyPointByI(pointList,i+1);
			}
		},30);
	}
}

/*
 * 插值
 * @author zhaoxd
 * @method _getInList
 * @for Flight
 * @param {point} spoint：开始点
 * @param {point} epoint：结束点
 * @return {list} rayPositions：插值点集合
 */
Flight.prototype._getInList = function(spoint,epoint){
	var self = this;
	var angle = CommonFunc.getAngle(spoint.lon,spoint.lat,epoint.lon,epoint.lat);
	var dist = CommonFunc.getDistance(spoint.lon,spoint.lat,epoint.lon,epoint.lat);
	var p0 = Cesium.Cartesian3.fromDegrees(spoint.lon,spoint.lat,spoint.alt);
	var p1 = Cesium.Cartesian3.fromDegrees(epoint.lon,epoint.lat,epoint.alt);
	var direction = new Cesium.Cartesian3();
	Cesium.Cartesian3.subtract(p1, p0, direction);
    Cesium.Cartesian3.normalize(direction, direction);
    var ray = new Cesium.Ray(p0, direction);
    var rayPositions = [];
    var i = 0;
    var t = 0;
	do {
	    t = i * 20;
	    var pt = Cesium.Ray.getPoint(ray, t);
	    if(t > dist){
			pt = Cesium.Ray.getPoint(ray, dist);
		}
		var cartographic = Cesium.Cartographic.fromCartesian(pt);
		var longitude = Cesium.Math.toDegrees(cartographic.longitude);
		var latitude = Cesium.Math.toDegrees(cartographic.latitude);
		var height = cartographic.height;
		rayPositions.push({lon:longitude,lat:latitude,alt:height,angle:angle});
	    i++;
	} while (t <= dist);
	return rayPositions;
}

/*
 * 结束飞行浏览
 * @author zhaoxd
 * @method flyToEnd
 * @for Flight
 * @param {null} null
 * @return {null} null
 */
Flight.prototype.flyToEnd = function(){
	var self = this;
	self._flyEnd = true;
	self._viewer.trackedEntity = undefined;
	self._viewer.entities.remove(self._flyEntity);
}

/*
 * 暂停飞行浏览
 * @author zhaoxd
 * @method flyToPause
 * @for Flight
 * @param {null} null
 * @return {null} null
 */
Flight.prototype.flyToPause = function(){
	var self = this;
	self._flyPause = true;
}

/*
 * 恢复飞行浏览
 * @author zhaoxd
 * @method flyToRecovery
 * @for Flight
 * @param {null} null
 * @return {null} null
 */
Flight.prototype.flyToRecovery = function(){
	var self = this;
	self._flyPause = false;
}

return Flight;
})