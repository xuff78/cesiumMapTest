/*
* author: 赵雪丹
* description: BattleLine-扑火线
* day: 2017-9-28
*/
define( [], function(){
function BattleLine(globe){
	var self = this;
	this._globe = globe;
	this._viewer = globe._viewer;
	this._globeId = globe._globeId;
	this._minHeight = 0;
	this._maxHeight = 1000000;
	this._catalog = "default";
	this._subcatalog = "default";
	this._showMenu = true;
	//扑火线标绘绘制
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
				}
			}else{
				for(var k = 0; k < self._layer.subset[i].polygons.length; k++){
					self._layer.subset[i].polygons[k].polygon.show = false;
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
					var m_battleLine_new = {
						id:"newbattleLine",
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
					self._layer.subset.push(m_battleLine_new);
					self._layer.drawid = "newbattleLine";
					var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
					self._globe.layerManager._add("entityLayer",startTime,self._layer.catalog,self._layer.subcatalog);
				}
				var m_battleLine;
				for(var i = 0; i < self._layer.subset.length; i++){
	    			if(self._layer.subset[i].id == self._layer.drawid){
	    				m_battleLine = self._layer.subset[i];
						break;
	    			}
	    		}
				var m_point = {lon: lonlat.lon, lat: lonlat.lat, alt: lonlat.alt};
				m_battleLine.points.push(m_point);
				if(m_battleLine.points.length == 1){
					var m_obj = {};
					m_obj.vertexList = [];
					m_obj.polygon = self._viewer.entities.add({
						rightClick:self._layer.rightClick,
						mid:self._layer.mid,
						name:self._layer.name,
				        polygon : {
				            hierarchy : new Cesium.CallbackProperty(function(){
				                return m_obj.vertexList;
				            }, false),
				            material : Cesium.Color.RED.withAlpha(1)
				        }
				    });
					m_battleLine.polygons.push(m_obj);
					self._layer.drawid = m_isolationBelt.id = m_obj.polygon.id;
				}else{
					var m_obj = {};
					m_obj.vertexList = [];
					m_obj.polygon = self._viewer.entities.add({
						rightClick:self._layer.rightClick,
						mid:self._layer.mid,
						name:self._layer.name,
				        polygon : {
				            hierarchy : new Cesium.CallbackProperty(function(){
				                return m_obj.vertexList;
				            }, false),
				            material : Cesium.Color.RED.withAlpha(1)
				        }
				    });
					m_battleLine.polygons.push(m_obj);
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
    		var m_battleLine;
    		for(var i = 0; i < self._layer.subset.length; i++){
    			if(self._layer.subset[i].id == self._layer.drawid){
    				m_battleLine = self._layer.subset[i];
    				m_battleLine.points.push(m_point);
					break;
    			}
    		}
    		self._layer.drawid = "";
    		if(m_battleLine && m_battleLine.callback){
    			m_battleLine.callback(m_battleLine);
    		}
    	}
	}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
	//MOUSE_MOVE 鼠标移动事件
	this._handler.setInputAction(function (movement) {
		var lonlat = self._globe.getLonLatByPosition(movement.endPosition);
		if(self._layer.draw && self._layer.drawid != ""){
    		var m_battleLine;
    		for(var i = 0; i < self._layer.subset.length; i++){
    			if(self._layer.subset[i].id == self._layer.drawid){
    				m_battleLine = self._layer.subset[i];
					break;
    			}
    		}
    		if(m_battleLine.points.length > 0){
				if(lonlat.alt < 0){
					lonlat.alt = 0;
				}
				var m_point = {lon: lonlat.lon, lat: lonlat.lat, alt: lonlat.alt};
				var m_list = [];
    			m_list.push(m_battleLine.points[m_battleLine.points.length-1]);
    			m_list.push(m_point);
				var m_list_a = self.getPointList(m_list);
				m_battleLine.polygons[m_battleLine.polygons.length - 1].vertexList = Cesium.Cartesian3.fromDegreesArrayHeights(m_list_a);
    		}
    	}
	}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
}

BattleLine.prototype.getPointList = function(pointList){
	if(pointList.length < 2){
		return [];
	}
	var self = this;
	var m_h = 2000;
	var m_width = 30;
	var m_dis = 300;
	var m_leftList = [];
	var m_rightList = [];
	for(var i = 1; i < pointList.length; i++){
		var m_b = pointList[i-1];
		var m_c = pointList[i];
		if(i == 1){
			var m_kzList = [];
			var m_distance = self._globe.commonFunc.getDistance(m_b.lon,m_b.lat,m_c.lon,m_c.lat);
			var m_angle = self._globe.commonFunc.getAngle(m_b.lon, m_b.lat, m_c.lon, m_c.lat);
			m_pstar = {lon:pointList[0].lon,lat:pointList[0].lat,alt:m_h};
			m_leftList[m_leftList.length] = m_pstar;
			var m_r1 = self._globe.commonFunc.destinationVincenty(m_b.lon, m_b.lat, m_h, m_angle + 90, 0, m_width);
			m_rightList[m_rightList.length] = m_r1;
			if(m_distance < 100){
				m_kzList = [];
			}else if(m_distance < m_dis*2){
				var m_kz = self._globe.commonFunc.destinationVincenty(m_b.lon, m_b.lat, m_h, m_angle, 0, m_distance/2);
				m_kzList[m_kzList.length] = m_kz;
			}else{
				var m_nun = parseInt((m_distance-200)/m_dis);
				var m_dis_sy = m_distance - m_dis*m_nun;
				var m_dis_se = m_dis_sy/2;
				var p0 = Cesium.Cartesian3.fromDegrees(m_b.lon,m_b.lat,m_h);
				var p1 = Cesium.Cartesian3.fromDegrees(m_c.lon,m_c.lat,m_h);
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
				var m_p1,m_p2,m_p3,m_p4,m_p5,m_p6,m_p7;
				m_p1 = self._globe.commonFunc.destinationVincenty(m_kzList[k].lon, m_kzList[k].lat, m_h, m_angle + 180, 0, 10);
				m_p2 = self._globe.commonFunc.destinationVincenty(m_p1.lon, m_p1.lat, m_h, m_angle - 90, 0, 30);
				m_p3 = self._globe.commonFunc.destinationVincenty(m_p2.lon, m_p2.lat, m_h, m_angle + 180, 0, 20);
				m_p4 = self._globe.commonFunc.destinationVincenty(m_kzList[k].lon, m_kzList[k].lat, m_h, m_angle - 90, 0, 60);
				m_p7 = self._globe.commonFunc.destinationVincenty(m_kzList[k].lon, m_kzList[k].lat, m_h, m_angle, 0, 10);
				m_p6 = self._globe.commonFunc.destinationVincenty(m_p7.lon, m_p7.lat, m_h, m_angle - 90, 0, 30);
				m_p5 = self._globe.commonFunc.destinationVincenty(m_p6.lon, m_p6.lat, m_h, m_angle, 0, 20);
				m_leftList[m_leftList.length] = m_p1;
				m_leftList[m_leftList.length] = m_p2;
				m_leftList[m_leftList.length] = m_p3;
				m_leftList[m_leftList.length] = m_p4;
				m_leftList[m_leftList.length] = m_p5;
				m_leftList[m_leftList.length] = m_p6;
				m_leftList[m_leftList.length] = m_p7;
				
				var m_p8 = self._globe.commonFunc.destinationVincenty(m_kzList[k].lon, m_kzList[k].lat, m_h, m_angle + 90, 0, m_width);
				m_rightList[m_rightList.length] = m_p8;
			}
			m_pend = {lon:pointList[1].lon,lat:pointList[1].lat,alt:m_h};
			m_leftList[m_leftList.length] = m_pend;
			var m_r2 = self._globe.commonFunc.destinationVincenty(m_c.lon, m_c.lat, m_h, m_angle + 90, 0, m_width);
			m_rightList[m_rightList.length] = m_r2;
		}
	}
		
	var m_list = [];
	for(var i = 0; i < m_leftList.length; i++){
		m_list[m_list.length] = m_leftList[i];
	}
	for(var i = m_rightList.length - 1; i >= 0; i--){
		m_list[m_list.length] = m_rightList[i];
	}
	var m_array = new Array();
    for(var i = 0; i < m_list.length; i++){
    	m_array.push(m_list[i].lon);
    	m_array.push(m_list[i].lat);
  		m_array.push(m_list[i].alt);
    }
	return m_array;
}

/*
 * 添加扑火线
 * @author zhaoxd
 * @method add
 * @for BattleLine
 * @param {Object} 扑火线参数
 * @return {Cesium.Entity} battleLine
 */
BattleLine.prototype.add = function(options){
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
	var m_battleLine = {
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
			var m_list = [];
			m_list.push(pointList[i]);
			m_list.push(pointList[i + 1]);
			var m_list_a = self.getPointList(m_list);
			m_obj.vertexList = Cesium.Cartesian3.fromDegreesArrayHeights(m_list_a);
			m_obj.polygon = self._viewer.entities.add({
				rightClick:self._layer.rightClick,
				mid:mid,
				name:name,
		        polygon : {
		            hierarchy : new Cesium.CallbackProperty(function(){
		                return m_obj.vertexList;
		            }, false),
		            material : Cesium.Color.RED.withAlpha(1)
		        }
		    });
			m_battleLine.polygons.push(m_obj);
			if(i == 0){
				m_battleLine.id = m_obj.polygon.id;
			}
		})(i);
	}
	self._layer.subset.push(m_battleLine);
	var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
	self._globe.layerManager._add("entityLayer",startTime,catalog,subcatalog);
	return m_battleLine;
}
/*
 * 绘制扑火线
 * @author zhaoxd
 * @method drawHandler
 * @for BattleLine
 * @param {function} 回调函数
 * @return {null} null
 */
