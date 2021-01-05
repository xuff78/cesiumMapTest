define( [], function(){
function Rectangle(globe){
	var self = this;
	this._globe = globe;
	this._viewer = globe._viewer;
	this._globeId = globe._globeId;
	this._handler = new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas);
	this._minHeight = 0;
	this._maxHeight = 1000000;
	this._catalog = "default";
	this._subcatalog = "default";
	this._layer = [];
	this._showMenu = true;
	//STK级别
	this._stkLevel = 14;
	
	//风向
	this._options = {
		draw: false, 
		drawid: '', 
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
				self._layer[i].rotate.show = true;
			}else{
				self._layer[i].rotate.show = false;
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
			var pinBuilder = new Cesium.PinBuilder();
			var url = m_options.url ? m_options.url : pinBuilder.fromColor(Cesium.Color.ROYALBLUE, 48).toDataURL();
			var m_obj = {
				rotate : null, 
				pointList : pointList, 
				vertexList:null, 
				layer:m_layer, 
				catalog: catalog,
				subcatalog: subcatalog,
				minHeight: minHeight,
				maxHeight: maxHeight,
				showHeight: true,
				showLayer: true,
				showEntity: true,
				angle: 0
			};
			m_obj.rotate = self._viewer.entities.add({
			    mid : mid,
			    name : name,
			    rightClick : rightClick,
			    options:m_options,
			    rectangle: {
			        coordinates: new Cesium.CallbackProperty(function(){return m_obj.vertexList}, false),//Cesium.Rectangle.fromDegrees(west, south, east, north),
			        material: url,
			        rotation: new Cesium.CallbackProperty(function(){return m_obj.angle}, false),
			        stRotation: new Cesium.CallbackProperty(function(){return m_obj.angle}, false),
			        height: lonlat.alt+1000
			    },
			});
			m_obj.rotate.rectangle.material = new Cesium.ImageMaterialProperty({
				image: url,
				transparent: true
			});
			
			self._layer.push(m_obj);
			self._options.drawid = m_obj.rotate.id;
			var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
			self._globe.layerManager._add("entityLayer",startTime,catalog,subcatalog);
		}
		
		
	}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
	
	//鼠标移动事件注册
	this._handler.setInputAction(function(movement){
		var lonlat = self._globe.getLonLatByPosition(movement.endPosition);
		if(self._options.draw && self._options.drawid != ''){
		    //self._layer[self._layer.length - 1].pointList.push(lonlat);
			var m_pointList = self._layer[self._layer.length - 1].pointList.slice(0);
			if(!self._contains(m_pointList, lonlat)){
				m_pointList.push(lonlat);
				var startPoint = m_pointList[0];
				var endPoint = m_pointList[m_pointList.length - 1];
				var distance = CommonFunc.getDistance(startPoint.lon, startPoint.lat, endPoint.lon, endPoint.lat);
				var angle0 = CommonFunc.getAngle(startPoint.lon, startPoint.lat, endPoint.lon, endPoint.lat);
				var midPoint = CommonFunc.destinationVincenty(startPoint.lon, startPoint.lat, startPoint.alt, angle0, 0, distance / 2);
				var tempList = [];
				var pointList = [];
				tempList[0] = CommonFunc.destinationVincenty(midPoint.lon, midPoint.lat, midPoint.alt, 270, 0, distance / 2);
				tempList[1] = CommonFunc.destinationVincenty(midPoint.lon, midPoint.lat, midPoint.alt, 90, 0, distance / 2);
				pointList[0] = CommonFunc.destinationVincenty(tempList[0].lon, tempList[0].lat, 2000, 180, 0, distance / 3);
				pointList[1] = CommonFunc.destinationVincenty(tempList[1].lon, tempList[1].lat, 2000, -90, 0, distance / 3);
				var m_array = new Array();
			    for(var i = 0; i < pointList.length; i++){
			    	m_array.push(pointList[i].lon);
			    	m_array.push(pointList[i].lat);
			    }
			    var west = parseFloat(m_array[0]);
			    var south = parseFloat(m_array[1]);
			    var east = parseFloat(m_array[2]);
			    var north = parseFloat(m_array[3]);
			    var tempAngle = CommonFunc.getAngle(m_pointList[0].lon, m_pointList[0].lat, m_pointList[1].lon, m_pointList[1].lat);
			    var temp = tempAngle;
			    if(tempAngle >0 && tempAngle <= 90){
			    	temp = 90 - temp;
			    }else{
			    	temp = 450 - temp;
			    }
			    tempAngle = temp;
			    var angle = Cesium.Math.toRadians(tempAngle);
				self._layer[self._layer.length - 1].vertexList = Cesium.Rectangle.fromDegrees(west, south, east, north);
				self._layer[self._layer.length - 1].angle = angle;
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
			self._layer[self._layer.length - 1].pointList.push(lonlat);
			var m_pointList = self._layer[self._layer.length - 1].pointList.slice(0);
			var m_options = self._layer[self._layer.length - 1].rotate.options;
			var clampMode = m_options.clampMode ? m_options.clampMode : 0;
			
			var startPoint = m_pointList[0];
			var endPoint = m_pointList[m_pointList.length - 1];
			var distance = CommonFunc.getDistance(startPoint.lon, startPoint.lat, endPoint.lon, endPoint.lat);
			var angle0 = CommonFunc.getAngle(startPoint.lon, startPoint.lat, endPoint.lon, endPoint.lat);
			var midPoint = CommonFunc.destinationVincenty(startPoint.lon, startPoint.lat, startPoint.alt, angle0, 0, distance / 2);
			var tempList = [];
			var pointList = [];
			tempList[0] = CommonFunc.destinationVincenty(midPoint.lon, midPoint.lat, midPoint.alt, 270, 0, distance / 2);
			tempList[1] = CommonFunc.destinationVincenty(midPoint.lon, midPoint.lat, midPoint.alt, 90, 0, distance / 2);
			pointList[0] = CommonFunc.destinationVincenty(tempList[0].lon, tempList[0].lat, 2000, 180, 0, distance / 3);
			pointList[1] = CommonFunc.destinationVincenty(tempList[1].lon, tempList[1].lat, 2000, -90, 0, distance / 3);
			var m_array = new Array();
		    for(var i = 0; i < pointList.length; i++){
		    	m_array.push(pointList[i].lon);
		    	m_array.push(pointList[i].lat);
		    }
		    var west = parseFloat(m_array[0]);
		    var south = parseFloat(m_array[1]);
		    var east = parseFloat(m_array[2]);
		    var north = parseFloat(m_array[3]);
		    var tempAngle = CommonFunc.getAngle(m_pointList[0].lon, m_pointList[0].lat, m_pointList[1].lon, m_pointList[1].lat);
		    var temp = tempAngle;
		    if(tempAngle >0 && tempAngle <= 90){
		    	temp = 90 - temp;
		    }else{
		    	temp = 450 - temp;
		    }
		    tempAngle = temp;
		    var angle = Cesium.Math.toRadians(tempAngle);
			self._layer[self._layer.length - 1].vertexList = Cesium.Rectangle.fromDegrees(west, south, east, north);
			self._layer[self._layer.length - 1].angle = angle;
			
			self._options.drawid = '';
			self._options.handlerCallback(self._layer[self._layer.length - 1]);
		}
		
	}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
}


/**
 * 球体点击添加风向
 * @author lijy
 * @method drawHandler
 * @for Rectangle
 * @param {options} 画风向的参数
 * @return {null} null
 */
Rectangle.prototype.drawHandler = function(options){
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
 * 球体添加风向
 * @author lijy
 * @method add
 * @for Rectangle
 * @param {options} 画风向的参数
 * @return {m_obj} 风向对象
 */
Rectangle.prototype.add = function(options){
	var self = this;
	var mid = options.mid ? options.mid : "";
	var name = options.name ? options.name : "";
	var width = options.width ? options.width : 3;
	var wlpha = options.wlpha ? options.wlpha : 0.5;
	var rightClick = options.rightClick ? options.rightClick : null;
	var color = options.color ? options.color : Cesium.Color.BLUE;
	var m_layer = options.layer ? options.layer : self._globe._defaultLayer;
	var catalog = options.catalog ? options.catalog : self._catalog;
	var subcatalog = options.subcatalog ? options.subcatalog : self._subcatalog;
	var minHeight = options.minHeight ? options.minHeight : self._minHeight;
	var maxHeight = options.maxHeight ? options.maxHeight : self._maxHeight;
	var clampMode = options.clampMode ? options.clampMode : 0;
	var m_pointList = options.pointList ? options.pointList : [];
	var pinBuilder = new Cesium.PinBuilder();
	var url = options.url ? options.url : pinBuilder.fromColor(Cesium.Color.ROYALBLUE, 48).toDataURL();
	
	var startPoint = m_pointList[0];
	var endPoint = m_pointList[m_pointList.length - 1];
	var distance = CommonFunc.getDistance(startPoint.lon, startPoint.lat, endPoint.lon, endPoint.lat);
	var angle0 = CommonFunc.getAngle(startPoint.lon, startPoint.lat, endPoint.lon, endPoint.lat);
	var midPoint = CommonFunc.destinationVincenty(startPoint.lon, startPoint.lat, startPoint.alt, angle0, 0, distance / 2);
	var tempList = [];
	var pointList = [];
	tempList[0] = CommonFunc.destinationVincenty(midPoint.lon, midPoint.lat, midPoint.alt, 270, 0, distance / 2);
	tempList[1] = CommonFunc.destinationVincenty(midPoint.lon, midPoint.lat, midPoint.alt, 90, 0, distance / 2);
	pointList[0] = CommonFunc.destinationVincenty(tempList[0].lon, tempList[0].lat, 2000, 180, 0, distance / 3);
	pointList[1] = CommonFunc.destinationVincenty(tempList[1].lon, tempList[1].lat, 2000, -90, 0, distance / 3);
	var m_array = new Array();
    for(var i = 0; i < pointList.length; i++){
    	m_array.push(pointList[i].lon);
    	m_array.push(pointList[i].lat);
    }
    var west = parseFloat(m_array[0]);
    var south = parseFloat(m_array[1]);
    var east = parseFloat(m_array[2]);
    var north = parseFloat(m_array[3]);
    var tempAngle = CommonFunc.getAngle(m_pointList[0].lon, m_pointList[0].lat, m_pointList[1].lon, m_pointList[1].lat);
    var temp = tempAngle;
    if(tempAngle >0 && tempAngle <= 90){
    	temp = 90 - temp;
    }else{
    	temp = 450 - temp;
    }
    tempAngle = temp;
    var angle = Cesium.Math.toRadians(tempAngle);
	var m_obj = {
		rotate : null, 
		pointList : m_pointList, 
		vertexList:null, 
		layer:m_layer, 
		catalog: catalog,
		subcatalog: subcatalog,
		minHeight: minHeight,
		maxHeight: maxHeight,
		showHeight: true,
		showLayer: true,
		showEntity: true,
		angle: 0
	};
	m_obj.rotate = self._viewer.entities.add({
	    mid : mid,
	    name : name,
	    rightClick : rightClick,
	    options:options,
	    rectangle: {
	        coordinates: Cesium.Rectangle.fromDegrees(west, south, east, north),//Cesium.Rectangle.fromDegrees(west, south, east, north),
	        material: url,
	        rotation: angle,
	        stRotation: angle,
	        height: 2000,
	    },
	});
	m_obj.rotate.rectangle.material = new Cesium.ImageMaterialProperty({
		image: url,
		transparent: true
	});
	self._layer[self._layer.length] = m_obj;
	var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
	self._globe.layerManager._add("entityLayer",startTime,catalog,subcatalog);
	return m_obj;
	
}
/*
 * 暂停球体点击添加风向
 * @author lijy
 * @method deactivateHandler
 * @for Rectangle
 * @param {null} null
 * @return {null} null
 */
Rectangle.prototype.deactivateHandler = function(){
	var self = this;
	self._options.draw = false;
	self._globe.globeMenu.setType(self._showMenu);
}
/*
 * 移除风向
 * @author lijy
 * @method remove
 * @for Rectangle
 * @param {Cesium.Entity} 风向对象
 * @return {Boolean} true:成功,false:失败
 */
Rectangle.prototype.remove = function(rotate){
	var self = this;
	for(var i = self._layer.length - 1; i >= 0; i--){
		if(self._layer[i].rotate == rotate){
			var catalog = self._layer[i].catalog;
			var subcatalog = self._layer[i].subcatalog;
			var back = self._viewer.entities.remove(rotate);
			self._layer.splice(i, 1);
			self._globe.layerManager._remove("entityLayer",catalog,subcatalog);
			return back;
		}
	}
}
/*
 * 根据mid移除风向
 * @author lijy
 * @method removeByMid
 * @for Rectangle
 * @param {string} 风向对象mid
 * @return {Boolean} true:成功,false:失败
 */
Rectangle.prototype.removeByMid = function(mid){
	var self = this;
	var back = true;
	for(var i = self._layer.length - 1; i >= 0; i--){
		if(self._layer[i].rotate.mid == mid){
			var catalog = self._layer[i].catalog;
			var subcatalog = self._layer[i].subcatalog;
			back = self._viewer.entities.remove(self._layer[i].rotate);
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
 * 根据name移除风向
 * @author lijy
 * @method removeByMid
 * @for Rectangle
 * @param {string} 风向对象name
 * @return {Boolean} true:成功,false:失败
 */
Rectangle.prototype.removeByName = function(name){
	var self = this;
	var back = true;
	for(var i = self._layer.length - 1; i >= 0; i--){
		if(self._layer[i].rotate.name == name){
			var catalog = self._layer[i].catalog;
			var subcatalog = self._layer[i].subcatalog;
			back = self._viewer.entities.remove(self._layer[i].rotate);
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
 * 根据mid获取风向
 * @author lijy
 * @method getByMid
 * @for Rectangle
 * @param {string} 风向mid
 * @return {list} list
 */
Rectangle.prototype.getByMid = function(mid){
	var self = this;
	var list = [];
	for(var i = self._layer.length - 1; i >= 0; i--){
		if(self._layer[i].rotate.mid == mid){
			list[list.length] = self._layer[i].rotate;
		}
	}
	return list;
}

/*
 * 根据name获取风向
 * @author lijy
 * @method getByName
 * @for Rectangle
 * @param {string} 风向name
 * @return {list} list
 */
Rectangle.prototype.getByName = function(name){
	var self = this;
	var list = [];
	for(var i = self._layer.length - 1; i >= 0; i--){
		if(self._layer[i].rotate.name == name){
			list[list.length] = self._layer[i].rotate;
		}
	}
	return list;
}


//私有方法
/**
 * 判断数组中是否存在重复元素
 */
Rectangle.prototype._contains = function(arr, obj){
	var i = arr.length;  
    while (i--) {  
        if (arr[i].lon === obj.lon && arr[i].lat === obj.lat) {  
            return true;  
        }  
    }  
    return false;
}

return Rectangle;
})