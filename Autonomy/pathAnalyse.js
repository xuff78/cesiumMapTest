/*
* author: 赵雪丹
* description: PathAnalyse-路径分析
* day: 2017-11-09
*/
define( [ ], function( ){
function PathAnalyse(globe){
	var self = this;
	this._globe = globe;
	this._viewer = globe._viewer;
	this._globeId = globe._globeId;
	this._dist = 0;
	//路径分析
	this._path_manager = {
		draw: false, 
		selectSpoint: false, 
		spoint: null, 
		selectTpoint: false, 
		tpoints: [], 
		selectEpoint: false, 
		epoint: null
	};
	this._layer = [];
	this._color = Cesium.Color.GREEN;
	this._colorNun = 0;
	this._colorList = [
		Cesium.Color.RED,
		Cesium.Color.ORANGE,
		Cesium.Color.YELLOW,
		Cesium.Color.GREEN,
		Cesium.Color.BLUE,
		Cesium.Color.VIOLET,
		Cesium.Color.LAWNGREEN,
		Cesium.Color.MAGENTA,
		Cesium.Color.MEDIUMSLATEBLUE,
		Cesium.Color.ORANGERED,
		Cesium.Color.YELLOWGREEN
	];
	
	//私有注册事件
	this._handler = new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas);
	//LEFT_CLICK 左键点击事件
	this._handler.setInputAction(function (e) {
		var lonlat = self._globe.getLonLatByPosition(e.position);
		if(self._path_manager.draw){
			if(self._path_manager.selectSpoint){
				if(self._path_manager.spoint){
					for(var i = self._layer.length - 1; i >= 0; i--){
						self._viewer.entities.remove(self._layer[i]);
						self._layer.pop();
					}
//					for(var i = self._layer.length - 1; i >= 0; i--){
//						if(self._layer[i] == self._path_manager.spoint){
//							self._viewer.entities.remove(self._layer[i]);
//							self._layer.splice(i, 1);
//						}
//					}
				}
				self._path_manager.spoint = lonlat;
				self._drawPoint(lonlat,"起");
			}else if(self._path_manager.selectTpoint){
				if(self._path_manager.spoint){
					self._path_manager.tpoints.push(lonlat);
					self._drawPoint(lonlat,"过");
				}else{
					alert("请先选取起始点");
				}
			}else if(self._path_manager.selectEpoint){
				if(self._path_manager.spoint){
					self._path_manager.epoint = lonlat;
					self._drawPoint(lonlat,"止");
					self._actionAnalyse();
				}else{
					alert("请先选取起始点");
				}
			}
    	}
	}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

/*
 * 根据点集合进行路径分析
 * @author zhaoxd
 * @method analyseByPoints
 * @for PathAnalyse
 * @param {list} 点集合
 * @return {null} null
 */
PathAnalyse.prototype.analyseByPoints = function(points){
	var self = this;
	self._color = self._colorList[0];
//	self._color = self._colorList[self._colorNun];
	self._colorNun++;
	if(self._colorNun == self._colorList.length){
		self._colorNun = 0;
	}
	if(points && points.length > 1){
		for(var i = 0; i < points.length; i++){
			var str = "";
			if(i == 0){
				str = "起";
			}else if(i == points.length-1){
				str = "止";
			}else{
				str = "过";
			}
			self._drawPoint(points[i],str);
			if(i > 0){
				if(i == points.length-1){
					self._drawPathByPoints(points[i],points[i-1],"e");
				}else{
					self._drawPathByPoints(points[i],points[i-1],"t");
				}
			}
		}
	}else{
		alert("点集合错误！");
	}
}

/*
 * 开始分析
 * @author zhaoxd
 * @method _actionAnalyse
 * @for PathAnalyse
 * @param {null} null
 * @return {null} null
 */
PathAnalyse.prototype._actionAnalyse = function(){
	var self = this;
	self._dist = 0;
	self._color = self._colorList[self._colorNun];
	self._colorNun++;
	if(self._colorNun == self._colorList.length){
		self._colorNun = 0;
	}
	if(self._path_manager.tpoints.length > 0){
		for(var i = 0; i < self._path_manager.tpoints.length; i++){
			if(i == 0){
				self._drawPathByPoints(self._path_manager.spoint,self._path_manager.tpoints[i],"t");
				if(self._path_manager.tpoints.length == 1){
					self._drawPathByPoints(self._path_manager.tpoints[i],self._path_manager.epoint,"e");
				}
			}else if(i == self._path_manager.tpoints.length-1){
				self._drawPathByPoints(self._path_manager.tpoints[i-1],self._path_manager.tpoints[i],"t");
				self._drawPathByPoints(self._path_manager.tpoints[i],self._path_manager.epoint,"e");
			}else{
				self._drawPathByPoints(self._path_manager.tpoints[i-1],self._path_manager.tpoints[i],"t");
			}
		}
	}else{
		self._drawPathByPoints(self._path_manager.spoint,self._path_manager.epoint,"e");
	}
}

/*
 * 选取起始点
 * @author zhaoxd
 * @method selectSpoint
 * @for PathAnalyse
 * @param {null} null
 * @return {null} null
 */
PathAnalyse.prototype.selectSpoint = function(){
	var self = this;
	self._path_manager.draw = true;
	self._path_manager.selectSpoint = true;
	self._path_manager.spoint = null;
	self._path_manager.selectTpoint = false;
	self._path_manager.tpoints = [];
	self._path_manager.selectEpoint = false;
	self._path_manager.epoint = null;
	for(var i = self._layer.length - 1; i >= 0; i--){
		self._viewer.entities.remove(self._layer[i]);
		self._layer.pop();
	}
}

/*
 * 选取经过点
 * @author zhaoxd
 * @method selectTpoint
 * @for PathAnalyse
 * @param {null} null
 * @return {null} null
 */
PathAnalyse.prototype.selectTpoint = function(){
	var self = this;
	self._path_manager.draw = true;
	self._path_manager.selectSpoint = false;
	self._path_manager.selectTpoint = true;
	self._path_manager.tpoints = [];
	self._path_manager.selectEpoint = false;
	self._path_manager.epoint = null;
}

/*
 * 选取结束点
 * @author zhaoxd
 * @method selectEpoint
 * @for PathAnalyse
 * @param {null} null
 * @return {null} null
 */
PathAnalyse.prototype.selectEpoint = function(){
	var self = this;
	self._path_manager.draw = true;
	self._path_manager.selectSpoint = false;
	self._path_manager.selectTpoint = false;
	self._path_manager.selectEpoint = true;
	self._path_manager.epoint = null;
}

/*
 * 结束选取
 * @author zhaoxd
 * @method selectEnd
 * @for PathAnalyse
 * @param {null} null
 * @return {null} null
 */
PathAnalyse.prototype.selectEnd = function(){
	var self = this;
	self._path_manager.draw = false;
	self._path_manager.selectSpoint = false;
	self._path_manager.spoint = null;
	self._path_manager.selectTpoint = false;
	self._path_manager.tpoints = [];
	self._path_manager.selectEpoint = false;
	self._path_manager.epoint = null;
	self._color = Cesium.Color.GREEN;
}

/*
 * 绘制点
 * @author zhaoxd
 * @method _drawPoint
 * @for PathAnalyse
 * @param {point} 点信息
 * @return {null} null
 */
PathAnalyse.prototype._drawPoint = function(point,str){
	var self = this;
	var pinBuilder = new Cesium.PinBuilder();
	var m_pos = self._viewer.entities.add({
	    position : Cesium.Cartesian3.fromDegrees(point.lon, point.lat),
	    billboard : {
	        image : pinBuilder.fromText(str, Cesium.Color.RED, 48).toDataURL(),
	        width : 30,
	        height : 30,
	        verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
	        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
	        disableDepthTestDistance : Number.POSITIVE_INFINITY
	    }
	});
    self._layer.push(m_pos);
}

/*
 * 绘制两点间线路
 * @author zhaoxd
 * @method _drawPathByPoints
 * @for PathAnalyse
 * @param {point} point1：信息点1
 * @param {point} point2：信息点2
 * @param {string} str：状态标识
 * @return {null} null
 */
PathAnalyse.prototype._drawPathByPoints = function(point1, point2, str){
	var self = this;
	var spoint = point1;
	var epoint = point2;
	var m_upNun = 5;
    $.ajax(self._globe.urlConfig.LOCALOWS,{
        type: 'GET',
        data: {
            service: 'WFS',
            version: '1.0.0',
            request: 'GetFeature',
            typename: "cf:roadnet",
            outputFormat: 'application/json',
            viewparams:'x1:'+spoint.lon+';y1:'+spoint.lat+';x2:'+epoint.lon+';y2:'+epoint.lat
        },
        success: function(data){
        	if(!data.features){
        		alert("数据获取失败，请稍后重试!");
        		return;
        	}
        	var points = data.features[0].geometry.coordinates;
        	var dist = 0;
        	if(points.length == 2 && points[0][0] == points[1][0] && points[0][1] == points[1][1]){
        		dist = CommonFunc.getDistance(spoint.lon,spoint.lat,epoint.lon,epoint.lat);
        		var m_array = new Array();
			    m_array.push(spoint.lon);
		    	m_array.push(spoint.lat);
				m_array.push(spoint.alt);
			    m_array.push(epoint.lon);
		    	m_array.push(epoint.lat);
				m_array.push(epoint.alt);
				var positions = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
				var m_polyline = self._viewer.entities.add({
					polyline: {
					    positions: positions,
					    width: 5,
					    material: new Cesium.PolylineDashMaterialProperty({
				            color : Cesium.Color.ORANGE,
				            dashLength: 8.0
				        })
					}
				});
				self._layer.push(m_polyline);
				if(str == "t"){
					self._dist += dist;
				}else if(str == "e"){
					self._dist += dist;
					var m_pos = self._viewer.entities.add({
					    position : Cesium.Cartesian3.fromDegrees(spoint.lon, spoint.lat),
					    label:{
					    	text:  (self._dist/1000).toFixed(2) + "km",
					    	font:"14pt sans-serif",
					    	horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
					    	pixelOffset: new Cesium.Cartesian2(15, 0),
					    	verticalOrigin : Cesium.VerticalOrigin.BASELINE,
					        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
					        disableDepthTestDistance : Number.POSITIVE_INFINITY
					    }
					});
				    self._layer.push(m_pos);
				    self._dist = 0;
				}
        		return;
        	}
        	var pointList = [];
        	for(var i = 0; i < points.length; i++){
        		var lon = points[i][0];
        		var lat = points[i][1];
        		var lonlat = {lon:lon,lat:lat,alt:2000};
        		pointList[pointList.length] = lonlat;
        		if(i>0){
        			var sub_dist = CommonFunc.getDistance(points[i][0],points[i][1],points[i-1][0],points[i-1][1]);
        			dist += sub_dist;
        		}
        	}
        	self._globe.getAltByLonlat(pointList,function(plst){
				var m_array = new Array();
			    for(var i = 0; i < plst.length; i++){
			    	m_array.push(plst[i].lon);
			    	m_array.push(plst[i].lat);
					m_array.push(plst[i].alt+m_upNun);
			    }
				var positions = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
				var m_polyline = self._viewer.entities.add({
					polyline: {
					    positions: positions,
					    width: 5,
					    material: self._color.withAlpha(1)
					}
				});
				self._layer.push(m_polyline);
				var dist1 = CommonFunc.getDistance(spoint.lon,spoint.lat,plst[0].lon,plst[0].lat);
				var dist2 = CommonFunc.getDistance(spoint.lon,spoint.lat,plst[plst.length - 1].lon,plst[plst.length - 1].lat);
				var m_array_s = new Array();
				if(dist1 < dist2){
					dist += dist1;
					m_array_s.push(plst[0].lon);
			    	m_array_s.push(plst[0].lat);
					m_array_s.push(plst[0].alt+m_upNun);
				}else{
					dist += dist2;
					m_array_s.push(plst[plst.length - 1].lon);
			    	m_array_s.push(plst[plst.length - 1].lat);
					m_array_s.push(plst[plst.length - 1].alt+m_upNun);
				}
			    m_array_s.push(spoint.lon);
		    	m_array_s.push(spoint.lat);
				m_array_s.push(spoint.alt);
				var positions_s = Cesium.Cartesian3.fromDegreesArrayHeights(m_array_s);
				var m_polyline_s = self._viewer.entities.add({
					polyline: {
					    positions: positions_s,
					    width: 5,
					    material: new Cesium.PolylineDashMaterialProperty({
				            color : Cesium.Color.ORANGE,
				            dashLength: 8.0
				        })
					}
				});
				self._layer.push(m_polyline_s);
				
				var dist3 = CommonFunc.getDistance(epoint.lon,epoint.lat,plst[0].lon,plst[0].lat);
				var dist4 = CommonFunc.getDistance(epoint.lon,epoint.lat,plst[plst.length - 1].lon,plst[plst.length - 1].lat);
				var m_array_e = new Array();
			    if(dist3 < dist4){
					dist += dist3;
					m_array_e.push(plst[0].lon);
			    	m_array_e.push(plst[0].lat);
					m_array_e.push(plst[0].alt+m_upNun);
				}else{
					dist += dist4;
			    	m_array_e.push(plst[plst.length - 1].lon);
			    	m_array_e.push(plst[plst.length - 1].lat);
					m_array_e.push(plst[plst.length - 1].alt+m_upNun);
				}
			    m_array_e.push(epoint.lon);
		    	m_array_e.push(epoint.lat);
				m_array_e.push(epoint.alt);
				var positions_e = Cesium.Cartesian3.fromDegreesArrayHeights(m_array_e);
				var m_polyline_e = self._viewer.entities.add({
					polyline: {
					    positions: positions_e,
					    width: 5,
					    material: new Cesium.PolylineDashMaterialProperty({
				            color : Cesium.Color.ORANGE,
				            dashLength: 8.0
				        })
					}
				});
				self._layer.push(m_polyline_e);
				if(str == "t"){
					self._dist += dist;
				}else if(str == "e"){
					self._dist += dist;
					var m_pos = self._viewer.entities.add({
					    position : Cesium.Cartesian3.fromDegrees(spoint.lon, spoint.lat),
					    label:{
					    	text:  (self._dist/1000).toFixed(2) + "km",
					    	font:"14pt sans-serif",
					    	horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
					    	pixelOffset: new Cesium.Cartesian2(15, 0),
					    	verticalOrigin : Cesium.VerticalOrigin.BASELINE,
					        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
					        disableDepthTestDistance : Number.POSITIVE_INFINITY
					    }
					});
				    self._layer.push(m_pos);
				    self._dist = 0;
				}
        	})
        }
    });
}

/*
 * 清除
 * @author zhaoxd
 * @method clear
 * @for PathAnalyse
 * @param {null} null
 * @return {null} null
 */
PathAnalyse.prototype.clear = function(){
	var self = this;
	self.selectEnd();
	for(var i = self._layer.length - 1; i >= 0; i--){
		self._viewer.entities.remove(self._layer[i]);
		self._layer.pop();
	}
}

return PathAnalyse;
})


///*
//* author: 赵雪丹
//* description: PathAnalyse-路径分析
//* day: 2017-11-09
//*/
//define( [ ], function( ){
//function PathAnalyse(globe){
//	var self = this;
//	this._globe = globe;
//	this._viewer = globe._viewer;
//	this._globeId = globe._globeId;
//	this._dist = 0;
//	//路径分析
//	this._path_manager = {
//		draw: false, 
//		selectSpoint: false, 
//		spoint: null, 
//		selectTpoint: false, 
//		tpoints: [], 
//		selectEpoint: false, 
//		epoint: null
//	};
//	this._layer = [];
//	this._color = Cesium.Color.GREEN;
//	this._colorNun = 0;
//	this._colorList = [
//		Cesium.Color.RED,
//		Cesium.Color.ORANGE,
//		Cesium.Color.YELLOW,
//		Cesium.Color.GREEN,
//		Cesium.Color.BLUE,
//		Cesium.Color.VIOLET,
//		Cesium.Color.LAWNGREEN,
//		Cesium.Color.MAGENTA,
//		Cesium.Color.MEDIUMSLATEBLUE,
//		Cesium.Color.ORANGERED,
//		Cesium.Color.YELLOWGREEN
//	];
//	
//	//私有注册事件
//	this._handler = new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas);
//	//LEFT_CLICK 左键点击事件
//	this._handler.setInputAction(function (e) {
//		var lonlat = self._globe.getLonLatByPosition(e.position);
//		if(self._path_manager.draw){
//			if(self._path_manager.selectSpoint){
//				if(self._path_manager.spoint){
//					for(var i = self._layer.length - 1; i >= 0; i--){
//						self._viewer.entities.remove(self._layer[i]);
//						self._layer.pop();
//					}
////					for(var i = self._layer.length - 1; i >= 0; i--){
////						if(self._layer[i] == self._path_manager.spoint){
////							self._viewer.entities.remove(self._layer[i]);
////							self._layer.splice(i, 1);
////						}
////					}
//				}
//				self._path_manager.spoint = lonlat;
//				self._drawPoint(lonlat,"起");
//			}else if(self._path_manager.selectTpoint){
//				if(self._path_manager.spoint){
//					self._path_manager.tpoints.push(lonlat);
//					self._drawPoint(lonlat,"过");
//				}else{
//					alert("请先选取起始点");
//				}
//			}else if(self._path_manager.selectEpoint){
//				if(self._path_manager.spoint){
//					self._path_manager.epoint = lonlat;
//					self._drawPoint(lonlat,"止");
//					self._actionAnalyse();
//				}else{
//					alert("请先选取起始点");
//				}
//			}
//  	}
//	}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
//}
//
///*
// * 根据点集合进行路径分析
// * @author zhaoxd
// * @method analyseByPoints
// * @for PathAnalyse
// * @param {list} 点集合
// * @return {null} null
// */
//PathAnalyse.prototype.analyseByPoints = function(points){
//	var self = this;
//	self._color = self._colorList[self._colorNun];
//	self._colorNun++;
//	if(self._colorNun == self._colorList.length){
//		self._colorNun = 0;
//	}
//	if(points && points.length > 1){
//		for(var i = 0; i < points.length; i++){
//			var str = "";
//			if(i == 0){
//				str = "起";
//			}else if(i == points.length-1){
//				str = "止";
//			}else{
//				str = "过";
//			}
//			self._drawPoint(points[i],str);
//			if(i > 0){
//				if(i == points.length-1){
//					self._drawPathByPoints(points[i],points[i-1],"e");
//				}else{
//					self._drawPathByPoints(points[i],points[i-1],"t");
//				}
//			}
//		}
//	}else{
//		alert("点集合错误！");
//	}
//}
//
///*
// * 开始分析
// * @author zhaoxd
// * @method _actionAnalyse
// * @for PathAnalyse
// * @param {null} null
// * @return {null} null
// */
//PathAnalyse.prototype._actionAnalyse = function(){
//	var self = this;
//	self._dist = 0;
//	self._color = self._colorList[self._colorNun];
//	self._colorNun++;
//	if(self._colorNun == self._colorList.length){
//		self._colorNun = 0;
//	}
//	if(self._path_manager.tpoints.length > 0){
//		for(var i = 0; i < self._path_manager.tpoints.length; i++){
//			if(i == 0){
//				self._drawPathByPoints(self._path_manager.spoint,self._path_manager.tpoints[i],"t");
//				if(self._path_manager.tpoints.length == 1){
//					self._drawPathByPoints(self._path_manager.tpoints[i],self._path_manager.epoint,"e");
//				}
//			}else if(i == self._path_manager.tpoints.length-1){
//				self._drawPathByPoints(self._path_manager.tpoints[i-1],self._path_manager.tpoints[i],"t");
//				self._drawPathByPoints(self._path_manager.tpoints[i],self._path_manager.epoint,"e");
//			}else{
//				self._drawPathByPoints(self._path_manager.tpoints[i-1],self._path_manager.tpoints[i],"t");
//			}
//		}
//	}else{
//		self._drawPathByPoints(self._path_manager.spoint,self._path_manager.epoint,"e");
//	}
//}
//
///*
// * 选取起始点
// * @author zhaoxd
// * @method selectSpoint
// * @for PathAnalyse
// * @param {null} null
// * @return {null} null
// */
//PathAnalyse.prototype.selectSpoint = function(){
//	var self = this;
//	self._path_manager.draw = true;
//	self._path_manager.selectSpoint = true;
//	self._path_manager.spoint = null;
//	self._path_manager.selectTpoint = false;
//	self._path_manager.tpoints = [];
//	self._path_manager.selectEpoint = false;
//	self._path_manager.epoint = null;
//	for(var i = self._layer.length - 1; i >= 0; i--){
//		self._viewer.entities.remove(self._layer[i]);
//		self._layer.pop();
//	}
//}
//
///*
// * 选取经过点
// * @author zhaoxd
// * @method selectTpoint
// * @for PathAnalyse
// * @param {null} null
// * @return {null} null
// */
//PathAnalyse.prototype.selectTpoint = function(){
//	var self = this;
//	self._path_manager.draw = true;
//	self._path_manager.selectSpoint = false;
//	self._path_manager.selectTpoint = true;
//	self._path_manager.tpoints = [];
//	self._path_manager.selectEpoint = false;
//	self._path_manager.epoint = null;
//}
//
///*
// * 选取结束点
// * @author zhaoxd
// * @method selectEpoint
// * @for PathAnalyse
// * @param {null} null
// * @return {null} null
// */
//PathAnalyse.prototype.selectEpoint = function(){
//	var self = this;
//	self._path_manager.draw = true;
//	self._path_manager.selectSpoint = false;
//	self._path_manager.selectTpoint = false;
//	self._path_manager.selectEpoint = true;
//	self._path_manager.epoint = null;
//}
//
///*
// * 结束选取
// * @author zhaoxd
// * @method selectEnd
// * @for PathAnalyse
// * @param {null} null
// * @return {null} null
// */
//PathAnalyse.prototype.selectEnd = function(){
//	var self = this;
//	self._path_manager.draw = false;
//	self._path_manager.selectSpoint = false;
//	self._path_manager.spoint = null;
//	self._path_manager.selectTpoint = false;
//	self._path_manager.tpoints = [];
//	self._path_manager.selectEpoint = false;
//	self._path_manager.epoint = null;
//	self._color = Cesium.Color.GREEN;
//}
//
///*
// * 绘制点
// * @author zhaoxd
// * @method _drawPoint
// * @for PathAnalyse
// * @param {point} 点信息
// * @return {null} null
// */
//PathAnalyse.prototype._drawPoint = function(point,str){
//	var self = this;
//	var pinBuilder = new Cesium.PinBuilder();
//	var m_pos = self._viewer.entities.add({
//	    position : Cesium.Cartesian3.fromDegrees(point.lon, point.lat),
//	    billboard : {
//	        image : pinBuilder.fromText(str, Cesium.Color.RED, 48).toDataURL(),
//	        width : 30,
//	        height : 30,
//	        verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
//	        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
//	        disableDepthTestDistance : Number.POSITIVE_INFINITY
//	    }
//	});
//  self._layer.push(m_pos);
//}
//
///*
// * 绘制两点间线路
// * @author zhaoxd
// * @method _drawPathByPoints
// * @for PathAnalyse
// * @param {point} point1：信息点1
// * @param {point} point2：信息点2
// * @param {string} str：状态标识
// * @return {null} null
// */
//PathAnalyse.prototype._drawPathByPoints = function(point1, point2, str){
//	var self = this;
//	var spoint = point1;
//	var epoint = point2;
//	var m_upNun = 5;
//  $.ajax(self._globe.urlConfig.LOCALOWS,{
//      type: 'GET',
//      data: {
//          service: 'WFS',
//          version: '1.0.0',
//          request: 'GetFeature',
//          typename: "cf:roadnet",
//          outputFormat: 'application/json',
//          viewparams:'x1:'+spoint.lon+';y1:'+spoint.lat+';x2:'+epoint.lon+';y2:'+epoint.lat
//      },
//      success: function(data){
//      	if(!data.features){
//      		alert("数据获取失败，请稍后重试!");
//      		return;
//      	}
//      	var points = data.features[0].geometry.coordinates;
//      	var dist = 0;
//      	if(points.length == 2 && points[0][0] == points[1][0] && points[0][1] == points[1][1]){
//      		dist = CommonFunc.getDistance(spoint.lon,spoint.lat,epoint.lon,epoint.lat);
//      		var m_array = new Array();
//			    m_array.push(spoint.lon);
//		    	m_array.push(spoint.lat);
//				m_array.push(spoint.alt);
//			    m_array.push(epoint.lon);
//		    	m_array.push(epoint.lat);
//				m_array.push(epoint.alt);
//				var positions = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
//				var m_polyline = self._viewer.entities.add({
//					polyline: {
//					    positions: positions,
//					    width: 5,
//					    material: new Cesium.PolylineDashMaterialProperty({
//				            color : Cesium.Color.ORANGE,
//				            dashLength: 8.0
//				        })
//					}
//				});
//				self._layer.push(m_polyline);
//				if(str == "t"){
//					self._dist += dist;
//				}else if(str == "e"){
//					self._dist += dist;
//					var m_pos = self._viewer.entities.add({
//					    position : Cesium.Cartesian3.fromDegrees(epoint.lon, epoint.lat),
//					    label:{
//					    	text:  (self._dist/1000).toFixed(2) + "km",
//					    	font:"14pt sans-serif",
//					    	horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
//					    	pixelOffset: new Cesium.Cartesian2(15, 0),
//					    	verticalOrigin : Cesium.VerticalOrigin.BASELINE,
//					        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
//					        disableDepthTestDistance : Number.POSITIVE_INFINITY
//					    }
//					});
//				    self._layer.push(m_pos);
//				    self._dist = 0;
//				}
//      		return;
//      	}
//      	var pointList = [];
//      	for(var i = 0; i < points.length; i++){
//      		var lon = points[i][0];
//      		var lat = points[i][1];
//      		var lonlat = {lon:lon,lat:lat,alt:2000};
//      		pointList[pointList.length] = lonlat;
//      		if(i>0){
//      			var sub_dist = CommonFunc.getDistance(points[i][0],points[i][1],points[i-1][0],points[i-1][1]);
//      			dist += sub_dist;
//      		}
//      	}
//      	self._globe.getAltByLonlat(pointList,function(plst){
//				var m_array = new Array();
//			    for(var i = 0; i < plst.length; i++){
//			    	m_array.push(plst[i].lon);
//			    	m_array.push(plst[i].lat);
//					m_array.push(plst[i].alt+m_upNun);
//			    }
//				var positions = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
//				var m_polyline = self._viewer.entities.add({
//					polyline: {
//					    positions: positions,
//					    width: 5,
//					    material: self._color.withAlpha(1)
//					}
//				});
//				self._layer.push(m_polyline);
//				var dist1 = CommonFunc.getDistance(spoint.lon,spoint.lat,plst[0].lon,plst[0].lat);
//				dist += dist1;
//				var dist2 = CommonFunc.getDistance(spoint.lon,spoint.lat,plst[plst.length - 1].lon,plst[plst.length - 1].lat);
//				dist += dist2;
//				var m_array_s = new Array();
//				if(dist1 < dist2){
//					m_array_s.push(plst[0].lon);
//			    	m_array_s.push(plst[0].lat);
//					m_array_s.push(plst[0].alt+m_upNun);
//				}else{
//					m_array_s.push(plst[plst.length - 1].lon);
//			    	m_array_s.push(plst[plst.length - 1].lat);
//					m_array_s.push(plst[plst.length - 1].alt+m_upNun);
//				}
//			    m_array_s.push(spoint.lon);
//		    	m_array_s.push(spoint.lat);
//				m_array_s.push(spoint.alt);
//				var positions_s = Cesium.Cartesian3.fromDegreesArrayHeights(m_array_s);
//				var m_polyline_s = self._viewer.entities.add({
//					polyline: {
//					    positions: positions_s,
//					    width: 5,
//					    material: new Cesium.PolylineDashMaterialProperty({
//				            color : Cesium.Color.ORANGE,
//				            dashLength: 8.0
//				        })
//					}
//				});
//				self._layer.push(m_polyline_s);
//
//				var m_array_e = new Array();
//			    if(dist1 < dist2){
//			    	m_array_e.push(plst[plst.length - 1].lon);
//			    	m_array_e.push(plst[plst.length - 1].lat);
//					m_array_e.push(plst[plst.length - 1].alt+m_upNun);
//				}else{
//					m_array_e.push(plst[0].lon);
//			    	m_array_e.push(plst[0].lat);
//					m_array_e.push(plst[0].alt+m_upNun);
//				}
//			    m_array_e.push(epoint.lon);
//		    	m_array_e.push(epoint.lat);
//				m_array_e.push(epoint.alt);
//				var positions_e = Cesium.Cartesian3.fromDegreesArrayHeights(m_array_e);
//				var m_polyline_e = self._viewer.entities.add({
//					polyline: {
//					    positions: positions_e,
//					    width: 5,
//					    material: new Cesium.PolylineDashMaterialProperty({
//				            color : Cesium.Color.ORANGE,
//				            dashLength: 8.0
//				        })
//					}
//				});
//				self._layer.push(m_polyline_e);
//				if(str == "t"){
//					self._dist += dist;
//				}else if(str == "e"){
//					self._dist += dist;
//					var m_pos = self._viewer.entities.add({
//					    position : Cesium.Cartesian3.fromDegrees(epoint.lon, epoint.lat),
//					    label:{
//					    	text:  (self._dist/1000).toFixed(2) + "km",
//					    	font:"14pt sans-serif",
//					    	horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
//					    	pixelOffset: new Cesium.Cartesian2(15, 0),
//					    	verticalOrigin : Cesium.VerticalOrigin.BASELINE,
//					        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
//					        disableDepthTestDistance : Number.POSITIVE_INFINITY
//					    }
//					});
//				    self._layer.push(m_pos);
//				    self._dist = 0;
//				}
//      	})
//      }
//  });
//}
//
///*
// * 清除
// * @author zhaoxd
// * @method clear
// * @for PathAnalyse
// * @param {null} null
// * @return {null} null
// */
//PathAnalyse.prototype.clear = function(){
//	var self = this;
//	self.selectEnd();
//	for(var i = self._layer.length - 1; i >= 0; i--){
//		self._viewer.entities.remove(self._layer[i]);
//		self._layer.pop();
//	}
//}
//
//return PathAnalyse;
//})


///*
//* author: 赵雪丹
//* description: PathAnalyse-路径分析
//* day: 2017-11-09
//*/
//define( [ ], function( ){
//function PathAnalyse(globe){
//	var self = this;
//	this._globe = globe;
//	this._viewer = globe._viewer;
//	this._globeId = globe._globeId;
//	//路径分析
//	this._path_manager = {draw:false, selectSpoint:false, spoint:null, epoint:null, subset:[]};
//	
//	//私有注册事件
//	this._handler = new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas);
//	//LEFT_CLICK 左键点击事件
//	this._handler.setInputAction(function (e) {
//		var lonlat = self._globe.getLonLatByPosition(e.position);
//		if(self._path_manager.draw){
//			if(self._path_manager.selectSpoint){
//				for(var i = self._path_manager.subset.length - 1; i >= 0; i--){
//					self._viewer.entities.remove(self._path_manager.subset[i]);
//					self._path_manager.subset.pop();
//				}
//				self._path_manager.spoint = lonlat;
//				var pinBuilder = new Cesium.PinBuilder();
//				var m_pos = self._viewer.entities.add({
//				    position : Cesium.Cartesian3.fromDegrees(lonlat.lon, lonlat.lat),
//				    billboard : {
//				        image : pinBuilder.fromText('起', Cesium.Color.RED, 48).toDataURL(),
//				        width : 30,
//				        height : 30,
//				        verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
//				        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
//				    }
//				});
//		        self._path_manager.subset[self._path_manager.subset.length] = m_pos;
//			}else{
//				self._path_manager.epoint = lonlat;
//				self._drawPathByPoints();
//			}
//  	}
//	}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
//}
//
///*
// * 根据两点进行路径分析
// * @author zhaoxd
// * @method analyseByPoints
// * @for PathAnalyse
// * @param {point} spoint:起始点
// * @param {point} spoint:结束点
// * @return {null} null
// */
//PathAnalyse.prototype.analyseByPoints = function(spoint,epoint){
//	var self = this;
//	if(spoint.alt && epoint.alt){
//		self._actionAnalyse(spoint,epoint);
//	}else{
//		var pointList = [spoint,epoint];
//		self._globe.getAltByLonlat(pointList,function(plst){
//			self._actionAnalyse(plst[0],plst[1]);
//		});
//	}
//}
//
///*
// * 开始分析
// * @author zhaoxd
// * @method _actionAnalyse
// * @for PathAnalyse
// * @param {point} spoint:起始点
// * @param {point} spoint:结束点
// * @return {null} null
// */
//PathAnalyse.prototype._actionAnalyse = function(spoint,epoint){
//	var self = this;
//	self.clear();
//	self._path_manager.spoint = spoint;
//	self._path_manager.epoint = epoint;
//	var pinBuilder = new Cesium.PinBuilder();
//	var m_pos = self._viewer.entities.add({
//	    position : Cesium.Cartesian3.fromDegrees(spoint.lon, spoint.lat),
//	    billboard : {
//	        image : pinBuilder.fromText('起', Cesium.Color.RED, 48).toDataURL(),
//	        width : 30,
//	        height : 30,
//	        verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
//	        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
//	    }
//	});
//  self._path_manager.subset[self._path_manager.subset.length] = m_pos;
//	self._drawPathByPoints();
//}
//
///*
// * 选取起始点
// * @author zhaoxd
// * @method selectSpoint
// * @for PathAnalyse
// * @param {null} null
// * @return {null} null
// */
//PathAnalyse.prototype.selectSpoint = function(){
//	var self = this;
//	self._path_manager.draw = true;
//	self._path_manager.selectSpoint = true;
//	self._path_manager.spoint = null;
//	self._path_manager.epoint = null;
//	for(var i = self._path_manager.subset.length - 1; i >= 0; i--){
//		self._viewer.entities.remove(self._path_manager.subset[i]);
//		self._path_manager.subset.pop();
//	}
//}
//
///*
// * 选取结束点
// * @author zhaoxd
// * @method selectEpoint
// * @for PathAnalyse
// * @param {null} null
// * @return {null} null
// */
//PathAnalyse.prototype.selectEpoint = function(){
//	var self = this;
//	if(self._path_manager.draw && self._path_manager.spoint){
//		self._path_manager.selectSpoint = false;
//		self._path_manager.epoint = null;
//	}else{
//		alert("请先选取起始点");
//	}
//}
//
///*
// * 清除
// * @author zhaoxd
// * @method clear
// * @for PathAnalyse
// * @param {null} null
// * @return {null} null
// */
//PathAnalyse.prototype.clear = function(){
//	var self = this;
//	self._path_manager.draw = false;
//	self._path_manager.selectSpoint = false;
//	self._path_manager.spoint = null;
//	self._path_manager.epoint = null;
//	for(var i = self._path_manager.subset.length - 1; i >= 0; i--){
//		self._viewer.entities.remove(self._path_manager.subset[i]);
//		self._path_manager.subset.pop();
//	}
//}
//
///*
// * 绘制
// * @author zhaoxd
// * @method _drawPathByPoints
// * @for PathAnalyse
// * @param {null} null
// * @return {null} null
// */
//PathAnalyse.prototype._drawPathByPoints = function(){
//	var self = this;
//	var spoint = self._path_manager.spoint;
//	var epoint = self._path_manager.epoint;
//	var m_upNun = 5;
//  $.ajax(self._globe.urlConfig.LOCALOWS,{
//      type: 'GET',
//      data: {
//          service: 'WFS',
//          version: '1.0.0',
//          request: 'GetFeature',
//          typename: "cf:roadnet",
//          outputFormat: 'application/json',
//          viewparams:'x1:'+spoint.lon+';y1:'+spoint.lat+';x2:'+epoint.lon+';y2:'+epoint.lat
//      },
//      success: function(data){
//      	if(!data.features){
//      		alert("数据获取失败，请稍后重试!");
//      		return;
//      	}
//      	var points = data.features[0].geometry.coordinates;
//      	var dist = 0;
//      	if(points.length == 2 && points[0][0] == points[1][0] && points[0][1] == points[1][1]){
//      		dist = CommonFunc.getDistance(spoint.lon,spoint.lat,epoint.lon,epoint.lat);
//      		var m_array = new Array();
//			    m_array.push(spoint.lon);
//		    	m_array.push(spoint.lat);
//				m_array.push(spoint.alt);
//			    m_array.push(epoint.lon);
//		    	m_array.push(epoint.lat);
//				m_array.push(epoint.alt);
//				var positions = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
//				var m_polyline = self._viewer.entities.add({
//					polyline: {
//					    positions: positions,
//					    width: 5,
//					    material: new Cesium.PolylineDashMaterialProperty({
//				            color : Cesium.Color.ORANGE,
//				            dashLength: 8.0
//				        })
//					}
//				});
//				self._path_manager.subset[self._path_manager.subset.length] = m_polyline;
//				var pinBuilder = new Cesium.PinBuilder();
//				var m_pos = self._viewer.entities.add({
//				    position : Cesium.Cartesian3.fromDegrees(epoint.lon, epoint.lat),
//				    billboard : {
//				        image : pinBuilder.fromText('止', Cesium.Color.RED, 48).toDataURL(),
//				        width : 30,
//				        height : 30,
//				        verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
//				        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
//				    },
//				    label:{
//				    	text:  (dist/1000).toFixed(2) + "km",
//				    	font:"14pt sans-serif",
//				    	horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
//				    	pixelOffset: new Cesium.Cartesian2(15, 0),
//				    	verticalOrigin : Cesium.VerticalOrigin.BASELINE,
//				        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
//				        disableDepthTestDistance : Number.POSITIVE_INFINITY
//				    }
//				});
//			    self._path_manager.subset[self._path_manager.subset.length] = m_pos;
//      		return;
//      	}
//      	var pointList = [];
//      	for(var i = 0; i < points.length; i++){
//      		var lon = points[i][0];
//      		var lat = points[i][1];
//      		var lonlat = {lon:lon,lat:lat,alt:2000};
//      		pointList[pointList.length] = lonlat;
//      		if(i>0){
//      			var sub_dist = CommonFunc.getDistance(points[i][0],points[i][1],points[i-1][0],points[i-1][1]);
//      			dist += sub_dist;
//      		}
//      	}
//      	self._globe.getAltByLonlat(pointList,function(plst){
//				var m_array = new Array();
//			    for(var i = 0; i < plst.length; i++){
//			    	m_array.push(plst[i].lon);
//			    	m_array.push(plst[i].lat);
//					m_array.push(plst[i].alt+m_upNun);
//			    }
//				var positions = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
//				var m_polyline = self._viewer.entities.add({
//					polyline: {
//					    positions: positions,
//					    width: 5,
//					    material: Cesium.Color.GREEN.withAlpha(1)
//					}
//				});
//				self._path_manager.subset[self._path_manager.subset.length] = m_polyline;
//				var dist1 = CommonFunc.getDistance(spoint.lon,spoint.lat,plst[0].lon,plst[0].lat);
//				dist += dist1;
//				var dist2 = CommonFunc.getDistance(spoint.lon,spoint.lat,plst[plst.length - 1].lon,plst[plst.length - 1].lat);
//				dist += dist2;
//				var m_array_s = new Array();
//				if(dist1 < dist2){
//					m_array_s.push(plst[0].lon);
//			    	m_array_s.push(plst[0].lat);
//					m_array_s.push(plst[0].alt+m_upNun);
//				}else{
//					m_array_s.push(plst[plst.length - 1].lon);
//			    	m_array_s.push(plst[plst.length - 1].lat);
//					m_array_s.push(plst[plst.length - 1].alt+m_upNun);
//				}
//			    m_array_s.push(spoint.lon);
//		    	m_array_s.push(spoint.lat);
//				m_array_s.push(spoint.alt);
//				var positions_s = Cesium.Cartesian3.fromDegreesArrayHeights(m_array_s);
//				var m_polyline_s = self._viewer.entities.add({
//					polyline: {
//					    positions: positions_s,
//					    width: 5,
//					    material: new Cesium.PolylineDashMaterialProperty({
//				            color : Cesium.Color.ORANGE,
//				            dashLength: 8.0
//				        })
//					}
//				});
//				self._path_manager.subset[self._path_manager.subset.length] = m_polyline_s;
//
//				var m_array_e = new Array();
//			    if(dist1 < dist2){
//			    	m_array_e.push(plst[plst.length - 1].lon);
//			    	m_array_e.push(plst[plst.length - 1].lat);
//					m_array_e.push(plst[plst.length - 1].alt+m_upNun);
//				}else{
//					m_array_e.push(plst[0].lon);
//			    	m_array_e.push(plst[0].lat);
//					m_array_e.push(plst[0].alt+m_upNun);
//				}
//			    m_array_e.push(epoint.lon);
//		    	m_array_e.push(epoint.lat);
//				m_array_e.push(epoint.alt);
//				var positions_e = Cesium.Cartesian3.fromDegreesArrayHeights(m_array_e);
//				var m_polyline_e = self._viewer.entities.add({
//					polyline: {
//					    positions: positions_e,
//					    width: 5,
//					    material: new Cesium.PolylineDashMaterialProperty({
//				            color : Cesium.Color.ORANGE,
//				            dashLength: 8.0
//				        })
//					}
//				});
//				self._path_manager.subset[self._path_manager.subset.length] = m_polyline_e;
//				var pinBuilder = new Cesium.PinBuilder();
//				var m_pos = self._viewer.entities.add({
//				    position : Cesium.Cartesian3.fromDegrees(epoint.lon, epoint.lat),
//				    billboard : {
//				        image : pinBuilder.fromText('止', Cesium.Color.RED, 48).toDataURL(),
//				        width : 30,
//				        height : 30,
//				        verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
//				        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
//				    },
//				    label:{
//				    	text:  (dist/1000).toFixed(2) + "km",
//				    	font:"14pt sans-serif",
//				    	horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
//				    	pixelOffset: new Cesium.Cartesian2(15, 0),
//				    	verticalOrigin : Cesium.VerticalOrigin.BASELINE,
//				        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
//				        disableDepthTestDistance : Number.POSITIVE_INFINITY
//				    }
//				});
//			    self._path_manager.subset[self._path_manager.subset.length] = m_pos;
//      	})
//      }
//  });
//}
//
//return PathAnalyse;
//})