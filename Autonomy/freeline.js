define([],function(){
	function Freeline(globe){
		var self = this;
		this._globe = globe;
		this._viewer = globe._viewer;
		this._globeId = globe._globeId;
		this._minHeight = 0;
		this._maxHeight = 1000000;
		this._catalog = "default";
		this._subcatalog = "default";
		this._handler = new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas);
		this._layer = [];
		this._showMenu = true;
		//STK级别
		this._stkLevel = 14;
		
		//画自由线
		this._options = {
			draw:false, 
			minHeight: 0,
			maxHeight: 1000000,
			catalog: "default",
			subcatalog: "default",
			drawid:'', 
			handlerCallback:null, 
			options:null
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
					self._layer[i].freeline.show = true;
				}else{
					self._layer[i].freeline.show = false;
				}
			}
		});
		//鼠标左键事件注册
		this._handler.setInputAction(function(e){
			var lonlat = self._globe.getLonLatByPosition(e.position);
			if(self._options.draw && self._options.drawid == ''){
				var m_options = {};
				for (var key in self._options.options){
					if(key!="color" && key!="layer"){
						m_options[key] = typeof self._options.options[key]==="object"? deepCoyp(self._options.options[key]): self._options.options[key];
	    			}
				}
				var mid = m_options.mid ? m_options.mid : "";
				var name = m_options.name ? m_options.name : "";
				var width = m_options.width ? m_options.width : 3;
				var wlpha = m_options.wlpha ? m_options.wlpha : 0.5;
				var rightClick = m_options.rightClick ? m_options.rightClick : null;
				var catalog = m_options.catalog ? m_options.catalog : self._catalog;
				var subcatalog = m_options.subcatalog ? m_options.subcatalog : self._subcatalog;
				var minHeight = m_options.minHeight ? m_options.minHeight : self._minHeight;
				var maxHeight = m_options.maxHeight ? m_options.maxHeight : self._maxHeight;
				var color = self._options.options.color ? self._options.options.color : Cesium.Color.BLUE;
				var m_layer = self._options.options.layer ? self._options.options.layer : self._globe._defaultLayer;
				var clampMode = self._options.options.clampMode ? self._options.options.clampMode : 0;
				var pointList = [lonlat];
				var m_obj = {
					freeline : null, 
					pointList : pointList, 
					vertexList:null, 
					catalog: catalog,
					subcatalog: subcatalog,
					minHeight: minHeight,
					maxHeight: maxHeight,
					showHeight: true,
					showLayer: true,
					showEntity: true,
					layer:m_layer
				};
				m_obj.freeline = self._viewer.entities.add({
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
				self._layer.push(m_obj);
				self._options.drawid = m_obj.freeline.id;
				var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
				self._globe.layerManager._add("entityLayer",startTime,catalog,subcatalog);
			}
			
			
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
		
		//鼠标移动事件注册
		this._handler.setInputAction(function(movement){
			var lonlat = self._globe.getLonLatByPosition(movement.endPosition);
			if(self._options.draw && self._options.drawid != ''){
			    self._layer[self._layer.length - 1].pointList.push(lonlat);
				var m_pointList = self._layer[self._layer.length - 1].pointList.slice(0);
				var m_array = new Array();
			    for(var k = 0; k < m_pointList.length; k++){
			    	m_array.push(m_pointList[k].lon);
			    	m_array.push(m_pointList[k].lat);
					m_array.push(m_pointList[k].alt+5);
			    }
				self._layer[self._layer.length - 1].vertexList = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
				
			}
			
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
		
		//鼠标右键事件注册
		this._handler.setInputAction(function(e){
			var lonlat = self._globe.getLonLatByPosition(e.position);
			if(lonlat.alt < 0){
				lonlat.alt = 0;
			}
			if(self._options.draw && self._options.drawid != ''){
				//self._layer[self._layer.length - 1].pointList.push(lonlat);
				var m_pointList = self._layer[self._layer.length - 1].pointList.slice(0);
				var m_options = self._layer[self._layer.length - 1].freeline.options;
				var clampMode = m_options.clampMode ? m_options.clampMode : 0;
				if(clampMode == 1){
					var m_length = 50;
					var m_terrainSamplePositions = [];
					for(var j = 1; j < m_pointList.length; j++){
						var startLon = Cesium.Math.toRadians(m_pointList[j-1].lon);
				  		var startlat = Cesium.Math.toRadians(m_pointList[j-1].lat);
				        var endLon = Cesium.Math.toRadians(m_pointList[j].lon);
				  		var endlat = Cesium.Math.toRadians(m_pointList[j].lat);
				  		for (var m = 0; m < m_length; m++) {
			            	var m_lon = Cesium.Math.lerp(startLon, endLon, m / (m_length - 1));
			            	var m_lat = Cesium.Math.lerp(startlat, endlat, m / (m_length - 1));
			            	var m_position = new Cesium.Cartographic(m_lon, m_lat);
			            	if(!self._contains(m_terrainSamplePositions, m_position)){
			            		m_terrainSamplePositions.push(m_position);
			            	}
			            	
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
							m_array.push(updatedPositions[k].alt+5);
					    }
						self._layer[self._layer.length - 1].vertexList = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
				    });
					
				}else{
					var m_array = new Array();
				    for(var k = 0; k < m_pointList.length; k++){
				    	m_array.push(m_pointList[k].lon);
				    	m_array.push(m_pointList[k].lat);
						m_array.push(m_pointList[k].alt+200);
				    }
					self._layer[self._layer.length - 1].vertexList = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
				}
				
				self._options.drawid = '';
				if(self._options.handlerCallback) self._options.handlerCallback(self._layer[self._layer.length - 1]);
			}
			
		}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

	}
	
	/**
	 * 球体点击添加自由线
	 * @author lijy
     * @method drawHandler
     * @for Freeline
     * @param {options} 画自由线的参数
     * @return {null} null
	 */
	Freeline.prototype.drawHandler = function(options){
		var self = this;
		self._options.draw = true;
		self._options.drawid = "";
		self._options.options = options;
		var handlerCallback = options.handlerCallback ? options.handlerCallback : null;
		self._options.handlerCallback = handlerCallback;
		self._showMenu = self._globe.globeMenu._showMenu;
		self._globe.globeMenu.setType(false);
	}
	/**
	 * 球体添加自由线
	 * @author lijy
     * @method add
     * @for Freeline
     * @param {options} 画自由线的参数
     * @return {m_obj} 自由线对象
	 */
	Freeline.prototype.add = function(options){
		var self = this;
		var mid = options.mid ? options.mid : "";
		var name = options.name ? options.name : "";
		var width = options.width ? parseInt(options.width) : 3;
		var wlpha = options.wlpha ? parseFloat(options.wlpha) : 1;
		var rightClick = options.rightClick ? options.rightClick : null;
		var color = options.color ? options.color : Cesium.Color.BLUE;
		var pointList = options.pointList ? options.pointList : [];
		var m_layer = options.layer ? options.layer : self._globe._defaultLayer;
		var catalog = options.catalog ? options.catalog : self._catalog;
		var subcatalog = options.subcatalog ? options.subcatalog : self._subcatalog;
		var minHeight = options.minHeight ? options.minHeight : self._minHeight;
		var maxHeight = options.maxHeight ? options.maxHeight : self._maxHeight;
//		var left = Cesium.Cartesian3.fromDegrees(self._options.pointList[0].lon, self._options.pointList[0].lat);
//		var right = Cesium.Cartesian3.fromDegrees(self._options.pointList[1].lon, self._options.pointList[1].lat);
//		var distance = Cesium.Cartesian3.distance(left, right);
		
		var m_obj = {
			freeline : null, 
			pointList : pointList, 
			vertexList:null, 
			catalog: catalog,
			subcatalog: subcatalog,
			minHeight: minHeight,
			maxHeight: maxHeight,
			showHeight: true,
			showLayer: true,
			showEntity: true,
			layer:m_layer
		};
		var m_pointList = pointList.slice(0);
		var clampMode = options.clampMode ? options.clampMode : 0;
		if(clampMode == 1){
			var m_length = 50;
			var m_terrainSamplePositions = [];
			for(var j = 1; j < m_pointList.length; j++){
				var startLon = Cesium.Math.toRadians(m_pointList[j-1].lon);
		  		var startlat = Cesium.Math.toRadians(m_pointList[j-1].lat);
		        var endLon = Cesium.Math.toRadians(m_pointList[j].lon);
		  		var endlat = Cesium.Math.toRadians(m_pointList[j].lat);
		  		for (var m = 0; m < m_length; m++) {
	            	var m_lon = Cesium.Math.lerp(startLon, endLon, m / (m_length - 1));
	            	var m_lat = Cesium.Math.lerp(startlat, endlat, m / (m_length - 1));
	            	var m_position = new Cesium.Cartographic(m_lon, m_lat);
	            	if(!self._contains(m_terrainSamplePositions, m_position)){
	            		m_terrainSamplePositions.push(m_position);
	            	}
	            	
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
			    m_obj.vertexList = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
		    });
			
		}else{
			var m_array = new Array();
		    for(var k = 0; k < m_pointList.length; k++){
		    	m_array.push(m_pointList[k].lon);
		    	m_array.push(m_pointList[k].lat);
				m_array.push(m_pointList[k].alt+200);
		    }
		    m_obj.vertexList = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
		}
		m_obj.freeline = self._viewer.entities.add({
			mid:mid,
			name:name,
			options:options,
			rightClick : rightClick,
			polyline: {
			    positions: new Cesium.CallbackProperty(function(){ return m_obj.vertexList; }, false),
			    width: width,
			    material: color.withAlpha(wlpha)
			}
		});
		self._layer.push(m_obj);
		var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
		self._globe.layerManager._add("entityLayer",startTime,catalog,subcatalog);
		return m_obj;
	}
	/*
	 * 暂停球体点击添加自由线
	 * @author lijy
	 * @method deactivateHandler
	 * @for Freeline
	 * @param {null} null
	 * @return {null} null
	 */
	Freeline.prototype.deactivateHandler = function(){
		var self = this;
		self._options.draw = false;
		self._globe.globeMenu.setType(self._showMenu);
	}
	/*
	 * 移除自由线
	 * @author lijy
	 * @method remove
	 * @for Freeline
	 * @param {Cesium.Entity} 自由线对象
	 * @return {Boolean} true:成功,false:失败
	 */
	Freeline.prototype.remove = function(freeline){
		var self = this;
		for(var i = self._layer.length - 1; i >= 0; i--){
			if(self._layer[i].freeline == freeline){
				var catalog = self._layer[i].catalog;
				var subcatalog = self._layer[i].subcatalog;
				var back = self._viewer.entities.remove(freeline);
				self._globe.layerManager._remove("entityLayer",catalog,subcatalog);
				self._layer.splice(i, 1);
				return back;
			}
		}
	}
	
	/*
	 * 根据mid移除自由线
	 * @author lijy
	 * @method removeByMid
	 * @for Freeline
	 * @param {string} 自由线对象mid
	 * @return {Boolean} true:成功,false:失败
	 */
	Freeline.prototype.removeByMid = function(mid){
		var self = this;
		var back = true;
		for(var i = self._layer.length - 1; i >= 0; i--){
			if(self._layer[i].freeline.mid == mid){
				var catalog = self._layer[i].catalog;
				var subcatalog = self._layer[i].subcatalog;
				back = self._viewer.entities.remove(self._layer[i].freeline);
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
	 * 根据name移除自由线
	 * @author lijy
	 * @method removeByName
	 * @for Freeline
	 * @param {string} 自由线对象name
	 * @return {Boolean} true:成功,false:失败
	 */
	Freeline.prototype.removeByName = function(name){
		var self = this;
		var back = true;
		for(var i = self._layer.length - 1; i >= 0; i--){
			if(self._layer[i].freeline.name == name){
				var catalog = self._layer[i].catalog;
				var subcatalog = self._layer[i].subcatalog;
				back = self._viewer.entities.remove(self._layer[i].freeline);
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
	 * 根据mid获取自由线
	 * @author lijy
	 * @method getByMid
	 * @for Freeline
	 * @param {string} 自由线mid
	 * @return {list} list
	 */
	Freeline.prototype.getByMid = function(mid){
		var self = this;
		var list = [];
		for(var i = self._layer.length - 1; i >= 0; i--){
			if(self._layer[i].freeline.mid == mid){
				list[list.length] = self._layer[i].freeline;
			}
		}
		return list;
	}

	/*
	 * 根据name获取自由线
	 * @author lijy
	 * @method getByName
	 * @for Freeline
	 * @param {string} 自由线name
	 * @return {list} list
	 */
	Freeline.prototype.getByName = function(name){
		var self = this;
		var list = [];
		for(var i = self._layer.length - 1; i >= 0; i--){
			if(self._layer[i].freeline.name == name){
				list[list.length] = self._layer[i].freeline;
			}
		}
		return list;
	}
	
	//私有方法
	/**
	 * 判断数组中是否存在重复元素
	 */
	Freeline.prototype._contains = function(arr, obj){
		var i = arr.length;  
	    while (i--) {  
	        if (arr[i].longitude === obj.longitude && arr[i].latitude === obj.latitude) {  
	            return true;  
	        }  
	    }  
	    return false;
	}
	
	return Freeline;
})