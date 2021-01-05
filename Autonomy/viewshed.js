/**
 * @author lijy
 * @description 可视域分析
 * @day 2017年12月26日 09:30:54
 */
define( [], function(){
function Viewshed(globe){
	var self = this;
	this._globe = globe;
	this._viewer = globe._viewer;
	this._globeId = globe._globeId;
	//可视域分析
	this.viewshedOptions = {
			draw: false, 
			drawid: '', 
			n: 0, 
			vertexLineList:[],
			towerHeight: 0,
			endPoint: null
	};
	this.viewshedList = [];
	
	//私有注册事件
	this._handler = new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas);
	//LEFT_CLICK 左键点击事件
	this._handler.setInputAction(function (e) {
    	var lonlat = self._globe.getLonLatByPosition(e.position);
    	if(self.viewshedOptions.draw && self.viewshedOptions.drawid == '' && lonlat != null){//可视域分析
    		self.viewshedOptions.vertexLineList = [];
    		self.viewshedOptions.drawid = (new Date()).valueOf();
    		var vid = 'toolset-id';
    		var viewObj = {vname: 'toolset-name', vid: vid, spoint: null, epoint: null, marker: null, towerLine: null, infoWindow: null, viewshedLayers: null};
			var circle = self._viewer.entities.add({
			    position: Cesium.Cartesian3.fromDegrees(lonlat.lon, lonlat.lat),
			    radius: 0,
			    ellipse : {
			        semiMinorAxis : new Cesium.CallbackProperty(function(){ return circle.radius; }, false),
			        semiMajorAxis : new Cesium.CallbackProperty(function(){ return circle.radius; }, false),
			        material : Cesium.Color.BLUE.withAlpha(0.1)
			    }
			});
			var polyline = self._viewer.entities.add({
				polyline: {
				    positions: new Cesium.CallbackProperty(function(){ return self.viewshedOptions.vertexLineList }, false),
				    width: 3,
				    material: Cesium.Color.DARKRED.withAlpha(1)
				}
			});
			
			var label = self._viewer.entities.add({
			    position : Cesium.Cartesian3.fromDegrees(lonlat.lon, lonlat.lat),
			    distance: 0,
			    label:{
			    	text:  new Cesium.CallbackProperty(function(){ return (label.distance / 1000).toFixed(2) + "km"}, false),
			    	font:"14pt sans-serif",
			    	fillColor :Cesium.Color.YELLOW,
			    	horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
			    	pixelOffset: new Cesium.Cartesian2(15, 0),
			    	verticalOrigin : Cesium.VerticalOrigin.BASELINE,
			        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
			        disableDepthTestDistance : Number.POSITIVE_INFINITY
			    }
			});
			viewObj.circle = circle;
			viewObj.polyline = polyline;
			viewObj.label = label;
    		viewObj.spoint = lonlat;
    		self.viewshedList.push(viewObj);
    	}
    	
    	
	}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
	
	//鼠标移动事件注册
	this._handler.setInputAction(function(movement){
		var lonlat = self._globe.getLonLatByPosition(movement.endPosition);
		if(self.viewshedOptions.draw && self.viewshedOptions.drawid != ''){
			var l_viewshed = self.viewshedList[self.viewshedList.length - 1];
			var spoint = l_viewshed.spoint;
			var epoint = lonlat;
//			var left = Cesium.Cartesian3.fromDegrees(spoint.lon, spoint.lat);
//			var right = Cesium.Cartesian3.fromDegrees(epoint.lon, epoint.lat);
//			var distance = Cesium.Cartesian3.distance(left, right);
			var distance = CommonFunc.getDistance(spoint.lon, spoint.lat, epoint.lon, epoint.lat);
			l_viewshed.label.distance = distance;
			distance = distance <= 15000 ? distance : 15000;
//			if(distance < 15000){
//				self.viewshedOptions.endPoint = lonlat;
//			}else{
//				distance = 15000;
//				self.viewshedOptions.endPoint = CommonFunc.destinationVincenty(spoint.lon, spoint.lat, 0, 90, 0, 15000);
//			}
			l_viewshed.circle.radius = distance;
			l_viewshed.label.position = Cesium.Cartesian3.fromDegrees(lonlat.lon, lonlat.lat);
			var m_array = [];
			m_array.push(spoint.lon);
			m_array.push(spoint.lat);
			m_array.push(spoint.alt);
			m_array.push(epoint.lon);
			m_array.push(epoint.lat);
			m_array.push(epoint.alt);
		    self.viewshedOptions.vertexLineList = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
		}
		
	}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

	
	//RIGHT_CLICK 右键点击事件
	this._handler.setInputAction(function (e) {
		var lonlat = self._globe.getLonLatByPosition(e.position);
	  	if(lonlat.alt < 0){
			lonlat.alt = 0;
		}
	  	if(self.viewshedOptions.draw && self.viewshedOptions.drawid != ''){
//	  		self._executeDrawViewshed(self.viewshedOptions.endPoint);
	  		self._executeDrawViewshed(self.viewshedList[self.viewshedList.length - 1].circle.radius);
	  	}
	  	
	}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
	
}

/**
 * 绘制可视域
 * @method drawHandler
 * @for Viewshed
 * @param {null} null
 * @return {null} null
 */
Viewshed.prototype.drawHandler = function(height){
	var self = this;
	//可视域分析
	self.viewshedOptions.draw = true;
	self.viewshedOptions.towerHeight = parseFloat(height);
	//可视域分析清除（如果在地图上只需要一个可视域分析，放开此段代码即可）
//	for(var i = 0; i < self.viewshedList.length; i++){
//		var viewshed = self.viewshedList[i];
//		if (viewshed.viewshedLayers != null && viewshed.vname == 'toolset-name'){
//			self._viewer.imageryLayers.remove(viewshed.viewshedLayers);
//			self._globe.placeMark.remove(viewshed.marker);
//			self._viewer.entities.remove(viewshed.towerLine);
//			self._globe.infoWindow.removeById(viewshed.infoWindow);
//			self.viewshedList.splice(i, 1);
//		}
//	}	
}

/**
 * 清除可视域
 * @method clear
 * @for Viewshed
 * @param {null} null
 * @return {null} null
 */
Viewshed.prototype.clear = function(){
	var self = this;
	var tempList = [];
	var length = self.viewshedList.length;
	self.viewshedOptions.draw = false;
	for(var i = 0; i < length; i++){
		var viewshed = self.viewshedList[i];
		if(viewshed.viewshedLayers != null && viewshed.vname == 'toolset-name'){
			self._viewer.imageryLayers.remove(viewshed.viewshedLayers);
			self._globe.placeMark.remove(viewshed.marker);
			self._viewer.entities.remove(viewshed.towerLine);
			self._globe.infoWindow.removeById(viewshed.infoWindow);
		}else{
			tempList.push(viewshed);
		}
	}
	self.viewshedList.splice(0, length);
	self.viewshedList = tempList;
}

/**
 * 根据id清除可视域
 * @method clear
 * @for Viewshed
 * @param {vid} 可视域对象Id
 * @return {null} null
 */
Viewshed.prototype.removeById = function(vid){
	var self = this;
	for(var i = 0; i < self.viewshedList.length; i++){
		var viewshed = self.viewshedList[i];
		if(viewshed.vid == vid){
			self._viewer.imageryLayers.remove(viewshed.viewshedLayers);
			self._globe.placeMark.remove(viewshed.marker);
			self._viewer.entities.remove(viewshed.towerLine);
			self._globe.infoWindow.removeById(viewshed.infoWindow);
			self.viewshedList.splice(i, 1);
		}
	}
}

/**
 * 可视域分析接口(根据中心点、半径、塔高等)
 * @author lijy
 * @method add
 * @for Viewshed
 * @param {object} options 可视域分析参数
 * @return {null} null
 */
Viewshed.prototype.add = function(options){
	var self = this;
	var vid = options.vid ? options.vid : "add-vid";
	var lon = options.lon ? parseFloat(options.lon) : 0;
	var lat = options.lat ? parseFloat(options.lat) : 0;
	var name = options.name ? options.name : 'add-name';
	var radius = options.radius ? parseFloat(options.radius) : 0;
	var towerHeight = options.towerHeight ? parseFloat(options.towerHeight) : 0;
	var callback = options.callback ? options.callback : null;
	var spoint = {lon: lon, lat: lat};
	var pointList = [spoint];
	var option = {spoint: spoint, radius: radius, towerHeight: towerHeight, vid: vid, vname: name, self: self, callback: callback};
	self._globe.getAltByLonlat(pointList, self._callback, option);
}

/**
 * 根据经纬度获取高程的回调函数
 */
Viewshed.prototype._callback = function(updatedPositions, option){
	var self = this;
	var spoint = {lon: option.spoint.lon, lat: option.spoint.lat, alt: updatedPositions[0].alt};
	var viewObj = {vname: option.vname, vid: option.vid, spoint: spoint, epoint: null, marker: null, towerLine: null, infoWindow: null, viewshedLayers: null};
	option.self._executeViewshed(viewObj, spoint, option.radius, option.towerHeight, option.callback);
	
}

/**
 * 可视域分析(绘制时调用)
 * @author lijy
 * @method _executeDrawViewshed
 * @for Viewshed
 * @param {object} self toolset对象
 * @param {object} lonlat 点对象
 * @return {null} null
 */
Viewshed.prototype._executeDrawViewshed = function(radius){
	var self = this;
	var towerHeight = self.viewshedOptions.towerHeight;
	var vieshed = self.viewshedList[self.viewshedList.length - 1];
//	var vid = vieshed.circle.id;
	self._viewer.entities.remove(vieshed.circle);
	self._viewer.entities.remove(vieshed.polyline);
	self._viewer.entities.remove(vieshed.label);
//	vieshed.epoint = lonlat;
	var spoint = vieshed.spoint;
//	var epoint = vieshed.epoint;
//	var left = Cesium.Cartesian3.fromDegrees(spoint.lon, spoint.lat);
//	var right = Cesium.Cartesian3.fromDegrees(epoint.lon, epoint.lat);
//	var radius = Cesium.Cartesian3.distance(left, right);
//	var radius = CommonFunc.getDistance(spoint.lon, spoint.lat, epoint.lon, epoint.lat);
	self._executeViewshed(vieshed, spoint, radius, towerHeight, null);
	self.viewshedOptions.draw = false;
	self.viewshedOptions.drawid = '';
}

/**
 * 可视域分析
 * @author lijy
 * @method _executeViewshed
 * @for Viewshed
 * @param {object} self toolset对象
 * @param {object} lonlat 点对象
 * @return {null} null
 */
Viewshed.prototype._executeViewshed = function(viewObj, spoint, radius, towerHeight, callback){
	var self = this;
	var midNum;
	var radiusText;
	//var serverUrl = 'http://localhost:8090/cfservice';
	var serverUrl = self._globe.urlConfig.LOCALVIEWSHED;
	var n = CommonFunc.destinationVincenty(spoint.lon, spoint.lat, 0, 0, 0, radius);
	var e = CommonFunc.destinationVincenty(spoint.lon, spoint.lat, 0, 90, 0, radius);
	var b = Math.ceil((n.lat - spoint.lat) * 3600);
	var a = Math.ceil((e.lon - spoint.lon) * 3600);
	//midNum = Math.floor(radius / 30);//中心点到边界的点数
	midNum = a;
	if(midNum % 2 != 0) midNum += 1;
	a = midNum;
//	if(midNum > 500) midNum = 500;
	radiusText = (parseFloat(radius) / 1000).toFixed(2)  + "km";

	var imgName = 'image' + (new Date()).valueOf() + '.png';
	var data = {lon: spoint.lon, lat: spoint.lat, imgName: imgName, midNum: midNum, towerHeight: towerHeight, a: a, b: b};
	$.ajax({
			type: "post",
			url: serverUrl + '/viewshed/execute.do',
			data: data,
			//async: false,
			success: function(data){
				if(data !== null){
					var data = JSON.parse(data);
					var percent = data.percent;
					var flag = true;//是否显示infowindow
					if(percent != -1){
						var options = {
								lon: spoint.lon, lat: spoint.lat, width:15, height: 15,
								leftClick: function () {
									if (flag) {
										var towerPoint;
										if(towerHeight > 0){
											towerPoint = {lon: spoint.lon, lat: spoint.lat, alt: (spoint.alt+towerHeight)};
											var pointList = [spoint, towerPoint];
											var m_array = [];
											for (var i = 0; i < pointList.length; i++) {
												m_array.push(pointList[i].lon);
												m_array.push(pointList[i].lat);
												m_array.push(pointList[i].alt);
											}
											viewObj.towerLine = self._viewer.entities.add({
												polyline: {
												    positions: Cesium.Cartesian3.fromDegreesArrayHeights(m_array),
												    material : new Cesium.PolylineDashMaterialProperty({
											            color: Cesium.Color.YELLOW
											        })
												}
											});
										}
										var des = '<table><tr><td>视高：</td><td>' + towerHeight + '米' + '</td></tr>'
									      +'<tr><td>半径：</td><td>' + radiusText + '</td></tr>'
									      +'<tr><td>经度：</td><td>' + spoint.lon.toFixed(4) + '度' + '</td></tr>'
									      +'<tr><td>纬度：</td><td>' + spoint.lat.toFixed(4) + '度'  + '</td></tr>'
									      +'<tr><td>可视：</td><td>' + percent.toFixed(2) + '%'  + '</td></tr></table>';
										var infoWindowPoint;
										if(towerPoint){
											infoWindowPoint = towerPoint;
										}else{
											infoWindowPoint = spoint;
										}
										var options = {
												lonlat: infoWindowPoint,
												des:des,
												width: 170,
												height: 125,
												showClose: true,
												title: "可视域信息",
												top: 24,
												afterClose: function () {
													flag = true;
													self._viewer.entities.remove(viewObj.towerLine);
												}
										};
										viewObj.infoWindow = self._globe.infoWindow.build(options);
										flag = false;
										
									}
									
								}
						};
						viewObj.marker = self._globe.placeMark.add(options);
						
						var pn = CommonFunc.destinationVincenty(spoint.lon, spoint.lat, 0, 0, 0, radius);
						var pe = CommonFunc.destinationVincenty(spoint.lon, spoint.lat, 0, 90, 0, radius);
						var ps = CommonFunc.destinationVincenty(spoint.lon, spoint.lat, 0, 180, 0, radius);
						var pw = CommonFunc.destinationVincenty(spoint.lon, spoint.lat, 0, 270, 0, radius);
						
						var startLon = pw.lon;
						var startLat = ps.lat;
						var endLon = pe.lon;
						var endLat = pn.lat;
						
					    var layers = self._viewer.imageryLayers;
						viewObj.viewshedLayers = layers.addImageryProvider(new Cesium.SingleTileImageryProvider({
						    url : serverUrl + '/static/viewshedImg/' + imgName,
						    rectangle : Cesium.Rectangle.fromDegrees(startLon, startLat, endLon, endLat)
						}));
						viewObj.viewshedLayers.alpha = 0.5;
						
						/*var redRectangle = self._viewer.entities.add({
						    name : 'Red translucent rectangle',
						    rectangle : {
						        coordinates : Cesium.Rectangle.fromDegrees(startLon, startLat, endLon, endLat),
						        material : Cesium.Color.RED.withAlpha(0.2)
						    }
						});*/
						
						if(viewObj.vname == 'toolset-name'){
							self.viewshedList[self.viewshedList.length - 1] = viewObj;
						}else{
							self.viewshedList.push(viewObj);
						}
						if(callback) callback(true);
					}else{
						alert("此地区没有dem数据!");
						if(callback) callback(false);
					}
					
			}else{
				if(callback) callback(false);
			}
		},
		error: function(){
			if(callback) callback(false);
		}
	});
}

return Viewshed;
})