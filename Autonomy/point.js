/*
* author: lijy
* description: Point-点
* day: 2017年11月16日
*/
define( [], function(){
function Point(globe){
	var self = this;
	this._globe = globe;
	this._viewer = globe._viewer;
	this._globeId = globe._globeId;
	this._minHeight = 0;
	this._maxHeight = 1000000;
	this._catalog = "default";
	this._subcatalog = "default";
	this._layer = [];
	this._options = {
		draw: false,
		minHeight: 0,
		maxHeight: 1000000,
		catalog: "default",
		subcatalog: "default",
		handlerCallback: null,
		options: null
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
    		m_options.lon = lonlat.lon;
    		m_options.lat = lonlat.lat;
    		m_options.alt = lonlat.alt;
			m_options.layer = self._options.options.layer ? self._options.options.layer : null;
    		var point = self.add(m_options);
    		if(self._options.handlerCallback){
    			self._options.handlerCallback(point);
    		}
    	}
	}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

/*
 * 添加信息点
 * @author lijy
 * @method add
 * @for Point
 * @param {Object} 信息点参数
 * @return {Cesium.Entity} mark
 */
Point.prototype.add = function(options){
	var self = this;
	var mid = options.mid ? options.mid : "";			//信息点id
	var name = options.name ? options.name : "default";		//信息点name
	var lon = options.lon ? parseFloat(options.lon) : 0;			//经度
	var lat = options.lat ? parseFloat(options.lat) : 0;			//纬度
	var alt = options.alt ? parseFloat(options.alt) : 0;
	var callback = options.callback ? options.callback : null;				//回调函数
	var setMenu = options.setMenu ? options.setMenu : null;					//设置右键菜单函数
	var description = options.description ? options.description : "";		//简介
	var catalog = options.catalog ? options.catalog : self._catalog;
	var subcatalog = options.subcatalog ? options.subcatalog : self._subcatalog;
	var minHeight = options.minHeight ? options.minHeight : self._minHeight;
	var maxHeight = options.maxHeight ? options.maxHeight : self._maxHeight;
	var position = Cesium.Cartesian3.fromDegrees(lon, lat);
	var leftClick = options.leftClick ? options.leftClick : null;
	var rightClick = options.rightClick ? options.rightClick : null;
	var heightReference;
	var clampMode = options.clampMode ? options.clampMode : 0;
	if(clampMode == 1){
		heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
		position = Cesium.Cartesian3.fromDegrees(lon, lat);
	}else {
		heightReference = Cesium.HeightReference.NONE;
		position = Cesium.Cartesian3.fromDegrees(lon, lat, alt);
    }
	var markPoint = {lon:lon,lat:lat,alt:alt};
	var point = self._viewer.entities.add({
	    mid : mid,
	    name : name,
	    callback : callback,
	    setMenu : setMenu,
	    description : description,
	    options:options,
	    position : position,
	    markPoint:markPoint,
	    catalog: catalog,
		subcatalog: subcatalog,
		minHeight: minHeight,
		maxHeight: maxHeight,
		showHeight: true,
		showLayer: true,
		showEntity: true,
		leftClick: leftClick,
		rightClick: rightClick,
	    point : {
	        color : Cesium.Color.RED,
	        pixelSize : 18,
	        heightReference: heightReference
	    }
	    
	});
	self._layer[self._layer.length] = point;
	var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
	self._globe.layerManager._add("entityLayer",startTime,catalog,subcatalog);
	return point;
}

/*
 * 球体点击添加点
 * @author lijy
 * @method drawHandler
 * @for Point
 * @param {Object} 信息点参数
 * @return {null} null
 */
Point.prototype.drawHandler = function(options){
	var self = this;
	self._options.draw = true;
	self._options.options = options;
	var handlerCallback = options.handlerCallback ? options.handlerCallback : null;
	self._options.handlerCallback = handlerCallback;
}

/*
 * 暂停球体点击添加点
 * @author lijy
 * @method deactivateHandler
 * @for Point
 * @param {null} null
 * @return {null} null
 */
Point.prototype.deactivateHandler = function(){
	var self = this;
	self._options.draw = false;
}

/*
 * 移除信息点
 * @author lijy
 * @method remove
 * @for Point
 * @param {Cesium.Entity} 信息点
 * @return {Boolean} true:成功,false:失败
 */
Point.prototype.remove = function(point){
	var self = this;
	for(var i = self._layer.length - 1; i >= 0; i--){
		if(self._layer[i] == point){
			var catalog = self._layer[i].catalog;
			var subcatalog = self._layer[i].subcatalog;
			var back = self._viewer.entities.remove(point);
			self._layer.splice(i, 1);
			self._globe.layerManager._remove("entityLayer",catalog,subcatalog);
			return back;
		}
	}
}

/*
 * 根据mid移除信息点
 * @author lijy
 * @method removeByMid
 * @for Point
 * @param {string} 信息点mid
 * @return {Boolean} true:成功,false:失败
 */
Point.prototype.removeByMid = function(mid){
	var self = this;
	var back = true;
	for(var i = self._layer.length - 1; i >= 0; i--){
		if(self._layer[i].mid == mid){
			var catalog = self._layer[i].catalog;
			var subcatalog = self._layer[i].subcatalog;
			back = self._viewer.entities.remove(self._layer[i]);
			self._layer.splice(i, 1);
			self._globe.layerManager._remove("entityLayer",catalog,subcatalog);
			if(!back){
				return back;
			}
		}
	}
	return back;
}

/*
 * 根据name移除信息点
 * @author lijy
 * @method removeByName
 * @for Point
 * @param {string} 信息点name
 * @return {Boolean} true:成功,false:失败
 */
Point.prototype.removeByName = function(name){
	var self = this;
	var back = true;
	for(var i = self._layer.length - 1; i >= 0; i--){
		if(self._layer[i].name == name){
			var catalog = self._layer[i].catalog;
			var subcatalog = self._layer[i].subcatalog;
			back = self._viewer.entities.remove(self._layer[i]);
			self._layer.splice(i, 1);
			self._globe.layerManager._remove("entityLayer",catalog,subcatalog);
			if(!back){
				return back;
			}
		}
	}
	return back;
}

/*
 * 根据mid获取信息点
 * @author lijy
 * @method getByMid
 * @for Point
 * @param {string} 信息点mid
 * @return {list} list
 */
Point.prototype.getByMid = function(mid){
	var self = this;
	var list = [];
	for(var i = self._layer.length - 1; i >= 0; i--){
		if(self._layer[i].mid == mid){
			list[list.length] = self._layer[i];
		}
	}
	return list;
}

/*
 * 根据name获取信息点
 * @author lijy
 * @method getByName
 * @for Point
 * @param {string} 信息点name
 * @return {list} list
 */
Point.prototype.getByName = function(name){
	var self = this;
	var list = [];
	for(var i = self._layer.length - 1; i >= 0; i--){
		if(self._layer[i].name == name){
			list[list.length] = self._layer[i];
		}
	}
	return list;
}

return Point;
})