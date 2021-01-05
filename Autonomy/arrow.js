/*
* author: 赵雪丹
* description: Arrow-箭头
* day: 2017-9-28
*/
define( [], function(){
function Arrow(globe){
	var self = this;
	this._globe = globe;
	this._viewer = globe._viewer;
	this._globeId = globe._globeId;
	this._minHeight = 0;
	this._maxHeight = 1000000;
	this._catalog = "default";
	this._subcatalog = "default";
	this._showMenu = true;
	//箭头标绘绘制
	this._layer = {
		draw: false,
		drawid: "",
		layer: this._globe._defaultLayer,
		minHeight: 0,
		maxHeight: 1000000,
		catalog: "default",
		subcatalog: "default",
		mid: "",
		name: "default",
		type: "basic",
		clampMode: 0,
		callback: null,
		rightClick: null,
		subset: []
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
		for(var i = 0; i < self._layer.subset.length; i++){
			if(m_alt >= self._layer.subset[i].minHeight && m_alt <= self._layer.subset[i].maxHeight){
				self._layer.subset[i].showHeight = true;
			}else{
				self._layer.subset[i].showHeight = false;
			}
			if(self._layer.subset[i].showHeight && self._layer.subset[i].showLayer && self._layer.subset[i].showEntity){
				self._layer.subset[i].polygon.show = true;
				if(self._layer.subset[i].clampMode == 0){
					self._layer.subset[i].polyline.show = true;
				}
			}else{
				self._layer.subset[i].polygon.show = false;
				if(self._layer.subset[i].polyline){
					self._layer.subset[i].polyline.show = false;
				}
				
			}
		}
	});
	//私有注册事件
	this._handler = new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas);
	//LEFT_CLICK 左键点击事件
	this._handler.setInputAction(function (e) {
		var lonlat = self._globe.getLonLatByPosition(e.position);
		if(self._layer.draw){
			if(lonlat.alt < 0){
				lonlat.alt = 0;
			}
			if(self._layer.drawid == ""){
				var m_arrow_new = {id:"newarrow",
					mid:self._layer.mid,
					name:self._layer.name,
					type:self._layer.type,
					layer:self._layer.layer,
				    catalog: self._layer.catalog,
				    subcatalog: self._layer.subcatalog,
				    minHeight: self._layer.minHeight,
				    maxHeight: self._layer.maxHeight,
				    showHeight: true,
				    showLayer: true,
				    showEntity: true,
					clampMode:self._layer.clampMode,
					callback:self._layer.callback,
					polygon:null,
					polyline:null,
					points:[],
					vertexList:[],
					vertexLineList:[]};
				self._layer.subset[self._layer.subset.length] = m_arrow_new;
				self._layer.drawid = "newarrow";
				var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
				self._globe.layerManager._add("entityLayer",startTime,self._layer.catalog,self._layer.subcatalog);
			}
			var m_arrow;
			for(var i = 0; i < self._layer.subset.length; i++){
    			if(self._layer.subset[i].id == self._layer.drawid){
    				m_arrow = self._layer.subset[i];
					break;
    			}
    		}
			var m_point = {lon: lonlat.lon, lat: lonlat.lat, alt: lonlat.alt};
			m_arrow.points[m_arrow.points.length] = m_point;
  			if(m_arrow.points.length == 1){
  				m_arrow.vertexList = [];
				m_arrow.vertexLineList = [];
				if(m_arrow.clampMode == 0){
					m_arrow.polygon = self._viewer.entities.add({
						rightClick:self._layer.rightClick,
				        polygon : {
				            hierarchy : new Cesium.CallbackProperty(function(){
				                return m_arrow.vertexList;
				            }, false),
				            material : Cesium.Color.RED.withAlpha(0.5),
				            height: 2000
				        }
				    });
			        m_arrow.polyline = self._viewer.entities.add({
						polyline : {
						    positions : new Cesium.CallbackProperty(function(){
						        return m_arrow.vertexLineList;
						    }, false),
						    width : 3,
						    material : Cesium.Color.RED.withAlpha(1)
						}
					});
				}else{
					m_arrow.polygon = self._viewer.entities.add({
						rightClick:self._layer.rightClick,
				        polygon : {
				            hierarchy : new Cesium.CallbackProperty(function(){
				                return m_arrow.vertexList;
				            }, false),
				            material : Cesium.Color.RED.withAlpha(0.5)
				        }
				    });
			        m_arrow.polyline = null;
				}
				self._layer.drawid = m_arrow.id = m_arrow.polygon.id;
  			}else{
  				var m_list = CommonFunc.getArrowPointList(m_arrow.points,"polygon",m_arrow.type);
				m_arrow.vertexList = Cesium.Cartesian3.fromDegreesArrayHeights(m_list);
    			if(m_arrow.clampMode == 0){
  					var m_list_line = CommonFunc.getArrowPointList(m_arrow.points,"polyline",m_arrow.type);
					m_arrow.vertexLineList = Cesium.Cartesian3.fromDegreesArrayHeights(m_list_line);
  				}
    			if(m_arrow.points.length == 3){
    				self._layer.drawid = "";
		    		if(m_arrow.callback){
		    			m_arrow.callback(m_arrow);
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
    	var m_point = {lon: lonlat.lon, lat: lonlat.lat, alt: lonlat.alt};
		if(self._layer.draw){
    		var m_arrow;
    		for(var i = 0; i < self._layer.subset.length; i++){
    			if(self._layer.subset[i].id == self._layer.drawid){
    				m_arrow = self._layer.subset[i];
    				m_arrow.points[m_arrow.points.length] = m_point;
					break;
    			}
    		}
    		self._layer.drawid = "";
    		if(m_arrow.callback){
    			m_arrow.callback(m_arrow);
    		}
    	}
	}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
	//MOUSE_MOVE 鼠标移动事件
	this._handler.setInputAction(function (movement) {
		var lonlat = self._globe.getLonLatByPosition(movement.endPosition);
		if(self._layer.draw && self._layer.drawid != ""){
    		var m_arrow;
    		for(var i = 0; i < self._layer.subset.length; i++){
    			if(self._layer.subset[i].id == self._layer.drawid){
    				m_arrow = self._layer.subset[i];
					break;
    			}
    		}
    		if(m_arrow.points.length > 0){
				if(lonlat.alt < 0){
					lonlat.alt = 0;
				}
				var m_point = {lon: lonlat.lon, lat: lonlat.lat, alt: lonlat.alt};
    			var m_list = m_arrow.points.slice(0);
    			m_list[m_list.length] = m_point;
				var m_list_a = CommonFunc.getArrowPointList(m_list,"polygon",m_arrow.type);
				m_arrow.vertexList = Cesium.Cartesian3.fromDegreesArrayHeights(m_list_a);
    			if(m_arrow.clampMode == 0){
  					var m_list_line = CommonFunc.getArrowPointList(m_list,"polyline",m_arrow.type);
					m_arrow.vertexLineList = Cesium.Cartesian3.fromDegreesArrayHeights(m_list_line);
				}
    		}
    	}
	}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}

/*
 * 添加箭头
 * @author zhaoxd
 * @method add
 * @for Arrow
 * @param {Object} 箭头参数
 * @return {Cesium.Entity} arrow
 */
Arrow.prototype.add = function(options){
	var self = this;
	var mid = options.mid ? options.mid : "";
	var name = options.name ? options.name : "";
	var wlpha = options.wlpha ? parseFloat(options.wlpha) : 1;
	var clampMode = options.clampMode ? options.clampMode : 0;
	var type = options.type ? options.type : "basic";
	var height = options.height ? parseInt(options.height) : 2000;
	var rightClick = options.rightClick ? options.rightClick : null;
	var color = options.color ? options.color : Cesium.Color.RED;
	var pointList = options.pointList ? options.pointList : [];
	var layer = options.layer ? options.layer : self._globe._defaultLayer;
	var catalog = options.catalog ? options.catalog : self._catalog;
	var subcatalog = options.subcatalog ? options.subcatalog : self._subcatalog;
	var minHeight = options.minHeight ? options.minHeight : self._minHeight;
	var maxHeight = options.maxHeight ? options.maxHeight : self._maxHeight;
	var positions,positions_line;
	var m_list = CommonFunc.getArrowPointList(pointList,"polygon",type);
	positions = Cesium.Cartesian3.fromDegreesArrayHeights(m_list);
	if(clampMode == 0){
		var m_list_line = CommonFunc.getArrowPointList(pointList,"polyline",type);
		positions_line = Cesium.Cartesian3.fromDegreesArrayHeights(m_list_line);
	}
	var m_polygon,m_polyline;
	if(clampMode == 0){
		m_polygon = self._viewer.entities.add({
			mid:mid,
			name:name,
			options:options,
			rightClick:rightClick,
			polygon: {
			    hierarchy: positions,
			    material: color.withAlpha(wlpha),
	            height: height
			}
		});
		m_polyline = self._viewer.entities.add({
			mid:mid,
			name:name,
			options:options,
			polyline: {
			    positions: positions_line,
			    width: 3,
			    material: color.withAlpha(1)
			}
		});
	}else{
		m_polygon = self._viewer.entities.add({
			mid:mid,
			name:name,
			options:options,
			rightClick:rightClick,
			polygon: {
			    hierarchy: positions,
			    material: color.withAlpha(wlpha)
			}
		});
		m_polyline = null;
	}
	var m_arrow = {id:m_polygon.id,
		mid:mid,
		name:name,
		type:type,
		layer:layer,
	    catalog: catalog,
	    subcatalog: subcatalog,
	    minHeight: minHeight,
	    maxHeight: maxHeight,
	    showHeight: true,
	    showLayer: true,
	    showEntity: true,
		clampMode:clampMode,
		callback:null,
		polygon:m_polygon,
		polyline:m_polyline,
		points:pointList,
		vertexList:positions,
		vertexLineList:positions_line};
	self._layer.subset[self._layer.subset.length] = m_arrow;
	var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
	self._globe.layerManager._add("entityLayer",startTime,catalog,subcatalog);
	return m_arrow;
}

/*
 * 绘制箭头
 * @author zhaoxd
 * @method drawHandler
 * @for Arrow
 * @param {Object} 绘制参数
 * @return {null} null
 */
Arrow.prototype.drawHandler = function(options){
	var self = this;
	var m_mid = options.mid ? options.mid : "";
	var m_name = options.name ? options.name : "default";
	var m_type = options.type ? options.type : "basic";
	var m_clampMode = options.clampMode ? options.clampMode : 0;
	var m_callback = options.callback ? options.callback : null;
	var m_setMenu = options.setMenu ? options.setMenu : null;
	var m_layer = options.layer ? options.layer : self._globe._defaultLayer;
	var m_catalog = options.catalog ? options.catalog : self._catalog;
	var m_subcatalog = options.subcatalog ? options.subcatalog : self._subcatalog;
	var m_minHeight = options.minHeight ? options.minHeight : self._minHeight;
	var m_maxHeight = options.maxHeight ? options.maxHeight : self._maxHeight;
	var rightClick = options.rightClick ? options.rightClick : null;
	self._layer.draw = true;
	self._layer.drawid = "";
	self._layer.mid = m_mid;
	self._layer.name = m_name;
	self._layer.type = m_type;
	self._layer.clampMode = m_clampMode;
	self._layer.callback = m_callback;
	self._layer.rightClick = rightClick;
	self._layer.layer = m_layer;
	self._layer.catalog = m_catalog;
	self._layer.subcatalog = m_subcatalog;
	self._layer.minHeight = m_minHeight;
	self._layer.maxHeight = m_maxHeight;
	self._showMenu = self._globe.globeMenu._showMenu;
	self._globe.globeMenu.setType(false);
}

/*
 * 结束绘制箭头
 * @author zhaoxd
 * @method deactivateHandler
 * @for Arrow
 * @param {null} null
 * @return {null} null
 */
Arrow.prototype.deactivateHandler = function(){
	var self = this;
	self._layer.draw = false;
	self._layer.drawid = "";
	self._layer.mid = "";
	self._layer.name = "default";
	self._layer.type = "basic";
	self._layer.clampMode = 0;
	self._layer.callback = null;
	self._layer.layer = self._globe._defaultLayer;
	self._layer.catalog = self._catalog;
	self._layer.subcatalog = self._subcatalog;
	self._layer.minHeight = self._minHeight;
	self._layer.maxHeight = self._maxHeight;
	self._globe.globeMenu.setType(self._showMenu);
}

/*
 * 删除箭头对象
 * @author zhaoxd
 * @method remove
 * @for Arrow
 * @param {Entity} 箭头对象
 * @return {Boolean} true:成功,false:失败
 */
Arrow.prototype.remove = function(arrow){
	var self = this;
	var back;
	for(var i = self._layer.subset.length - 1; i >= 0; i--){
		if(self._layer.subset[i].id == arrow.id){
			var catalog = self._layer.subset[i].catalog;
			var subcatalog = self._layer.subset[i].subcatalog;
			back = self._viewer.entities.remove(self._layer.subset[i].polygon);
			if(!back){
				break;
			}
			if(arrow.clampMode == 0){
				back = self._viewer.entities.remove(self._layer.subset[i].polyline);
				if(!back){
					break;
				}
			}
			self._layer.subset.splice(i,1);
			self._globe.layerManager._remove("entityLayer",catalog,subcatalog);
		}
	}
	self._layer.draw = false;
	self._layer.drawid = "";
	self._layer.name = "default";
	self._layer.type = "basic";
	self._layer.clampMode = 0;
	self._layer.callback = null;
	self._layer.layer = self._globe._defaultLayer;
	self._layer.catalog = self._catalog;
	self._layer.subcatalog = self._subcatalog;
	self._layer.minHeight = self._minHeight;
	self._layer.maxHeight = self._maxHeight;
	return back;
}

/*
 * 根据mid移除箭头
 * @author zhaoxd
 * @method removeByMid
 * @for Arrow
 * @param {string} 箭头mid
 * @return {Boolean} true:成功,false:失败
 */
Arrow.prototype.removeByMid = function(mid){
	var self = this;
	var back = true;
	for(var i = self._layer.subset.length - 1; i >= 0; i--){
		if(self._layer.subset[i].mid == mid){
			var catalog = self._layer.subset[i].catalog;
			var subcatalog = self._layer.subset[i].subcatalog;
			back = self._viewer.entities.remove(self._layer.subset[i].polygon);
			if(!back){
				break;
			}
			if(arrow.clampMode == 0){
				back = self._viewer.entities.remove(self._layer.subset[i].polyline);
				if(!back){
					break;
				}
			}
			self._layer.subset.splice(i,1);
			self._globe.layerManager._remove("entityLayer",catalog,subcatalog);
		}
	}
	self._layer.draw = false;
	self._layer.drawid = "";
	self._layer.name = "default";
	self._layer.type = "basic";
	self._layer.clampMode = 0;
	self._layer.callback = null;
	self._layer.layer = self._globe._defaultLayer;
	self._layer.catalog = self._catalog;
	self._layer.subcatalog = self._subcatalog;
	self._layer.minHeight = self._minHeight;
	self._layer.maxHeight = self._maxHeight;
	return back;
}

/*
 * 根据name移除箭头
 * @author zhaoxd
 * @method removeByName
 * @for Arrow
 * @param {string} 箭头name
 * @return {Boolean} true:成功,false:失败
 */
Arrow.prototype.removeByName = function(name){
	var self = this;
	var back = true;
	for(var i = self._layer.subset.length - 1; i >= 0; i--){
		if(self._layer.subset[i].name == name){
			var catalog = self._layer.subset[i].catalog;
			var subcatalog = self._layer.subset[i].subcatalog;
			back = self._viewer.entities.remove(self._layer.subset[i].polygon);
			if(!back){
				break;
			}
			if(arrow.clampMode == 0){
				back = self._viewer.entities.remove(self._layer.subset[i].polyline);
				if(!back){
					break;
				}
			}
			self._layer.subset.splice(i,1);
			self._globe.layerManager._remove("entityLayer",catalog,subcatalog);
		}
	}
	self._layer.draw = false;
	self._layer.drawid = "";
	self._layer.name = "default";
	self._layer.type = "basic";
	self._layer.clampMode = 0;
	self._layer.callback = null;
	self._layer.layer = self._globe._defaultLayer;
	self._layer.catalog = self._catalog;
	self._layer.subcatalog = self._subcatalog;
	self._layer.minHeight = self._minHeight;
	self._layer.maxHeight = self._maxHeight;
	return back;
}

/*
 * 根据mid获取箭头
 * @author zhaoxd
 * @method getByMid
 * @for Arrow
 * @param {string} 箭头mid
 * @return {list} list
 */
Arrow.prototype.getByMid = function(mid){
	var self = this;
	var list = [];
	for(var i = self._layer.subset.length - 1; i >= 0; i--){
		if(self._layer.subset[i].mid == mid){
			list[list.length] = self._layer.subset[i];
		}
	}
	return list;
}

/*
 * 根据name获取箭头
 * @author zhaoxd
 * @method getByName
 * @for Arrow
 * @param {string} 箭头name
 * @return {list} list
 */
Arrow.prototype.getByName = function(name){
	var self = this;
	var list = [];
	for(var i = self._layer.subset.length - 1; i >= 0; i--){
		if(self._layer.subset[i].name == name){
			list[list.length] = self._layer.subset[i];
		}
	}
	return list;
}

return Arrow;
})