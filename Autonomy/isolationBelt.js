/*
* author: 赵雪丹
* description: IsolationBelt-隔离带
* day: 2017-9-28
*/
define( [], function(){
function IsolationBelt(globe){
	var self = this;
	this._globe = globe;
	this._viewer = globe._viewer;
	this._globeId = globe._globeId;
	this._minHeight = 0;
	this._maxHeight = 1000000;
	this._catalog = "default";
	this._subcatalog = "default";
	this._showMenu = true;
	//隔离带标绘绘制
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
				for(var k = 0; k < self._layer.subset[i].polygons.length; k++){
					self._layer.subset[i].polygons[k].polygon.show = true;
					self._layer.subset[i].polygons[k].polygonHat.show = true;
				}
			}else{
				for(var k = 0; k < self._layer.subset[i].polygons.length; k++){
					self._layer.subset[i].polygons[k].polygon.show = false;
					self._layer.subset[i].polygons[k].polygonHat.show = false;
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
			var m_cartographic = Cesium.Cartographic.fromCartesian(self._viewer.scene.camera.position);
			m_alt = m_cartographic.height;
//			if(m_alt < 10000){
			if(true){
				if(self._layer.drawid == ""){
					var m_isolationBelt_new = {
						id:"newisolationBelt",
						layer:self._layer.layer,
						catalog: self._layer.catalog,
						subcatalog: self._layer.subcatalog,
						minHeight: self._layer.minHeight,
						maxHeight: self._layer.maxHeight,
						showHeight: true,
						showLayer: true,
						showEntity: true,
						mid:self._layer.mid,
						name:self._layer.name,
						callback:self._layer.callback,
						polygons:[],
						points:[]
					};
					self._layer.subset.push(m_isolationBelt_new);
					self._layer.drawid = "newisolationBelt";
					var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
					self._globe.layerManager._add("entityLayer",startTime,self._layer.catalog,self._layer.subcatalog);
				}
				var m_isolationBelt;
				for(var i = 0; i < self._layer.subset.length; i++){
	    			if(self._layer.subset[i].id == self._layer.drawid){
	    				m_isolationBelt = self._layer.subset[i];
						break;
	    			}
	    		}
				var m_point = {lon: lonlat.lon, lat: lonlat.lat, alt: lonlat.alt};
				m_isolationBelt.points.push(m_point);
				if(m_isolationBelt.points.length == 1){
					var m_obj = {};
					m_obj.vertexList = [];
					m_obj.vertexListHat = [];
					m_obj.polygon = self._viewer.entities.add({
						rightClick:self._layer.rightClick,
						mid:self._layer.mid,
						name:self._layer.name,
				        polygon : {
				            hierarchy : new Cesium.CallbackProperty(function(){
				                return m_obj.vertexList;
				            }, false),
				            material : Cesium.Color.WHITE.withAlpha(1)
				        }
				    });
					m_obj.polygonHat = self._viewer.entities.add({
						rightClick:self._layer.rightClick,
						mid:self._layer.mid,
						name:self._layer.name,
				        polygon : {
				            hierarchy : new Cesium.CallbackProperty(function(){
				                return m_obj.vertexListHat;
				            }, false),
				            material : Cesium.Color.WHITE.withAlpha(1)
				        }
				    });
					m_isolationBelt.polygons.push(m_obj);
					self._layer.drawid = m_isolationBelt.id = m_obj.polygon.id;
				}else{
					var m_obj = {};
					m_obj.vertexList = [];
					m_obj.vertexListHat = [];
					m_obj.polygon = self._viewer.entities.add({
						rightClick:self._layer.rightClick,
						mid:self._layer.mid,
						name:self._layer.name,
				        polygon : {
				            hierarchy : new Cesium.CallbackProperty(function(){
				                return m_obj.vertexList;
				            }, false),
				            material : Cesium.Color.WHITE.withAlpha(1)
				        }
				    });
					m_obj.polygonHat = self._viewer.entities.add({
						rightClick:self._layer.rightClick,
						mid:self._layer.mid,
						name:self._layer.name,
				        polygon : {
				            hierarchy : new Cesium.CallbackProperty(function(){
				                return m_obj.vertexListHat;
				            }, false),
				            material : Cesium.Color.WHITE.withAlpha(1)
				        }
				    });
					m_isolationBelt.polygons.push(m_obj);
				}
			}else{
				if(self._layer.callback) self._layer.callback(null);
				self._layer.draw = false;
				self._layer.drawid = '';
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
    		var m_isolationBelt;
    		for(var i = 0; i < self._layer.subset.length; i++){
    			if(self._layer.subset[i].id == self._layer.drawid){
    				m_isolationBelt = self._layer.subset[i];
    				m_isolationBelt.points.push(m_point);
					break;
    			}
    		}
    		self._layer.drawid = "";
    		if(m_isolationBelt.callback){
    			m_isolationBelt.callback(m_isolationBelt);
    		}
    	}
	}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
	//MOUSE_MOVE 鼠标移动事件
	this._handler.setInputAction(function (movement) {
		var lonlat = self._globe.getLonLatByPosition(movement.endPosition);
		if(self._layer.draw && self._layer.drawid != ""){
    		var m_isolationBelt;
    		for(var i = 0; i < self._layer.subset.length; i++){
    			if(self._layer.subset[i].id == self._layer.drawid){
    				m_isolationBelt = self._layer.subset[i];
					break;
    			}
    		}
    		if(m_isolationBelt.points.length > 0){
				if(lonlat.alt < 0){
					lonlat.alt = 0;
				}
				var m_point = {lon: lonlat.lon, lat: lonlat.lat, alt: lonlat.alt};
    			var m_list = [];
    			m_list.push(m_isolationBelt.points[m_isolationBelt.points.length-1]);
    			m_list.push(m_point);
				var m_list_a = self.getPointList(m_list);
				m_isolationBelt.polygons[m_isolationBelt.polygons.length - 1].vertexList = Cesium.Cartesian3.fromDegreesArrayHeights(m_list_a.vertexList);
				m_isolationBelt.polygons[m_isolationBelt.polygons.length - 1].vertexListHat = Cesium.Cartesian3.fromDegreesArrayHeights(m_list_a.vertexListHat);
    		}
    	}
	}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}

IsolationBelt.prototype.getPointList = function(pointList){
	var self = this;
	var m_h = 2000;
	var m_width = 20;
	var m_height = 50;
	var m_dis = 300;
	var m_leftHatList = [];
	var m_rightHatList = [];
	var m_leftList = [];
	var m_rightList = [];
	if(pointList.length < 2){
		return {vertexList:[],vertexListHat:[]};
	}else if(pointList.length == 2){
		var m_sp = {lon:pointList[0].lon,lat:pointList[0].lat,alt:m_h};
		var m_ep = {lon:pointList[1].lon,lat:pointList[1].lat,alt:m_h};
		var m_kzList = [];
		var m_distance = self._globe.commonFunc.getDistance(m_sp.lon,m_sp.lat,m_ep.lon,m_ep.lat);
		var m_angle = self._globe.commonFunc.getAngle(m_sp.lon, m_sp.lat, m_ep.lon, m_ep.lat);
		
		var m_s1 = m_sp;
		var m_s2 = self._globe.commonFunc.destinationVincenty(m_sp.lon, m_sp.lat, m_h, m_angle + 90, 0, m_width);
		var m_s3 = self._globe.commonFunc.destinationVincenty(m_s2.lon, m_s2.lat, m_h, m_angle, 0, m_width);
		var m_s4 = self._globe.commonFunc.destinationVincenty(m_s3.lon, m_s3.lat, m_h, m_angle + 90, 0, m_height);
		var m_s5 = self._globe.commonFunc.destinationVincenty(m_sp.lon, m_sp.lat, m_h, m_angle + 90, 0, m_height + m_width * 2);
		m_leftHatList.push(m_s1);
		m_rightHatList.push(m_s2);
		m_rightHatList.push(m_s3);
		m_leftList.push(m_s2);
		m_leftList.push(m_s3);
		m_leftList.push(m_s4);
		m_rightList.push(m_s5);
		if(m_distance < 100){
			m_kzList = [];
		}else if(m_distance < m_dis*2){
			var m_kz = self._globe.commonFunc.destinationVincenty(m_sp.lon, m_sp.lat, m_h, m_angle, 0, m_distance/2);
			m_kzList.push(m_kz);
		}else{
			var m_nun = parseInt((m_distance-200)/m_dis);
			var m_dis_sy = m_distance - m_dis*m_nun;
			var m_dis_se = m_dis_sy/2;
			var p0 = Cesium.Cartesian3.fromDegrees(m_sp.lon,m_sp.lat,m_h);
			var p1 = Cesium.Cartesian3.fromDegrees(m_ep.lon,m_ep.lat,m_h);
			var direction = new Cesium.Cartesian3();
			Cesium.Cartesian3.subtract(p1, p0, direction);
		    Cesium.Cartesian3.normalize(direction, direction);
		    var ray = new Cesium.Ray(p0, direction);
			for(var k = 0; k <= m_nun; k++){
				var m_kz_d = m_dis_se + m_dis*k;
				var pt = Cesium.Ray.getPoint(ray, m_kz_d);
				var cartographic = Cesium.Cartographic.fromCartesian(pt);
				var longitude = Cesium.Math.toDegrees(cartographic.longitude);
				var latitude = Cesium.Math.toDegrees(cartographic.latitude);
				var height = cartographic.height;
				var m_kz = {lon:longitude,lat:latitude,alt:height};
				m_kzList.push(m_kz);
			}
		}
		for(var k = 0; k < m_kzList.length; k++){
			var m_n5 = m_kzList[k];
			var m_np = self._globe.commonFunc.destinationVincenty(m_n5.lon, m_n5.lat, m_h, m_angle + 90, 0, m_height + m_width);
			var m_n1 = self._globe.commonFunc.destinationVincenty(m_np.lon, m_np.lat, m_h, m_angle - 180, 0, m_width);
			var m_n2 = self._globe.commonFunc.destinationVincenty(m_np.lon, m_np.lat, m_h, m_angle - 90, 0, m_height);
			var m_n3 = self._globe.commonFunc.destinationVincenty(m_np.lon, m_np.lat, m_h, m_angle, 0, m_width);
			var m_n4 = self._globe.commonFunc.destinationVincenty(m_np.lon, m_np.lat, m_h, m_angle + 90, 0, m_width);
			m_leftHatList.push(m_n5);
			m_rightHatList.push(m_n2);
			m_leftList.push(m_n1);
			m_leftList.push(m_n2);
			m_leftList.push(m_n3);
			m_rightList.push(m_n4);
		}
		var m_e1 = m_ep;
		var m_e2 = self._globe.commonFunc.destinationVincenty(m_ep.lon, m_ep.lat, m_h, m_angle + 90, 0, m_width);
		var m_e3 = self._globe.commonFunc.destinationVincenty(m_e2.lon, m_e2.lat, m_h, m_angle - 180, 0, m_width);
		var m_e4 = self._globe.commonFunc.destinationVincenty(m_e3.lon, m_e3.lat, m_h, m_angle + 90, 0, m_height);
		var m_e5 = self._globe.commonFunc.destinationVincenty(m_ep.lon, m_ep.lat, m_h, m_angle + 90, 0, m_height + m_width * 2);
		m_leftHatList.push(m_e1);
		m_rightHatList.push(m_e3);
		m_rightHatList.push(m_e2);
		m_leftList.push(m_e4);
		m_leftList.push(m_e3);
		m_leftList.push(m_e2);
		m_rightList.push(m_e5);
		var m_list = [];
		for(var i = 0; i < m_leftList.length; i++){
			m_list.push(m_leftList[i]);
		}
		for(var i = m_rightList.length - 1; i >= 0; i--){
			m_list.push(m_rightList[i]);
		}
		var m_array = new Array();
	    for(var i = 0; i < m_list.length; i++){
	    	m_array.push(m_list[i].lon);
	    	m_array.push(m_list[i].lat);
	  		m_array.push(m_list[i].alt);
	    }
	    var m_listHat = [];
		for(var i = 0; i < m_leftHatList.length; i++){
			m_listHat.push(m_leftHatList[i]);
		}
		for(var i = m_rightHatList.length - 1; i >= 0; i--){
			m_listHat.push(m_rightHatList[i]);
		}
		var m_arrayHat = new Array();
	    for(var i = 0; i < m_listHat.length; i++){
	    	m_arrayHat.push(m_listHat[i].lon);
	    	m_arrayHat.push(m_listHat[i].lat);
	  		m_arrayHat.push(m_listHat[i].alt);
	    }
		return {vertexList: m_array,vertexListHat: m_arrayHat};
	}else{
		return {vertexList:[],vertexListHat:[]};
	}
}

/*
 * 添加隔离带
 * @author zhaoxd
 * @method add
 * @for IsolationBelt
 * @param {Object} 隔离带参数
 * @return {Cesium.Entity} isolationBelt
 */
IsolationBelt.prototype.add = function(options){
	var self = this;
	var mid = options.mid ? options.mid : "";
	var name = options.name ? options.name : "default";
	var rightClick = options.rightClick ? options.rightClick : null;
	var pointList = options.pointList ? options.pointList : [];
	var layer = options.layer ? options.layer : self._globe._defaultLayer;
	var catalog = options.catalog ? options.catalog : self._catalog;
	var subcatalog = options.subcatalog ? options.subcatalog : self._subcatalog;
	var minHeight = options.minHeight ? options.minHeight : self._minHeight;
	var maxHeight = options.maxHeight ? options.maxHeight : self._maxHeight;
	
//	var m_list = CommonFunc.getIsolationBeltPointList(pointList);
//	var vertexList = Cesium.Cartesian3.fromDegreesArrayHeights(m_list.vertexList);
//	var vertexListHat = Cesium.Cartesian3.fromDegreesArrayHeights(m_list.vertexListHat);
//	var m_polygon = self._viewer.entities.add({
//		mid:mid,
//		name:name,
//		options:options,
//		rightClick:rightClick,
//		polygon: {
//		    hierarchy: vertexList,
//		    material: Cesium.Color.WHITE.withAlpha(1)
//		}
//	});
//	var m_polygonHat = self._viewer.entities.add({
//		mid:mid,
//		name:name,
//		options:options,
//		rightClick:rightClick,
//		polygon: {
//		    hierarchy: vertexListHat,
//		    material: Cesium.Color.WHITE.withAlpha(1)
//		}
//	});
	var m_isolationBelt = {
//		id:m_polygon.id,
		layer:layer,
		catalog: catalog,
		subcatalog: subcatalog,
		minHeight: minHeight,
		maxHeight: maxHeight,
		showHeight: true,
		showLayer: true,
		showEntity: true,
		mid:mid,
		name:name,
		callback:null,
		polygons:[],
		points:pointList
	};
	for(var i = 0; i < pointList.length - 1; i++){
		(function(i){
			var m_obj = {};
			m_obj.vertexList = [];
			m_obj.vertexListHat = [];
			var m_list = [];
			m_list.push(pointList[i]);
			m_list.push(pointList[i + 1]);
			var m_list_a = self.getPointList(m_list);
			m_obj.vertexList = Cesium.Cartesian3.fromDegreesArrayHeights(m_list_a.vertexList);
			m_obj.vertexListHat = Cesium.Cartesian3.fromDegreesArrayHeights(m_list_a.vertexListHat);
			m_obj.polygon = self._viewer.entities.add({
				rightClick:self._layer.rightClick,
				mid:mid,
				name:name,
		        polygon : {
		            hierarchy : new Cesium.CallbackProperty(function(){
		                return m_obj.vertexList;
		            }, false),
		            material : Cesium.Color.WHITE.withAlpha(1)
		        }
		    });
			m_obj.polygonHat = self._viewer.entities.add({
				rightClick:self._layer.rightClick,
				mid:mid,
				name:name,
		        polygon : {
		            hierarchy : new Cesium.CallbackProperty(function(){
		                return m_obj.vertexListHat;
		            }, false),
		            material : Cesium.Color.WHITE.withAlpha(1)
		        }
		    });
			m_isolationBelt.polygons.push(m_obj);
			if(i == 0){
				m_isolationBelt.id = m_obj.polygon.id;
			}
		})(i);
	}
	self._layer.push(m_isolationBelt);
	var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
	self._globe.layerManager._add("entityLayer",startTime,catalog,subcatalog);
	return m_isolationBelt;
}

/*
 * 绘制隔离带
 * @author zhaoxd
 * @method drawHandler
 * @for IsolationBelt
 * @param {function} 回调函数
 * @return {null} null
 */
IsolationBelt.prototype.drawHandler = function(options){
	var self = this;
	var m_mid = options.mid ? options.mid : "";
	var m_name = options.name ? options.name : "default";
	var m_callback = options.callback ? options.callback : null;
	var m_rightClick = options.rightClick ? options.rightClick : null;
	var m_layer = options.layer ? options.layer : self._globe._defaultLayer;
	var m_catalog = options.catalog ? options.catalog : self._catalog;
	var m_subcatalog = options.subcatalog ? options.subcatalog : self._subcatalog;
	var m_minHeight = options.minHeight ? options.minHeight : self._minHeight;
	var m_maxHeight = options.maxHeight ? options.maxHeight : self._maxHeight;
	self._layer.draw = true;
	self._layer.drawid = "";
	self._layer.mid = m_mid;
	self._layer.name = m_name;
	self._layer.callback = m_callback;
	self._layer.rightClick = m_rightClick;
	self._layer.layer = m_layer;
	self._showMenu = self._globe.globeMenu._showMenu;
	self._layer.catalog = m_catalog;
	self._layer.subcatalog = m_subcatalog;
	self._layer.minHeight = m_minHeight;
	self._layer.maxHeight = m_maxHeight;
	self._globe.globeMenu.setType(false);
}

/*
 * 结束绘制隔离带
 * @author zhaoxd
 * @method deactivateHandler
 * @for IsolationBelt
 * @param {null} null
 * @return {null} null
 */
IsolationBelt.prototype.deactivateHandler = function(){
	var self = this;
	self._layer.draw = false;
	self._layer.drawid = "";
	self._layer.mid = "";
	self._layer.name = "default";
	self._layer.callback = null;
	self._layer.layer = self._globe._defaultLayer;
	self._layer.catalog = self._catalog;
	self._layer.subcatalog = self._subcatalog;
	self._layer.minHeight = self._minHeight;
	self._layer.maxHeight = self._maxHeight;
	self._globe.globeMenu.setType(self._showMenu);
}

/*
 * 删除隔离带对象
 * @author zhaoxd
 * @method remove
 * @for IsolationBelt
 * @param {Entity} 隔离带对象
 * @return {Boolean} true:成功,false:失败
 */
IsolationBelt.prototype.remove = function(isolationBelt){
	var self = this;
	var back;
	for(var i = self._layer.subset.length - 1; i >= 0; i--){
		if(self._layer.subset[i].id == isolationBelt.id){
			var catalog = self._layer.subset[i].catalog;
			var subcatalog = self._layer.subset[i].subcatalog;
//			back = self._viewer.entities.remove(self._layer.subset[i].polygon);
//			back = self._viewer.entities.remove(self._layer.subset[i].polygonHat);
			for(var k = self._layer.subset[i].polygons.length - 1; k >= 0; k--){
				back = self._viewer.entities.remove(self._layer.subset[i].polygons[k].polygon);
				back = self._viewer.entities.remove(self._layer.subset[i].polygons[k].polygonHat);
				if(!back){
					break;
				}
			}
			if(!back){
				break;
			}
			self._layer.subset.splice(i,1);
			self._globe.layerManager._remove("entityLayer",catalog,subcatalog);
		}
	}
	self._layer.draw = false;
	self._layer.name = "default";
	self._layer.drawid = "";
	self._layer.callback = null;
	self._layer.layer = self._globe._defaultLayer;
	self._layer.catalog = self._catalog;
	self._layer.subcatalog = self._subcatalog;
	self._layer.minHeight = self._minHeight;
	self._layer.maxHeight = self._maxHeight;
	return back;
}

/*
 * 根据mid移除隔离带
 * @author zhaoxd
 * @method removeByMid
 * @for IsolationBelt
 * @param {string} 隔离带mid
 * @return {Boolean} true:成功,false:失败
 */
IsolationBelt.prototype.removeByMid = function(mid){
	var self = this;
	var back = true;
	for(var i = self._layer.subset.length - 1; i >= 0; i--){
		if(self._layer.subset[i].mid == mid){
			var catalog = self._layer.subset[i].catalog;
			var subcatalog = self._layer.subset[i].subcatalog;
//			back = self._viewer.entities.remove(self._layer.subset[i].polygon);
//			back = self._viewer.entities.remove(self._layer.subset[i].polygonHat);
			for(var k = self._layer.subset[i].polygons.length - 1; k >= 0; k--){
				back = self._viewer.entities.remove(self._layer.subset[i].polygons[k].polygon);
				back = self._viewer.entities.remove(self._layer.subset[i].polygons[k].polygonHat);
				if(!back){
					break;
				}
			}
			if(!back){
				break;
			}
			self._layer.subset.splice(i,1);
			self._globe.layerManager._remove("entityLayer",catalog,subcatalog);
		}
	}
	self._layer.draw = false;
	self._layer.name = "default";
	self._layer.drawid = "";
	self._layer.callback = null;
	self._layer.layer = self._globe._defaultLayer;
	self._layer.catalog = self._catalog;
	self._layer.subcatalog = self._subcatalog;
	self._layer.minHeight = self._minHeight;
	self._layer.maxHeight = self._maxHeight;
	return back;
}

/*
 * 根据name移除隔离带
 * @author zhaoxd
 * @method removeByName
 * @for IsolationBelt
 * @param {string} 隔离带name
 * @return {Boolean} true:成功,false:失败
 */
IsolationBelt.prototype.removeByName = function(name){
	var self = this;
	var back = true;
	for(var i = self._layer.subset.length - 1; i >= 0; i--){
		if(self._layer.subset[i].name == name){
			var catalog = self._layer.subset[i].catalog;
			var subcatalog = self._layer.subset[i].subcatalog;
//			back = self._viewer.entities.remove(self._layer.subset[i].polygon);
//			back = self._viewer.entities.remove(self._layer.subset[i].polygonHat);
			for(var k = self._layer.subset[i].polygons.length - 1; k >= 0; k--){
				back = self._viewer.entities.remove(self._layer.subset[i].polygons[k].polygon);
				back = self._viewer.entities.remove(self._layer.subset[i].polygons[k].polygonHat);
				if(!back){
					break;
				}
			}
			if(!back){
				break;
			}
			self._layer.subset.splice(i,1);
			self._globe.layerManager._remove("entityLayer",catalog,subcatalog);
		}
	}
	self._layer.draw = false;
	self._layer.name = "default";
	self._layer.drawid = "";
	self._layer.callback = null;
	self._layer.layer = self._globe._defaultLayer;
	self._layer.catalog = self._catalog;
	self._layer.subcatalog = self._subcatalog;
	self._layer.minHeight = self._minHeight;
	self._layer.maxHeight = self._maxHeight;
	return back;
}

/*
 * 根据mid获取隔离带
 * @author zhaoxd
 * @method getByMid
 * @for IsolationBelt
 * @param {string} 隔离带mid
 * @return {list} list
 */
IsolationBelt.prototype.getByMid = function(mid){
	var self = this;
	var list = [];
	for(var i = self._layer.subset.length - 1; i >= 0; i--){
		if(self._layer.subset[i].mid == mid){
			list.push(self._layer.subset[i]);
		}
	}
	return list;
}

/*
 * 根据name获取隔离带
 * @author zhaoxd
 * @method getByName
 * @for IsolationBelt
 * @param {string} 隔离带name
 * @return {list} list
 */
IsolationBelt.prototype.getByName = function(name){
	var self = this;
	var list = [];
	for(var i = self._layer.subset.length - 1; i >= 0; i--){
		if(self._layer.subset[i].name == name){
			list.push(self._layer.subset[i]);
		}
	}
	return list;
}

return IsolationBelt;
})