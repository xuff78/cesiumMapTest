/*
* author: 赵雪丹
* description: Polyline-线
* day: 2017-9-28
*/
define( [], function(){
function Polyline(globe){
	var self = this;
	this._globe = globe;
	this._viewer = globe._viewer;
	this._globeId = globe._globeId;
	this._minHeight = 0;
	this._maxHeight = 1000000;
	this._catalog = "default";
	this._subcatalog = "default";
	this._layer = [];
	this._showMenu = true;
	this._options = {
		draw: false,
		minHeight: 0,
		maxHeight: 1000000,
		catalog: "default",
		subcatalog: "default",
		handlerCallback: null,
		options: null,
		drawid: ""
	};
	//实时设置元素显隐
	this._viewer.scene.postRender.addEventListener(function(){
		var m_alt = 0;
		var sceneMode = self._viewer.scene.mode;
		if(sceneMode == Cesium.SceneMode.SCENE3D){
			var m_cartographic = Cesium.Cartographic.fromCartesian(self._viewer.scene.camera.position);
			m_alt = m_cartographic.height;
		}else{
			m_alt = Math.ceil(self._viewer.camera.positionCartographic.height);
		}
		for(var i = 0; i < self._layer.length; i++){
			if(m_alt >= self._layer[i].minHeight && m_alt <= self._layer[i].maxHeight){
				self._layer[i].showHeight = true;
			}else{
				self._layer[i].showHeight = false;
			}
			if(self._layer[i].showHeight && self._layer[i].showLayer && self._layer[i].showEntity){
				self._layer[i].show = true;
			}else{
				self._layer[i].show = false;
			}
		}
	});
	//私有注册事件
	this._handler = new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas);
	//LEFT_CLICK 左键点击事件
	this._handler.setInputAction(function (e) {
		var lonlat = self._globe.getLonLatByPosition(e.position);
		if(self._options.draw){
			var m_options = {};
			for (var key in self._options.options){
				if(key!="color" && key!="layer"){
					m_options[key] = typeof self._options.options[key]==="object"? deepCoyp(self._options.options[key]): self._options.options[key];
    			}
			}
			if(self._options.drawid == ""){
				var mid = m_options.mid ? m_options.mid : "";
				var name = m_options.name ? m_options.name : "default";
				var width = m_options.width ? m_options.width : 3;
				var wlpha = m_options.wlpha ? m_options.wlpha : 1;
				var rightClick = m_options.rightClick ? m_options.rightClick : null;
				var color = self._options.options.color ? self._options.options.color : Cesium.Color.BLUE;
				var m_layer = self._options.options.layer ? self._options.options.layer : self._globe._defaultLayer;
				var catalog = m_options.catalog ? m_options.catalog : self._catalog;
				var subcatalog = m_options.subcatalog ? m_options.subcatalog : self._subcatalog;
				var minHeight = m_options.minHeight ? m_options.minHeight : self._minHeight;
				var maxHeight = m_options.maxHeight ? m_options.maxHeight : self._maxHeight;
				var clampMode = m_options.clampMode ? m_options.clampMode : 0;
				var pointList = [lonlat];
				var m_obj = {
					mid: mid,
					name: name,
					polyline: null,
					pointList: pointList,
					vertexList: null,
					catalog: catalog,
					subcatalog: subcatalog,
					minHeight: minHeight,
					maxHeight: maxHeight,
					showHeight: true,
					showLayer: true,
					showEntity: true,
					layer: m_layer,
					clampMode: clampMode
				};
				m_obj.polyline = self._viewer.entities.add({
					mid:mid,
					name:name,
					options:m_options,
					rightClick : rightClick,
					polyline: {
					    positions: new Cesium.CallbackProperty(function(){ return m_obj.vertexList; }, false),
					    width: width,
					    material: color.withAlpha(wlpha)
					}
				});
				self._layer[self._layer.length] = m_obj;
				self._options.drawid = m_obj.polyline.id;
				var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
				self._globe.layerManager._add("entityLayer",startTime,catalog,subcatalog);
			}else{
				for(var i = 0; i < self._layer.length; i++){
					if(self._layer[i].polyline.id == self._options.drawid){
						self._layer[i].pointList[self._layer[i].pointList.length] = lonlat;
						var m_array = new Array();
					    for(var k = 0; k < self._layer[i].pointList.length; k++){
					    	m_array.push(self._layer[i].pointList[k].lon);
					    	m_array.push(self._layer[i].pointList[k].lat);
							m_array.push(self._layer[i].pointList[k].alt+200);
					    }
						self._layer[i].vertexList = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
					}
				}
			}
    	}
	}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
	//RIGHT_CLICK 右键点击事件
	this._handler.setInputAction(function (e) {
		var lonlat = self._globe.getLonLatByPosition(e.position);
    	if(lonlat.alt < 0){
			lonlat.alt = 0;
		}
		if(self._options.draw){
			if(self._options.handlerCallback){
    			for(var i = 0; i < self._layer.length; i++){
					if(self._layer[i].polyline.id == self._options.drawid){
						self._layer[i].pointList[self._layer[i].pointList.length] = lonlat;
//						var m_options = self._layer[i].polyline.options;
//						var clampMode = m_options.clampMode ? m_options.clampMode : 0;
						if(self._layer[i].clampMode == 1){
							var m_length = 500;
							var m_terrainSamplePositions = [];
							for(var j = 1; j < self._layer[i].pointList.length; j++){
								var startLon = Cesium.Math.toRadians(self._layer[i].pointList[j-1].lon);
						  		var startlat = Cesium.Math.toRadians(self._layer[i].pointList[j-1].lat);
						        var endLon = Cesium.Math.toRadians(self._layer[i].pointList[j].lon);
						  		var endlat = Cesium.Math.toRadians(self._layer[i].pointList[j].lat);
						  		for (var m = 0; m < m_length; m++) {
					            	var m_lon = Cesium.Math.lerp(startLon, endLon, m / (m_length - 1));
					            	var m_lat = Cesium.Math.lerp(startlat, endlat, m / (m_length - 1));
					            	var m_position = new Cesium.Cartographic(m_lon, m_lat);
					            	m_terrainSamplePositions.push(m_position);
					            }
							}
							var promise = Cesium.sampleTerrain(self._viewer.terrainProvider, self._globe._stkLevel, m_terrainSamplePositions);
						    Cesium.when(promise, function(updatedPositions) {
						    	for(var n = 0; n < updatedPositions.length; n++){
						    		updatedPositions[n].lon = CommonFunc.deg(updatedPositions[n].longitude);
						    		updatedPositions[n].lat = CommonFunc.deg(updatedPositions[n].latitude);
						    		if(typeof(updatedPositions[n].height) !== "undefined"){
						    			updatedPositions[n].alt = updatedPositions[n].height;
						    		}else{
						    			updatedPositions[n].alt = 1000;
						    		}
						    	}
						    	var m_array = new Array();
							    for(var k = 0; k < updatedPositions.length; k++){
							    	m_array.push(updatedPositions[k].lon);
							    	m_array.push(updatedPositions[k].lat);
									m_array.push(updatedPositions[k].alt+10);
							    }
								self._layer[i].vertexList = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
						    });
							self._options.drawid = "";
							self._options.handlerCallback(self._layer[i]);
							break;
						}else{
							self._options.drawid = "";
							self._options.handlerCallback(self._layer[i]);
							break;
						}
					}
				}
    		}else{
    			self._options.drawid = "";
    		}
    	}
		
	}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
	//MOUSE_MOVE 鼠标移动事件
	this._handler.setInputAction(function (movement) {
		var lonlat = self._globe.getLonLatByPosition(movement.endPosition);
		if(self._options.draw){
    		for(var i = 0; i < self._layer.length; i++){
				if(self._layer[i].polyline.id == self._options.drawid){
					var m_pointList = self._layer[i].pointList.slice(0);
					m_pointList[m_pointList.length] = lonlat;
					var m_array = new Array();
				    for(var k = 0; k < m_pointList.length; k++){
				    	m_array.push(m_pointList[k].lon);
				    	m_array.push(m_pointList[k].lat);
						m_array.push(m_pointList[k].alt+200);
				    }
					self._layer[i].vertexList = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
				}
			}
    	}
	}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}

/*
 * 添加线
 * @author zhaoxd
 * @method add
 * @for Polyline
 * @param {Object} 线对象参数
 * @return {Cesium.Entity} polyline
 */
Polyline.prototype.add = function(options){
	var self = this;
	var mid = options.mid ? options.mid : "";
	var name = options.name ? options.name : "default";
	var width = options.width ? parseInt(options.width) : 3;
	var wlpha = options.wlpha ? parseFloat(options.wlpha) : 1;
	var leftClick = options.leftClick ? options.leftClick : null;
	var rightClick = options.rightClick ? options.rightClick : null;
	var color = options.color ? options.color : Cesium.Color.BLUE;
	var pointList = options.pointList ? options.pointList : [];
	var layer = options.layer ? options.layer : self._globe._defaultLayer;
	var catalog = options.catalog ? options.catalog : self._catalog;
	var subcatalog = options.subcatalog ? options.subcatalog : self._subcatalog;
	var minHeight = options.minHeight ? options.minHeight : self._minHeight;
	var maxHeight = options.maxHeight ? options.maxHeight : self._maxHeight;
	var clampMode = options.clampMode ? options.clampMode : 0;
	var positions = [];
	var m_array = new Array();
	var m_obj = {
		mid: mid,
		name: name,
		polyline: null,
		pointList: pointList,
		vertexList: positions,
		layer: layer,
		catalog: catalog,
		subcatalog: subcatalog,
		minHeight: minHeight,
		maxHeight: maxHeight,
		showHeight: true,
		showLayer: true,
		showEntity: true,
		clampMode: clampMode
	};
	if(clampMode == 1){
		var m_length = 500;
		var m_terrainSamplePositions = [];
		for(var j = 1; j < pointList.length; j++){
			var startLon = Cesium.Math.toRadians(pointList[j-1].lon);
	  		var startlat = Cesium.Math.toRadians(pointList[j-1].lat);
	        var endLon = Cesium.Math.toRadians(pointList[j].lon);
	  		var endlat = Cesium.Math.toRadians(pointList[j].lat);
	  		for (var m = 0; m < m_length; m++) {
            	var m_lon = Cesium.Math.lerp(startLon, endLon, m / (m_length - 1));
            	var m_lat = Cesium.Math.lerp(startlat, endlat, m / (m_length - 1));
            	var m_position = new Cesium.Cartographic(m_lon, m_lat);
            	m_terrainSamplePositions.push(m_position);
            }
		}
		var promise = Cesium.sampleTerrain(self._viewer.terrainProvider, self._globe._stkLevel, m_terrainSamplePositions);
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
		    for(var k = 0; k < updatedPositions.length; k++){
		    	m_array.push(updatedPositions[k].lon);
		    	m_array.push(updatedPositions[k].lat);
				m_array.push(updatedPositions[k].alt+0.5);
		    }
			m_obj.vertexList = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
	    });
	}else{
	    for(var i = 0; i < pointList.length; i++){
	    	m_array.push(pointList[i].lon);
	    	m_array.push(pointList[i].lat);
			m_array.push(pointList[i].alt);
	    }
		m_obj.vertexList = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
	}
	m_obj.polyline = self._viewer.entities.add({
		mid:mid,
		name:name,
		options:options,
		leftClick: leftClick,
		rightClick: rightClick,
		polyline: {
		    positions: new Cesium.CallbackProperty(function(){ return m_obj.vertexList; }, false),
		    width: width,
		    material: color.withAlpha(wlpha)
		}
	});
	self._layer[self._layer.length] = m_obj;
	var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
	self._globe.layerManager._add("entityLayer",startTime,catalog,subcatalog);
	return m_obj;
}

/*
 * 球体点击添加线
 * @author zhaoxd
 * @method drawHandler
 * @for Polyline
 * @param {Object} 线对象参数
 * @return {null} null
 */
Polyline.prototype.drawHandler = function(options){
	var self = this;
	self._options.draw = true;
	self._options.drawid = "";
	self._options.options = options;
	var handlerCallback = options.handlerCallback ? options.handlerCallback : null;
	self._options.handlerCallback = handlerCallback;
	self._showMenu = self._globe.globeMenu._showMenu;
	self._globe.globeMenu.setType(false);
}

/*
 * 暂停球体点击添加线
 * @author zhaoxd
 * @method deactivateHandler
 * @for Polyline
 * @param {null} null
 * @return {null} null
 */
Polyline.prototype.deactivateHandler = function(){
	var self = this;
	self._options.draw = false;
	self._globe.globeMenu.setType(self._showMenu);
}

/*
 * 移除线
 * @author zhaoxd
 * @method remove
 * @for Polyline
 * @param {Cesium.Entity} 线对象
 * @return {Boolean} true:成功,false:失败
 */
Polyline.prototype.remove = function(polyline){
	var self = this;
	for(var i = self._layer.length - 1; i >= 0; i--){
		if(self._layer[i].polyline == polyline.polyline){
			var catalog = self._layer[i].catalog;
			var subcatalog = self._layer[i].subcatalog;
			var back = self._viewer.entities.remove(polyline.polyline);
			self._globe.layerManager._remove("entityLayer",catalog,subcatalog);
			self._layer.splice(i, 1);
			return back;
		}
	}
}

/*
 * 根据mid移除线
 * @author zhaoxd
 * @method removeByMid
 * @for Polyline
 * @param {string} 线对象mid
 * @return {Boolean} true:成功,false:失败
 */
Polyline.prototype.removeByMid = function(mid){
	var self = this;
	var back = true;
	for(var i = self._layer.length - 1; i >= 0; i--){
		if(self._layer[i].polyline.mid == mid){
			var catalog = self._layer[i].catalog;
			var subcatalog = self._layer[i].subcatalog;
			back = self._viewer.entities.remove(self._layer[i].polyline);
			self._globe.layerManager._remove("entityLayer",catalog,subcatalog);
			self._layer.splice(i, 1);
			if(!back){
				return back;
			}
		}
	}
	return back;
}

/*
 * 根据name移除线
 * @author zhaoxd
 * @method removeByName
 * @for Polyline
 * @param {string} 线对象name
 * @return {Boolean} true:成功,false:失败
 */
Polyline.prototype.removeByName = function(name){
	var self = this;
	var back = true;
	for(var i = self._layer.length - 1; i >= 0; i--){
		if(self._layer[i].polyline.name == name){
			var catalog = self._layer[i].catalog;
			var subcatalog = self._layer[i].subcatalog;
			back = self._viewer.entities.remove(self._layer[i].polyline);
			self._globe.layerManager._remove("entityLayer",catalog,subcatalog);
			self._layer.splice(i, 1);
			if(!back){
				return back;
			}
		}
	}
	return back;
}

/*
 * 根据mid获取线
 * @author zhaoxd
 * @method getByMid
 * @for Polyline
 * @param {string} 线对象mid
 * @return {list} list
 */
Polyline.prototype.getByMid = function(mid){
	var self = this;
	var list = [];
	for(var i = self._layer.length - 1; i >= 0; i--){
		if(self._layer[i].polyline.mid == mid){
			list[list.length] = self._layer[i].polyline;
		}
	}
	return list;
}

/*
 * 根据name获取线
 * @author zhaoxd
 * @method getByName
 * @for Polyline
 * @param {string} 线对象name
 * @return {list} list
 */
Polyline.prototype.getByName = function(name){
	var self = this;
	var list = [];
	for(var i = self._layer.length - 1; i >= 0; i--){
		if(self._layer[i].polyline.name == name){
			list[list.length] = self._layer[i].polyline;
		}
	}
	return list;
}

return Polyline;
})