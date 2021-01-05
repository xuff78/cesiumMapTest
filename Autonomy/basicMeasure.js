/**
 * @author lijy
 * @Date 2017年9月29日
 * @Description 基础量算
 */
define( [], function(){
function BasicMeasure(globe){
	this._globe = globe;
	this._viewer = globe._viewer;
	this._globeId = globe._globeId;
	this._handler = new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas);
	//STK级别
	this._stkLevel = 14;
	
	//距离测量
	this._disOptions = {draw:false, drawid:'', pointList:[], polyLineList:[], disLabel:null};
	//面积测量
	this._areaOptions = {draw:false, drawid:'', pointList:[], areaObj:null, disLabel:null, callback: null};
	//高度测量
	this._heightOptions = {draw:false, drawid:'', pointList:[], heightObj:null, hLabel:null, vLabel:null};
	this._showMenu;//记录右键状态
	var self_globe = this._globe;
	var self = this;
	//鼠标左键事件注册
	this._handler.setInputAction(function(e){
		var lonlat = self_globe.getLonLatByPosition(e.position);
		if(self._disOptions.draw){//left测距
			if(self._disOptions.drawid == ""){
    			self._disOptions.pointList.splice(0);
    			if(self._disOptions.polyLineList[0]){
    				self._disOptions.polyLineList[0].vertexLineList.splice(0);
    			}
    			self._viewer.entities.remove(self._disOptions.disLabel);
    			self._disOptions.pointList.push(lonlat);
				var m_obj = {polyline:null, vertexList:null};
				m_obj.polyline = self._viewer.entities.add({
					name:'disPolyline',
					polyline: {
					    positions: new Cesium.CallbackProperty(function(){ return m_obj.vertexLineList; }, false),
					    width: 3,
					    material: Cesium.Color.DARKRED.withAlpha(1)
					}
				});
				self._disOptions.polyLineList.push(m_obj);
				self._disOptions.drawid = m_obj.polyline.id;
			}else{
				self._disOptions.pointList.push(lonlat);
				var m_array = new Array();
				for(var i = 0; i < self._disOptions.pointList.length; i++){
					var point = self._disOptions.pointList[i];
					m_array.push(point.lon);
					m_array.push(point.lat);
					m_array.push(point.alt + 0.5);
				}
				self._disOptions.polyLineList[0].vertexLineList = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
			}
		}else if(self._areaOptions.draw){//left测面积
			if(self._areaOptions.drawid == ""){
    			if(self._areaOptions.areaObj){
    				self._areaOptions.areaObj.vertexLineList.splice(0);
    				self._areaOptions.areaObj.vertexList.splice(0);
    			}
    			self._areaOptions.pointList.splice(0);
    			self._viewer.entities.remove(self._areaOptions.areaLabel);
    			self._areaOptions.pointList.push(lonlat);
				var m_obj = {polygon:null,polyline:null, vertexList:null, vertexLineList:null};
				m_obj.polygon = self._viewer.entities.add({
			        name:'areaPolygon',
			        show:false,
			        polygon: {
			            hierarchy: new Cesium.CallbackProperty(function(){ return m_obj.vertexList; }, false),
			            //extrudedHeight:5000,
			            material: Cesium.Color.YELLOW.withAlpha(0.3),
			        }
			    });
			    m_obj.polyline = self._viewer.entities.add({
			        name:'areaPolyline',
			        polyline: {
			            positions: new Cesium.CallbackProperty(function(){ return m_obj.vertexLineList; }, false),
			            width: 4,
			            material: Cesium.Color.LIME
			        }
			    });
			    self._areaOptions.areaObj = m_obj;
				self._areaOptions.drawid = m_obj.polyline.id;
			}else{
				self._areaOptions.pointList.push(lonlat);
				var m_array = new Array();
				var m_arrayLine = new Array();
				for(var i = 0; i < self._areaOptions.pointList.length; i++){
					var point = self._areaOptions.pointList[i];
					m_array.push(point.lon);
					m_array.push(point.lat);
					m_array.push(point.alt + 5);
					m_arrayLine.push(point.lon);
			    	m_arrayLine.push(point.lat);
					m_arrayLine.push(point.alt + 5);
				}
				m_arrayLine.push(self._areaOptions.pointList[0].lon);
		    	m_arrayLine.push(self._areaOptions.pointList[0].lat);
				m_arrayLine.push(self._areaOptions.pointList[0].alt + 5);
				self._areaOptions.areaObj.vertexList = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
				self._areaOptions.areaObj.vertexLineList = Cesium.Cartesian3.fromDegreesArrayHeights(m_arrayLine);
			}
		}else if(self._heightOptions.draw){//left测高
			if(self._heightOptions.drawid == ''){
    			//第一次点击
    			//删除上一次绘制的测高
    			self._heightOptions.pointList.splice(0);
    			if(self._heightOptions.heightObj){
    				self._heightOptions.heightObj.s_vertexLineList.splice(0);
        			self._heightOptions.heightObj.h_vertexLineList.splice(0);
        			self._heightOptions.heightObj.v_vertexLineList.splice(0);
        			self._viewer.entities.remove(self._heightOptions.heightObj.s_polyline);
        			self._viewer.entities.remove(self._heightOptions.heightObj.h_polyline);
        			self._viewer.entities.remove(self._heightOptions.heightObj.v_polyline);
    			}
    			self._viewer.entities.remove(self._heightOptions.hLabel);
    			self._viewer.entities.remove(self._heightOptions.vLabel);
    			self._heightOptions.hLabel = null;
    			self._heightOptions.vLabel = null;
    			self._heightOptions.pointList.push(lonlat);
    			var m_obj = {s_polyline:null, s_vertexLineList:null, h_polyline:null, h_vertexLineList:null, v_polyline:null, v_vertexLineList:null};
    			//空间
    			m_obj.s_polyline = self._viewer.entities.add({
			        name:'sPolyline',
			        polyline: {
			            positions: new Cesium.CallbackProperty(function(){ return m_obj.s_vertexLineList; }, false),
			            width: 3,
			            material: Cesium.Color.LIME
			        }
			    });
    			//水平
    			m_obj.h_polyline = self._viewer.entities.add({
			        name:'hPolyline',
			        polyline: {
			            positions: new Cesium.CallbackProperty(function(){ return m_obj.h_vertexLineList; }, false),
			            width: 3,
			            material: Cesium.Color.LIME
			        }
			    });
    			//垂直
    			m_obj.v_polyline = self._viewer.entities.add({
			        name:'vPolyline',
			        polyline: {
			            positions: new Cesium.CallbackProperty(function(){ return m_obj.v_vertexLineList; }, false),
			            width: 3,
			            material: Cesium.Color.LIME
			        }
			    });

    			self._heightOptions.heightObj = m_obj;
    			self._heightOptions.drawid = m_obj.s_polyline.id;

    		}else{
    			//第二次点击
    			self._heightOptions.draw = false;
    			self._heightOptions.drawid = '';
    			self._heightOptions.pointList.push(lonlat);
    			self._drawHeight(self._heightOptions.pointList);
    		}
		}
		
	}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
	
	//鼠标移动事件注册
	this._handler.setInputAction(function(movement){
		var lonlat = self_globe.getLonLatByPosition(movement.endPosition);
		if(self._disOptions.draw){//move测距
			if(self._disOptions.polyLineList.length > 0 && self._disOptions.drawid !== ''){

    		    var m_pointList = self._disOptions.pointList.slice(0);
    		    m_pointList.push(lonlat);
        		var m_array = new Array();
        		for(var i = 0; i < m_pointList.length; i++){
        			var point = m_pointList[i];
        			m_array.push(point.lon);
    		    	m_array.push(point.lat);
    				m_array.push(point.alt+0.5);
        		}
        		self._disOptions.polyLineList[0].vertexLineList = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
    		}
		}else if(self._areaOptions.draw){//move测面积
			if(self._areaOptions.drawid !== ''){
    			var m_pointList = self._areaOptions.pointList.slice(0);
    			m_pointList.push(lonlat);
    			var m_array = new Array();
				var m_arrayLine = new Array();
				for(var k = 0; k < m_pointList.length; k++){
			    	m_array.push(m_pointList[k].lon);
			    	m_array.push(m_pointList[k].lat);
					m_array.push(m_pointList[k].alt);
					m_arrayLine.push(m_pointList[k].lon);
			    	m_arrayLine.push(m_pointList[k].lat);
					m_arrayLine.push(m_pointList[k].alt + 1);
			    }
			    if(m_pointList.length > 2){
			    	m_arrayLine.push(m_pointList[0].lon);
			    	m_arrayLine.push(m_pointList[0].lat);
					m_arrayLine.push(m_pointList[0].alt + 1);
			    }
				self._areaOptions.areaObj.vertexList = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
				self._areaOptions.areaObj.vertexLineList = Cesium.Cartesian3.fromDegreesArrayHeights(m_arrayLine);
    		}
		}else if(self._heightOptions.draw){//move测高
			if(self._heightOptions.drawid !== ''){
    			var m_pointList = self._heightOptions.pointList.slice(0);
    			m_pointList.push(lonlat);
    			self._drawHeight(m_pointList);
    		}
		}
		
	}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
	
	//鼠标右键事件注册
	this._handler.setInputAction(function(e){
		var lonlat = self_globe.getLonLatByPosition(e.position);
		if(lonlat.alt < 0){
			lonlat.alt = 0;
		}
		if(self._disOptions.draw){//right测距
			self._disOptions.pointList.push(lonlat);
			var distance = 0;//距离
			var m_length = 500;
			var m_terrainSamplePositions = [];
			for(var i = 1; i < self._disOptions.pointList.length; i++){
				var startPoint = self._disOptions.pointList[i-1];
				var endPoint = self._disOptions.pointList[i];
				var startLon = Cesium.Math.toRadians(startPoint.lon);
		  		var startlat = Cesium.Math.toRadians(startPoint.lat);
		        var endLon = Cesium.Math.toRadians(endPoint.lon);
		  		var endlat = Cesium.Math.toRadians(endPoint.lat);
		  		for (var m = 0; m < m_length; m++) {
	            	var m_lon = Cesium.Math.lerp(startLon, endLon, m / (m_length - 1));
	            	var m_lat = Cesium.Math.lerp(startlat, endlat, m / (m_length - 1));
	            	var m_position = new Cesium.Cartographic(m_lon, m_lat);
	            	m_terrainSamplePositions.push(m_position);
	            }
			}
			var promise = Cesium.sampleTerrain(self._viewer.terrainProvider, self._stkLevel, m_terrainSamplePositions);
		    Cesium.when(promise, function(updatedPositions) {
		    	for(var n = 0; n < updatedPositions.length; n++){
		    		updatedPositions[n].lon = CommonFunc.deg(updatedPositions[n].longitude);
		    		updatedPositions[n].lat = CommonFunc.deg(updatedPositions[n].latitude);
		    		if(typeof(updatedPositions[n].height) !== "undefined"){
		    			updatedPositions[n].alt = updatedPositions[n].height;
		    		}else{
		    			updatedPositions[n].alt = 0;
		    		}
		    	}
		    	for(var j = 1; j < updatedPositions.length; j++){
		    		var startPoint = updatedPositions[j-1];
					var endPoint = updatedPositions[j];
					var left = Cesium.Cartesian3.fromRadians(startPoint.longitude, startPoint.latitude);
					var right = Cesium.Cartesian3.fromRadians(endPoint.longitude, endPoint.latitude);
					distance += Cesium.Cartesian3.distance(left, right);
		    	}
		    	var m_array = new Array();
			    for(var k = 0; k < updatedPositions.length; k++){
			    	m_array.push(updatedPositions[k].lon);
			    	m_array.push(updatedPositions[k].lat);
					m_array.push(updatedPositions[k].alt+0.5);
			    }
			    var disText;
			    if(distance > 1000){
			    	disText = (distance/1000).toFixed(2) + "km";
			    }else{
			    	disText = Math.round(distance) + "m";
			    }
				self._disOptions.polyLineList[0].vertexLineList = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
				self._disOptions.disLabel = self._viewer.entities.add({
				    position : Cesium.Cartesian3.fromDegrees(lonlat.lon, lonlat.lat),
				    label:{
				    	text: disText,
				    	font:"14pt sans-serif",
				    	fillColor :Cesium.Color.YELLOW,
				    	horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
				    	pixelOffset: new Cesium.Cartesian2(15, 0),
				    	verticalOrigin : Cesium.VerticalOrigin.BASELINE,
				        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
				        disableDepthTestDistance : Number.POSITIVE_INFINITY
				    }
				});

		    });

			self._disOptions.drawid = "";
			self._disOptions.draw = false;
			self._globe.globeMenu.setType(self._showMenu);
		}else if(self._areaOptions.draw){//right测面积
			var temp = self._areaOptions.pointList[self._areaOptions.pointList.length - 1];
    		if(temp.lon != lonlat.lon && temp.lat != lonlat.lat){
    			self._areaOptions.pointList.push(lonlat);
    		}
    		var m_length = 500;
    		var m_terrainSamplePositions = [];

    		if(self._areaOptions.pointList.length > 2){
    			var m_array = new Array();
    			var m_arrayLine = new Array();
    			for(var i = 0; i < self._areaOptions.pointList.length; i++){
    				var point = self._areaOptions.pointList[i];
    				m_array.push(point.lon);
    				m_array.push(point.lat);
    				m_array.push(point.alt);
    			}

    			/*for(var i = 1; i < self._areaOptions.pointList.length; i++){
    			    var startPoint = self._areaOptions.pointList[i-1];
    			    var endPoint = self._areaOptions.pointList[i];
    			    var startLon = Cesium.Math.toRadians(startPoint.lon);
    			    var startlat = Cesium.Math.toRadians(startPoint.lat);
    			    var endLon = Cesium.Math.toRadians(endPoint.lon);
    			    var endlat = Cesium.Math.toRadians(endPoint.lat);
    			    for (var m = 0; m < m_length; m++) {
    			        var m_lon = Cesium.Math.lerp(startLon, endLon, m / (m_length - 1));
    			        var m_lat = Cesium.Math.lerp(startlat, endlat, m / (m_length - 1));
    			        var m_position = new Cesium.Cartographic(m_lon, m_lat);
    			        m_terrainSamplePositions.push(m_position);
    			    }

    			}
    			//最后一点与第一点
    			for(var n = 0; n < m_length; n++){
    		    	var lastPoint = self._areaOptions.pointList[self._areaOptions.pointList.length - 1];
    			    var lastLon = Cesium.Math.toRadians(lastPoint.lon);
    			    var lastLat = Cesium.Math.toRadians(lastPoint.lat);
    			    var firstPoint = self._areaOptions.pointList[0];
    			    var firstLon = Cesium.Math.toRadians(firstPoint.lon);
    			    var firstLat = Cesium.Math.toRadians(firstPoint.lat);
    			    var last_lon = Cesium.Math.lerp(lastLon, firstLon, n / (m_length - 1));
    			    var last_lat = Cesium.Math.lerp(lastLat, firstLat, n / (m_length - 1));
    			    var last_position = new Cesium.Cartographic(last_lon, last_lat);
    		        m_terrainSamplePositions.push(last_position);
    		    }

    			var promise = Cesium.sampleTerrain(self._viewer.terrainProvider, self._stkLevel, m_terrainSamplePositions);
    			Cesium.when(promise, function(updatedPositions) {
    			    for(var n = 0; n < updatedPositions.length; n++){
    			        updatedPositions[n].lon = CommonFunc.deg(updatedPositions[n].longitude);
    			        updatedPositions[n].lat = CommonFunc.deg(updatedPositions[n].latitude);
    			        if(typeof(updatedPositions[n].height) !== "undefined"){
    		    			updatedPositions[n].alt = updatedPositions[n].height;
    		    		}else{
    		    			updatedPositions[n].alt = 0;
    		    		}
    			    }
    			    var m_array = new Array();
    			    for(var k = 0; k < updatedPositions.length; k++){
    			        m_array.push(updatedPositions[k].lon);
    			        m_array.push(updatedPositions[k].lat);
    			        m_array.push(updatedPositions[k].alt);
    			    }
    			    self._areaOptions.areaObj.vertexLineList = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
    			});
*/
    			self._areaOptions.areaObj.vertexList = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
        		self._areaOptions.areaObj.polygon.show = true;
        		self._areaOptions.areaObj.polyline.show = false;
        		var pointArr = self._areaOptions.pointList.slice(0);

        		var area = self._calculateArea(pointArr);
        		var areaText = area/1000000 < 0 ? (area/1000000).toFixed(4) : (area/1000000).toFixed(2);

        		self._areaOptions.areaLabel = self._viewer.entities.add({
    			    position : Cesium.Cartesian3.fromDegrees(lonlat.lon, lonlat.lat),
    			    label:{
    			    	text: areaText + "km²",
    			    	font:"14pt sans-serif",
    			    	fillColor :Cesium.Color.YELLOW,
    			    	horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
    			    	pixelOffset: new Cesium.Cartesian2(15, 0),
    			    	verticalOrigin : Cesium.VerticalOrigin.BASELINE,
    			        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
    			        disableDepthTestDistance : Number.POSITIVE_INFINITY
    			    }
    			});
        		self._areaOptions.drawid = '';
        		self._areaOptions.draw = false;
        		if(self._areaOptions.callback) self._areaOptions.callback(self._areaOptions.areaObj);
        		self._globe.globeMenu.setType(self._showMenu);
    		}
    		
		}else if(self._heightOptions.draw){//right测高
			self._heightOptions.draw = false;
			self._heightOptions.drawid = '';
			self._heightOptions.pointList.push(lonlat);
			self._drawHeight(self._heightOptions.pointList);
			self._globe.globeMenu.setType(self._showMenu);
		}
		
	}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

}

/**
 * 测距方法
 * @author lijy
 * @method measureDis
 * @for BasicMeasure
 * @param {null} null
 * @return {null} null
 */
BasicMeasure.prototype.measureDis = function(){
	var self = this;
	self._disOptions.draw = true;
	self._showMenu = self._globe.globeMenu._showMenu;
	self._globe.globeMenu.setType(false);
}

/**
 * 清除测距要素
 * @author lijy
 * @method removeMeasureDis
 * @for BasicMeasure
 * @param {null} null
 * @return {null} nul
 */
BasicMeasure.prototype.removeMeasureDis = function(){
	var self = this;
	self._disOptions.draw = false;
	self._disOptions.drawid = '';
	self._disOptions.pointList.splice(0);
	if(self._disOptions.polyLineList.length > 0){
		self._viewer.entities.remove(self._disOptions.polyLineList[0].polyline);
	}
	self._viewer.entities.remove(self._disOptions.disLabel);
	self._disOptions.polyLineList.splice(0);
	self._disOptions.disLabel = null;
}

/**
 * 测面方法
 * @author lijy
 * @method measureArea
 * @for BasicMeasure
 * @param {null} null
 * @return {null} null
 */
BasicMeasure.prototype.measureArea = function(callback){
	var self = this;
	self._areaOptions.draw = true;
	if(callback){
		self._areaOptions.callback = callback;
	}
	self._showMenu = self._globe.globeMenu._showMenu;
	self._globe.globeMenu.setType(false);
}

/**
 * 测面方法(添加)
 * @author lijy
 * @method addMeasureArea
 * @for BasicMeasure
 * @param {options} 测面的参数
 * @return {null} null
 */
BasicMeasure.prototype.addMeasureArea = function(options){
	var callback = options.callback ? options.callback : null;
	var pointList = options.pointList ? options.pointList : [];
	var self = this;
	var m_array = new Array();
	var m_arrayLine = new Array();
	for(var i = 0; i < pointList.length; i++){
		var point = pointList[i];
		m_array.push(point.lon);
		m_array.push(point.lat);
		m_array.push(point.alt + 200);
	}
	var area = self._calculateArea(pointList);
	var m_obj = {polygon: null, polyline: null, areaLabel: null, vertexLineList: null};
	m_obj.polygon = self._viewer.entities.add({
        name:'areaPolygonAdd',
        show:true,
        polygon: {
            hierarchy: Cesium.Cartesian3.fromDegreesArrayHeights(m_array),
            material: Cesium.Color.YELLOW.withAlpha(0.3),
        }
    });
    m_obj.polyline = self._viewer.entities.add({
        name:'areaPolyline',
        polyline: {
            positions: new Cesium.CallbackProperty(function(){ return m_obj.vertexLineList; }, false),
            width: 4,
            material: Cesium.Color.LIME
        }
    });
    m_obj.areaLabel = self._viewer.entities.add({
	    position : Cesium.Cartesian3.fromDegrees(pointList[pointList.length - 1].lon, pointList[pointList.length - 1].lat),
	    label:{
	    	text: (area/1000000).toFixed(2) + "km²",
	    	font:"14pt sans-serif",
	    	fillColor :Cesium.Color.YELLOW,
	    	horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
	    	pixelOffset: new Cesium.Cartesian2(15, 0),
	    	verticalOrigin : Cesium.VerticalOrigin.BASELINE,
	        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
	        disableDepthTestDistance : Number.POSITIVE_INFINITY
	    }
	});
	
    var m_length = 500;
	var m_terrainSamplePositions = [];
	for(var i = 1; i < pointList.length; i++){
	    var startPoint = pointList[i-1];
	    var endPoint = pointList[i];
	    var startLon = Cesium.Math.toRadians(startPoint.lon);
	    var startlat = Cesium.Math.toRadians(startPoint.lat);
	    var endLon = Cesium.Math.toRadians(endPoint.lon);
	    var endlat = Cesium.Math.toRadians(endPoint.lat);
	    for (var m = 0; m < m_length; m++) {
	        var m_lon = Cesium.Math.lerp(startLon, endLon, m / (m_length - 1));
	        var m_lat = Cesium.Math.lerp(startlat, endlat, m / (m_length - 1));
	        var m_position = new Cesium.Cartographic(m_lon, m_lat);
	        m_terrainSamplePositions.push(m_position);
	    }

	}
	//最后一点与第一点
	for(var n = 0; n < m_length; n++){
    	var lastPoint = pointList[pointList.length - 1];
	    var lastLon = Cesium.Math.toRadians(lastPoint.lon);
	    var lastLat = Cesium.Math.toRadians(lastPoint.lat);
	    var firstPoint = pointList[0];
	    var firstLon = Cesium.Math.toRadians(firstPoint.lon);
	    var firstLat = Cesium.Math.toRadians(firstPoint.lat);
	    var last_lon = Cesium.Math.lerp(lastLon, firstLon, n / (m_length - 1));
	    var last_lat = Cesium.Math.lerp(lastLat, firstLat, n / (m_length - 1));
	    var last_position = new Cesium.Cartographic(last_lon, last_lat);
        m_terrainSamplePositions.push(last_position);
    }

	var promise = Cesium.sampleTerrain(self._viewer.terrainProvider, self._stkLevel, m_terrainSamplePositions);
	Cesium.when(promise, function(updatedPositions) {
	    for(var n = 0; n < updatedPositions.length; n++){
	        updatedPositions[n].lon = CommonFunc.deg(updatedPositions[n].longitude);
	        updatedPositions[n].lat = CommonFunc.deg(updatedPositions[n].latitude);
	        if(typeof(updatedPositions[n].height) !== "undefined"){
    			updatedPositions[n].alt = updatedPositions[n].height;
    		}else{
    			updatedPositions[n].alt = 0;
    		}
	    }
	    var m_array = new Array();
	    for(var k = 0; k < updatedPositions.length; k++){
	        m_array.push(updatedPositions[k].lon);
	        m_array.push(updatedPositions[k].lat);
	        m_array.push(updatedPositions[k].alt+10);
	    }
	    m_obj.vertexLineList = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
	});
    
	if(callback) callback(m_obj);
	
	return m_obj;
}

/**
 * 测面方法(删除通过addMeasureArea添加的测面)
 * @author lijy
 * @method addMeasureArea
 * @for BasicMeasure
 * @param {options} 测面的参数
 * @return {null} null
 */
BasicMeasure.prototype.removeArea = function(obj){
	var self = this;
	self._viewer.entities.remove(obj.polyline);
	self._viewer.entities.remove(obj.polygon);
	self._viewer.entities.remove(obj.areaLabel);
}

/**
 * 清除面积测量要素
 * @author lijy
 * @method removeMeasureArea
 * @for BasicMeasure
 * @param {null} null
 * @return {null} null
 */
BasicMeasure.prototype.removeMeasureArea = function(){
	var self = this;
	self._areaOptions.draw = false;
	self._areaOptions.drawid = '';
	self._areaOptions.pointList.splice(0);
	if(self._areaOptions.areaObj){
		self._viewer.entities.remove(self._areaOptions.areaObj.polyline);
		self._viewer.entities.remove(self._areaOptions.areaObj.polygon);
	}
	self._viewer.entities.remove(self._areaOptions.areaLabel);
	self._areaOptions.areaObj = null;
	self._areaOptions.areaLabel = null;
}

/**
 * 测高方法
 * @author lijy
 * @method measureHight
 * @for BasicMeasure
 * @param {null} null
 * @return {null} null
 */
BasicMeasure.prototype.measureHeight = function(clampMode){
	var self = this;
	self._heightOptions.draw = true;
	self._showMenu = self._globe.globeMenu._showMenu;
	self._globe.globeMenu.setType(false);
}

/**
 * 清除高度测量要素
 * @author lijy
 * @method removeMeasureHeight
 * @for BasicMeasure
 * @param {null} null
 * @return {null} null
 */
BasicMeasure.prototype.removeMeasureHeight = function(){
	var self = this;
	self._heightOptions.pointList.splice(0);
	if(self._heightOptions.heightObj){
		self._heightOptions.heightObj.s_vertexLineList.splice(0);
		self._heightOptions.heightObj.h_vertexLineList.splice(0);
		self._heightOptions.heightObj.v_vertexLineList.splice(0);
		self._viewer.entities.remove(self._heightOptions.heightObj.s_polyline);
		self._viewer.entities.remove(self._heightOptions.heightObj.h_polyline);
		self._viewer.entities.remove(self._heightOptions.heightObj.v_polyline);
	}
	self._viewer.entities.remove(self._heightOptions.hLabel);
	self._viewer.entities.remove(self._heightOptions.vLabel);
	self._heightOptions.hLabel = null;
	self._heightOptions.vLabel = null;
	self._heightOptions.draw = false;
	self._heightOptions.drawid = '';
}

/**********************私有方法***************************/
//测高绘制线，label
BasicMeasure.prototype._drawHeight = function(pointList){
	var self = this;
	var s_array = new Array();
	var h_array = new Array();
	var h_pointList = new Array();
	var v_array = new Array();
	var v_pointList = new Array();
	var s_distance;
	var h_distance;
	var v_distance;
	s_array.push(pointList[0].lon);
  s_array.push(pointList[0].lat);
  s_array.push(pointList[0].alt);
  s_array.push(pointList[pointList.length - 1].lon);
  s_array.push(pointList[pointList.length - 1].lat);
  s_array.push(pointList[pointList.length - 1].alt);
	self._heightOptions.heightObj.s_vertexLineList = Cesium.Cartesian3.fromDegreesArrayHeights(s_array);
	var startPoint = pointList[0];
	var endPoint = pointList[pointList.length - 1];
	var s_left = Cesium.Cartesian3.fromDegrees(startPoint.lon, startPoint.lat, startPoint.alt);
	var s_right = Cesium.Cartesian3.fromDegrees(endPoint.lon, endPoint.lat, endPoint.alt);
	s_distance = Cesium.Cartesian3.distance(s_left, s_right);
	var firstPoint;
	var secondPoint;
	var thirdPoint;
	if(startPoint.alt < endPoint.alt){
	    firstPoint = startPoint;
	    secondPoint = endPoint;
	}else{
	    firstPoint = endPoint;
	    secondPoint = startPoint;
	}
	thirdPoint = {lon: firstPoint.lon, lat: firstPoint.lat, alt: secondPoint.alt};
	h_pointList.push(secondPoint);
	h_pointList.push(thirdPoint);
	var h_left = Cesium.Cartesian3.fromDegrees(secondPoint.lon, secondPoint.lat, secondPoint.alt);
	var h_right = Cesium.Cartesian3.fromDegrees(thirdPoint.lon, thirdPoint.lat, thirdPoint.alt);
	h_distance = Cesium.Cartesian3.distance(h_left, h_right);
	for(var i = 0; i < h_pointList.length; i++){
	    var point = h_pointList[i];
	    h_array.push(point.lon);
	    h_array.push(point.lat);
	    h_array.push(point.alt);
	}
	self._heightOptions.heightObj.h_vertexLineList = Cesium.Cartesian3.fromDegreesArrayHeights(h_array);

	v_pointList.push(firstPoint);
	v_pointList.push(thirdPoint);
	var v_left = Cesium.Cartesian3.fromDegrees(firstPoint.lon, firstPoint.lat, firstPoint.alt);
	var v_right = Cesium.Cartesian3.fromDegrees(thirdPoint.lon, thirdPoint.lat, thirdPoint.alt);
	v_distance = Cesium.Cartesian3.distance(v_left, v_right);
	for(var i = 0; i < v_pointList.length; i++){
	    var point = v_pointList[i];
	    v_array.push(point.lon);
	    v_array.push(point.lat);
	    v_array.push(point.alt);
	}
	self._heightOptions.heightObj.v_vertexLineList = Cesium.Cartesian3.fromDegreesArrayHeights(v_array);

	self._viewer.entities.remove(self._heightOptions.hLabel);
	self._viewer.entities.remove(self._heightOptions.vLabel);
	self._heightOptions.hLabel = null;
	self._heightOptions.vLabel = null;

	self._heightOptions.hLabel = self._viewer.entities.add({
	    position : Cesium.Cartesian3.fromDegrees(secondPoint.lon, secondPoint.lat, secondPoint.alt),
	    label:{
	        text:  '水平距离： ' + (h_distance/1000).toFixed(4) + "km",
	        font:"14pt sans-serif",
	        fillColor :Cesium.Color.YELLOW,
	        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
	        pixelOffset: new Cesium.Cartesian2(15, 0),
	        verticalOrigin : Cesium.VerticalOrigin.BASELINE,
	        //heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
	        disableDepthTestDistance : Number.POSITIVE_INFINITY
	    }
	});

	self._heightOptions.vLabel = self._viewer.entities.add({
	    position : Cesium.Cartesian3.fromDegrees(firstPoint.lon, firstPoint.lat, firstPoint.alt),
	    label:{
	        text:  '垂直距离： ' + v_distance.toFixed(4) + "m",
	        font:"14pt sans-serif",
	        fillColor :Cesium.Color.YELLOW,
	        horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
	        pixelOffset: new Cesium.Cartesian2(15, 0),
	        verticalOrigin : Cesium.VerticalOrigin.BASELINE,
	        //heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
	        disableDepthTestDistance : Number.POSITIVE_INFINITY
	    }
	});
}
//测面积
BasicMeasure.prototype._calculateArea = function(pointArr){
	//根据经纬度计算多边形面积（墨卡托投影）
	var earthRadiusMeters = 6371000.0;
	var metersPerDegree = 2.0 * Math.PI * earthRadiusMeters / 360.0;
	var radiansPerDegree = Math.PI / 180.0;
	var degreesPerRadian = 180.0 / Math.PI;
	function calculateArea(points) {
	    if (points.length > 2) {
	        var areaMeters2 = PlanarPolygonAreaMeters2(points);
	        if (areaMeters2 > 1000000.0) {
	            areaMeters2 = SphericalPolygonAreaMeters2(points);
	        }
	    }
	    return areaMeters2;
	}

	/*球面多边形面积计算*/
	function SphericalPolygonAreaMeters2(points) {
	    var totalAngle = 0;
	    for (var i = 0; i < points.length; i++) {
	        var j = (i + 1) % points.length;
	        var k = (i + 2) % points.length;
	        totalAngle += Angle(points[i], points[j], points[k]);
	    }
	    var planarTotalAngle = (points.length - 2) * 180.0;
	    var sphericalExcess = totalAngle - planarTotalAngle;
	    if (sphericalExcess > 420.0) {
	        totalAngle = points.length * 360.0 - totalAngle;
	        sphericalExcess = totalAngle - planarTotalAngle;
	    } else if (sphericalExcess > 300.0 && sphericalExcess < 420.0) {
	        sphericalExcess = Math.abs(360.0 - sphericalExcess);
	    }
	    return sphericalExcess * radiansPerDegree * earthRadiusMeters * earthRadiusMeters;
	}

	/*角度*/
	function Angle(p1, p2, p3) {
	    var bearing21 = Bearing(p2, p1);
	    var bearing23 = Bearing(p2, p3);
	    var angle = bearing21 - bearing23;
	    if (angle < 0) {
	        angle += 360;
	    }
	    return angle;
	}

	/*方向*/
	function Bearing(from, to) {
	    var lat1 = from.lat * radiansPerDegree;
	    var lon1 = from.lon * radiansPerDegree;
	    var lat2 = to.lat * radiansPerDegree;
	    var lon2 = to.lon * radiansPerDegree;
	    var angle = -Math.atan2(Math.sin(lon1 - lon2) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2));
	    if (angle < 0) {
	        angle += Math.PI * 2.0;
	    }
	    angle = angle * degreesPerRadian;
	    return angle;
	}

	/*平面多边形面积*/
	function PlanarPolygonAreaMeters2(points) {
	    var a = 0;
	    for (var i = 0; i < points.length; ++i) {
	        var j = (i + 1) % points.length;
	        var xi = points[i].lon * metersPerDegree * Math.cos(points[i].lat * radiansPerDegree);
	        var yi = points[i].lat * metersPerDegree;
	        var xj = points[j].lon * metersPerDegree * Math.cos(points[j].lat * radiansPerDegree);
	        var yj = points[j].lat * metersPerDegree;
	        a += xi * yj - xj * yi;
	    }
	    return Math.abs(a / 2);
	}

	return calculateArea(pointArr);
}

return BasicMeasure;
})