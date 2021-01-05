/*
* author: 赵雪丹
* description: InfoWindow-气泡窗口
* day: 2017-9-28
*/
define( [], function(){
function InfoWindow(globe){
	var self = this;
	this._nunid = 0;
	this._globe = globe;
	this._viewer = globe._viewer;
	this._globeId = globe._globeId;
	
    //气泡窗口列表
    this._infoWindowList = [];
	this._loadInfoWindow();
    //私有渲染事件-实时刷新气泡窗口位置
	this._viewer.scene.postRender.addEventListener(function(){
		self._positionPopUp();
	});
	
	//私有注册事件
	this._handler = new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas);
	//LEFT_CLICK 左键点击事件
	this._handler.setInputAction(function (e) {
    	var pick = self._viewer.scene.pick(e.position);
        if(Cesium.defined(pick)){
            if(pick.id){
		        //回调函数
		        if(pick.id._callback){
		        	pick.id._callback(pick.id);
		        }
            }
        }	
	}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

/*
 * 初始化气泡窗口
 * @author zhaoxd
 * @method _loadInfoWindow
 * @for InfoWindow
 * @param {null} null
 * @return {null} null
 */
InfoWindow.prototype._loadInfoWindow = function(){
	var self = this;
	var m_infoWindow = document.createElement("div");
	m_infoWindow.setAttribute("id", "cfglobe_infoWindow");
	document.getElementById(self._globeId).getElementsByTagName("div")[0].appendChild(m_infoWindow);
}

/*
 * 添加气泡窗口
 * @author zhaoxd
 * @method build
 * @for InfoWindow
 * @param {null} null
 * @return {int} 窗口标识
 */
InfoWindow.prototype.build = function(options){
	var self = this;
	var width = options.width ? parseInt(options.width) : 100;
	var height = options.height ? parseInt(options.height) : 80;
	var top = options.top ? parseInt(options.top) : 0;
	var left = options.left ? parseInt(options.left) : 0;
	var src = options.src ? options.src : "";
	var des = options.des ? options.des : "";
	var title = options.title ? options.title : "";
	var showClose = options.showClose !== false;
	var callback = options.callback ? options.callback : null;
	var beforeClose = options.beforeClose ? options.beforeClose : null;
	var afterClose = options.afterClose ? options.afterClose : null;
	var lonlat = options.lonlat ? options.lonlat : null;
	var m_id = options.id ? options.id : self._nunid;
	var background = options.background ? options.background : null;
	if(!lonlat){
		alert("位置信息不能为空！");
		return;
	}
	var m_infoWindow = document.createElement("div");
	m_infoWindow.setAttribute("id", "cfglobe_infowindow_" + m_id);
	var m_infoWindow_content = document.createElement("div");
	m_infoWindow_content.setAttribute("id", "cfglobe_infowindow_content_" + m_id);
	m_infoWindow_content.setAttribute("class", "cfglobe-infowindow");
	m_infoWindow_content.setAttribute("style", "top:-" + top + "px;left:-" + left + "px;");
	m_infoWindow.appendChild(m_infoWindow_content);
	if(showClose){
		var m_infoWindow_a = document.createElement("a");
		m_infoWindow_a.setAttribute("class", "cfglobe-infowindow-close-button");
		m_infoWindow_a.setAttribute("id", "cfglobe_infowindow_a_" + m_id);
		m_infoWindow_a.innerHTML = "×";
		m_infoWindow_a.onclick = function(){
			self._remove(this);
		};
		m_infoWindow_content.appendChild(m_infoWindow_a);
	}
	var m_infoWindow_content_wrapper = document.createElement("div");
	m_infoWindow_content_wrapper.setAttribute("class", "cfglobe-infowindow-content-wrapper");
	if(background){
		m_infoWindow_content_wrapper.setAttribute("style", "background:" + background);
	}
	m_infoWindow_content.appendChild(m_infoWindow_content_wrapper);
	var m_infoWindow_content_1 = document.createElement("div");
	m_infoWindow_content_1.setAttribute("class", "cfglobe-infowindow-content");
	m_infoWindow_content_wrapper.appendChild(m_infoWindow_content_1);
	var m_infoWindow_title = document.createElement("div");
	m_infoWindow_title.setAttribute("class", "cfglobe-infowindow-title");
	m_infoWindow_title.innerHTML = title;
	m_infoWindow_content_1.appendChild(m_infoWindow_title);
	var m_infoWindow_dex = document.createElement("div");
	m_infoWindow_dex.setAttribute("id", "cfglobe_infowindow_des_" + m_id);
	m_infoWindow_dex.setAttribute("class", "cfglobe-infowindow-des");
	m_infoWindow_dex.setAttribute("style", "width:" + width + "px;height:" + height + "px;");
	if(des){
		m_infoWindow_dex.innerHTML = des;
	}
	m_infoWindow_content_1.appendChild(m_infoWindow_dex);
	if(src != ""){
		var m_infoWindow_iframe = document.createElement("iframe");
		m_infoWindow_iframe.setAttribute("width", "100%");
		m_infoWindow_iframe.setAttribute("height", "100%");
		m_infoWindow_iframe.setAttribute("style", "border:0;");
		m_infoWindow_iframe.setAttribute("src", src);
		m_infoWindow_dex.appendChild(m_infoWindow_iframe);
	}
	var m_infoWindow_bot = document.createElement("div");
	m_infoWindow_bot.setAttribute("class", "cfglobe-infowindow-bot");
	m_infoWindow_content_1.appendChild(m_infoWindow_bot);
	var m_infoWindow_tip_container = document.createElement("div");
	m_infoWindow_tip_container.setAttribute("class", "cfglobe-infowindow-tip-container");
	m_infoWindow_content.appendChild(m_infoWindow_tip_container);
	var m_infoWindow_tip = document.createElement("div");
	m_infoWindow_tip.setAttribute("class", "cfglobe-infowindow-tip");
	m_infoWindow_tip_container.appendChild(m_infoWindow_tip);
	document.getElementById("cfglobe_infoWindow").appendChild(m_infoWindow);
	options.id = m_id;
	var ellipsoid = self._viewer.scene.globe.ellipsoid;
	var coord_wgs84 = Cesium.Cartographic.fromDegrees(lonlat.lon, lonlat.lat, lonlat.alt);
	var coord_xyz = ellipsoid.cartographicToCartesian(coord_wgs84);
	options.position = coord_xyz;
	options.beforeClose = beforeClose;
	options.afterClose = afterClose;
	options.callback = callback;
	self._infoWindowList[self._infoWindowList.length] = options;
	self._nunid++;
	self._positionPopUp();
	return options.id;
}

/*
 * 根据id修改气泡窗口位置
 * @author zhaoxd
 * @method reviseById
 * @for InfoWindow
 * @param {string} id：气泡窗口id
 * @param {point} lonlat：气泡窗口位置
 * @return {null} null
 */
InfoWindow.prototype.reviseById = function(id,lonlat,width,height){
	var self = this;
	for(var i = self._infoWindowList.length - 1; i >= 0; i--){
		if(self._infoWindowList[i].id == id){
			var m_obj = document.getElementById("cfglobe_infowindow_des_" + id);
			if(width){
				m_obj.style.width = width + "px";
			}
			if(height){
				m_obj.style.height = height + "px";
			}
			var ellipsoid = self._viewer.scene.globe.ellipsoid;
			var coord_wgs84 = Cesium.Cartographic.fromDegrees(lonlat.lon, lonlat.lat, lonlat.alt);
			var coord_xyz = ellipsoid.cartographicToCartesian(coord_wgs84);
			self._infoWindowList[i].position = coord_xyz;
			self._positionPopUp();
		}
	}
}

/*
 * 移除气泡窗口
 * @author zhaoxd
 * @method _remove
 * @for InfoWindow
 * @param {null} null
 * @return {null} null
 */
InfoWindow.prototype._remove = function(obj){
	var self = this;
	var id = obj.id.replace("cfglobe_infowindow_a_","");
	self.removeById(id);
}

/*
 * 根据id移除气泡窗口
 * @author zhaoxd
 * @method removeById
 * @for InfoWindow
 * @param {string} 气泡窗口id
 * @return {null} null
 */
InfoWindow.prototype.removeById = function(id){
	var self = this;
	var m_i = -1;
	for(var i = self._infoWindowList.length - 1; i >= 0; i--){
		if(self._infoWindowList[i].id == id){
			m_i = i;
			break;
		}
	}
	if(m_i >= 0){
		if(self._infoWindowList[m_i].beforeClose){
			self._infoWindowList[m_i].beforeClose();
		}
		var m_obj = document.getElementById("cfglobe_infowindow_" + id);
		if(m_obj){
			document.getElementById("cfglobe_infoWindow").removeChild(m_obj);
		}
		if(self._infoWindowList[m_i].afterClose){
			self._infoWindowList[m_i].afterClose();
		}
		if(self._infoWindowList[m_i].callback){
			self._infoWindowList[m_i].callback();
		}
		self._infoWindowList.splice(m_i, 1);
	}
}

/*
 * 移除全部气泡窗口
 * @author zhaoxd
 * @method removeAll
 * @for InfoWindow
 * @param {null} null
 * @return {null} null
 */
InfoWindow.prototype.removeAll = function(){
	var self = this;
	for(var i = self._infoWindowList.length - 1; i >= 0; i--){
		if(self._infoWindowList[i].beforeClose){
			self._infoWindowList[i].beforeClose();
		}
		var m_obj = document.getElementById("cfglobe_infowindow_" + self._infoWindowList[i].id);
		if(m_obj){
			document.getElementById("cfglobe_infoWindow").removeChild(m_obj);
		}
		if(self._infoWindowList[i].afterClose){
			self._infoWindowList[i].afterClose();
		}
		if(self._infoWindowList[i].callback){
			self._infoWindowList[i].callback();
		}
		self._infoWindowList.splice(i, 1);
	}
}

/*
 * 实时修改气泡窗口位置
 * @author zhaoxd
 * @method _positionPopUp
 * @for InfoWindow
 * @param {null} null
 * @return {null} null
 */
InfoWindow.prototype._positionPopUp = function() {
	var self = this;
	for(var i = 0; i < self._infoWindowList.length; i++){
		var c = Cesium.SceneTransforms.wgs84ToWindowCoordinates(self._viewer.scene, self._infoWindowList[i].position);
		if(c){
			var m_obj=document.getElementById("cfglobe_infowindow_content_" + self._infoWindowList[i].id);
			if(m_obj){
				var x = c.x - (m_obj.offsetWidth) / 2;
				var y = c.y - (m_obj.offsetHeight);
//				m_obj.style.transform='translate3d(' + x + 'px, ' + y + 'px, 0)';
				m_obj.style.transform='translate3d(' + Math.round(x) + 'px, ' + Math.round(y) + 'px, 0)';
			}
		}
	}
}

return InfoWindow;
})


//define( [], function(){
//function InfoWindow(globe){
//	var self = this;
//	this._globe = globe;
//	this._viewer = globe._viewer;
//	this._globeId = globe._globeId;
//	
//  //气泡窗口列表
//  this._infoWindowList = [];
//	this._loadInfoWindow();
//  this._selectpickPosition_left = null;
//  //私有渲染事件-实时刷新气泡窗口位置
//	this._viewer.scene.postRender.addEventListener(function(){
//		for(var i = 0; i < self._infoWindowList.length; i++){
//			var c = Cesium.SceneTransforms.wgs84ToWindowCoordinates(self._viewer.scene, self._infoWindowList[i].position);
//			self._positionPopUp(c,self._infoWindowList[i].pick.id._id);
//		}
//	});
//	
//	//私有注册事件
//	this._handler = new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas);
//	//LEFT_CLICK 左键点击事件
//	this._handler.setInputAction(function (e) {
//		var lonlat = self._globe.getLonLatByPosition(e.position);
//  	var pick = self._viewer.scene.pick(e.position);
//      if(Cesium.defined(pick)){
//          if(pick.id){
//          	if(pick.id._showWindow){
//          		var m_is = false;
//	            	for(var i = 0; i < self._infoWindowList.length; i++){
//	            		if(self._infoWindowList[i].pick.id == pick.id){
//	            			m_is = true;
//	            		}
//					}
//	            	if(!m_is){
//	            		self._add(pick,self._viewer.scene.pickPosition(e.position));
//	            	}
//          	}
//		        //回调函数
//		        if(pick.id._callback){
//		        	pick.id._callback(pick.id);
//		        }
//          }
//      }	
//	}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
////	//RIGHT_CLICK 右键点击事件
////	this._handler.setInputAction(function (e) {
////		var lonlat = self._globe.getLonLatByPosition(e.position);
////  	if(lonlat.alt < 0){
////			lonlat.alt = 0;
////		}
////  	var m_point = {lon: lonlat.lon, lat: lonlat.lat, alt: lonlat.alt};
////		
////	}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
////	//MOUSE_MOVE 鼠标移动事件
////	this._handler.setInputAction(function (movement) {
////		var lonlat = self._globe.getLonLatByPosition(e.position);
////		
////	}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
//}
//InfoWindow.prototype.aaa = function(){
//	
//}
//
///*
// * 初始化气泡窗口
// * @author zhaoxd
// * @method _loadInfoWindow
// * @for InfoWindow
// * @param {null} null
// * @return {null} null
// */
//InfoWindow.prototype._loadInfoWindow = function(){
//	var self = this;
//	var m_infoWindow = document.createElement("div");
//	m_infoWindow.setAttribute("id", "cfglobe_infoWindow");
//	document.getElementById(self._globeId).getElementsByTagName("div")[0].appendChild(m_infoWindow);
//}
//
///*
// * 添加气泡窗口
// * @author zhaoxd
// * @method _add
// * @for InfoWindow
// * @param {pick} 信息点
// * @return {null} null
// */
//InfoWindow.prototype._add = function(pick,selectPosition){
//	var self = this;
//	var m_top = 0;
////	if(pick.id._billboard){
////		m_top = pick.id._billboard._height._value - 5;
////	}
//	var m_infoWindow = document.createElement("div");
//	m_infoWindow.setAttribute("id", "cfglobe_infowindow_" + pick.id._id);
////	m_infoWindow.setAttribute("style", "display:none;");
//	var m_infoWindow_content = document.createElement("div");
//	m_infoWindow_content.setAttribute("id", "cfglobe_infowindow_content_" + pick.id._id);
//	m_infoWindow_content.setAttribute("class", "cfglobe-infowindow");
//	m_infoWindow_content.setAttribute("style", "top:-" + m_top + "px;left:0;");
//	m_infoWindow.appendChild(m_infoWindow_content);
//	var m_infoWindow_a = document.createElement("a");
//	m_infoWindow_a.setAttribute("class", "cfglobe-infowindow-close-button");
//	m_infoWindow_a.innerHTML = "×";
//	m_infoWindow_a.onclick = function(){
//		self._remove(pick.id._id);
//	};
//	m_infoWindow_content.appendChild(m_infoWindow_a);
//	var m_infoWindow_content_wrapper = document.createElement("div");
//	m_infoWindow_content_wrapper.setAttribute("class", "cfglobe-infowindow-content-wrapper");
//	m_infoWindow_content.appendChild(m_infoWindow_content_wrapper);
//	var m_infoWindow_content_1 = document.createElement("div");
//	m_infoWindow_content_1.setAttribute("class", "cfglobe-infowindow-content");
//	m_infoWindow_content_wrapper.appendChild(m_infoWindow_content_1);
//	var m_infoWindow_title = document.createElement("div");
//	m_infoWindow_title.setAttribute("class", "cfglobe-infowindow-title");
//	m_infoWindow_title.innerHTML = pick.id._name;
//	m_infoWindow_content_1.appendChild(m_infoWindow_title);
//	var m_infoWindow_dex = document.createElement("div");
//	m_infoWindow_dex.setAttribute("class", "cfglobe-infowindow-des");
//	m_infoWindow_dex.setAttribute("style", "width: " + pick.id._windowWidth + "px;height: " + pick.id._windowHeight + "px;");
//	if(pick.id._description){
//		m_infoWindow_dex.innerHTML = pick.id._description;
//	}
//	m_infoWindow_content_1.appendChild(m_infoWindow_dex);
//	if(pick.id._src != ""){
//		var m_infoWindow_iframe = document.createElement("iframe");
//		m_infoWindow_iframe.setAttribute("width", "100%");
//		m_infoWindow_iframe.setAttribute("height", "100%");
//		m_infoWindow_iframe.setAttribute("src", pick.id._src);
//		m_infoWindow_dex.appendChild(m_infoWindow_iframe);
//	}
//	var m_infoWindow_bot = document.createElement("div");
//	m_infoWindow_bot.setAttribute("class", "cfglobe-infowindow-bot");
//	m_infoWindow_content_1.appendChild(m_infoWindow_bot);
//	var m_infoWindow_tip_container = document.createElement("div");
//	m_infoWindow_tip_container.setAttribute("class", "cfglobe-infowindow-tip-container");
//	m_infoWindow_content.appendChild(m_infoWindow_tip_container);
//	var m_infoWindow_tip = document.createElement("div");
//	m_infoWindow_tip.setAttribute("class", "cfglobe-infowindow-tip");
//	m_infoWindow_tip_container.appendChild(m_infoWindow_tip);
//	document.getElementById("cfglobe_infoWindow").appendChild(m_infoWindow);
//	var c = Cesium.SceneTransforms.wgs84ToWindowCoordinates(self._viewer.scene, pick.id._position._value);
//	self._positionPopUp(c,pick.id._id);
//	self._infoWindowList[self._infoWindowList.length] = {pick:pick,position:selectPosition};
//}
//
///*
// * 移除气泡窗口
// * @author zhaoxd
// * @method _remove
// * @for InfoWindow
// * @param {string} 气泡窗口id(后面部分)
// * @return {null} null
// */
//InfoWindow.prototype._remove = function(id){
//	var self = this;
//	var m_obj = document.getElementById("cfglobe_infowindow_" + id);
//	if(m_obj){
//		document.getElementById("cfglobe_infoWindow").removeChild(m_obj);
//	}
//	for(var i = self._infoWindowList.length - 1; i >= 0; i--){
//		if(self._infoWindowList[i].pick.id._id == id){
//			self._infoWindowList.splice(i, 1);
//		}
//	}
//}
//
///*
// * 实时修改气泡窗口位置
// * @author zhaoxd
// * @method _positionPopUp
// * @for InfoWindow
// * @param {object} c:位置坐标
// * @param {string} id:气泡窗口id(后面部分)
// * @return {null} null
// */
//InfoWindow.prototype._positionPopUp = function(c,id) {
//	var self = this;
//	if(c){
//		var m_obj=document.getElementById("cfglobe_infowindow_content_" + id);
//		if(m_obj){
//			var x = c.x - (m_obj.offsetWidth) / 2;
//			var y = c.y - (m_obj.offsetHeight);
//			m_obj.style.transform='translate3d(' + x + 'px, ' + y + 'px, 0)';
//		}
//	}
//}
//
//return InfoWindow;
//})