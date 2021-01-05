/*
* author: 赵雪丹
* description: Model-模型
* day: 2017-9-28
*/
define( [], function(){
function Model(globe){
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
				if(key!="layer"){
					m_options[key] = typeof self._options.options[key]==="object"? deepCoyp(self._options.options[key]): self._options.options[key];
				}
			}
    		m_options.lon = lonlat.lon;
    		m_options.lat = lonlat.lat;
    		m_options.alt = lonlat.alt;
			m_options.layer = self._options.options.layer ? self._options.options.layer : null;
    		var m_model = self.add(m_options);
    		if(self._options.handlerCallback){
    			self._options.handlerCallback(m_model);
    		}
    	}
	}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

/*
 * 添加模型
 * @author zhaoxd
 * @method add
 * @for Model
 * @param {Object} 模型参数
 * @return {Cesium.Entity} model
 */
Model.prototype.add = function(options){
	var self = this;
	var pinBuilder = new Cesium.PinBuilder();
	var mid = options.mid ? options.mid : "";			//模型mid
	var name = options.name ? options.name : "default";		//模型name
	var scale = options.scale ? parseFloat(options.scale) : 1.0;	//缩放比例
	var lon = options.lon ? parseFloat(options.lon) : 0;			//经度
	var lat = options.lat ? parseFloat(options.lat) : 0;			//纬度
	var alt = options.alt ? parseFloat(options.alt) : 0;			//高程
	var uri = options.uri ? options.uri : ""; 						//模型地址
	var callback = options.callback ? options.callback : null;				//回调函数
	var setMenu = options.setMenu ? options.setMenu : null;					//设置右键菜单函数
	var leftClick = options.leftClick ? options.leftClick : null;			//左键点击事件
	var rightClick = options.rightClick ? options.rightClick : null;		//右键点击事件
	var description = options.description ? options.description : "";		//简介
	var showBox = options.showBox !== false;								//是否弹出信息框
	var windowWidth = options.windowWidth ? parseInt(options.windowWidth) : 100;		//气泡窗口宽度
	var windowHeight = options.windowHeight ? parseInt(options.windowHeight) : 80;	//气泡窗口高度
	var src = options.src ? options.src : "";								//iframe-src
	var showWindow = options.showWindow !== false;							//是否弹出气泡窗口
//	var layer = options.layer ? options.layer : self._defaultLayer;
	var catalog = options.catalog ? options.catalog : self._catalog;
	var subcatalog = options.subcatalog ? options.subcatalog : self._subcatalog;
	var minHeight = options.minHeight ? options.minHeight : self._minHeight;
	var maxHeight = options.maxHeight ? options.maxHeight : self._maxHeight;
	var label = options.label ? options.label : "";
	var heightReference = options.heightReference ? options.heightReference : Cesium.HeightReference.RELATIVE_TO_GROUND;
	var position;
	if(options.heightReference){
		position = Cesium.Cartesian3.fromDegrees(lon, lat, alt);
	}else{
		position = Cesium.Cartesian3.fromDegrees(lon, lat);
	}
	var modelPoint = {lon:lon,lat:lat,alt:alt};
	var model = self._viewer.entities.add({
	    mid : mid,
	    name : name,
//	    layer:layer,
		catalog: catalog,
		subcatalog: subcatalog,
		minHeight: minHeight,
		maxHeight: maxHeight,
		showHeight: true,
		showLayer: true,
		showEntity: true,
	    showBox : showBox,
	    showWindow : showWindow,
	    windowWidth : windowWidth,
	    windowHeight : windowHeight,
	    src : src,
	    callback : callback,
	    setMenu : setMenu,
	    leftClick : leftClick,
	    rightClick : rightClick,
	    position : position,
	    description : description,
	    modelPoint:modelPoint,
	    options:options,
	    model : {
	        uri : uri,
	        scale : scale,
	        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
	        shadows : Cesium.ShadowMode.ENABLED
	    },
	    label:{
	    	text:label,
	    	font:"14pt sans-serif",
	    	horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
	    	verticalOrigin : Cesium.VerticalOrigin.BASELINE,
	        heightReference: heightReference,
	        disableDepthTestDistance : Number.POSITIVE_INFINITY
	    }
	});
	self._layer[self._layer.length] = model;
	var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
	self._globe.layerManager._add("entityLayer",startTime,catalog,subcatalog);
	return model;
}

