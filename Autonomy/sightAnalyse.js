/*
* author: 赵雪丹
* description: SightAnalyse-视域分析
* day: 2017-9-28
*/
define( [], function(){
function SightAnalyse(globe){
	var self = this;
	this._globe = globe;
	this._viewer = globe._viewer;
	this._globeId = globe._globeId;
	this._pointToPoint = false;
	this._pointToPolygon = false;
	this._sPoint = null;
	this._ePoint = null;
	this._objList = [];
	this._polyline = null;
	this._vertexList = [];
	this._towerHeight = 1;
	this._treeHeight = 0;
	this._targetHeight = 0;
	this._showMenu = true;
	
	//私有注册事件
	this._handler = new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas);
	//LEFT_CLICK 左键点击事件
	this._handler.setInputAction(function (e) {
		var lonlat = self._globe.getLonLatByPosition(e.position);
//		console.log("LEFT_CLICK: " + lonlat.lon + "，" + lonlat.lat);
		if(lonlat){
			if(self._pointToPoint){
				if(self._polyline == null){
					self._vertexList = [];
					self._polyline = self._viewer.entities.add({
						polyline: {
						    positions: new Cesium.CallbackProperty(function(){ return self._vertexList; }, false),
						    material : new Cesium.PolylineDashMaterialProperty({
					            color: Cesium.Color.CYAN
					        })
						}
					});
				}
				if(self._sPoint == null){
					self._globe.getAltByLonlat([{lon:lonlat.lon,lat:lonlat.lat}],function(updatedPositions){
						self._sPoint = updatedPositions[0];
						self._sPoint.alt = self._sPoint.alt + self._towerHeight;
						self._addMark(self._sPoint,"起");
					});
				} else{
					self._globe.getAltByLonlat([{lon:lonlat.lon,lat:lonlat.lat}],function(updatedPositions){
						self._ePoint = updatedPositions[0];
						self._ePoint.alt = self._ePoint.alt + self._targetHeight;
						self._addMark(self._ePoint,"止");
						self._actionCompute();
					});
				}
			}
		}
	}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
	//RIGHT_CLICK 右键点击事件
	this._handler.setInputAction(function (e) {
		var lonlat = self._globe.getLonLatByPosition(e.position);
//		console.log("RIGHT_CLICK: " + lonlat.lon + "，" + lonlat.lat);
		if(lonlat){
			if(self._pointToPoint){
				if(self._sPoint != null){
					self._globe.getAltByLonlat([{lon:lonlat.lon,lat:lonlat.lat}],function(updatedPositions){
						self._pointToPoint = false;
						self._ePoint = updatedPositions[0];
						self._ePoint.alt = self._ePoint.alt + self._targetHeight;
						self._addMark(self._ePoint,"止");
						self._actionCompute();
						self._vertexList = [];
					});
				}
				self._globe.globeMenu.setType(self._showMenu);
			}
		}
	}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
	//MOUSE_MOVE 鼠标移动事件
	this._handler.setInputAction(function (movement) {
		var lonlat = self._globe.getLonLatByPosition(movement.endPosition);
//		console.log("MOUSE_MOVE: " + lonlat.lon + "，" + lonlat.lat);
		if(lonlat){
			if(self._pointToPoint){
				if(self._sPoint != null){
					self._globe.getAltByLonlat([{lon:lonlat.lon,lat:lonlat.lat}],function(updatedPositions){
						var m_array = new Array();
					    m_array.push(self._sPoint.lon);
				    	m_array.push(self._sPoint.lat);
						m_array.push(self._sPoint.alt);
					    m_array.push(updatedPositions[0].lon);
				    	m_array.push(updatedPositions[0].lat);
						m_array.push(updatedPositions[0].alt + self._targetHeight);
						self._vertexList = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
					});
				}
			}
		}
	}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}

/*
 * 根据两点进行视线分析
 * @author zhaoxd
 * @method intervisibilityByPoints
 * @for SightAnalyse
 * @param {Object} options：参数信息
 * @return {null} null
 */
SightAnalyse.prototype.intervisibilityByPoints = function(options){
	self._towerHeight = options.towerHeight ? options.towerHeight : 1;
	self._treeHeight = options.treeHeight ? options.treeHeight : 0;
	self._targetHeight = options.targetHeight ? options.targetHeight : 0;
	self._sPoint = options.sPoint ? options.sPoint : null;
	self._ePoint = options.ePoint ? options.ePoint : null;
	if(self._sPoint && self._ePoint){
		self._sPoint.alt = self._sPoint.alt + self._towerHeight;
		self._addMark(self._sPoint,"起");
		self._ePoint.alt = self._ePoint.alt + self._targetHeight;
		self._addMark(self._ePoint,"止");
		self._actionCompute();
	}else{
		alert("起止点信息不能为空！");
	}
}

/*
 * 开始视线分析
 * @author zhaoxd
 * @method actionIntervisibility
 * @for SightAnalyse
 * @param {Object} options：附加参数
 * @return {null} null
 */
SightAnalyse.prototype.actionIntervisibility = function(options){
	var self = this;
	self._towerHeight = options.towerHeight ? options.towerHeight : 1;
	self._treeHeight = options.treeHeight ? options.treeHeight : 0;
	self._targetHeight = options.targetHeight ? options.targetHeight : 0;
	self._pointToPoint = true;
	self._sPoint = null;
	self._ePoint = null;
	self._showMenu = self._globe.globeMenu._showMenu;
	self._globe.globeMenu.setType(false);
}

/*
 * 结束视线分析
 * @author zhaoxd
 * @method endIntervisibility
 * @for SightAnalyse
 * @param {null} null
 * @return {null} null
 */
SightAnalyse.prototype.endIntervisibility = function(){
	var self = this;
	self._towerHeight = 1;
	self._treeHeight = 0;
	self._targetHeight = 0;
	self._pointToPoint = false;
	self._sPoint = null;
	self._ePoint = null;
}

/*
 * 清除
 * @author zhaoxd
 * @method clear
 * @for SightAnalyse
 * @param {null} null
 * @return {null} null
 */
SightAnalyse.prototype.clear = function(){
	var self = this;
	self.endIntervisibility();
	self._vertexList = [];
	for(var i = self._objList.length - 1; i >= 0; i--){
		self._viewer.entities.remove(self._objList[i]);
		self._objList.pop();
	}
}

/*
 * 添加标识
 * @author zhaoxd
 * @method _addMark
 * @for SightAnalyse
 * @param {point} lonlat：标识坐标
 * @param {string} str：标识名称
 * @return {null} null
 */
SightAnalyse.prototype._addMark = function(lonlat,str){
	var self = this;
	var pinBuilder = new Cesium.PinBuilder();
	var m_pos = self._viewer.entities.add({
	    position : Cesium.Cartesian3.fromDegrees(lonlat.lon, lonlat.lat, lonlat.alt),
	    billboard : {
	        image : pinBuilder.fromText(str, Cesium.Color.RED, 48).toDataURL(),
	        width : 30,
	        height : 30,
	        verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
	        disableDepthTestDistance : Number.POSITIVE_INFINITY
	    }
	});
    self._objList[self._objList.length] = m_pos;
}

/*
 * 开始绘制视线
 * @author zhaoxd
 * @method _actionCompute
 * @for SightAnalyse
 * @param {null} null
 * @return {null} null
 */
SightAnalyse.prototype._actionCompute = function(){
	var self = this;
	self.getIntersectionByPoints(self._sPoint, self._ePoint, function(intersectionPoint){
		if(intersectionPoint){
			self._addMark(intersectionPoint,"交");
			var m_array1 = new Array();
		    m_array1.push(self._sPoint.lon);
	    	m_array1.push(self._sPoint.lat);
			m_array1.push(self._sPoint.alt);
		    m_array1.push(intersectionPoint.lon);
	    	m_array1.push(intersectionPoint.lat);
			m_array1.push(intersectionPoint.alt);
			var m_positions1 = Cesium.Cartesian3.fromDegreesArrayHeights(m_array1);
			var m_polyline1 = self._viewer.entities.add({
				polyline: {
				    positions: m_positions1,
				    material: Cesium.Color.GREEN
				}
			});
			self._objList[self._objList.length] = m_polyline1;
			var m_array = new Array();
		    m_array.push(intersectionPoint.lon);
	    	m_array.push(intersectionPoint.lat);
			m_array.push(intersectionPoint.alt);
		    m_array.push(self._ePoint.lon);
	    	m_array.push(self._ePoint.lat);
			m_array.push(self._ePoint.alt);
			var m_positions = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
			var m_polyline = self._viewer.entities.add({
				polyline: {
				    positions: m_positions,
				    material: Cesium.Color.RED
				}
			});
			self._objList[self._objList.length] = m_polyline;
		}else{
			var m_array = new Array();
		    m_array.push(self._sPoint.lon);
	    	m_array.push(self._sPoint.lat);
			m_array.push(self._sPoint.alt);
		    m_array.push(self._ePoint.lon);
	    	m_array.push(self._ePoint.lat);
			m_array.push(self._ePoint.alt);
			var m_positions = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
			var m_polyline = self._viewer.entities.add({
				polyline: {
				    positions: m_positions,
				    material: Cesium.Color.GREEN
				}
			});
			self._objList[self._objList.length] = m_polyline;
		}
		if(!self._pointToPoint){
			self._sPoint = null;
			self._ePoint = null;
		}
	});
}

/*
 * 根据两点坐标求交点
 * @author zhaoxd
 * @method getIntersectionByPoints
 * @for SightAnalyse
 * @param {point} starPoint：开始点
 * @param {point} endPoint：目标点
 * @param {function} callback：回调函数
 * @return {null} null
 */
SightAnalyse.prototype.getIntersectionByPoints = function(starPoint,endPoint,callback){
	var self = this;
	var lon0 = starPoint.lon;
	var lat0 = starPoint.lat;
	var alt0 = starPoint.alt;
	var lon1 = endPoint.lon;
	var lat1 = endPoint.lat;
	var alt1 = endPoint.alt;
	var dist = CommonFunc.getDistance(lon0,lat0,lon1,lat1);
	self._getIntersectionByRay(dist,lon0,lat0,alt0,lon1,lat1,alt1,callback);
}

/*
 * 根据一点坐标和方位角求交点
 * @author zhaoxd
 * @method getIntersectionByAngle
 * @for SightAnalyse
 * @param {object} 坐标以及方位角参数
 * @return {null} null
 */
SightAnalyse.prototype.getIntersectionByAngle = function(options){
	var self = this;
	var lon0 = options.lon ? parseFloat(options.lon) : 0;
	var lat0 = options.lat ? parseFloat(options.lat) : 0;
	var alt0 = options.alt ? parseFloat(options.alt) : 0;
	var horizontal = options.horizontal ? parseFloat(options.horizontal) : 0;
	var pitch = options.pitch ? parseFloat(options.pitch) : 0;
	var dist = options.dist ? parseInt(options.dist) : 15000;
	var callback = options.callback ? options.callback : null;
	var lonlat1 = CommonFunc.destinationVincenty(lon0, lat0, alt0, horizontal, pitch, 5000);
	var lon1 = lonlat1.lon;
	var lat1 = lonlat1.lat;
	var alt1 = lonlat1.alt;
	self._getIntersectionByRay(dist,lon0,lat0,alt0,lon1,lat1,alt1,callback);
}

/*
 * 内部求交点方法
 * @author zhaoxd
 * @method _getIntersectionByRay
 * @for SightAnalyse
 * @param {float} dist：距离
 * @param {float} lon0：开始点经度
 * @param {float} lat0：开始点维度
 * @param {float} alt0：开始点高程
 * @param {float} lon1：目标点经度
 * @param {float} lat1：目标点纬度
 * @param {float} alt1：目标点高程
 * @param {function} callback：回调函数
 * @return {null} null
 */
SightAnalyse.prototype._getIntersectionByRay = function(dist,lon0,lat0,alt0,lon1,lat1,alt1,callback){
    var self = this;
	var p0 = Cesium.Cartesian3.fromDegrees(lon0,lat0,alt0);
	var p1 = Cesium.Cartesian3.fromDegrees(lon1,lat1,alt1);
	var direction = new Cesium.Cartesian3();
	Cesium.Cartesian3.subtract(p1, p0, direction);
    Cesium.Cartesian3.normalize(direction, direction);
    var ray = new Cesium.Ray(p0, direction);
    var rayPositions = [];
    var terrainSamplePositions = [];
	for(i = 0; i < 1000; i++){
		var t = i * 100;
		var pt = Cesium.Ray.getPoint(ray, t);
		if(t > dist){
			pt = Cesium.Ray.getPoint(ray, dist);
		}
		var cartographic = Cesium.Cartographic.fromCartesian(pt);
		var longitude = Cesium.Math.toDegrees(cartographic.longitude);
		var latitude = Cesium.Math.toDegrees(cartographic.latitude);
		var height = cartographic.height;
		
		//this._globe.placeMark.add({lon:longitude,lat:latitude,alt:height});
		
		var position = new Cesium.Cartographic(cartographic.longitude, cartographic.latitude);
		terrainSamplePositions.push(position);
		rayPositions.push({lon:longitude,lat:latitude,alt:height});
		if(t > dist){
			break;
		}
	}
	
	//this._globe.polyline.add({pointList: rayPositions});
	
	var promise = Cesium.sampleTerrain(self._viewer.terrainProvider, self._globe._stkLevel, terrainSamplePositions);
	Cesium.when(promise, function(updatedPositions) {
		var intersectionPoint = null;
		try{
			var raisedPositions = self._viewer.scene.globe.ellipsoid.cartographicArrayToCartesianArray(updatedPositions);
			var is = true;
			for(var i = 0; i < rayPositions.length; i++){
				var cartographic1 = Cesium.Cartographic.fromCartesian(raisedPositions[i]);
				if(rayPositions[i].alt < cartographic1.height + self._treeHeight){
					if(i>0){
						is = false;
						var rayPositions2 = [];
					    var terrainSamplePositions2 = [];
						for(k = 0; k < 21; k++){
							var t2 = k * 5;
							var pt2 = Cesium.Ray.getPoint(ray, t2 + ((i - 1) * 100));
							if(t2 > dist){
								pt2 = Cesium.Ray.getPoint(ray, dist);
							}
							var cartographic2 = Cesium.Cartographic.fromCartesian(pt2);
							var longitude2 = Cesium.Math.toDegrees(cartographic2.longitude);
							var latitude2 = Cesium.Math.toDegrees(cartographic2.latitude);
							var height2 = cartographic2.height;
							var position2 = new Cesium.Cartographic(cartographic2.longitude, cartographic2.latitude);
							terrainSamplePositions2.push(position2);
							rayPositions2.push({lon:longitude2,lat:latitude2,alt:height2});
							if(t2 > dist){
								break;
							}
						}
						var promise2 = Cesium.sampleTerrain(self._viewer.terrainProvider, self._globe._stkLevel, terrainSamplePositions2);
						Cesium.when(promise2, function(updatedPositions2) {
							var raisedPositions2 = self._viewer.scene.globe.ellipsoid.cartographicArrayToCartesianArray(updatedPositions2);
							for(var j = 0; j < rayPositions2.length; j++){
								var cartographic22 = Cesium.Cartographic.fromCartesian(raisedPositions2[j]);
								if(rayPositions2[j].alt < cartographic22.height + self._treeHeight){
									intersectionPoint = rayPositions2[j-1];
									break;
								}
							}
							if(callback){
								callback(intersectionPoint);
							}
						});
					}
					break;
				}
			}
			if(is){
				if(callback){
					callback(intersectionPoint);
				}
			}
		}catch(error) {
			if(callback){
				callback(intersectionPoint);
			}
		}
	});
}



/*
 * 根据一点坐标和方位角求某距离外的另一点坐标
 * @author wms
 * @method getPolylineByAngle
 * @for SightAnalyse
 * @param {object} 坐标以及方位角参数
 * @return {null} null
 */
SightAnalyse.prototype.getDestinationVincentyByAngle = function(options){
	var self = this;
	var lon0 = options.lon ? parseFloat(options.lon) : 0;
	var lat0 = options.lat ? parseFloat(options.lat) : 0;
	var alt0 = options.alt ? parseFloat(options.alt) : 0;
	var horizontal = options.horizontal ? parseFloat(options.horizontal) : 0;
	var pitch = options.pitch ? parseFloat(options.pitch) : 0;
	var dist = options.dist ? parseInt(options.dist) : 5000;
	var lonlat1 = CommonFunc.destinationVincenty(lon0, lat0, alt0, horizontal, pitch, dist);
	return lonlat1;
}


return SightAnalyse;
})