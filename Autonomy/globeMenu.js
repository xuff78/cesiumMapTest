/*
* author: 赵雪丹
* description: GlobeMenu-右键菜单
* day: 2017-9-28
*/
define( [ "./commonFunc" ], function( CommonFunc ){
function GlobeMenu(globe){
	var self = this;
	this._globe = globe;
	this._viewer = globe._viewer;
	this._globeId = globe._globeId;
	this._widget = this._viewer.cesiumWidget;
	//动态添加右键菜单
	this._showMenu = true;
	this._infoMenuId = "cfglobeInfoMenuContent";
//  this._selectpick = null;
    this._selectpickPosition = null;
    this._xyz = null;
    this._menuList = [];
	this._load();
	//添加右键菜单
	this.showGlobeMenuList = true;
//	this._defaultMenuList = [{icon:"home",name:"详细坐标",handler:self._copyLonlat},{icon:"i",name:"观测此处",handler:self._viewing}];
	this._defaultMenuList = [{icon:self._globe.urlConfig.MENU_HOME ,name:"详细坐标",handler:self._copyLonlat},{icon:self._globe.urlConfig.MENU_I,name:"观测此处",handler:self._viewing}];
    this._globeMenuList = this._defaultMenuList;
    //私有渲染事件-实时刷新右键菜单位置
	this._viewer.scene.postRender.addEventListener(function(){
		//实时刷新右键菜单位置
		if(self._xyz){
			var c = Cesium.SceneTransforms.wgs84ToWindowCoordinates(self._viewer.scene, self._xyz);
			self._positionPopUp(c);
		}
//		if(self._selectpick){
//			if(self._selectpick.id){
//				var val = self._selectpickPosition;
//				if(val){
//					var c = Cesium.SceneTransforms.wgs84ToWindowCoordinates(self._viewer.scene, val);
//					self._positionPopUp(c);
//				}
//		    }else{
//				self.closeMenus();
//		    }
//		}else if(self._selectpickPosition){
//			var c = Cesium.SceneTransforms.wgs84ToWindowCoordinates(self._viewer.scene, self._selectpickPosition);
//			self._positionPopUp(c);
//		}
	});
	
	//私有注册事件
	this._handler = new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas);
	//LEFT_CLICK 左键点击事件
	this._handler.setInputAction(function (e) {
    	self.closeMenus();
	}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
	//RIGHT_CLICK 右键点击事件
	this._handler.setInputAction(function (e) {
		self.closeMenus();
		if(self._showMenu){
			var pick = self._viewer.scene.pick(e.position);
			if(Cesium.defined(pick)){
				if(pick.id){
					if(pick.id._rightClick){
						var lonlat = {lon:0,lat:0,alt:0};
						var pickray = new Cesium.Cartesian2(e.position.x,e.position.y);
						var cartesian = self._viewer.camera.pickEllipsoid(pickray, self._viewer.scene.globe.ellipsoid);
						if(cartesian){
							var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
							var longitude = Cesium.Math.toDegrees(cartographic.longitude);
							var latitude = Cesium.Math.toDegrees(cartographic.latitude);
							var height = cartographic.height;
							lonlat = {lon:longitude,lat:latitude,alt:height};
						}
			        	pick.id._rightClick(pick.id,lonlat);
			        }
//					self._selectpick = pick;
//					self._selectpickPosition = self._viewer.scene.pickPosition(e.position);
//					if(typeof(self._selectpickPosition) !== 'undefined'){
//						self._menuList = [];
//						if(pick.id._setMenu){
//				        	pick.id._setMenu(pick.id);
//							document.getElementById("cfglobeInfoMenu").style.display="block";
//				        }
//					}
//				}else{
//					self.closeMenus();
				}
			}else{
				if(self.showGlobeMenuList){
//					self.closeMenus();
//					document.getElementById("cfglobeInfoMenu").style.display="block";
					var sceneMode = self._viewer.scene.mode;
					if(sceneMode == Cesium.SceneMode.SCENE3D){
						self._xyz = self._selectpickPosition = self._viewer.scene.pickPosition(e.position);
					}else{
						var pick= new Cesium.Cartesian2(e.position.x,e.position.y);
						self._xyz = self._selectpickPosition = self._viewer.camera.pickEllipsoid(pick, self._viewer.scene.globe.ellipsoid);
					}
					if(self._xyz){
						self.setMenus(self._globeMenuList);
					}
				}
			}
		}
	}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
}

/*
 * 设置显隐
 * @author zhaoxd
 * @method setType
 * @for GlobeMenu
 * @param {Boolean} true:显示,false:隐藏
 * @return {null} null
 */
GlobeMenu.prototype.setType = function(type){
	var self = this;
	self._showMenu = type;
}

/*
 * 复制坐标信息
 * @author zhaoxd
 * @method _copyLonlat
 * @for GlobeMenu
 * @param {null} null
 * @return {null} null
 */
GlobeMenu.prototype._copyLonlat = function(){
	var self = this;
	self.closeMenus();
	var cartographic = Cesium.Cartographic.fromCartesian(self._selectpickPosition);
	var longitude = Cesium.Math.toDegrees(cartographic.longitude);
	var latitude = Cesium.Math.toDegrees(cartographic.latitude);
	var height = cartographic.height;
	var lonlat = {lon:longitude,lat:latitude,alt:height};
	var txt="经度："+longitude+"；纬度："+latitude;
	if (self._widget._showRenderLoopErrors) {
//      var title = "经度：" + longitude + "（" + CommonFunc.formatDegree(longitude).value + "）；纬度：" + latitude + "（" + CommonFunc.formatDegree(latitude).value + "）；高程：" + height + "（米）";
        var title = "经纬度："+longitude+","+latitude+"<br>";
        title += "度分秒："+CommonFunc.formatDegree(longitude).value+","+CommonFunc.formatDegree(latitude).value+"<br>";
        title += "高程：" + height + "（米）";
        self._widget.showErrorPanel("坐标详情", title, "*视角过高时，高程数据可能存在较大误差！");
    }
}

/*
 * 环绕观测
 * @author zhaoxd
 * @method _viewing
 * @for GlobeMenu
 * @param {null} null
 * @return {null} null
 */
GlobeMenu.prototype._viewing = function(){
	var self = this;
	self.closeMenus();
	var sceneMode = self._viewer.scene.mode;
	if(sceneMode != Cesium.SceneMode.SCENE3D){
		alert("2D状态下不支持此功能！");
		return;
	}
	var cameraObj = self._viewer.scene.globe.ellipsoid.cartesianToCartographic(self._viewer.scene.camera.position);
	var lon1 = CommonFunc.deg(cameraObj.longitude);
	var lat1 = CommonFunc.deg(cameraObj.latitude);
	var alt1 = cameraObj.height;
	var cartographic = Cesium.Cartographic.fromCartesian(self._selectpickPosition);
	var lon2 = Cesium.Math.toDegrees(cartographic.longitude);
	var lat2 = Cesium.Math.toDegrees(cartographic.latitude);
	var alt2 = cartographic.height;
	var dist = CommonFunc.getDistance(lon1,lat1,lon2,lat2);
	var heading = CommonFunc.getAngle(lon2,lat2,lon1,lat1);
	var pitch = CommonFunc.deg(self._viewer.scene.camera.pitch);
	var roll = 0;
	var pointList = [];
	for(var i = 0; i < 720; i++){
		var endpoint = CommonFunc.destinationVincenty(lon2, lat2, alt2, heading+i*0.5, 0, dist);
		pointList[pointList.length] = {lon:endpoint.lon,lat:endpoint.lat,alt:alt1,heading:heading+i*0.5+180, pitch:pitch};
	}
	self._globe.toolset._rotatePoint = true;
	self._globe.toolset._rotateByPointList(pointList,0);
}

/*
 * 初始化右键菜单
 * @author zhaoxd
 * @method _load
 * @for GlobeMenu
 * @param {null} null
 * @return {null} null
 */
GlobeMenu.prototype._load = function(){
	var self = this;
	var m_infoMenu = document.createElement("div");
	m_infoMenu.setAttribute("id", "cfglobeInfoMenu");
	m_infoMenu.setAttribute("style", "display:none;");
	m_infoMenu.oncontextmenu=function(){
		window.event.returnValue=false;
		return false;
	};
	var m_infoMenu_content = document.createElement("div");
	m_infoMenu_content.setAttribute("id", self._infoMenuId);
	m_infoMenu_content.setAttribute("class", "cfglobe-infomenu");
	m_infoMenu.appendChild(m_infoMenu_content);
//	var m_infoMenu_a = document.createElement("a");
//	m_infoMenu_a.setAttribute("class", "cfglobe-infomenu-close-button");
//	m_infoMenu_a.innerHTML = "×";
//	m_infoMenu_a.onclick = function(){
//		self.closeMenus();
//	};
//	m_infoMenu_content.appendChild(m_infoMenu_a);
	var m_infoMenu_content_wrapper = document.createElement("div");
	m_infoMenu_content_wrapper.setAttribute("class", "cfglobe-infomenu-content-wrapper");
	m_infoMenu_content.appendChild(m_infoMenu_content_wrapper);
	var m_infoMenu_top = document.createElement("div");
	m_infoMenu_top.setAttribute("class", "cfglobe-infomenu-top");
	m_infoMenu_content_wrapper.appendChild(m_infoMenu_top);
	var m_infoMenu_content = document.createElement("div");
	m_infoMenu_content.setAttribute("id", "cfglobe_infomenu_content");
	m_infoMenu_content.setAttribute("class", "cfglobe-infomenu-content");
	m_infoMenu_content_wrapper.appendChild(m_infoMenu_content);
	var m_infoMenu_bot = document.createElement("div");
	m_infoMenu_bot.setAttribute("class", "cfglobe-infomenu-bot");
	m_infoMenu_content_wrapper.appendChild(m_infoMenu_bot);
	document.getElementById(self._globeId).getElementsByTagName("div")[0].appendChild(m_infoMenu);
}

/*
 * 关闭右键菜单
 * @author zhaoxd
 * @method closeMenus
 * @for GlobeMenu
 * @param {null} null
 * @return {null} null
 */
GlobeMenu.prototype.closeMenus = function(){
	var self = this;
	document.getElementById("cfglobeInfoMenu").style.display="none";
//	self._selectpick = null;
//	self._selectpickPosition = null;
	self._xyz = null;
}

/*
 * 设置右键菜单
 * @author zhaoxd
 * @method setGlobeMenus
 * @for GlobeMenu
 * @param {Object} menus：菜单列表
 * @param {Boolean} true:保留原菜单,false:不保留原菜单
 * @return {null} null
 */
GlobeMenu.prototype.setGlobeMenus = function(menus,defaultMenu){
	var self = this;
	self._globeMenuList = [];
	if(defaultMenu){
		self._globeMenuList = self._defaultMenuList;
		self._globeMenuList = self._globeMenuList.concat(menus);
	}else{
		self._globeMenuList = menus;
	}
}

/*
 * 恢复右键菜单
 * @author zhaoxd
 * @method recoveryGlobeMenus
 * @for GlobeMenu
 * @param {null} null
 * @return {null} null
 */
GlobeMenu.prototype.recoveryGlobeMenus = function(){
	var self = this;
	self._globeMenuList = self._defaultMenuList;
}

/*
 * 根据name获取菜单信息
 * @author zhaoxd
 * @method getGlobeMenusByName
 * @for GlobeMenu
 * @param {string} name
 * @return {Object} 菜单信息
 */
GlobeMenu.prototype.getGlobeMenusByName = function(name){
	var self = this;
	for(var i = self._globeMenuList.length - 1; i >= 0; i--){
		if(self._globeMenuList[i].name == name){
			return self._globeMenuList[i];
		}
	}
	return null;
}

/*
 * 增加右键菜单列表
 * @author zhaoxd
 * @method addGlobeMenus
 * @for GlobeMenu
 * @param {Object} 菜单列表
 * @return {null} null
 */
GlobeMenu.prototype.addGlobeMenus = function(menus){
	var self = this;
	self._globeMenuList = self._globeMenuList.concat(menus);
}

/*
 * 根据name删除右键菜单
 * @author zhaoxd
 * @method removeGlobeMenusByName
 * @for GlobeMenu
 * @param {string} name
 * @return {null} null
 */
GlobeMenu.prototype.removeGlobeMenusByName = function(name){
	var self = this;
	for(var i = self._globeMenuList.length - 1; i >= 0; i--){
		if(self._globeMenuList[i].name == name){
			self._globeMenuList.splice(i, 1);
		}
	}
}

/*
 * 设置右键菜单
 * @author zhaoxd
 * @method setMenus
 * @for GlobeMenu
 * @param {object} 菜单信息
 * @param {point} 坐标信息
 * @return {null} null
 */
GlobeMenu.prototype.setMenus = function(menus,point){
	document.getElementById("cfglobeInfoMenu").style.display="block";
	try{
		var self = this;
		self._menuList = menus;
		document.getElementById("cfglobe_infomenu_content").innerHTML = "";
		if(self._menuList.length > 0){
			for(var i = 0; i < self._menuList.length; i++){
				(function(i){
	                var m_li = document.createElement("div");
	                m_li.onclick = function(){
						var cartographic = Cesium.Cartographic.fromCartesian(self._xyz);
						var longitude = Cesium.Math.toDegrees(cartographic.longitude);
						var latitude = Cesium.Math.toDegrees(cartographic.latitude);
						var height = cartographic.height;
						var lonlat = {lon:longitude,lat:latitude,alt:height};
						self._menuList[i].handler.call(self,self._menuList[i],lonlat);
					};
					m_li.setAttribute("class", "cfglobe-infomenu-content-div");
					var m_src = self._globe.urlConfig.MENU_I;
					var m_icon = document.createElement("img");
					if(self._menuList[i].icon){
						m_src = self._menuList[i].icon;
					}
					m_icon.setAttribute("src", m_src);
					m_li.appendChild(m_icon);
//					var m_icon = document.createElement("div");
//					if(self._menuList[i].icon){
//						m_icon.setAttribute("class", "cfglobe-infomenu-icon-" + self._menuList[i].icon);
//					}else{
//						m_icon.setAttribute("class", "cfglobe-infomenu-icon-i");
//					}
//					m_li.appendChild(m_icon);
					var span = document.createElement("span");
					span.innerHTML = self._menuList[i].name;
//					span.onclick = function(){
//						var cartographic = Cesium.Cartographic.fromCartesian(self._selectpickPosition);
//						var longitude = Cesium.Math.toDegrees(cartographic.longitude);
//						var latitude = Cesium.Math.toDegrees(cartographic.latitude);
//						var height = cartographic.height;
//						var lonlat = {lon:longitude,lat:latitude,alt:height};
//						self._menuList[i].handler.call(self,self._menuList[i],lonlat);
//					};
					m_li.appendChild(span);
					document.getElementById("cfglobe_infomenu_content").appendChild(m_li);
	            })(i);
			}
			if(point){
				var coord_wgs84 = Cesium.Cartographic.fromDegrees(point.lon, point.lat, point.alt);
				self._xyz = self._viewer.scene.globe.ellipsoid.cartographicToCartesian(coord_wgs84);
			}
			var c = Cesium.SceneTransforms.wgs84ToWindowCoordinates(self._viewer.scene, self._xyz);
			self._positionPopUp(c);
			
//			if(self._viewer.scene && self._selectpick && self._selectpick.id._position){
//				document.getElementById("cfglobeInfoMenu").style.display="block";
//				var c = Cesium.SceneTransforms.wgs84ToWindowCoordinates(self._viewer.scene, self._selectpick.id._position._value);
//				self._positionPopUp(c);
//			}else if(self._selectpickPosition){
//				var c = Cesium.SceneTransforms.wgs84ToWindowCoordinates(self._viewer.scene, self._selectpickPosition);
//				self._positionPopUp(c);
//			}
		}
    }
    catch(e){
        if (self._widget._showRenderLoopErrors) {
            var title = '请检查菜单参数！';
            self._widget.showErrorPanel(title, undefined, e);
        }
        return;
    }
}

/*
 * 实时修改右键菜单位置
 * @author zhaoxd
 * @method _positionPopUp
 * @for GlobeMenu
 * @param {object} c:位置坐标
 * @param {string} id:右键菜单id
 * @return {null} null
 */
GlobeMenu.prototype._positionPopUp = function(c,id) {
	var self = this;
	if(c){
		var m_obj=document.getElementById(self._infoMenuId);
		if(m_obj){
			var x = c.x + 10;
			var y = c.y - 30;
			m_obj.style.transform='translate3d(' + x + 'px, ' + y + 'px, 0)';
		}
	}
}

return GlobeMenu;
})