/*
* author: 赵雪丹
* description: BottomInfo-底部信息
* day: 2017-9-28
*/
define( [ "./commonFunc" ], function( CommonFunc ){
function BottomInfo(globe){
	var self = this;
	this._globe = globe;
	this._viewer = globe._viewer;
	this._ellipsoid = this._viewer.scene.globe.ellipsoid;
	this._globeId = globe._globeId;
	if(!this._globe._showBottomInfo){
		return;
	}
	this._lonlat;
	this._showDFM = true;
	this._bottom_info;
	this._loadBottomInfo();
	
	//私有注册事件
	this._handler = new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas);
	
	this._handler.setInputAction(function(movement){
		var sceneMode = self._viewer.scene.mode;
		var lonlat = self._globe.getLonLatByPosition(movement.endPosition);
		if(lonlat){
			if(sceneMode == Cesium.SceneMode.SCENE3D){
				if(self._viewer.scene.camera.positionCartographic.height > 100000){
					lonlat.alt = 0;
				}
			}
			self._lonlat = lonlat;
			self._setLonLat();
		}
	}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
	
    //私有渲染事件-实时修改BottomInfo位置
	this._viewer.scene.postRender.addEventListener(function(){
		var h_w = self._viewer._lastHeight;
		var h_n = self._viewer.scene.canvas.height;
		var h = h_w-h_n;
		if(self._bottom_info){
			self._bottom_info.setAttribute("style", "bottom: " + h + "px;");
		}
	});
}

/*
 * 初始化底部信息
 * @author zhaoxd
 * @method _loadBottomInfo
 * @for BottomInfo
 * @param {null} null
 * @return {null} null
 */
BottomInfo.prototype._loadBottomInfo = function(){
	var self = this;
	self._bottom_info = document.createElement("div");
	self._bottom_info.setAttribute("class", "cfglobe-bottom-info");
	var m_bottom_info_left = document.createElement("div");
	m_bottom_info_left.setAttribute("id", "cfglobe_bottom_info_left");
	m_bottom_info_left.setAttribute("class", "cfglobe-bottom-info-left");
	self._bottom_info.appendChild(m_bottom_info_left);
	var m_bottom_info_right = document.createElement("div");
	m_bottom_info_right.setAttribute("id", "cfglobe_bottom_info_right");
	m_bottom_info_right.setAttribute("class", "cfglobe-bottom-info-right");
	m_bottom_info_right.setAttribute("title", "点击切换显示类型");
	m_bottom_info_right.onclick = function(){
		self._showDFM = !self._showDFM;
		self._setLonLat();
	};
	self._bottom_info.appendChild(m_bottom_info_right);
	document.getElementById(self._globeId).getElementsByTagName("div")[0].appendChild(self._bottom_info);
}

/*
 * 设置经纬度信息
 * @author zhaoxd
 * @method _setLonLat
 * @for BottomInfo
 * @param {null} null
 * @return {null} null
 */
BottomInfo.prototype._setLonLat = function(){
	var self = this;
	var jd = CommonFunc.formatDegree(self._lonlat.lon);
	var wd = CommonFunc.formatDegree(self._lonlat.lat);
	if(jd.f < 10){
		jd.f = "0" + jd.f;
	}
	if(wd.f < 10){
		wd.f = "0" + wd.f;
	}
	var jd_m = jd.m.toFixed(2);
	if(jd_m < 10){
		jd_m = "0" + jd_m;
	}
	var wd_m = wd.m.toFixed(2);
	if(wd_m < 10){
		wd_m = "0" + wd_m;
	}
	if(self._showDFM){
		document.getElementById("cfglobe_bottom_info_right").innerHTML = "经度：" + jd.d + "°" + jd.f + "'" + jd_m + "\"；纬度：" + wd.d + "°" + wd.f + "'" + wd_m + "\"； 高程：" + parseInt(self._lonlat.alt) + "m";
	}else{
		document.getElementById("cfglobe_bottom_info_right").innerHTML = "经度：" + self._lonlat.lon.toFixed(4) + " ； 纬度：" + self._lonlat.lat.toFixed(4) + "  ； 高程：" + self._lonlat.alt.toFixed(2);
	}
}

/*
 * 设置底部信息
 * @author zhaoxd
 * @method setBottomInfo
 * @for BottomInfo
 * @param {string} 要显示的信息
 * @return {null} null
 */
BottomInfo.prototype.setBottomInfo = function(str){
	var self = this;
	document.getElementById("cfglobe_bottom_info_left").innerHTML = str;
}

return BottomInfo;
})