BattleLine.prototype.drawHandler = function(options){
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
	self._layer.catalog = m_catalog;
	self._layer.subcatalog = m_subcatalog;
	self._layer.minHeight = m_minHeight;
	self._layer.maxHeight = m_maxHeight;
	self._showMenu = self._globe.globeMenu._showMenu;
	self._globe.globeMenu.setType(false);
}

/*
 * 结束绘制扑火线
 * @author zhaoxd
 * @method deactivateHandler
 * @for BattleLine
 * @param {null} null
 * @return {null} null
 */
BattleLine.prototype.deactivateHandler = function(){
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
 * 删除扑火线对象
 * @author zhaoxd
 * @method remove
 * @for BattleLine
 * @param {Entity} 扑火线对象
 * @return {Boolean} true:成功,false:失败
 */
BattleLine.prototype.remove = function(battleLine){
	var self = this;
	var back;
	for(var i = self._layer.subset.length - 1; i >= 0; i--){
		if(self._layer.subset[i].id == battleLine.id){
			var catalog = self._layer.subset[i].catalog;
			var subcatalog = self._layer.subset[i].subcatalog;
			for(var k = self._layer.subset[i].polygons.length - 1; k >= 0; k--){
				back = self._viewer.entities.remove(self._layer.subset[i].polygons[k].polygon);
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
 * 根据mid移除扑火线
 * @author zhaoxd
 * @method removeByMid
 * @for BattleLine
 * @param {string} 扑火线mid
 * @return {Boolean} true:成功,false:失败
 */
BattleLine.prototype.removeByMid = function(mid){
	var self = this;
	var back = true;
	for(var i = self._layer.subset.length - 1; i >= 0; i--){
		if(self._layer.subset[i].mid == mid){
			var catalog = self._layer.subset[i].catalog;
			var subcatalog = self._layer.subset[i].subcatalog;
			for(var k = self._layer.subset[i].polygons.length - 1; k >= 0; k--){
				back = self._viewer.entities.remove(self._layer.subset[i].polygons[k].polygon);
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
 * 根据name移除扑火线
 * @author zhaoxd
 * @method removeByName
 * @for BattleLine
 * @param {string} 扑火线name
 * @return {Boolean} true:成功,false:失败
 */
BattleLine.prototype.removeByName = function(name){
	var self = this;
	var back = true;
	for(var i = self._layer.subset.length - 1; i >= 0; i--){
		if(self._layer.subset[i].name == name){
			var catalog = self._layer.subset[i].catalog;
			var subcatalog = self._layer.subset[i].subcatalog;
			for(var k = self._layer.subset[i].polygons.length - 1; k >= 0; k--){
				back = self._viewer.entities.remove(self._layer.subset[i].polygons[k].polygon);
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
 * 根据mid获取扑火线
 * @author zhaoxd
 * @method getByMid
 * @for BattleLine
 * @param {string} 扑火线mid
 * @return {list} list
 */
BattleLine.prototype.getByMid = function(mid){
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
 * 根据name获取扑火线
 * @author zhaoxd
 * @method getByName
 * @for BattleLine
 * @param {string} 扑火线name
 * @return {list} list
 */
BattleLine.prototype.getByName = function(name){
	var self = this;
	var list = [];
	for(var i = self._layer.subset.length - 1; i >= 0; i--){
		if(self._layer.subset[i].name == name){
			list.push(self._layer.subset[i]);
		}
	}
	return list;
}

return BattleLine;
})