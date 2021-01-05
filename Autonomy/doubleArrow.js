define([],function(){
	function DoubleArrow(globe){
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
		
		//画双箭头
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
					self._layer[i].polygon.show = true;
					if(self._layer[i].clampMode == 0){
						self._layer[i].polyline.show = true;
					}
				}else{
					self._layer[i].polygon.show = false;
					if(self._layer[i].polyline){
						self._layer[i].polyline.show = false;
					}
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
					polyline: null, 
					polygon: null, 
					pointList : pointList, 
					vertexLineList: [], 
					vertexList: [], 
					layer: m_layer,
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
					m_obj.polygon = self._viewer.entities.add({
						rightClick:rightClick,
						name: name,
				        polygon : {
				            hierarchy : new Cesium.CallbackProperty(function(){
				                return m_obj.vertexList;
				            }, false),
				            material : Cesium.Color.RED.withAlpha(0.5),
				            height: 2000
				        }
				    });
					m_obj.polyline = self._viewer.entities.add({
						polyline : {
						    positions : new Cesium.CallbackProperty(function(){
						        return m_obj.vertexLineList;
						    }, false),
						    width : 3,
						    material : Cesium.Color.RED.withAlpha(1),
						}
					});
				}else{
					m_obj.polygon = self._viewer.entities.add({
						rightClick:rightClick,
						name: name,
				        polygon : {
				            hierarchy : new Cesium.CallbackProperty(function(){
				                return m_obj.vertexList;
				            }, false),
				            material : Cesium.Color.RED.withAlpha(0.5)
				        }
				    });
					m_obj.polyline = null;
				}
				
				self._layer.push(m_obj);
				self._options.drawid = m_obj.polygon.id;
				var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
				self._globe.layerManager._add("entityLayer",startTime,catalog,subcatalog);
			}else if(self._options.draw && self._options.drawid !== ''){
				var name = self._options.options.name ? self._options.options.name : '';
				self._layer[self._layer.length - 1].pointList.push(lonlat);
				if(self._layer[self._layer.length - 1].pointList.length == 4){
					self._options.drawid = '';
					if(self._options.handlerCallback){
						self._options.handlerCallback(self._layer[self._layer.length - 1]);
					}
					self._globe.globeMenu.setType(self._showMenu);
				}
			}
			
			
		}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
		
		//鼠标移动事件注册
		this._handler.setInputAction(function(movement){
			var lonlat = self._globe.getLonLatByPosition(movement.endPosition);
			if(self._options.draw && self._options.drawid != ''){
				var pointList = self._layer[self._layer.length - 1].pointList.slice(0);
				if(pointList.length > 1){
					pointList.push(lonlat);
					var clampMode = self._options.options.clampMode;
					if(clampMode == 0){
						var m_array = self._getDoubleArrowPoints(pointList, clampMode);
						self._layer[self._layer.length - 1].vertexList = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
						self._layer[self._layer.length - 1].vertexLineList = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
					}else{
						var m_array = self._getDoubleArrowPoints(pointList, clampMode);
						self._layer[self._layer.length - 1].vertexList = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
						self._layer[self._layer.length - 1].vertexLineList = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
					}
					
					
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
				var pointList = self._layer[self._layer.length - 1].pointList.slice(0);
				var clampMode = self._options.options.clampMode;
				if(clampMode == 0){
					var m_array = self._getDoubleArrowPoints(pointList, clampMode);
					self._layer[self._layer.length - 1].vertexList = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
					self._layer[self._layer.length - 1].vertexLineList = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
				}else{
					var m_array = self._getDoubleArrowPoints(pointList, clampMode);
					self._layer[self._layer.length - 1].vertexList = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
					self._layer[self._layer.length - 1].vertexLineList = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
				}
				self._options.drawid = '';
				if(self._options.handlerCallback){
					self._options.handlerCallback(self._layer[self._layer.length - 1]);
				}
			}
			
		}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

	}
	
	/**
	 * 球体点击添加双箭头
	 * @author lijy
     * @method drawHandler
     * @for DoubleArrow
     * @param {options} 画双箭头的参数
     * @return {null} null
	 */
	DoubleArrow.prototype.drawHandler = function(options){
		var self = this;
		self._options.draw = true;
		self._options.drawid = "";
		self._options.options = options;
		var handlerCallback = options.callback ? options.callback : null;
		self._options.handlerCallback = handlerCallback;
		self._showMenu = self._globe.globeMenu._showMenu;
		self._globe.globeMenu.setType(false);
	}
	
	/*
	 * 暂停球体点击添加双箭头
	 * @author lijy
	 * @method deactivateHandler
	 * @for DoubleArrow
	 * @param {null} null
	 * @return {null} null
	 */
	DoubleArrow.prototype.deactivateHandler = function(){
		var self = this;
		self._options.draw = false;
		self._globe.globeMenu.setType(self._showMenu);
	}
	
	/*
	 * 添加双箭头
	 * @author lijy
	 * @method add
	 * @for DoubleArrow
	 * @param {Object} 双箭头参数
	 * @return {Cesium.Entity} arrow
	 */
	DoubleArrow.prototype.add = function(options){
		var self = this;
		var wlpha = options.wlpha ? parseFloat(options.wlpha) : 1;
		var clampMode = options.clampMode ? options.clampMode : 0;
		var height = options.height ? parseInt(options.height) : 2000;
		var rightClick = options.rightClick ? options.rightClick : null;
		var color = options.color ? options.color : Cesium.Color.RED;
		var pointList = options.pointList ? options.pointList : [];
		var layer = options.layer ? options.layer : self._globe._defaultLayer;
		var catalog = options.catalog ? options.catalog : self._catalog;
		var subcatalog = options.subcatalog ? options.subcatalog : self._subcatalog;
		var minHeight = options.minHeight ? options.minHeight : self._minHeight;
		var maxHeight = options.maxHeight ? options.maxHeight : self._maxHeight;
		var m_obj = {
			polyline: null, 
			polygon: null, 
			pointList : pointList, 
			vertexLineList: [], 
			vertexList: [], 
			layer:layer,
			catalog: catalog,
			subcatalog: subcatalog,
			minHeight: minHeight,
			maxHeight: maxHeight,
			showHeight: true,
			showLayer: true,
			showEntity: true,
			clampMode: clampMode
		};
		var name = options.name ? options.name : "";
		if(clampMode == 0){
			var m_array = self._getDoubleArrowPoints(pointList, clampMode);
			m_obj.polygon = self._viewer.entities.add({
				rightClick:rightClick,
				name: name,
		        polygon : {
		            hierarchy : Cesium.Cartesian3.fromDegreesArrayHeights(m_array),
		            material : Cesium.Color.RED.withAlpha(0.5),
		            height: 2000
		        }
		    });
			m_obj.polyline = self._viewer.entities.add({
				polyline : {
				    positions : Cesium.Cartesian3.fromDegreesArrayHeights(m_array),
				    width : 3,
				    material : Cesium.Color.RED.withAlpha(1),
				}
			});
		}else{
			var m_array = self._getDoubleArrowPoints(pointList, clampMode);
			m_obj.polygon = self._viewer.entities.add({
				rightClick:rightClick,
				name: name,
		        polygon : {
		            hierarchy : Cesium.Cartesian3.fromDegreesArrayHeights(m_array),
		            material : Cesium.Color.RED.withAlpha(0.5)
		        }
		    });
			m_obj.polyline = null;
		}
		
		self._layer[self._layer.length] = m_obj;
		var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
		self._globe.layerManager._add("entityLayer",startTime,catalog,subcatalog);
		return m_obj;
	}
	
	/*
	 * 删除双箭头对象
	 * @author lijy
	 * @method remove
	 * @for DoubleArrow
	 * @param {Entity} 双箭头对象
	 * @return {Boolean} true:成功,false:失败
	 */
	DoubleArrow.prototype.remove = function(doubleArrow){
		var self = this;
		var back;
		for(var i = self._layer.length - 1; i >= 0; i--){
			if(self._layer[i].polygon.id == doubleArrow.polygon.id){
				var catalog = self._layer[i].catalog;
				var subcatalog = self._layer[i].subcatalog;
				back = self._viewer.entities.remove(self._layer[i].polygon);
				if(!back){
					break;
				}
				if(self._layer[i].polyline != null){
					back = self._viewer.entities.remove(self._layer[i].polyline);
					if(!back){
						break;
					}
				}
				self._globe.layerManager._remove("entityLayer",catalog,subcatalog);
				self._layer.splice(i,1);
			}
		}
		self._options.draw = false;
		self._options.drawid = "";
		self._options.callback = null;
		//self._options.layer = self._globe._defaultLayer;
		return back;
	}
	
	/*
	 * 根据id删除双箭头对象
	 * @author lijy
	 * @method removeById
	 * @for DoubleArrow
	 * @param {Entity} 双箭头id
	 * @return {Boolean} true:成功,false:失败
	 */
	DoubleArrow.prototype.removeById = function(id){
		var self = this;
		var back;
		for(var i = self._layer.length - 1; i >= 0; i--){
			if(self._layer[i].polygon.id == id){
				var catalog = self._layer[i].catalog;
				var subcatalog = self._layer[i].subcatalog;
				back = self._viewer.entities.remove(self._layer[i].polygon);
				if(!back){
					break;
				}
				if(self._layer[i].polyline != null){
					back = self._viewer.entities.remove(self._layer[i].polyline);
					if(!back){
						break;
					}
				}
				self._globe.layerManager._remove("entityLayer",catalog,subcatalog);
				self._layer.splice(i,1);
			}
		}
		self._options.draw = false;
		self._options.drawid = "";
		self._options.callback = null;
		//self._options.layer = self._globe._defaultLayer;
		return back;
	}
	
	
	//私有方法-获取双箭头的控制点集合
	DoubleArrow.prototype._getDoubleArrowPoints = function(pointList,clampMode){
		if(pointList.length < 3) return [];
		var m_h = 2000;
		var m_ratio = 6;
		var m_min_width = 0;
		var m_distance = 0;
		for(var i = 1; i < pointList.length; i++){
			m_min_width = CommonFunc.getDistance(pointList[i-1].lon, pointList[i-1].lat, pointList[i].lon, pointList[i].lat); 
			m_distance += m_min_width;
		}
		var m_width = m_distance/m_ratio;
		var m_array = new Array();
		var m_list = [];
		
		var direction = (pointList[1].lon - pointList[0].lon)*(pointList[2].lat - pointList[0].lat) - (pointList[2].lon - pointList[0].lon) * (pointList[1].lat - pointList[0].lat);
		if(direction < 0){
			//顺时针
			var first0 = pointList[0];//第一个箭头的第一个点
			var second0 = pointList[1];//第二个箭头的第一个点
			var secondHead = CommonFunc.destinationVincenty(pointList[2].lon, pointList[2].lat, m_h, 0, 0, 0);//第二个箭头头部点
			var angle_sf = CommonFunc.getAngle(second0.lon, second0.lat, first0.lon, first0.lat);//第二个点与第一个点的夹角
			var angle_fs = CommonFunc.getAngle(first0.lon, first0.lat, second0.lon, second0.lat);//第一个点与第二个点的夹角
			var distance = CommonFunc.getDistance(second0.lon, second0.lat, first0.lon, first0.lat);//第二个点与第一个点的距离
			var firstHead;
			if(pointList.length == 3){
				firstHead = CommonFunc.destinationVincenty(secondHead.lon, secondHead.lat, m_h, angle_sf, 0, distance);//第一个箭头头部点
			}else{
				firstHead = CommonFunc.destinationVincenty(pointList[3].lon, pointList[3].lat, m_h, 0, 0, 0);//第一个箭头头部点
			}
			var firstTail = CommonFunc.destinationVincenty(first0.lon, first0.lat, m_h, angle_fs, 0, distance / 3);//第一个箭头尾部点
			var secondTail = CommonFunc.destinationVincenty(second0.lon, second0.lat, m_h, angle_sf, 0, distance / 3);	
			//第一个箭头
			var first_angle_th = CommonFunc.getAngle(firstTail.lon, firstTail.lat, firstHead.lon, firstHead.lat);//第一个箭头尾部与头部夹角
			var first_tempLon = (firstTail.lon + 5 * firstHead.lon) / 6;
	        var first_tempLat = (firstTail.lat + 5 * firstHead.lat) / 6;
			var first_temp = {lon: first_tempLon, lat: first_tempLat};
			var first_bezier_tempLon = (firstTail.lon * 5 + firstHead.lon) / 6;
			var first_bezier_tempLat = (firstTail.lat * 5 + firstHead.lat) / 6;
			var first_bezier = CommonFunc.destinationVincenty(first_bezier_tempLon, first_bezier_tempLat, m_h, angle_sf, 0, m_width / 4);
			var first1 = CommonFunc.destinationVincenty(first_temp.lon, first_temp.lat, m_h, first_angle_th + 90, 0, m_width / 12);
			var first2 = CommonFunc.destinationVincenty(first_temp.lon, first_temp.lat, m_h, first_angle_th + 90, 0, m_width / 6);
			var first4Bezier = [first0, first_bezier, first1];
			var firstList = CommonFunc.getBezier(first4Bezier);
			for(var i = 0; i < firstList.length - 1; i++){
				m_list.push(firstList[i]);
			}
			m_list.push(first1);
			m_list.push(first2)
			m_list.push(firstHead);
			var first3 = CommonFunc.destinationVincenty(first_temp.lon, first_temp.lat, m_h, first_angle_th - 90, 0, m_width / 6);
			var first4 = CommonFunc.destinationVincenty(first_temp.lon, first_temp.lat, m_h, first_angle_th - 90, 0, m_width / 12);
			m_list.push(first3);
			m_list.push(first4);
			
			//第二个箭头
			var second_angle_th = CommonFunc.getAngle(secondTail.lon, secondTail.lat, secondHead.lon, secondHead.lat);//第二个箭头尾部与头部夹角
			var second_tempLon = (secondTail.lon + 5 * secondHead.lon) / 6;
	        var second_tempLat = (secondTail.lat + 5 * secondHead.lat) / 6;
			var second_temp = {lon: second_tempLon, lat: second_tempLat};
			var second_bezier_tempLon = (secondTail.lon * 5 + secondHead.lon) / 6;
			var second_bezier_tempLat = (secondTail.lat * 5 + secondHead.lat) / 6;
			var second_bezier = CommonFunc.destinationVincenty(second_bezier_tempLon, second_bezier_tempLat, m_h, angle_fs, 0, m_width / 4);
			var second1 = CommonFunc.destinationVincenty(second_temp.lon, second_temp.lat, m_h, second_angle_th - 90, 0, m_width / 12);
			var second2 = CommonFunc.destinationVincenty(second_temp.lon, second_temp.lat, m_h, second_angle_th - 90, 0, m_width / 6);
			var second4Bezier = [second0, second_bezier, second1];
			var secondList = CommonFunc.getBezier(second4Bezier);
			var second3 = CommonFunc.destinationVincenty(second_temp.lon, second_temp.lat, m_h, second_angle_th + 90, 0, m_width / 6);
			var second4 = CommonFunc.destinationVincenty(second_temp.lon, second_temp.lat, m_h, second_angle_th + 90, 0, m_width / 12);
			
			var centerTail = {lon: (firstTail.lon + secondTail.lon) / 2, lat: (firstTail.lat + secondTail.lat) / 2};
			var centerHead = {lon: (firstHead.lon + secondHead.lon) / 2, lat: (firstHead.lat + secondHead.lat) / 2};
			var centerControl = {lon: (centerTail.lon * 5 + centerHead.lon) / 6, lat: (centerTail.lat * 5 + centerHead.lat) / 6};
			
			var tmpx1 = first4.lon-centerControl.lon;
			var tmpx2 = second4.lon-centerControl.lon;
			var tmpy1 = first4.lat-centerControl.lat;
			var tmpy2 = second4.lat-centerControl.lat;
			var dist1 = Math.sqrt(tmpx1*tmpx1+tmpy1*tmpy1);
			var dist2 = Math.sqrt(tmpx2*tmpx2+tmpy2*tmpy2);
			var tmpx = centerControl.lon-Math.sqrt(dist1*dist2)*(tmpx1/dist1+tmpx2/dist2)/2;
			var tmpy = centerControl.lat-Math.sqrt(dist1*dist2)*(tmpy1/dist1+tmpy2/dist2)/2;
			var tmp = {lon: tmpx, lat: tmpy};
			var tmp4Bezier = [first4, tmp, second4];
			var tmpList = CommonFunc.getBezier(tmp4Bezier);
			for(var i = 0; i < tmpList.length - 1; i++){
				m_list.push(tmpList[i]);
			}
			
			m_list.push(second4);
			m_list.push(second3);
			m_list.push(secondHead);
			m_list.push(second2);
			m_list.push(second1);
			for(var i = secondList.length - 2; i >= 0; i--){
				m_list.push(secondList[i]);
			}
			
			if(clampMode == 0){
	        	m_list.push(firstList[0]);
	        }
	        for(var i = 0; i < m_list.length; i++){
	            m_array.push(m_list[i].lon);
	            m_array.push(m_list[i].lat);
	            m_array.push(m_list[i].alt);
	        }
	        return m_array; 
			
		}else{
			//逆时针
			var first0 = pointList[0];//第一个箭头的第一个点
			var second0 = pointList[1];//第二个箭头的第一个点
			var secondHead = CommonFunc.destinationVincenty(pointList[2].lon, pointList[2].lat, m_h, 0, 0, 0);//第二个箭头头部点
			var angle_sf = CommonFunc.getAngle(second0.lon, second0.lat, first0.lon, first0.lat);//第二个点与第一个点的夹角
			var angle_fs = CommonFunc.getAngle(first0.lon, first0.lat, second0.lon, second0.lat);//第一个点与第二个点的夹角
			var distance = CommonFunc.getDistance(second0.lon, second0.lat, first0.lon, first0.lat);//第二个点与第一个点的距离
			var firstHead;
			if(pointList.length == 3){
				firstHead = CommonFunc.destinationVincenty(secondHead.lon, secondHead.lat, m_h, angle_sf, 0, distance);//第一个箭头头部点
			}else{
				firstHead = CommonFunc.destinationVincenty(pointList[3].lon, pointList[3].lat, m_h, 0, 0, 0);//第一个箭头头部点
			}
			var firstTail = first0;//第一个箭头尾部点
			var secondTail = second0;
			//第一个箭头
			var first_angle_th = CommonFunc.getAngle(firstTail.lon, firstTail.lat, firstHead.lon, firstHead.lat);//第一个箭头尾部与头部夹角
			var first_tempLon = (firstTail.lon + 5 * firstHead.lon) / 6;
	        var first_tempLat = (firstTail.lat + 5 * firstHead.lat) / 6;
			var first_temp = {lon: first_tempLon, lat: first_tempLat};
			var first_bezier_tempLon = (firstTail.lon * 5 + firstHead.lon) / 6;
			var first_bezier_tempLat = (firstTail.lat * 5 + firstHead.lat) / 6;
			var first_bezier = CommonFunc.destinationVincenty(first_bezier_tempLon, first_bezier_tempLat, m_h, angle_sf, 0, m_width / 2);
			var first1 = CommonFunc.destinationVincenty(first_temp.lon, first_temp.lat, m_h, first_angle_th - 90, 0, m_width / 12);
			var first2 = CommonFunc.destinationVincenty(first_temp.lon, first_temp.lat, m_h, first_angle_th - 90, 0, m_width / 6);
			var first4Bezier = [first0, first_bezier, first1];
			var firstList = CommonFunc.getBezier(first4Bezier);
			for(var i = 0; i < firstList.length - 1; i++){
				m_list.push(firstList[i]);
			}
			m_list.push(first1);
			m_list.push(first2)
			m_list.push(firstHead);
			var first3 = CommonFunc.destinationVincenty(first_temp.lon, first_temp.lat, m_h, first_angle_th + 90, 0, m_width / 6);
			var first4 = CommonFunc.destinationVincenty(first_temp.lon, first_temp.lat, m_h, first_angle_th + 90, 0, m_width / 12);
			m_list.push(first3);
			m_list.push(first4);
			
			//第二个箭头
			var second_angle_th = CommonFunc.getAngle(secondTail.lon, secondTail.lat, secondHead.lon, secondHead.lat);//第二个箭头尾部与头部夹角
			var second_tempLon = (secondTail.lon + 5 * secondHead.lon) / 6;
	        var second_tempLat = (secondTail.lat + 5 * secondHead.lat) / 6;
			var second_temp = {lon: second_tempLon, lat: second_tempLat};
			var second_bezier_tempLon = (secondTail.lon * 5 + secondHead.lon) / 6;
			var second_bezier_tempLat = (secondTail.lat * 5 + secondHead.lat) / 6;
			var second_bezier = CommonFunc.destinationVincenty(second_bezier_tempLon, second_bezier_tempLat, m_h, angle_fs, 0, m_width / 2);
			var second1 = CommonFunc.destinationVincenty(second_temp.lon, second_temp.lat, m_h, second_angle_th + 90, 0, m_width / 12);
			var second2 = CommonFunc.destinationVincenty(second_temp.lon, second_temp.lat, m_h, second_angle_th + 90, 0, m_width / 6);
			var second4Bezier = [second0, second_bezier, second1];
			var secondList = CommonFunc.getBezier(second4Bezier);
			var second3 = CommonFunc.destinationVincenty(second_temp.lon, second_temp.lat, m_h, second_angle_th - 90, 0, m_width / 6);
			var second4 = CommonFunc.destinationVincenty(second_temp.lon, second_temp.lat, m_h, second_angle_th - 90, 0, m_width / 12);
			
			//中间部分
			var centerTail = {lon: (firstTail.lon + secondTail.lon) / 2, lat: (firstTail.lat + secondTail.lat) / 2};
			var centerHead = {lon: (firstHead.lon + secondHead.lon) / 2, lat: (firstHead.lat + secondHead.lat) / 2};
			var centerControl = {lon: (centerTail.lon * 5 + centerHead.lon) / 6, lat: (centerTail.lat * 5 + centerHead.lat) / 6};
			
			var tmpx1 = first4.lon-centerControl.lon;
			var tmpx2 = second4.lon-centerControl.lon;
			var tmpy1 = first4.lat-centerControl.lat;
			var tmpy2 = second4.lat-centerControl.lat;
			var dist1 = Math.sqrt(tmpx1*tmpx1+tmpy1*tmpy1);
			var dist2 = Math.sqrt(tmpx2*tmpx2+tmpy2*tmpy2);
			var tmpx = centerControl.lon-Math.sqrt(dist1*dist2)*(tmpx1/dist1+tmpx2/dist2)/2;
			var tmpy = centerControl.lat-Math.sqrt(dist1*dist2)*(tmpy1/dist1+tmpy2/dist2)/2;
			var tmp = {lon: tmpx, lat: tmpy};
			var tmp4Bezier = [first4, tmp, second4];
			var tmpList = CommonFunc.getBezier(tmp4Bezier);
			for(var i = 0; i < tmpList.length - 1; i++){
				m_list.push(tmpList[i]);
			}
			
			m_list.push(second4);
			m_list.push(second3);
			m_list.push(secondHead);
			m_list.push(second2);
			m_list.push(second1);
			for(var i = secondList.length - 2; i >= 0; i--){
				m_list.push(secondList[i]);
			}
			
			if(clampMode == 0){
	        	m_list.push(firstList[0]);
	        }
	        for(var i = 0; i < m_list.length; i++){
	            m_array.push(m_list[i].lon);
	            m_array.push(m_list[i].lat);
	            m_array.push(m_list[i].alt);
	        }
	        return m_array;
		}
		
	}
	
	
	
	return DoubleArrow;
})