/*
 * 修改模型
 * @author zhaoxd
 * @method revise
 * @for Model
 * @param {Cesium.Entity} model-模型
 * @param {Object} options-模型参数
 * @return {null} options
 */
Model.prototype.revise = function(model,options){
	var self = this;
	for(var i = self._layer.length - 1; i >= 0; i--){
		if(self._layer[i] == model){
			var cartographic = Cesium.Cartographic.fromCartesian(self._layer[i]._position._value);
			var longitude = Cesium.Math.toDegrees(cartographic.longitude);
			var latitude = Cesium.Math.toDegrees(cartographic.latitude);
			var altitude = cartographic.height;
			var lon = options.lon ? parseFloat(options.lon) : longitude;
			var lat = options.lat ? parseFloat(options.lat) : latitude;
			var alt = options.alt ? parseFloat(options.alt) : altitude;
			var scale = options.scale ? parseFloat(options.scale) : self._layer[i]._model._scale._value;
			var label = options.label ? options.label : self._layer[i]._label._text._value;
			var show = self._layer[i].showEntity;
			if(!!options.show === options.show){
				show = options.show;
			}
			self._layer[i]._position._value = Cesium.Cartesian3.fromDegrees(lon, lat, alt);
			self._layer[i]._label._text._value = label;
			self._layer[i]._model._scale._value = scale;
			self._layer[i].showEntity = show;
		}
	}
}

/*
 * 球体点击添加模型
 * @author zhaoxd
 * @method drawHandler
 * @for Model
 * @param {Object} 模型参数
 * @return {null} null
 */
Model.prototype.drawHandler = function(options){
	var self = this;
	self._options.draw = true;
	self._options.options = options;
	var handlerCallback = options.handlerCallback ? options.handlerCallback : null;
	self._options.handlerCallback = handlerCallback;
}

/*
 * 暂停球体点击添加模型
 * @author zhaoxd
 * @method deactivateHandler
 * @for Model
 * @param {null} null
 * @return {null} null
 */
Model.prototype.deactivateHandler = function(){
	var self = this;
	self._options.draw = false;
}

/*
 * 移除模型
 * @author zhaoxd
 * @method remove
 * @for Model
 * @param {Cesium.Entity} 模型
 * @return {Boolean} true:成功,false:失败
 */
Model.prototype.remove = function(model){
	var self = this;
	for(var i = self._layer.length - 1; i >= 0; i--){
		if(self._layer[i] == model){
			var catalog = self._layer[i].catalog;
			var subcatalog = self._layer[i].subcatalog;
			var back = self._viewer.entities.remove(model);
			self._layer.splice(i, 1);
			self._globe.layerManager._remove("entityLayer",catalog,subcatalog);
			return back;
		}
	}
}

/*
 * 根据mid移除模型
 * @author zhaoxd
 * @method removeByMid
 * @for Model
 * @param {string} 模型mid
 * @return {Boolean} true:成功,false:失败
 */
Model.prototype.removeByMid = function(mid){
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
 * 根据name移除模型
 * @author zhaoxd
 * @method removeByName
 * @for Model
 * @param {string} 模型name
 * @return {Boolean} true:成功,false:失败
 */
Model.prototype.removeByName = function(name){
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
 * 根据mid获取模型
 * @author zhaoxd
 * @method getByMid
 * @for Model
 * @param {string} 模型mid
 * @return {list} list
 */
Model.prototype.getByMid = function(mid){
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
 * 根据name获取模型
 * @author zhaoxd
 * @method getByName
 * @for Model
 * @param {string} 模型name
 * @return {list} list
 */
Model.prototype.getByName = function(name){
	var self = this;
	var list = [];
	for(var i = self._layer.length - 1; i >= 0; i--){
		if(self._layer[i].name == name){
			list[list.length] = self._layer[i];
		}
	}
	return list;
}


return Model;
})