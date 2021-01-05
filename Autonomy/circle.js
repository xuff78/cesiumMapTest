define([],function(){
	function Circle(globe){
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
		
		//画圆
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
					self._layer[i].circle.show = true;
				}else{
					self._layer[i].circle.show = false;
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
					circle : null, 
					pointList : pointList, 
					radius: null, 
					layer:m_layer, 
					options: m_options, 
					catalog: catalog,
					subcatalog: subcatalog,
					minHeight: minHeight,
					maxHeight: maxHeight,
					showHeight: true,
					showLayer: true,
					showEntity: true,
					clampMode: clampMode
				};
				if(clampMode == 0){
					m_obj.circle = self._viewer.entities.add({
					    position: Cesium.Cartesian3.fromDegrees(lonlat.lon, lonlat.lat),
					    mid:mid,
					    name : name,
					    rightClick: rightClick,
					    ellipse : {
					        semiMinorAxis : new Cesium.CallbackProperty(function(){ return m_obj.radius; }, false),
					        semiMajorAxis : new Cesium.CallbackProperty(function(){ return m_obj.radius; }, false),
					        height: 2000,
					        material : color.withAlpha(wlpha)
					    }
					});
				}else{
					m_obj.circle = self._viewer.entities.add({
					    position: Cesium.Cartesian3.fromDegrees(lonlat.lon, lonlat.lat),
					    mid:mid,
					    name : name,
					    rightClick: rightClick,
					    ellipse : {
					        semiMinorAxis : new Cesium.CallbackProperty(function(){ return m_obj.radius; }, false),
					        semiMajorAxis : new Cesium.CallbackProperty(function(){ return m_obj.radius; }, false),
					        material : color.withAlpha(wlpha)
					    }
					});
				}
				self._layer.push(m_obj);
				self._options.drawid = m_obj.circle.id;
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
				self._layer[self._layer.length - 1].radius = distance;
			}
			
		}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
		
		//鼠标右键事件注册
		this._handler.setInputAction(function(e){
			var lonlat = self._globe.getLonLatByPosition(e.position);
			if(lonlat.alt < 0){
				lonlat.alt = 0;
			}
			if(self._options.draw && self._options.drawid != ''){
				self._layer[self._layer.length - 1].pointList.push(lonlat);
				var pointList = self._layer[self._layer.length - 1].pointList.slice(0);
				var left = Cesium.Cartesian3.fromDegrees(pointList[pointList.length -2].lon, pointList[pointList.length -2].lat);
				var right = Cesium.Cartesian3.fromDegrees(pointList[pointList.length -1].lon, pointList[pointList.length -1].lat);
				var distance = Cesium.Cartesian3.distance(left, right);
				self._layer[self._layer.length - 1].radius = distance
				self._options.drawid = '';
				if(self._options.handlerCallback) self._options.handlerCallback(self._layer[self._layer.length - 1]);
			}
			
		}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

	}
	
	/**
	 * 球体点击添加圆
	 * @author lijy
     * @method drawHandler
     * @for Circle
     * @param {options} 画圆的参数
     * @return {null} null
	 */
	Circle.prototype.drawHandler = function(options){
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
	 * 球体添加圆
	 * @author lijy
     * @method add
     * @for Circle
     * @param {options} 画圆的参数
     * @return {m_obj} 圆对象
	 */
	Circle.prototype.add = function(options){
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
		var clampMode = options.clampMode ? options.clampMode : 0;
		var left = Cesium.Cartesian3.fromDegrees(pointList[0].lon, pointList[0].lat);
		var right = Cesium.Cartesian3.fromDegrees(pointList[1].lon, pointList[1].lat);
		var distance = Cesium.Cartesian3.distance(left, right);
		var m_obj = {
			circle : null, 
			pointList : pointList, 
			radius: distance, 
			layer:layer, 
			catalog: catalog,
			subcatalog: subcatalog,
			minHeight: minHeight,
			maxHeight: maxHeight,
			showHeight: true,
			showLayer: true,
			showEntity: true,
			options: options, 
			clampMode: clampMode
		};
		m_obj.circle = self._viewer.entities.add({
		    position: Cesium.Cartesian3.fromDegrees(pointList[0].lon, pointList[0].lat),
		    name : name,
		    mid : mid,
		    rightClick: rightClick,
		    ellipse : {
		        semiMinorAxis : distance,
		        semiMajorAxis : distance,
		        material : color.withAlpha(wlpha)
		    }
		});
		self._layer.push(m_obj);
		var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
		self._globe.layerManager._add("entityLayer",startTime,catalog,subcatalog);
		return m_obj;
	}
	
	/**
	 * 球体添加圆(指定半径)
	 * @author lijy
     * @method addByRadius
     * @for Circle
     * @param {options} 画圆的参数
     * @return {m_obj} 圆对象
	 */
	Circle.prototype.addByRadius = function(options){
		var self = this;
		var mid = options.mid ? options.mid : "";
		var name = options.name ? options.name : "";
		var width = options.width ? parseInt(options.width) : 3;
		var wlpha = options.wlpha ? parseFloat(options.wlpha) : 1;
		var rightClick = options.rightClick ? options.rightClick : null;
		var color = options.color ? options.color : Cesium.Color.BLUE;
		var point = options.point ? options.point : '';
		var radius = options.radius ? options.radius: '';
		var layer = options.layer ? options.layer : self._globe._defaultLayer;
		var catalog = options.catalog ? options.catalog : self._catalog;
		var subcatalog = options.subcatalog ? options.subcatalog : self._subcatalog;
		var minHeight = options.minHeight ? options.minHeight : self._minHeight;
		var maxHeight = options.maxHeight ? options.maxHeight : self._maxHeight;
		var clampMode = options.clampMode ? options.clampMode : 0;
		var callback = options.callback ? options.callback : '';
		
		var m_obj = {
			circle : null, 
			point : point, 
			radius: radius, 
			layer:layer, 
			catalog: catalog,
			subcatalog: subcatalog,
			minHeight: minHeight,
			maxHeight: maxHeight,
			showHeight: true,
			showLayer: true,
			showEntity: true,
			options: options, 
			clampMode: clampMode
		};
		m_obj.circle = self._viewer.entities.add({
		    position: Cesium.Cartesian3.fromDegrees(point.lon, point.lat),
		    name : name,
		    mid : mid,
		    rightClick: rightClick,
		    ellipse : {
		        semiMinorAxis : radius,
		        semiMajorAxis : radius,
		        material : color.withAlpha(wlpha)
		    }
		});
		self._layer.push(m_obj);
		var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
		self._globe.layerManager._add("entityLayer",startTime,catalog,subcatalog);
		if(callback) callback(m_obj);
		return m_obj;
	}
	
	/*
	 * 暂停球体点击添加圆
	 * @author lijy
	 * @method deactivateHandler
	 * @for Circle
	 * @param {null} null
	 * @return {null} null
	 */
	Circle.prototype.deactivateHandler = function(){
		var self = this;
		self._options.draw = false;
		self._globe.globeMenu.setType(self._showMenu);
	}
	/*
	 * 移除圆
	 * @author lijy
	 * @method remove
	 * @for Circle
	 * @param {Cesium.Entity} 圆对象
	 * @return {Boolean} true:成功,false:失败
	 */
	Circle.prototype.remove = function(circle){
		var self = this;
		for(var i = self._layer.length - 1; i >= 0; i--){
			if(self._layer[i].circle == circle){
				var catalog = self._layer[i].catalog;
				var subcatalog = self._layer[i].subcatalog;
				var back = self._viewer.entities.remove(circle);
				self._globe.layerManager._remove("entityLayer",catalog,subcatalog);
				self._layer.splice(i, 1);
				return back;
			}
		}
	}
	/*
	 * 根据mid移除圆
	 * @author lijy
	 * @method removeByMid
	 * @for Circle
	 * @param {string} 圆对象mid
	 * @return {Boolean} true:成功,false:失败
	 */
	Circle.prototype.removeByMid = function(mid){
		var self = this;
		var back = true;
		for(var i = self._layer.length - 1; i >= 0; i--){
			if(self._layer[i].circle.mid == mid){
				var catalog = self._layer[i].catalog;
				var subcatalog = self._layer[i].subcatalog;
				back = self._viewer.entities.remove(self._layer[i].circle);
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
	 * 根据name移除圆
	 * @author lijy
	 * @method removeByName
	 * @for Circle
	 * @param {string} 圆对象name
	 * @return {Boolean} true:成功,false:失败
	 */
	Circle.prototype.removeByName = function(name){
		var self = this;
		var back = true;
		for(var i = self._layer.length - 1; i >= 0; i--){
			if(self._layer[i].circle.name == name){
				var catalog = self._layer[i].catalog;
				var subcatalog = self._layer[i].subcatalog;
				back = self._viewer.entities.remove(self._layer[i].circle);
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
	 * 根据mid获取圆
	 * @author lijy
	 * @method getByMid
	 * @for Circle
	 * @param {string} 圆mid
	 * @return {list} list
	 */
	Circle.prototype.getByMid = function(mid){
		var self = this;
		var list = [];
		for(var i = self._layer.length - 1; i >= 0; i--){
			if(self._layer[i].circle.mid == mid){
				list[list.length] = self._layer[i].circle;
			}
		}
		return list;
	}

	/*
	 * 根据name获取圆
	 * @author lijy
	 * @method getByName
	 * @for Circle
	 * @param {string} 圆name
	 * @return {list} list
	 */
	Circle.prototype.getByName = function(name){
		var self = this;
		var list = [];
		for(var i = self._layer.length - 1; i >= 0; i--){
			if(self._layer[i].circle.name == name){
				list[list.length] = self._layer[i].circle;
			}
		}
		return list;
	}
	
	
	return Circle;
})