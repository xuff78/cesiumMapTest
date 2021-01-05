define([],function(){
	function Ellipse(globe){
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
		
		//画椭圆
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
					self._layer[i].ellipse.show = true;
				}else{
					self._layer[i].ellipse.show = false;
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
					ellipse : null, 
					pointList : pointList, 
					semiMinorAxis: 0, 
					semiMajorAxis: 0, 
					rotation: 0, 
					catalog: catalog,
					subcatalog: subcatalog,
					minHeight: minHeight,
					maxHeight: maxHeight,
					showHeight: true,
					showLayer: true,
					showEntity: true,
					layer:m_layer
				};
				if(clampMode == 0){
					m_obj.ellipse = self._viewer.entities.add({
					    position: Cesium.Cartesian3.fromDegrees(lonlat.lon, lonlat.lat),
					    mid:mid,
					    name : name,
					    rightClick: rightClick,
					    ellipse : {
					        semiMinorAxis : new Cesium.CallbackProperty(function(){ return m_obj.semiMinorAxis; }, false),
					        semiMajorAxis : new Cesium.CallbackProperty(function(){ return m_obj.semiMajorAxis; }, false),
					        rotation : new Cesium.CallbackProperty(function(){ return m_obj.rotation; }, false),
					        height: 2000,
					        material : color.withAlpha(wlpha)
					    }
					});
				}else{
					m_obj.ellipse = self._viewer.entities.add({
					    position: Cesium.Cartesian3.fromDegrees(lonlat.lon, lonlat.lat),
					    mid:mid,
					    name : name,
					    rightClick: rightClick,
					    ellipse : {
					        semiMinorAxis : new Cesium.CallbackProperty(function(){ return m_obj.semiMinorAxis; }, false),
					        semiMajorAxis : new Cesium.CallbackProperty(function(){ return m_obj.semiMajorAxis; }, false),
					        rotation : new Cesium.CallbackProperty(function(){ return m_obj.rotation; }, false),
					        material : color.withAlpha(wlpha)
					    }
					});
				}
				self._layer.push(m_obj);
				self._options.drawid = m_obj.ellipse.id;
				var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
				self._globe.layerManager._add("entityLayer",startTime,catalog,subcatalog);
			}
			
			
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
		
		//鼠标移动事件注册
		this._handler.setInputAction(function(movement){
			var lonlat = self._globe.getLonLatByPosition(movement.endPosition);
			if(self._options.draw && self._options.drawid != ''){
				var pointList = self._layer[self._layer.length - 1].pointList.slice(0);
				var left = Cesium.Cartesian3.fromDegrees(pointList[pointList.length -1].lon, pointList[pointList.length -1].lat);
				var right = Cesium.Cartesian3.fromDegrees(lonlat.lon, lonlat.lat);
				var distance = Cesium.Cartesian3.distance(left, right);
				var lonDis = Math.abs(lonlat.lon - pointList[pointList.length -1].lon);
                var latDis = Math.abs(lonlat.lat - pointList[pointList.length -1].lat);
                var a = distance;
                var b;
                if(Math.pow(a, 2) - Math.pow(right.x-left.x, 2) != 0){
                	b = Math.sqrt(Math.abs(Math.pow(a, 2) * Math.pow(right.y - left.y, 2) / (Math.pow(a, 2) - Math.pow(right.x-left.x, 2))));
                	/*var angle = CommonFunc.getAngle(pointList[pointList.length -1].lon, pointList[pointList.length -1].lat, lonlat.lon, lonlat.lat);
                	self._layer[self._layer.length - 1].rotation = Cesium.Math.toRadians(angle);*/
                	self._layer[self._layer.length - 1].rotation = lonDis > latDis ? Cesium.Math.toRadians(0) : Cesium.Math.toRadians(90);
    				self._layer[self._layer.length - 1].semiMajorAxis = a;
    				self._layer[self._layer.length - 1].semiMinorAxis = b;
                }
				
			}
			
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
		
		//鼠标右键事件注册
		this._handler.setInputAction(function(e){
			var lonlat = self._globe.getLonLatByPosition(e.position);
			if(lonlat.alt < 0){
				lonlat.alt = 0;
			}
			if(self._options.draw && self._options.drawid != ''){
				var tempPointList = self._layer[self._layer.length - 1].pointList.slice(0);
				if(!(tempPointList[tempPointList.length -1].lon == lonlat.lon && tempPointList[tempPointList.length -1].lat == lonlat.lat)){
					self._layer[self._layer.length - 1].pointList.push(lonlat);
				}
				var pointList = self._layer[self._layer.length - 1].pointList.slice(0);
				if(pointList.length > 1){
					var left = Cesium.Cartesian3.fromDegrees(pointList[pointList.length -2].lon, pointList[pointList.length -2].lat);
					var right = Cesium.Cartesian3.fromDegrees(pointList[pointList.length -1].lon, pointList[pointList.length -1].lat);
	                var distance = Cesium.Cartesian3.distance(left, right);
	                var lonDis = Math.abs(lonlat.lon - pointList[pointList.length -1].lon);
	                var latDis = Math.abs(lonlat.lat - pointList[pointList.length -1].lat);
	                var a = distance;
	                var b;
	                if(Math.pow(a, 2) - Math.pow(right.x-left.x, 2) != 0){
	                	b = Math.sqrt(Math.abs(Math.pow(a, 2) * Math.pow(right.y - left.y, 2) / (Math.pow(a, 2) - Math.pow(right.x-left.x, 2))));
	                	self._layer[self._layer.length - 1].semiMajorAxis = a;
						self._layer[self._layer.length - 1].semiMinorAxis = b;
	                }
					self._options.drawid = '';
					if(self._options.handlerCallback) self._options.handlerCallback(self._layer[self._layer.length - 1]);
				}
			}
			
		}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

	}
	
	/**
	 * 球体点击添加椭圆
	 * @author lijy
     * @method drawHandler
     * @for Ellipse
     * @param {options} 画椭圆的参数
     * @return {null} null
	 */
	Ellipse.prototype.drawHandler = function(options){
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
	 * 球体添加椭圆
	 * @author lijy
     * @method add
     * @for Ellipse
     * @param {options} 画椭圆的参数
     * @return {m_obj} 椭圆对象
	 */
	Ellipse.prototype.add = function(options){
		var self = this;
		var mid = options.mid ? options.mid : "";
		var name = options.name ? options.name : "";
		var width = options.width ? parseInt(options.width) : 3;
		var wlpha = options.wlpha ? parseFloat(options.wlpha) : 1;
		var rightClick = options.rightClick ? options.rightClick : null;
		var color = options.color ? options.color : Cesium.Color.BLUE;
		var pointList = options.pointList ? options.pointList : [];
		var layer = options.layer ? options.layer : self._globe._defaultLayer;
		var catalog = options.catalog ? options.catalog : self._catalog;
		var subcatalog = options.subcatalog ? options.subcatalog : self._subcatalog;
		var minHeight = options.minHeight ? options.minHeight : self._minHeight;
		var maxHeight = options.maxHeight ? options.maxHeight : self._maxHeight;
		var left = Cesium.Cartesian3.fromDegrees(pointList[0].lon, pointList[0].lat);
		var right = Cesium.Cartesian3.fromDegrees(pointList[1].lon, pointList[1].lat);
		var distance = Cesium.Cartesian3.distance(left, right);
		var a = distance;
        var b;
        if(Math.pow(a, 2) - Math.pow(right.x-left.x, 2) != 0){
        	b = Math.sqrt(Math.abs(Math.pow(a, 2) * Math.pow(right.y - left.y, 2) / (Math.pow(a, 2) - Math.pow(right.x-left.x, 2))));
        }
        var m_obj = {
        	ellipse : null, 
        	pointList : pointList, 
        	semiMinorAxis: 0, 
        	semiMajorAxis: 0, 
        	rotation: 0, 
        	catalog: catalog,
			subcatalog: subcatalog,
			minHeight: minHeight,
			maxHeight: maxHeight,
			showHeight: true,
			showLayer: true,
			showEntity: true,
        	layer:layer
        };
		m_obj.ellipse = self._viewer.entities.add({
		    position: Cesium.Cartesian3.fromDegrees(pointList[0].lon, pointList[0].lat),
		    name : name,
		    mid : mid,
		    rightClick: rightClick,
		    ellipse : {
		        semiMinorAxis : b,
		        semiMajorAxis : a,
		        material : color.withAlpha(wlpha)
		    }
		});
		self._layer.push(m_obj);
		var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
		self._globe.layerManager._add("entityLayer",startTime,catalog,subcatalog);
		return m_obj;
	}
	/*
	 * 暂停球体点击添加椭圆
	 * @author lijy
	 * @method deactivateHandler
	 * @for Ellipse
	 * @param {null} null
	 * @return {null} null
	 */
	Ellipse.prototype.deactivateHandler = function(){
		var self = this;
		self._options.draw = false;
		self._globe.globeMenu.setType(self._showMenu);
	}
	/*
	 * 移除椭圆
	 * @author lijy
	 * @method remove
	 * @for Ellipse
	 * @param {Cesium.Entity} 椭圆对象
	 * @return {Boolean} true:成功,false:失败
	 */
	Ellipse.prototype.remove = function(ellipse){
		var self = this;
		for(var i = self._layer.length - 1; i >= 0; i--){
			if(self._layer[i].ellipse == ellipse){
				var catalog = self._layer[i].catalog;
				var subcatalog = self._layer[i].subcatalog;
				var back = self._viewer.entities.remove(ellipse);
				self._globe.layerManager._remove("entityLayer",catalog,subcatalog);
				self._layer.splice(i, 1);
				return back;
			}
		}
	}
	/*
	 * 根据mid移除椭圆
	 * @author lijy
	 * @method removeByMid
	 * @for Ellipse
	 * @param {string} 椭圆对象mid
	 * @return {Boolean} true:成功,false:失败
	 */
	Ellipse.prototype.removeByMid = function(mid){
		var self = this;
		var back = true;
		for(var i = self._layer.length - 1; i >= 0; i--){
			if(self._layer[i].ellipse.mid == mid){
				var catalog = self._layer[i].catalog;
				var subcatalog = self._layer[i].subcatalog;
				back = self._viewer.entities.remove(self._layer[i].ellipse);
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
	 * 根据name移除椭圆
	 * @author lijy
	 * @method removeByMid
	 * @for Ellipse
	 * @param {string} 椭圆对象name
	 * @return {Boolean} true:成功,false:失败
	 */
	Ellipse.prototype.removeByName = function(name){
		var self = this;
		var back = true;
		for(var i = self._layer.length - 1; i >= 0; i--){
			if(self._layer[i].ellipse.name == name){
				var catalog = self._layer[i].catalog;
				var subcatalog = self._layer[i].subcatalog;
				back = self._viewer.entities.remove(self._layer[i].ellipse);
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
	 * 根据mid获取椭圆
	 * @author lijy
	 * @method getByMid
	 * @for Ellipse
	 * @param {string} 椭圆mid
	 * @return {list} list
	 */
	Ellipse.prototype.getByMid = function(mid){
		var self = this;
		var list = [];
		for(var i = self._layer.length - 1; i >= 0; i--){
			if(self._layer[i].ellipse.mid == mid){
				list[list.length] = self._layer[i].ellipse;
			}
		}
		return list;
	}

	/*
	 * 根据name获取椭圆
	 * @author lijy
	 * @method getByName
	 * @for Ellipse
	 * @param {string} 椭圆name
	 * @return {list} list
	 */
	Ellipse.prototype.getByName = function(name){
		var self = this;
		var list = [];
		for(var i = self._layer.length - 1; i >= 0; i--){
			if(self._layer[i].ellipse.name == name){
				list[list.length] = self._layer[i].ellipse;
			}
		}
		return list;
	}
	
	
	return Ellipse;
})