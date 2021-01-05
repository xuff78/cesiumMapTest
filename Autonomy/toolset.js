/*
* author: 赵雪丹
* description: Toolset-右侧工具条
* day: 2017-9-28
*/
define( [ ], function( ){
function Toolset(globe){
	var self = this;
	this._globe = globe;
	this._viewer = globe._viewer;
	this._globeId = globe._globeId;
	this._toolsetSelect = "";
	this._csvList = [];
	this._csvLabel = "";
	this._csvDraw = false;
	this._transformingDraw = false;
	this._showMenu = true;
	this._pathManager = {
		draw: false, 
		selectSpoint: false, 
		spoint: null, 
		selectTpoint: false, 
		tpoints: [], 
		tnun: 0, 
		selectEpoint: false, 
		epoint: null
	};
	this._loadToolset(this._globe._toolsetCloseList);
	if(!this._globe._showToolset){
		document.getElementById("cfglobe_toolset").style.display = "none";
	}
	//定位点
	this._location_pos = null;
	this._address_list = [];
	//射线分析结果列表
	this._intersectionByRay_list = [];
	//观测状态
	this._rotatePoint = false;
	//私有注册事件
	this._handler = new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas);
	//LEFT_CLICK 左键点击事件
	this._handler.setInputAction(function (e) {
    	self._rotatePoint = false;
    	var lonlat = self._globe.getLonLatByPosition(e.position);
    	if(self._csvDraw){
			self._addCsv(lonlat.lon,lonlat.lat,self._csvLabel);
    	}else if(self._transformingDraw){
			document.getElementById("cfglobe_toolset_top_transforming_jd_input").value = lonlat.lon.toFixed(4);
			document.getElementById("cfglobe_toolset_top_transforming_wd_input").value = lonlat.lat.toFixed(4);
			var dfm_j = self._globe.commonFunc.formatDegree(lonlat.lon);
			var dfm_w = self._globe.commonFunc.formatDegree(lonlat.lat);
			document.getElementById("cfglobe_toolset_top_transforming_j_d_input").value = dfm_j.d;
			document.getElementById("cfglobe_toolset_top_transforming_j_f_input").value = dfm_j.f;
			document.getElementById("cfglobe_toolset_top_transforming_j_m_input").value = dfm_j.m.toFixed(4);
			document.getElementById("cfglobe_toolset_top_transforming_w_d_input").value = dfm_w.d;
			document.getElementById("cfglobe_toolset_top_transforming_w_f_input").value = dfm_w.f;
			document.getElementById("cfglobe_toolset_top_transforming_w_m_input").value = dfm_w.m.toFixed(4);
    	}else if(self._pathManager.draw){
    		var pinBuilder = new Cesium.PinBuilder();
    		if(self._pathManager.selectSpoint){
    			if(self._pathManager.spoint){
    				self._viewer.entities.remove(self._pathManager.spoint);
    			}
    			self._pathManager.spoint = self._viewer.entities.add({
    				lonlat : lonlat,
				    position : Cesium.Cartesian3.fromDegrees(lonlat.lon, lonlat.lat),
				    billboard : {
//	    				show: false,
				        image : pinBuilder.fromText("起", Cesium.Color.RED, 48).toDataURL(),
				        width : 30,
				        height : 30,
				        verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
				        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
				        disableDepthTestDistance : Number.POSITIVE_INFINITY
				    }
				});
				document.getElementById("cfglobe_toolset_top_path_s_lon").setAttribute("value", lonlat.lon.toFixed(4));
				document.getElementById("cfglobe_toolset_top_path_s_lat").setAttribute("value", lonlat.lat.toFixed(4));
    		}else if(self._pathManager.selectTpoint){
    			var m_div2 = document.getElementById("cfglobe_toolset_top_path_t_pint");
    			var m_info = document.createElement("div");
    			m_div2.appendChild(m_info);
  				var m_toolset_button = document.createElement("button");
				m_toolset_button.setAttribute("id", "cfglobe_toolset_top_path_tpint_" + self._pathManager.tnun);
				m_toolset_button.setAttribute("class", "cesium-button");
				m_toolset_button.innerHTML = "删除经过点";
				m_toolset_button.onclick = function(){
					var m_id = this.id.replace("cfglobe_toolset_top_path_tpint_","");
					for(var i = self._pathManager.tpoints.length - 1; i >= 0; i--){
						if(self._pathManager.tpoints[i].tnun == m_id){
							self._viewer.entities.remove(self._pathManager.tpoints[i]);
							self._pathManager.tpoints.splice(i, 1);
						}
					}
					this.parentNode.parentNode.removeChild(this.parentNode);
				};
				m_info.appendChild(m_toolset_button);
				var m_toolset_top_path_j_lon = document.createElement("input");
				m_toolset_top_path_j_lon.setAttribute("style", "width: 80px; margin-right: 10px;");
				m_toolset_top_path_j_lon.setAttribute("disabled", "disabled");
				m_toolset_top_path_j_lon.setAttribute("value", lonlat.lon.toFixed(4));
				m_info.appendChild(m_toolset_top_path_j_lon);
				var m_toolset_top_path_j_lat = document.createElement("input");
				m_toolset_top_path_j_lat.setAttribute("style", "width: 70px; margin-right: 0;");
				m_toolset_top_path_j_lat.setAttribute("disabled", "disabled");
				m_toolset_top_path_j_lat.setAttribute("value", lonlat.lat.toFixed(4));
				m_info.appendChild(m_toolset_top_path_j_lat);
				var m_pos = self._viewer.entities.add({
    				lonlat : lonlat,
    				tnun : self._pathManager.tnun,
				    position : Cesium.Cartesian3.fromDegrees(lonlat.lon, lonlat.lat),
				    billboard : {
//	    				show: false,
				        image : pinBuilder.fromText("过", Cesium.Color.RED, 48).toDataURL(),
				        width : 30,
				        height : 30,
				        verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
				        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
				        disableDepthTestDistance : Number.POSITIVE_INFINITY
				    }
				});
				self._pathManager.tpoints.push(m_pos);
				self._pathManager.tnun++;
    		}else if(self._pathManager.selectEpoint){
    			if(self._pathManager.epoint){
    				self._viewer.entities.remove(self._pathManager.epoint);
    			}
    			self._pathManager.epoint = self._viewer.entities.add({
    				lonlat : lonlat,
				    position : Cesium.Cartesian3.fromDegrees(lonlat.lon, lonlat.lat),
				    billboard : {
//	    				show: false,
				        image : pinBuilder.fromText("止", Cesium.Color.RED, 48).toDataURL(),
				        width : 30,
				        height : 30,
				        verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
				        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
				        disableDepthTestDistance : Number.POSITIVE_INFINITY
				    }
				});
				document.getElementById("cfglobe_toolset_top_path_e_lon").setAttribute("value", lonlat.lon.toFixed(4));
				document.getElementById("cfglobe_toolset_top_path_e_lat").setAttribute("value", lonlat.lat.toFixed(4));
    		}
    	}
	}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
	
	//鼠标移动事件注册
	this._handler.setInputAction(function(movement){
		var o = document.getElementById(self._globeId);
		var w = o.offsetWidth;
		var m_w = w - movement.endPosition.x;
		if(m_w < 200){
			var h_w = self._viewer._lastHeight;
			var h_n = self._viewer.scene.canvas.height;
			var h = h_w-h_n;
			document.getElementById("cfglobe_toolset").style.bottom = (h+27) + "px";
			document.getElementById("cfglobe_toolset").style.minWidth = "70px";
		}else{
			document.getElementById("cfglobe_toolset").style.minWidth = "0";
		}
	}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

	
	//RIGHT_CLICK 右键点击事件
	this._handler.setInputAction(function (e) {
	  	self._rotatePoint = false;
		var lonlat = self._globe.getLonLatByPosition(e.position);
	  	if(lonlat.alt < 0){
			lonlat.alt = 0;
		}
	}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
	
    //私有渲染事件-实时修改LayerManager位置
	this._viewer.scene.postRender.addEventListener(function(){
		var h_w = self._viewer._lastHeight;
		var h_n = self._viewer.scene.canvas.height;
		var h = h_w-h_n;
		var m_toolset = document.getElementById("cfglobe_toolset");
		if(m_toolset){
//			m_toolset.setAttribute("style", "bottom: " + (h+27) + "px;");
		}
	});
}

/*
 * 设置显隐
 * @author zhaoxd
 * @method setDisplay
 * @for Toolset
 * @param {Boolean} true:显示,false:隐藏
 * @return {null} null
 */
Toolset.prototype.setDisplay = function(display){
	if(display){
		document.getElementById("cfglobe_toolset").style.display = "";
	}else{
		document.getElementById("cfglobe_toolset").style.display = "none";
	}
}

/*
 * 初始化工具条
 * @author zhaoxd
 * @method _loadToolset
 * @for Toolset
 * @param {null} null
 * @return {null} null
 */
Toolset.prototype._loadToolset = function(toolsetCloseList){
	var self = this;
	var m_toolset_top = document.createElement("div");
	m_toolset_top.setAttribute("id", "cfglobe_toolset_top");
//	m_toolset_top.setAttribute("class", "cfglobe-toolset-top-hide");
	document.getElementById(self._globeId).getElementsByTagName("div")[0].appendChild(m_toolset_top);
	self._loadAddress();
	self._loadLocation();
	self._loadMeasure();
	self._loadAnalysis();
	self._loadViewing();
	self._loadPath();
	self._loadShp();
	self._loadCsv();
	self._loadTransforming();
	var btnList = [
				{name:"open",title:""},
				{name:"globe",title:"全球视野"},
				{name:"2d",title:"维度切换"},
				{name:"north",title:"正北朝向"},
				{name:"overlooking",title:"正上俯视"},
				{name:"sunshine",title:"光照效果"},
				{name:"address",title:"地名定位"},
				{name:"location",title:"快速定位"},
				{name:"transforming",title:"坐标转换"},
				{name:"measure",title:"基础量算"},
				{name:"analysis",title:"空间分析"},
				{name:"viewing",title:"目标观测"},
				{name:"path",title:"路径分析"},
				{name:"shp",title:"导入SHP"},
				{name:"csv",title:"地图标注"},
				{name:"print",title:"高清出图"},
				{name:"clear",title:"清除结果"}];
	var m_toolset = document.createElement("div");
	m_toolset.setAttribute("id", "cfglobe_toolset");
	m_toolset.setAttribute("class", "cfglobe-toolset");
	for(var i = 0; i < btnList.length; i++){
		var m_is = true;
		for(var k = 0; k < toolsetCloseList.length; k++){
			if(toolsetCloseList[k] == btnList[i].name){
				m_is = false;
				break;
			}
		}
		if(m_is){
			var m_toolset_list = document.createElement("div");
			m_toolset_list.setAttribute("class", "cfglobe-toolset-list");
			var m_toolset_icon = document.createElement("img");
			m_toolset_icon.setAttribute("title", btnList[i].title);
			m_toolset_icon.dataset.tag = btnList[i].name;
//			m_toolset_icon.setAttribute("class", "cfglobe-toolset-btn-" + btnList[i].name);
			var m_src = "";
			if(btnList[i].name == "open"){
				m_src = self._globe.urlConfig.TOOLSET_OPEN;
			}else if(btnList[i].name == "globe"){
				m_src = self._globe.urlConfig.TOOLSET_GLOBE;
			}else if(btnList[i].name == "2d"){
				m_src = self._globe.urlConfig.TOOLSET_2D;
			}else if(btnList[i].name == "north"){
				m_src = self._globe.urlConfig.TOOLSET_NORTH;
			}else if(btnList[i].name == "overlooking"){
				m_src = self._globe.urlConfig.TOOLSET_OVERLOOKING;
			}else if(btnList[i].name == "sunshine"){
				m_src = self._globe.urlConfig.TOOLSET_SUNSHINE;
			}else if(btnList[i].name == "address"){
				m_src = self._globe.urlConfig.TOOLSET_ADDRESS;
			}else if(btnList[i].name == "location"){
				m_src = self._globe.urlConfig.TOOLSET_LOCATION;
			}else if(btnList[i].name == "transforming"){
				m_src = self._globe.urlConfig.TOOLSET_TRANSFORMING;
			}else if(btnList[i].name == "measure"){
				m_src = self._globe.urlConfig.TOOLSET_MEASURE;
			}else if(btnList[i].name == "analysis"){
				m_src = self._globe.urlConfig.TOOLSET_ANALYSIS;
			}else if(btnList[i].name == "viewing"){
				m_src = self._globe.urlConfig.TOOLSET_VIEWING;
			}else if(btnList[i].name == "path"){
				m_src = self._globe.urlConfig.TOOLSET_PATH;
			}else if(btnList[i].name == "shp"){
				m_src = self._globe.urlConfig.TOOLSET_SHP;
			}else if(btnList[i].name == "csv"){
				m_src = self._globe.urlConfig.TOOLSET_CSV;
			}else if(btnList[i].name == "print"){
				m_src = self._globe.urlConfig.TOOLSET_PRINT;
			}else if(btnList[i].name == "clear"){
				m_src = self._globe.urlConfig.TOOLSET_CLEAR;
			}
			m_toolset_icon.setAttribute("src", m_src);
			m_toolset_icon.onclick = function(){
				self._toolsetClick(this);
			};
			m_toolset_list.appendChild(m_toolset_icon);
//			var m_toolset_icon = document.createElement("button");
//			m_toolset_icon.setAttribute("title", btnList[i].title);
//			m_toolset_icon.dataset.tag = btnList[i].name;
//			m_toolset_icon.setAttribute("class", "cfglobe-toolset-btn-" + btnList[i].name);
//			m_toolset_icon.onclick = function(){
//				self._toolsetClick(this);
//			};
//			m_toolset_list.appendChild(m_toolset_icon);
			var m_toolset_span = document.createElement("span");
			m_toolset_span.setAttribute("class", "cfglobe-toolset-span");
			m_toolset_span.dataset.tag = btnList[i].name;
			m_toolset_span.onclick = function(){
				self._toolsetClick(this);
			};
			m_toolset_span.innerHTML =  btnList[i].title;
			m_toolset_list.appendChild(m_toolset_span);
			m_toolset.appendChild(m_toolset_list);
		}
	}
	document.getElementById(self._globeId).getElementsByTagName("div")[0].appendChild(m_toolset);
}

Toolset.prototype._loadAddress = function(){
	var self = this;
	var m_top = document.getElementById("cfglobe_toolset_top");
	var m_top_sub = document.createElement("div");
	m_top_sub.setAttribute("id", "cfglobe_toolset_top_address");
	m_top_sub.setAttribute("class", "cfglobe-toolset-top-hide");
	var m_title = document.createElement("div");
	m_title.setAttribute("class", "cfglobe-toolset-top-title");
	m_top_sub.appendChild(m_title);
	var m_icon = document.createElement("img");
	m_icon.setAttribute("class", "cfglobe-toolset-top-title-img");
	m_icon.setAttribute("src", self._globe.urlConfig.TOOLSET_ADDRESS);
	m_title.appendChild(m_icon);
	var m_title_span = document.createElement("span");
	m_title_span.innerHTML = "地名定位";
	m_title.appendChild(m_title_span);
	var m_title_x = document.createElement("img");
	m_title_x.setAttribute("class", "cfglobe-toolset-top-title-x");
	m_title_x.setAttribute("src", self._globe.urlConfig.TOOLSET_X);
	m_title_x.onclick = function(){
		self._closeAll();
	};
	m_title.appendChild(m_title_x);
	
	var m_info = document.createElement("div");
	m_info.setAttribute("class", "cfglobe-toolset-top-info");
	m_top_sub.appendChild(m_info);
	var m_toolset_top_dm = document.createElement("span");
	m_toolset_top_dm.innerHTML = "地名：";
	m_info.appendChild(m_toolset_top_dm);
	var m_toolset_top_dm_input = document.createElement("input");
	m_toolset_top_dm_input.setAttribute("id", "cfglobe_toolset_top_dm_input");
	m_toolset_top_dm_input.setAttribute("style", "width: 100px;");
	m_toolset_top_dm_input.setAttribute("value", "北京市");
	m_toolset_top_dm_input.onkeydown = function(e){
		 if(!e){
		 	e = window.event;
		 }
		 if((e.keyCode || e.which) == 13){
		 	self._addressClick();
		}
	}
	m_info.appendChild(m_toolset_top_dm_input);
	var m_toolset_top_address_button = document.createElement("button");
	m_toolset_top_address_button.setAttribute("class", "cesium-button");
	m_toolset_top_address_button.innerHTML = "查询";
	m_toolset_top_address_button.onclick = function(){
		self._addressClick();
	};
	m_info.appendChild(m_toolset_top_address_button);
	var m_toolset_top_address_button1 = document.createElement("button");
	m_toolset_top_address_button1.setAttribute("class", "cesium-button");
	m_toolset_top_address_button1.setAttribute("style", "margin-bottom: 7px;");    
	m_toolset_top_address_button1.innerHTML = "清除";
	m_toolset_top_address_button1.onclick = function(){
		self._clearAddressList();
	};
	m_info.appendChild(m_toolset_top_address_button1);
	var m_toolset_top_address_list = document.createElement("div");
	m_toolset_top_address_list.setAttribute("id", "cfglobe_toolset_top_address_list");
	m_info.appendChild(m_toolset_top_address_list);
	
	m_top.appendChild(m_top_sub);
}

Toolset.prototype._addressClick = function(){
	var self = this;
	var m_address = document.getElementById("cfglobe_toolset_top_dm_input").value;
	var m_filter = '<Filter>';
	m_filter += '<PropertyIsLike wildCard=\'*\' singleChar=\'.\' escapeChar=\'!\'><PropertyName>NAME</PropertyName><Literal>*' + m_address + '*</Literal></PropertyIsLike>';
	m_filter += '</Filter>';
	
	$.ajax(self._globe.urlConfig.LOCALOWS,{
        type: 'GET',
        data: {
            service: 'WFS',
            version: '1.0.0',
            request: 'GetFeature',
            typename: "cf:city_poi",
            maxFeatures: 500,
            outputFormat: 'application/json',
			filter: m_filter
        },
        success: function(data){
        	if(data.features){
        		self._clearAddressList();
				var addressList = [];
        		for(var i = 0; i < data.features.length; i++){
        			var coordinates = data.features[i].geometry.coordinates;
        			var properties = data.features[i].properties;
        			var info = {name:properties.NAME,id:properties.OBJECTID,lon:coordinates[0],lat:coordinates[1]};
					addressList.push(info);
					var position = Cesium.Cartesian3.fromDegrees(coordinates[0], coordinates[1]);
					var addressMark = self._viewer.entities.add({
					    position : position,
					    billboard : {
					        image : self._globe.urlConfig.ADDRESS_RED,
					        width : 30,
					        height : 30,
					        verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
					        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
        					disableDepthTestDistance : Number.POSITIVE_INFINITY
					    },
					    label:{
					    	text: properties.NAME,
					    	font: "14pt sans-serif",
					    	fillColor: Cesium.Color.WHITE,
					    	horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
					    	pixelOffset: new Cesium.Cartesian2(30/2, 0),
					    	verticalOrigin : Cesium.VerticalOrigin.BASELINE,
					        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
					        disableDepthTestDistance : Number.POSITIVE_INFINITY
					    }
					});
					self._address_list.push(addressMark);
        		}
				self._addressCallback(addressList);
        	}
        },
        error: function(XMLHttpRequest, textStatus, errorThrown){
        	alert("抱歉："+textStatus);
        }
    });
}

Toolset.prototype._loadLocation = function(){
	var self = this;
	var m_top = document.getElementById("cfglobe_toolset_top");
	var m_top_sub = document.createElement("div");
	m_top_sub.setAttribute("id", "cfglobe_toolset_top_location");
	m_top_sub.setAttribute("class", "cfglobe-toolset-top-hide");
	var m_title = document.createElement("div");
	m_title.setAttribute("class", "cfglobe-toolset-top-title");
	m_top_sub.appendChild(m_title);
	var m_icon = document.createElement("img");
	m_icon.setAttribute("class", "cfglobe-toolset-top-title-img");
	m_icon.setAttribute("src", self._globe.urlConfig.TOOLSET_LOCATION);
	m_title.appendChild(m_icon);
	var m_title_span = document.createElement("span");
	m_title_span.innerHTML = "快速定位";
	m_title.appendChild(m_title_span);
	var m_title_x = document.createElement("img");
	m_title_x.setAttribute("class", "cfglobe-toolset-top-title-x");
	m_title_x.setAttribute("src", self._globe.urlConfig.TOOLSET_X);
	m_title_x.onclick = function(){
		self._closeAll();
	};
	m_title.appendChild(m_title_x);
	
	var m_info = document.createElement("div");
	m_info.setAttribute("class", "cfglobe-toolset-top-info");
	m_top_sub.appendChild(m_info);
	var m_select = document.createElement("div");
	m_select.setAttribute("class", "cfglobe-toolset-top-info-radio");
	m_info.appendChild(m_select);
	var m_label = document.createElement("label");
	var m_radio = document.createElement("input");
	m_radio.setAttribute("value", "0");
	m_radio.setAttribute("type", "radio");
	m_radio.setAttribute("checked","checked");
	m_radio.setAttribute("name", "cfglobe_toolset_radio_location");
	m_radio.setAttribute("style", "width: 20px; height: 13px;");
	m_radio.onclick = function(){
		document.getElementById("cfglobe_toolset_top_dfm_div").style.display="none";
		document.getElementById("cfglobe_toolset_top_sjz_div").style.display="block";
	};
	m_label.appendChild(m_radio);
	var m_span = document.createElement("span");
	m_span.innerHTML = "十进制度";
	m_label.appendChild(m_span);
	m_select.appendChild(m_label);
	var m_label1 = document.createElement("label");
	m_label1.setAttribute("style", "margin-left: 10px;");
	var m_radio1 = document.createElement("input");
	m_radio1.setAttribute("value", "1");
	m_radio1.setAttribute("type", "radio");
	m_radio1.setAttribute("name", "cfglobe_toolset_radio_location");
	m_radio1.setAttribute("style", "width: 20px; height: 13px;");
	m_radio1.onclick = function(){
		document.getElementById("cfglobe_toolset_top_sjz_div").style.display="none";
		document.getElementById("cfglobe_toolset_top_dfm_div").style.display="block";
	};
	m_label1.appendChild(m_radio1);
	var m_span1 = document.createElement("span");
	m_span1.innerHTML = "度分秒";
	m_label1.appendChild(m_span1);
	m_select.appendChild(m_label1);
	var m_toolset_top_button_clear = document.createElement("button");
	m_toolset_top_button_clear.setAttribute("class", "cesium-button");
	m_toolset_top_button_clear.setAttribute("style", "margin-left: 30px;");
	m_toolset_top_button_clear.innerHTML = "清除";
	m_toolset_top_button_clear.onclick = function(){
		if(self._location_pos){
        	self._viewer.entities.remove(self._location_pos);
    	}
	};
	m_select.appendChild(m_toolset_top_button_clear);
	
	var m_toolset_top_sjz = document.createElement("div");
	m_toolset_top_sjz.setAttribute("id", "cfglobe_toolset_top_sjz_div");
	m_info.appendChild(m_toolset_top_sjz);
	var m_sjz_1 = document.createElement("div");
	var m_toolset_top_jd = document.createElement("span");
	m_toolset_top_jd.innerHTML = "经度：";
	m_sjz_1.appendChild(m_toolset_top_jd);
	var m_toolset_top_jd_input = document.createElement("input");
	m_toolset_top_jd_input.setAttribute("id", "cfglobe_toolset_top_jd_input");
	m_toolset_top_jd_input.setAttribute("value", "128.0613");
	m_toolset_top_jd_input.setAttribute("style", "width: 150px;");
	m_sjz_1.appendChild(m_toolset_top_jd_input);
	m_toolset_top_sjz.appendChild(m_sjz_1);
	var m_sjz_2 = document.createElement("div");
	var m_toolset_top_wd = document.createElement("span");
	m_toolset_top_wd.innerHTML = "纬度：";
	m_sjz_2.appendChild(m_toolset_top_wd);
	var m_toolset_top_wd_input = document.createElement("input");
	m_toolset_top_wd_input.setAttribute("id", "cfglobe_toolset_top_wd_input");
	m_toolset_top_wd_input.setAttribute("value", "42.0037");
	m_toolset_top_wd_input.setAttribute("style", "width: 150px;");
	m_toolset_top_wd_input.onkeydown = function(e){
		 if(!e){
		 	e = window.event;
		 }
		 if((e.keyCode || e.which) == 13){
		 	var m_lon = parseFloat(document.getElementById("cfglobe_toolset_top_jd_input").value);
			var m_lat = parseFloat(document.getElementById("cfglobe_toolset_top_wd_input").value);
			if(self._location_pos){
	        	self._viewer.entities.remove(self._location_pos);
	    	}
			self.location(m_lon, m_lat);
		}
	}
	m_sjz_2.appendChild(m_toolset_top_wd_input);
	var m_toolset_top_location_button = document.createElement("button");
	m_toolset_top_location_button.setAttribute("class", "cesium-button");
	m_toolset_top_location_button.innerHTML = "定位";
	m_toolset_top_location_button.onclick = function(){
		var m_lon = parseFloat(document.getElementById("cfglobe_toolset_top_jd_input").value);
		var m_lat = parseFloat(document.getElementById("cfglobe_toolset_top_wd_input").value);
		if(self._location_pos){
        	self._viewer.entities.remove(self._location_pos);
    	}
		self.location(m_lon, m_lat);
	};
	m_sjz_2.appendChild(m_toolset_top_location_button);
	m_toolset_top_sjz.appendChild(m_sjz_2);
	
	var m_toolset_top_dfm = document.createElement("div");
	m_toolset_top_dfm.setAttribute("id", "cfglobe_toolset_top_dfm_div");
	m_toolset_top_dfm.setAttribute("style", "display: none;");
	m_info.appendChild(m_toolset_top_dfm);
	var m_dfm_1 = document.createElement("div");
	var m_toolset_top_j = document.createElement("span");
	m_toolset_top_j.innerHTML = "经度：";
	m_dfm_1.appendChild(m_toolset_top_j);
	var m_toolset_top_j_d_input = document.createElement("input");
	m_toolset_top_j_d_input.setAttribute("id", "cfglobe_toolset_top_j_d_input");
	m_toolset_top_j_d_input.setAttribute("style", "width: 35px; margin-right: 0;");
	m_toolset_top_j_d_input.setAttribute("value", "128");
	m_dfm_1.appendChild(m_toolset_top_j_d_input);
	var m_toolset_top_j_d = document.createElement("span");
	m_toolset_top_j_d.innerHTML = "°";
	m_toolset_top_j_d.setAttribute("style", "margin-right: 5px;");
	m_dfm_1.appendChild(m_toolset_top_j_d);
	var m_toolset_top_j_f_input = document.createElement("input");
	m_toolset_top_j_f_input.setAttribute("id", "cfglobe_toolset_top_j_f_input");
	m_toolset_top_j_f_input.setAttribute("style", "width: 25px; margin-right: 0;");
	m_toolset_top_j_f_input.setAttribute("value", "3");
	m_dfm_1.appendChild(m_toolset_top_j_f_input);
	var m_toolset_top_j_f = document.createElement("span");
	m_toolset_top_j_f.innerHTML = "'";
	m_toolset_top_j_f.setAttribute("style", "margin-right: 5px;");
	m_dfm_1.appendChild(m_toolset_top_j_f);
	var m_toolset_top_j_m_input = document.createElement("input");
	m_toolset_top_j_m_input.setAttribute("id", "cfglobe_toolset_top_j_m_input");
	m_toolset_top_j_m_input.setAttribute("style", "width: 60px; margin-right: 0;");
	m_toolset_top_j_m_input.setAttribute("value", "40.67");
	m_dfm_1.appendChild(m_toolset_top_j_m_input);
	var m_toolset_top_j_m = document.createElement("span");
	m_toolset_top_j_m.innerHTML = '"';
	m_toolset_top_j_m.setAttribute("style", "margin-right: 5px;");
	m_dfm_1.appendChild(m_toolset_top_j_m);
	m_toolset_top_dfm.appendChild(m_dfm_1);
	var m_dfm_2 = document.createElement("div");
	var m_toolset_top_w = document.createElement("span");
	m_toolset_top_w.innerHTML = "纬度：";
	m_dfm_2.appendChild(m_toolset_top_w);
	var m_toolset_top_w_d_input = document.createElement("input");
	m_toolset_top_w_d_input.setAttribute("id", "cfglobe_toolset_top_w_d_input");
	m_toolset_top_w_d_input.setAttribute("style", "width: 35px; margin-right: 0;");
	m_toolset_top_w_d_input.setAttribute("value", "42");
	m_dfm_2.appendChild(m_toolset_top_w_d_input);
	var m_toolset_top_w_d = document.createElement("span");
	m_toolset_top_w_d.innerHTML = "°";
	m_toolset_top_w_d.setAttribute("style", "margin-right: 5px;");
	m_dfm_2.appendChild(m_toolset_top_w_d);
	var m_toolset_top_w_f_input = document.createElement("input");
	m_toolset_top_w_f_input.setAttribute("id", "cfglobe_toolset_top_w_f_input");
	m_toolset_top_w_f_input.setAttribute("style", "width: 25px; margin-right: 0;");
	m_toolset_top_w_f_input.setAttribute("value", "0");
	m_dfm_2.appendChild(m_toolset_top_w_f_input);
	var m_toolset_top_w_f = document.createElement("span");
	m_toolset_top_w_f.innerHTML = "'";
	m_toolset_top_w_f.setAttribute("style", "margin-right: 5px;");
	m_dfm_2.appendChild(m_toolset_top_w_f);
	var m_toolset_top_w_m_input = document.createElement("input");
	m_toolset_top_w_m_input.setAttribute("id", "cfglobe_toolset_top_w_m_input");
	m_toolset_top_w_m_input.setAttribute("style", "width: 60px; margin-right: 0;");
	m_toolset_top_w_m_input.setAttribute("value", "13.32");
	m_toolset_top_w_m_input.onkeydown = function(e){
		 if(!e){
		 	e = window.event;
		 }
		 if((e.keyCode || e.which) == 13){
		 	var m_j_d = parseFloat(document.getElementById("cfglobe_toolset_top_j_d_input").value);
			var m_j_f = parseFloat(document.getElementById("cfglobe_toolset_top_j_f_input").value);
			var m_j_m = parseFloat(document.getElementById("cfglobe_toolset_top_j_m_input").value);
			var m_j = {d:m_j_d,f:m_j_f,m:m_j_m};
			var m_lon = self._globe.commonFunc.degreeConvertBack(m_j);
			var m_w_d = parseFloat(document.getElementById("cfglobe_toolset_top_w_d_input").value);
			var m_w_f = parseFloat(document.getElementById("cfglobe_toolset_top_w_f_input").value);
			var m_w_m = parseFloat(document.getElementById("cfglobe_toolset_top_w_m_input").value);
			var m_w = {d:m_w_d,f:m_w_f,m:m_w_m};
			var m_lat = self._globe.commonFunc.degreeConvertBack(m_w);
			if(self._location_pos){
	        	self._viewer.entities.remove(self._location_pos);
	    	}
			self.location(m_lon, m_lat);
		}
	}
	m_dfm_2.appendChild(m_toolset_top_w_m_input);
	var m_toolset_top_w_m = document.createElement("span");
	m_toolset_top_w_m.innerHTML = '"';
	m_toolset_top_w_m.setAttribute("style", "margin-right: 5px;");
	m_dfm_2.appendChild(m_toolset_top_w_m);
	var m_toolset_top_location_button1 = document.createElement("button");
	m_toolset_top_location_button1.setAttribute("class", "cesium-button");
	m_toolset_top_location_button1.innerHTML = "定位";
	m_toolset_top_location_button1.onclick = function(){
		var m_j_d = parseFloat(document.getElementById("cfglobe_toolset_top_j_d_input").value);
		var m_j_f = parseFloat(document.getElementById("cfglobe_toolset_top_j_f_input").value);
		var m_j_m = parseFloat(document.getElementById("cfglobe_toolset_top_j_m_input").value);
		var m_j = {d:m_j_d,f:m_j_f,m:m_j_m};
		var m_lon = self._globe.commonFunc.degreeConvertBack(m_j);
		var m_w_d = parseFloat(document.getElementById("cfglobe_toolset_top_w_d_input").value);
		var m_w_f = parseFloat(document.getElementById("cfglobe_toolset_top_w_f_input").value);
		var m_w_m = parseFloat(document.getElementById("cfglobe_toolset_top_w_m_input").value);
		var m_w = {d:m_w_d,f:m_w_f,m:m_w_m};
		var m_lat = self._globe.commonFunc.degreeConvertBack(m_w);
		if(self._location_pos){
        	self._viewer.entities.remove(self._location_pos);
    	}
		self.location(m_lon, m_lat);
	};
	m_dfm_2.appendChild(m_toolset_top_location_button1);
	m_toolset_top_dfm.appendChild(m_dfm_2);
	m_top.appendChild(m_top_sub);
}

Toolset.prototype._loadMeasure = function(){
	var self = this;
	var m_top = document.getElementById("cfglobe_toolset_top");
	var m_top_sub = document.createElement("div");
	m_top_sub.setAttribute("id", "cfglobe_toolset_top_measure");
	m_top_sub.setAttribute("class", "cfglobe-toolset-top-hide");
	var m_title = document.createElement("div");
	m_title.setAttribute("class", "cfglobe-toolset-top-title");
	m_top_sub.appendChild(m_title);
	var m_icon = document.createElement("img");
	m_icon.setAttribute("class", "cfglobe-toolset-top-title-img");
	m_icon.setAttribute("src", self._globe.urlConfig.TOOLSET_MEASURE);
	m_title.appendChild(m_icon);
	var m_title_span = document.createElement("span");
	m_title_span.innerHTML = "基础量算";
	m_title.appendChild(m_title_span);
	var m_title_x = document.createElement("img");
	m_title_x.setAttribute("class", "cfglobe-toolset-top-title-x");
	m_title_x.setAttribute("src", self._globe.urlConfig.TOOLSET_X);
	m_title_x.onclick = function(){
		self._closeAll();
	};
	m_title.appendChild(m_title_x);
	
	var m_info = document.createElement("div");
	m_info.setAttribute("class", "cfglobe-toolset-top-info");
	m_top_sub.appendChild(m_info);
	var m_select = document.createElement("div");
	m_select.setAttribute("class", "cfglobe-toolset-top-info-radio");
	m_info.appendChild(m_select);
	var m_label = document.createElement("label");
	var m_radio = document.createElement("input");
	m_radio.setAttribute("value", "0");
	m_radio.setAttribute("type", "radio");
	m_radio.setAttribute("checked","checked");
	m_radio.setAttribute("name", "cfglobe_toolset_radio_measure");
	m_radio.setAttribute("style", "width: 20px; height: 13px;");
	m_radio.onclick = function(){
		document.getElementById("cfglobe_toolset_top_jdcl_div").style.display="none";
		document.getElementById("cfglobe_toolset_top_jccl_div").style.display="block";
	};
	m_label.appendChild(m_radio);
	var m_span = document.createElement("span");
	m_span.innerHTML = "基础测量";
	m_label.appendChild(m_span);
	m_select.appendChild(m_label);
	var m_label1 = document.createElement("label");
	m_label1.setAttribute("style", "margin-left: 10px;");
	var m_radio1 = document.createElement("input");
	m_radio1.setAttribute("value", "1");
	m_radio1.setAttribute("type", "radio");
	m_radio1.setAttribute("name", "cfglobe_toolset_radio_measure");
	m_radio1.setAttribute("style", "width: 20px; height: 13px;");
	m_radio1.onclick = function(){
		document.getElementById("cfglobe_toolset_top_jccl_div").style.display="none";
		document.getElementById("cfglobe_toolset_top_jdcl_div").style.display="block";
	};
	m_label1.appendChild(m_radio1);
	var m_span1 = document.createElement("span");
	m_span1.innerHTML = "角度测量";
	m_label1.appendChild(m_span1);
	m_select.appendChild(m_label1);
//	var m_toolset_top_button_clear = document.createElement("button");
//	m_toolset_top_button_clear.setAttribute("class", "cesium-button");
//	m_toolset_top_button_clear.setAttribute("style", "margin-left: 30px;");
//	m_toolset_top_button_clear.innerHTML = "清除";
//	m_toolset_top_button_clear.onclick = function(){
//		self._globe.basicMeasure.removeMeasureDis();
//		self._globe.basicMeasure.removeMeasureArea();
//		self._globe.basicMeasure.removeMeasureHeight();
//		self._globe.angleAnalyse.clear();
//	};
//	m_select.appendChild(m_toolset_top_button_clear);
	
	var m_toolset_top_measure_div1 = document.createElement("div");
	m_toolset_top_measure_div1.setAttribute("id", "cfglobe_toolset_top_jccl_div");
	var m_toolset_top_measure_button1 = document.createElement("button");
	m_toolset_top_measure_button1.setAttribute("class", "cesium-button");
	m_toolset_top_measure_button1.innerHTML = "测距";
	m_toolset_top_measure_button1.onclick = function(){
		self._globe.basicMeasure.measureDis();
	};
	m_toolset_top_measure_div1.appendChild(m_toolset_top_measure_button1);
	var m_toolset_top_measure_button2 = document.createElement("button");
	m_toolset_top_measure_button2.setAttribute("class", "cesium-button");
	m_toolset_top_measure_button2.setAttribute("style", "margin-left: 7px; margin-right: 7px;");
	m_toolset_top_measure_button2.innerHTML = "测面";
	m_toolset_top_measure_button2.onclick = function(){
		self._globe.basicMeasure.measureArea();
	};
	m_toolset_top_measure_div1.appendChild(m_toolset_top_measure_button2);
	var m_toolset_top_measure_button3 = document.createElement("button");
	m_toolset_top_measure_button3.setAttribute("class", "cesium-button");
	m_toolset_top_measure_button3.innerHTML = "测高";
	m_toolset_top_measure_button3.onclick = function(){
		self._globe.basicMeasure.measureHeight();
	};
	m_toolset_top_measure_div1.appendChild(m_toolset_top_measure_button3);
	var m_toolset_top_measure_button4 = document.createElement("button");
	m_toolset_top_measure_button4.setAttribute("class", "cesium-button");
	m_toolset_top_measure_button4.innerHTML = "清除";
	m_toolset_top_measure_button4.onclick = function(){
		self._globe.basicMeasure.removeMeasureDis();
		self._globe.basicMeasure.removeMeasureArea();
		self._globe.basicMeasure.removeMeasureHeight();
	};
	m_toolset_top_measure_div1.appendChild(m_toolset_top_measure_button4);
	m_info.appendChild(m_toolset_top_measure_div1);
	var m_toolset_top_measure_div2 = document.createElement("div");
	m_toolset_top_measure_div2.setAttribute("id", "cfglobe_toolset_top_jdcl_div");
	m_toolset_top_measure_div2.setAttribute("style", "display: none;");
	var m_toolset_top_angle_button1 = document.createElement("button"); 
	m_toolset_top_angle_button1.setAttribute("class", "cesium-button");
	m_toolset_top_angle_button1.innerHTML = "选取原点";
	m_toolset_top_angle_button1.onclick = function(){
		self._globe.angleAnalyse.selectSpoint();
	};
	m_toolset_top_measure_div2.appendChild(m_toolset_top_angle_button1);
	var m_toolset_top_angle_button2 = document.createElement("button");
	m_toolset_top_angle_button2.setAttribute("class", "cesium-button");
	m_toolset_top_angle_button2.innerHTML = "选取目标点";
	m_toolset_top_angle_button2.onclick = function(){
		self._globe.angleAnalyse.selectEpoint();
	};
	m_toolset_top_measure_div2.appendChild(m_toolset_top_angle_button2);
	var m_toolset_top_angle_button3 = document.createElement("button");
	m_toolset_top_angle_button3.setAttribute("class", "cesium-button");
	m_toolset_top_angle_button3.innerHTML = "清除";
	m_toolset_top_angle_button3.onclick = function(){
		self._globe.angleAnalyse.clear();
	};
	m_toolset_top_measure_div2.appendChild(m_toolset_top_angle_button3);
	m_info.appendChild(m_toolset_top_measure_div2);
	
	m_top.appendChild(m_top_sub);
}

Toolset.prototype._loadAnalysis = function(){
	var self = this;
	var m_top = document.getElementById("cfglobe_toolset_top");
	var m_top_sub = document.createElement("div");
	m_top_sub.setAttribute("id", "cfglobe_toolset_top_analysis");
	m_top_sub.setAttribute("class", "cfglobe-toolset-top-hide");
	var m_title = document.createElement("div");
	m_title.setAttribute("class", "cfglobe-toolset-top-title");
	m_top_sub.appendChild(m_title);
	var m_icon = document.createElement("img");
	m_icon.setAttribute("class", "cfglobe-toolset-top-title-img");
	m_icon.setAttribute("src", self._globe.urlConfig.TOOLSET_ANALYSIS);
	m_title.appendChild(m_icon);
	var m_title_span = document.createElement("span");
	m_title_span.innerHTML = "空间分析";
	m_title.appendChild(m_title_span);
	var m_title_x = document.createElement("img");
	m_title_x.setAttribute("class", "cfglobe-toolset-top-title-x");
	m_title_x.setAttribute("src", self._globe.urlConfig.TOOLSET_X);
	m_title_x.onclick = function(){
		self._closeAll();
	};
	m_title.appendChild(m_title_x);
	
	var m_info = document.createElement("div");
	m_info.setAttribute("class", "cfglobe-toolset-top-info");
	m_top_sub.appendChild(m_info);
	
	var m_select = document.createElement("div");
	m_select.setAttribute("class", "cfglobe-toolset-top-info-radio");
	m_info.appendChild(m_select);
	var m_label = document.createElement("label");
	var m_radio = document.createElement("input");
	m_radio.setAttribute("value", "0");
	m_radio.setAttribute("type", "radio");
	m_radio.setAttribute("checked","checked");
	m_radio.setAttribute("name", "cfglobe_toolset_radio_analysis");
	m_radio.setAttribute("style", "width: 20px; height: 13px;");
	m_radio.onclick = function(){
		document.getElementById("cfglobe_toolset_top_tsfx_div").style.display="block";
		document.getElementById("cfglobe_toolset_top_ksyfx_div").style.display="none";
		document.getElementById("cfglobe_toolset_top_sxfx_div").style.display="none";
	};
	m_label.appendChild(m_radio);
	var m_span = document.createElement("span");
	m_span.innerHTML = "通视分析";
	m_label.appendChild(m_span);
	m_select.appendChild(m_label);
	var m_label1 = document.createElement("label");
	m_label1.setAttribute("style", "margin-left: 10px;");
	var m_radio1 = document.createElement("input");
	m_radio1.setAttribute("value", "1");
	m_radio1.setAttribute("type", "radio");
	m_radio1.setAttribute("name", "cfglobe_toolset_radio_analysis");
	m_radio1.setAttribute("style", "width: 20px; height: 13px;");
	m_radio1.onclick = function(){
		document.getElementById("cfglobe_toolset_top_tsfx_div").style.display="none";
		document.getElementById("cfglobe_toolset_top_ksyfx_div").style.display="block";
		document.getElementById("cfglobe_toolset_top_sxfx_div").style.display="none";
	};
	m_label1.appendChild(m_radio1);
	var m_span1 = document.createElement("span");
	m_span1.innerHTML = "可视域分析";
	m_label1.appendChild(m_span1);
	m_select.appendChild(m_label1);
	var m_label2 = document.createElement("label");
	m_label2.setAttribute("style", "margin-left: 10px;");
	var m_radio2 = document.createElement("input");
	m_radio2.setAttribute("value", "2");
	m_radio2.setAttribute("type", "radio");
	m_radio2.setAttribute("name", "cfglobe_toolset_radio_analysis");
	m_radio2.setAttribute("style", "width: 20px; height: 13px;");
	m_radio2.onclick = function(){
		document.getElementById("cfglobe_toolset_top_tsfx_div").style.display="none";
		document.getElementById("cfglobe_toolset_top_ksyfx_div").style.display="none";
		document.getElementById("cfglobe_toolset_top_sxfx_div").style.display="block";
	};
	m_label2.appendChild(m_radio2);
	var m_span2 = document.createElement("span");
	m_span2.innerHTML = "射线分析";
	m_label2.appendChild(m_span2);
	m_select.appendChild(m_label2);
	var m_toolset_top_button_clear = document.createElement("button");
	m_toolset_top_button_clear.setAttribute("class", "cesium-button");
	m_toolset_top_button_clear.setAttribute("style", "margin-left: 30px;");
	m_toolset_top_button_clear.innerHTML = "清除";
	m_toolset_top_button_clear.onclick = function(){
		//通视分析
		self._globe.sightAnalyse.clear();
		//可视域分析清除
		self._globe.viewshed.clear();
		//射线分析
		self._clearIntersectionByRay();
	};
	m_select.appendChild(m_toolset_top_button_clear);
	
	var m_toolset_top_radio_div1 = document.createElement("div");
	m_toolset_top_radio_div1.setAttribute("id", "cfglobe_toolset_top_tsfx_div");
	m_info.appendChild(m_toolset_top_radio_div1);
	
	var m_toolset_top_tt = document.createElement("span");
	m_toolset_top_tt.innerHTML = "塔高：";
	m_toolset_top_radio_div1.appendChild(m_toolset_top_tt);
	var m_toolset_top_tt_input = document.createElement("input");
	m_toolset_top_tt_input.setAttribute("id", "cfglobe_toolset_top_tt_input");
	m_toolset_top_tt_input.setAttribute("value", "0");
	m_toolset_top_tt_input.setAttribute("style", "width: 30px;");
	m_toolset_top_radio_div1.appendChild(m_toolset_top_tt_input);
	var m_toolset_top_sm = document.createElement("span");
	m_toolset_top_sm.innerHTML = "树高：";
	m_toolset_top_radio_div1.appendChild(m_toolset_top_sm);
	var m_toolset_top_sm_input = document.createElement("input");
	m_toolset_top_sm_input.setAttribute("id", "cfglobe_toolset_top_sm_input");
	m_toolset_top_sm_input.setAttribute("value", "0");
	m_toolset_top_sm_input.setAttribute("style", "width: 30px;");
	m_toolset_top_radio_div1.appendChild(m_toolset_top_sm_input);
	var m_toolset_top_mb = document.createElement("span");
	m_toolset_top_mb.innerHTML = "标高：";
	m_toolset_top_radio_div1.appendChild(m_toolset_top_mb);
	var m_toolset_top_mb_input = document.createElement("input");
	m_toolset_top_mb_input.setAttribute("id", "cfglobe_toolset_top_mb_input");
	m_toolset_top_mb_input.setAttribute("value", "0");
	m_toolset_top_mb_input.setAttribute("style", "width: 30px;");
	m_toolset_top_radio_div1.appendChild(m_toolset_top_mb_input);
	var m_toolset_top_analysis_button1 = document.createElement("button");
	m_toolset_top_analysis_button1.setAttribute("class", "cesium-button");
	m_toolset_top_analysis_button1.innerHTML = "开始分析";
	m_toolset_top_analysis_button1.onclick = function(){
		self._globe.deactivateAllState();
		var m_tt = parseFloat(document.getElementById("cfglobe_toolset_top_tt_input").value);
		var m_sm = parseFloat(document.getElementById("cfglobe_toolset_top_sm_input").value);
		var m_mb = parseFloat(document.getElementById("cfglobe_toolset_top_mb_input").value);
		var options = {towerHeight:m_tt,treeHeight:m_sm,targetHeight:m_mb};
		self._globe.sightAnalyse.actionIntervisibility(options);
	};
	m_toolset_top_radio_div1.appendChild(m_toolset_top_analysis_button1);
	
	var m_toolset_top_radio_div2 = document.createElement("div");
	m_toolset_top_radio_div2.setAttribute("id", "cfglobe_toolset_top_ksyfx_div");
	m_toolset_top_radio_div2.setAttribute("style", "display: none;");
	m_info.appendChild(m_toolset_top_radio_div2);
	var m_toolset_top_ttt = document.createElement("span");
	m_toolset_top_ttt.innerHTML = "塔高：";
	m_toolset_top_radio_div2.appendChild(m_toolset_top_ttt);
	var m_toolset_top_ttt_input = document.createElement("input");
	m_toolset_top_ttt_input.setAttribute("id", "cfglobe_toolset_top_ttt_input");
	m_toolset_top_ttt_input.setAttribute("value", "0");
	m_toolset_top_ttt_input.setAttribute("style", "width: 30px;");
	m_toolset_top_radio_div2.appendChild(m_toolset_top_ttt_input);
	var m_toolset_top_analysis_button2 = document.createElement("button");
	m_toolset_top_analysis_button2.setAttribute("class", "cesium-button");
	m_toolset_top_analysis_button2.innerHTML = "开始分析";
	m_toolset_top_analysis_button2.onclick = function(){
		self._globe.deactivateAllState();
		//可视域分析
		var height = parseFloat(document.getElementById("cfglobe_toolset_top_ttt_input").value);
		self._globe.viewshed.drawHandler(height);
	};
	m_toolset_top_radio_div2.appendChild(m_toolset_top_analysis_button2);
	
	var m_toolset_top_radio_div3 = document.createElement("div");
	m_toolset_top_radio_div3.setAttribute("id", "cfglobe_toolset_top_sxfx_div");
	m_toolset_top_radio_div3.setAttribute("style", "display: none;");
	m_info.appendChild(m_toolset_top_radio_div3);
	var m_toolset_top_tt_lon = document.createElement("span");
	m_toolset_top_tt_lon.innerHTML = "经度：";
	m_toolset_top_radio_div3.appendChild(m_toolset_top_tt_lon);
	var m_toolset_top_tt_lon_input = document.createElement("input");
	m_toolset_top_tt_lon_input.setAttribute("id", "cfglobe_toolset_top_tt_lon_input");
	m_toolset_top_tt_lon_input.setAttribute("value", "0");
	m_toolset_top_tt_lon_input.setAttribute("style", "width: 70px; margin-bottom: 5px;");
	m_toolset_top_radio_div3.appendChild(m_toolset_top_tt_lon_input);
	
	var m_toolset_top_tt_horizontal = document.createElement("span");
	m_toolset_top_tt_horizontal.innerHTML = "水平角：";
	m_toolset_top_radio_div3.appendChild(m_toolset_top_tt_horizontal);
	var m_toolset_top_tt_horizontal_input = document.createElement("input");
	m_toolset_top_tt_horizontal_input.setAttribute("id", "cfglobe_toolset_top_tt_horizontal_input");
	m_toolset_top_tt_horizontal_input.setAttribute("value", "0");
	m_toolset_top_tt_horizontal_input.setAttribute("style", "width: 50px;");
	m_toolset_top_radio_div3.appendChild(m_toolset_top_tt_horizontal_input);
	
	var m_toolset_top_tt_alt = document.createElement("span");
	m_toolset_top_tt_alt.innerHTML = "高程：";
	m_toolset_top_radio_div3.appendChild(m_toolset_top_tt_alt);
	var m_toolset_top_tt_alt_input = document.createElement("input");
	m_toolset_top_tt_alt_input.setAttribute("id", "cfglobe_toolset_top_tt_alt_input");
	m_toolset_top_tt_alt_input.setAttribute("value", "0");
	m_toolset_top_tt_alt_input.setAttribute("style", "width: 50px;");
	m_toolset_top_radio_div3.appendChild(m_toolset_top_tt_alt_input);
	
	var m_toolset_top_tt_br = document.createElement("br");
	m_toolset_top_radio_div3.appendChild(m_toolset_top_tt_br);
	
	var m_toolset_top_tt_lat = document.createElement("span");
	m_toolset_top_tt_lat.innerHTML = "纬度：";
	m_toolset_top_radio_div3.appendChild(m_toolset_top_tt_lat);
	var m_toolset_top_tt_lat_input = document.createElement("input");
	m_toolset_top_tt_lat_input.setAttribute("id", "cfglobe_toolset_top_tt_lat_input");
	m_toolset_top_tt_lat_input.setAttribute("value", "0");
	m_toolset_top_tt_lat_input.setAttribute("style", "width: 70px;");
	m_toolset_top_radio_div3.appendChild(m_toolset_top_tt_lat_input);
	
	var m_toolset_top_tt_pitch = document.createElement("span");
	m_toolset_top_tt_pitch.innerHTML = "俯仰角：";
	m_toolset_top_radio_div3.appendChild(m_toolset_top_tt_pitch);
	var m_toolset_top_tt_pitch_input = document.createElement("input");
	m_toolset_top_tt_pitch_input.setAttribute("id", "cfglobe_toolset_top_tt_pitch_input");
	m_toolset_top_tt_pitch_input.setAttribute("value", "0");
	m_toolset_top_tt_pitch_input.setAttribute("style", "width: 50px;");
	m_toolset_top_radio_div3.appendChild(m_toolset_top_tt_pitch_input);
	
	var m_toolset_top_analysis_button2 = document.createElement("button");
	m_toolset_top_analysis_button2.setAttribute("class", "cesium-button");
	m_toolset_top_analysis_button2.setAttribute("style", "margin-left: 23px;");
	m_toolset_top_analysis_button2.innerHTML = "开始分析";
	m_toolset_top_analysis_button2.onclick = function(){
		self._globe.deactivateAllState();
		//射线分析
		var m_lon = parseFloat(document.getElementById("cfglobe_toolset_top_tt_lon_input").value);
		var m_lat = parseFloat(document.getElementById("cfglobe_toolset_top_tt_lat_input").value);
		var m_alt = parseFloat(document.getElementById("cfglobe_toolset_top_tt_alt_input").value);
		var m_horizontal = parseFloat(document.getElementById("cfglobe_toolset_top_tt_horizontal_input").value);
		var m_pitch = parseFloat(document.getElementById("cfglobe_toolset_top_tt_pitch_input").value);
		var m_dist = parseFloat(100000);
		var options = {lon:m_lon, lat:m_lat, alt:m_alt, horizontal:m_horizontal, pitch:m_pitch, dist:m_dist, 
			callback:function(point){
				if(point){
					var dist = myglobe.commonFunc.getDistance(point.lon,point.lat,m_lon,m_lat);
					self._addIntersectionMark(m_lon,m_lat,m_alt,Cesium.Color.RED);
					self._addIntersectionMark(point.lon,point.lat,point.alt,Cesium.Color.YELLOW,dist);
					var pointList = [];
					pointList.push({lon:m_lon,lat:m_lat,alt:m_alt});
					pointList.push(point);
					var line = self._globe.polyline.add({pointList:pointList});
					self._intersectionByRay_list.push(line);
					self._globe.flyTo({lon:point.lon,lat:point.lat,alt:point.alt+500});
				}else{
					alert("未计算出交点！");
				}
			}
		};
		self._globe.sightAnalyse.getIntersectionByAngle(options);
		
		//self._intersectionByRay_list.push(addressMark);
	};
	m_toolset_top_radio_div3.appendChild(m_toolset_top_analysis_button2);
	
	m_top.appendChild(m_top_sub);
}

Toolset.prototype._loadViewing = function(){
	var self = this;
	var m_top = document.getElementById("cfglobe_toolset_top");
	var m_top_sub = document.createElement("div");
	m_top_sub.setAttribute("id", "cfglobe_toolset_top_viewing");
	m_top_sub.setAttribute("class", "cfglobe-toolset-top-hide");
	var m_title = document.createElement("div");
	m_title.setAttribute("class", "cfglobe-toolset-top-title");
	m_top_sub.appendChild(m_title);
	var m_icon = document.createElement("img");
	m_icon.setAttribute("class", "cfglobe-toolset-top-title-img");
	m_icon.setAttribute("src", self._globe.urlConfig.TOOLSET_VIEWING);
	m_title.appendChild(m_icon);
	var m_title_span = document.createElement("span");
	m_title_span.innerHTML = "目标观测";
	m_title.appendChild(m_title_span);
	var m_title_x = document.createElement("img");
	m_title_x.setAttribute("class", "cfglobe-toolset-top-title-x");
	m_title_x.setAttribute("src", self._globe.urlConfig.TOOLSET_X);
	m_title_x.onclick = function(){
		self._closeAll();
	};
	m_title.appendChild(m_title_x);
	
	var m_info = document.createElement("div");
	m_info.setAttribute("class", "cfglobe-toolset-top-info");
	m_top_sub.appendChild(m_info);
	var m_toolset_top_path_button1 = document.createElement("button");
	m_toolset_top_path_button1.setAttribute("class", "cesium-button");
	m_toolset_top_path_button1.innerHTML = "环绕观测";
	m_toolset_top_path_button1.setAttribute("style", "margin: 0 25px;");
	m_toolset_top_path_button1.onclick = function(){
		var cameraObj = self._viewer.scene.globe.ellipsoid.cartesianToCartographic(self._viewer.scene.camera.position);
		var lon = CommonFunc.deg(cameraObj.longitude);
		var lat = CommonFunc.deg(cameraObj.latitude);
		var alt = cameraObj.height;
		var heading = CommonFunc.deg(self._viewer.scene.camera.heading);
		var pitch = CommonFunc.deg(self._viewer.scene.camera.pitch);
		var roll = CommonFunc.deg(self._viewer.scene.camera.roll);
		var options = {lon:lon, lat:lat, alt:alt, horizontal:heading, pitch:pitch, dist:1000000, callback:function(point){
			if(point){
				var dist = CommonFunc.getDistance(point.lon,point.lat,lon,lat);
				var pointList = [];
				for(var i = 0; i <= 720; i++){
					var endpoint = CommonFunc.destinationVincenty(point.lon, point.lat, point.alt, heading+i*0.5+180, 0, dist);
					pointList[pointList.length] = {lon:endpoint.lon,lat:endpoint.lat,alt:alt,heading:heading+i*0.5, pitch:pitch};
				}
				self._rotatePoint = true;
				self._rotateByPointList(pointList,0);
			}else{
				alert("未计算出观测点，或观测点距离超过1000公里。请调整位置再试一次！");
			}
		}};
		self._globe.sightAnalyse.getIntersectionByAngle(options);
	};
	m_info.appendChild(m_toolset_top_path_button1);
	var m_toolset_top_path_button2 = document.createElement("button");
	m_toolset_top_path_button2.setAttribute("class", "cesium-button");
	m_toolset_top_path_button2.innerHTML = "椭圆观测";
	m_toolset_top_path_button2.setAttribute("style", "margin: 0 25px;");
	m_toolset_top_path_button2.onclick = function(){
		var cameraObj = self._viewer.scene.globe.ellipsoid.cartesianToCartographic(self._viewer.scene.camera.position);
		var lon = CommonFunc.deg(cameraObj.longitude);
		var lat = CommonFunc.deg(cameraObj.latitude);
		var alt = cameraObj.height;
		var heading = CommonFunc.deg(self._viewer.scene.camera.heading);
		var pitch = CommonFunc.deg(self._viewer.scene.camera.pitch);
		var roll = CommonFunc.deg(self._viewer.scene.camera.roll);
		var options = {lon:lon, lat:lat, alt:alt, horizontal:heading, pitch:pitch, dist:1000000, callback:function(point){
			if(point){
				var dist = CommonFunc.getDistance(point.lon,point.lat,lon,lat);
				var pointList = [];
				var a=dist,b=dist*0.5;
		        for (var i = 0; i <= 720; i++) {
		        	var hudu=(Math.PI/180)*i*0.5;
		        	var rr = (a*a*b*b)/(a*a*Math.sin(hudu)*Math.sin(hudu) + b*b*Math.cos(hudu)*Math.cos(hudu));
		        	var r = Math.sqrt(rr);
		        	var endpoint = CommonFunc.destinationVincenty(point.lon, point.lat, point.alt, heading+i*0.5+180, 0, r);
		        	pointList[pointList.length] = {lon:endpoint.lon,lat:endpoint.lat,alt:alt,heading:heading+i*0.5, pitch:pitch};
		        };
		        self._rotatePoint = true;
				self._rotateByPointList(pointList,0);
			}else{
				alert("未计算出观测点，或观测点距离超过1000公里。请调整位置再试一次！");
			}
		}};
		self._globe.sightAnalyse.getIntersectionByAngle(options);
	};
	m_info.appendChild(m_toolset_top_path_button2);
	
	m_top.appendChild(m_top_sub);
}

Toolset.prototype._loadPath = function(){
	var self = this;
	var m_top = document.getElementById("cfglobe_toolset_top");
	var m_top_sub = document.createElement("div");
	m_top_sub.setAttribute("id", "cfglobe_toolset_top_path");
	m_top_sub.setAttribute("class", "cfglobe-toolset-top-hide");
	var m_title = document.createElement("div");
	m_title.setAttribute("class", "cfglobe-toolset-top-title");
	m_top_sub.appendChild(m_title);
	var m_icon = document.createElement("img");
	m_icon.setAttribute("class", "cfglobe-toolset-top-title-img");
	m_icon.setAttribute("src", self._globe.urlConfig.TOOLSET_PATH);
	m_title.appendChild(m_icon);
	var m_title_span = document.createElement("span");
	m_title_span.innerHTML = "路径分析";
	m_title.appendChild(m_title_span);
	var m_title_x = document.createElement("img");
	m_title_x.setAttribute("class", "cfglobe-toolset-top-title-x");
	m_title_x.setAttribute("src", self._globe.urlConfig.TOOLSET_X);
	m_title_x.onclick = function(){
		self._closeAll();
	};
	m_title.appendChild(m_title_x);
	
	var m_info = document.createElement("div");
	m_info.setAttribute("class", "cfglobe-toolset-top-info");
	m_top_sub.appendChild(m_info);
	
	var m_div1 = document.createElement("div");
	m_info.appendChild(m_div1);
	var m_toolset_top_path_button1 = document.createElement("button");
	m_toolset_top_path_button1.setAttribute("class", "cesium-button");
	m_toolset_top_path_button1.innerHTML = "选取起始点";
	m_toolset_top_path_button1.onclick = function(){
		self._pathManager.draw = true;
		self._pathManager.selectSpoint = true;
		self._pathManager.selectTpoint = false;
		self._pathManager.selectEpoint = false;
//		self._globe.pathAnalyse.selectSpoint();    
	};
	m_div1.appendChild(m_toolset_top_path_button1);
	var m_toolset_top_path_s_lon = document.createElement("input");
	m_toolset_top_path_s_lon.setAttribute("id", "cfglobe_toolset_top_path_s_lon");
	m_toolset_top_path_s_lon.setAttribute("style", "width: 80px; margin-right: 10px;");
	m_toolset_top_path_s_lon.setAttribute("disabled", "disabled");
	m_toolset_top_path_s_lon.setAttribute("value", "");
	m_div1.appendChild(m_toolset_top_path_s_lon);
	var m_toolset_top_path_s_lat = document.createElement("input");
	m_toolset_top_path_s_lat.setAttribute("id", "cfglobe_toolset_top_path_s_lat");
	m_toolset_top_path_s_lat.setAttribute("style", "width: 70px; margin-right: 0;");
	m_toolset_top_path_s_lat.setAttribute("disabled", "disabled");
	m_toolset_top_path_s_lat.setAttribute("value", "");
	m_div1.appendChild(m_toolset_top_path_s_lat);
	
	var m_div2 = document.createElement("div");
	m_div2.setAttribute("id", "cfglobe_toolset_top_path_t_pint");
	m_info.appendChild(m_div2);
//	var m_toolset_top_path_button3 = document.createElement("button");
//	m_toolset_top_path_button3.setAttribute("class", "cesium-button");
//	m_toolset_top_path_button3.innerHTML = "删除经过点";
//	m_toolset_top_path_button3.onclick = function(){
////		self._globe.pathAnalyse.selectEpoint();
//	};
//	m_div2.appendChild(m_toolset_top_path_button3);
//	var m_toolset_top_path_j_lon = document.createElement("input");
//	m_toolset_top_path_j_lon.setAttribute("id", "cfglobe_toolset_top_path_j_lon");
//	m_toolset_top_path_j_lon.setAttribute("style", "width: 80px; margin-right: 10px;");
//	m_toolset_top_path_j_lon.setAttribute("disabled", "disabled");
//	m_toolset_top_path_j_lon.setAttribute("value", "");
//	m_div2.appendChild(m_toolset_top_path_j_lon);
//	var m_toolset_top_path_j_lat = document.createElement("input");
//	m_toolset_top_path_j_lat.setAttribute("id", "cfglobe_toolset_top_path_j_lat");
//	m_toolset_top_path_j_lat.setAttribute("style", "width: 70px; margin-right: 0;");
//	m_toolset_top_path_j_lat.setAttribute("disabled", "disabled");
//	m_toolset_top_path_j_lat.setAttribute("value", "");
//	m_div2.appendChild(m_toolset_top_path_j_lat);
	
	var m_div3 = document.createElement("div");
	m_info.appendChild(m_div3);
	var m_toolset_top_path_button3 = document.createElement("button");
	m_toolset_top_path_button3.setAttribute("class", "cesium-button");
	m_toolset_top_path_button3.innerHTML = "选取目标点";
	m_toolset_top_path_button3.onclick = function(){
		self._pathManager.selectSpoint = false;
		self._pathManager.selectTpoint = false;
		self._pathManager.selectEpoint = true;
//		self._globe.pathAnalyse.selectEpoint();
	};
	m_div3.appendChild(m_toolset_top_path_button3);
	var m_toolset_top_path_e_lon = document.createElement("input");
	m_toolset_top_path_e_lon.setAttribute("id", "cfglobe_toolset_top_path_e_lon");
	m_toolset_top_path_e_lon.setAttribute("style", "width: 80px; margin-right: 10px;");
	m_toolset_top_path_e_lon.setAttribute("disabled", "disabled");
	m_toolset_top_path_e_lon.setAttribute("value", "");
	m_div3.appendChild(m_toolset_top_path_e_lon);
	var m_toolset_top_path_e_lat = document.createElement("input");
	m_toolset_top_path_e_lat.setAttribute("id", "cfglobe_toolset_top_path_e_lat");
	m_toolset_top_path_e_lat.setAttribute("style", "width: 70px; margin-right: 0;");
	m_toolset_top_path_e_lat.setAttribute("disabled", "disabled");
	m_toolset_top_path_e_lat.setAttribute("value", "");
	m_div3.appendChild(m_toolset_top_path_e_lat);
	
	var m_div4 = document.createElement("div");
	m_info.appendChild(m_div4);
	var m_toolset_top_path_button2 = document.createElement("button");
	m_toolset_top_path_button2.setAttribute("class", "cesium-button");
	m_toolset_top_path_button2.innerHTML = "增加经过点";
	m_toolset_top_path_button2.onclick = function(){
		self._pathManager.selectSpoint = false;
		self._pathManager.selectTpoint = true;
		self._pathManager.selectEpoint = false;
//		self._globe.pathAnalyse.selectTpoint();
	};
	m_div4.appendChild(m_toolset_top_path_button2);
	var m_toolset_top_path_button5 = document.createElement("button");
	m_toolset_top_path_button5.setAttribute("class", "cesium-button");
	m_toolset_top_path_button5.innerHTML = "开始分析";
	m_toolset_top_path_button5.setAttribute("style", "margin-left: 17px; margin-right: 17px;");
	m_toolset_top_path_button5.onclick = function(){
		var points = [];
		if(self._pathManager.spoint){
			points.push(self._pathManager.spoint.lonlat);
		}else{
			alert("起始点不能为空！");
			return;
		}
		for(var i = 0; i < self._pathManager.tpoints.length; i++){
			points.push(self._pathManager.tpoints[i].lonlat);
		}
		if(self._pathManager.epoint){
			points.push(self._pathManager.epoint.lonlat);
		}else{
			alert("目标点不能为空！");
			return;
		}
		self._pathManager.draw = false;
		self._pathManager.selectSpoint = false;
		self._pathManager.selectTpoint = false;
		self._pathManager.selectEpoint = false;
		self._globe.pathAnalyse.analyseByPoints(points);
	};
	m_div4.appendChild(m_toolset_top_path_button5);
	var m_toolset_top_path_button4 = document.createElement("button");
	m_toolset_top_path_button4.setAttribute("class", "cesium-button");
	m_toolset_top_path_button4.innerHTML = "清除";
	m_toolset_top_path_button4.onclick = function(){
		if(self._pathManager.spoint){
			self._viewer.entities.remove(self._pathManager.spoint);
			self._pathManager.spoint = null;
		}
//		for(var i = 0; i < self._pathManager.tpoints.length; i++){
		for(var i = self._pathManager.tpoints.length - 1; i >= 0; i--){
			self._viewer.entities.remove(self._pathManager.tpoints[i]);
			self._pathManager.tpoints.pop();
		}
		self._pathManager.tpoints = [];
		if(self._pathManager.epoint){
			self._viewer.entities.remove(self._pathManager.epoint);
			self._pathManager.epoint = null;
		}
		self._globe.pathAnalyse.clear();
		self._pathManager.draw = false;
		self._pathManager.selectSpoint = false;
		self._pathManager.selectTpoint = false;
		self._pathManager.selectEpoint = false;
		document.getElementById("cfglobe_toolset_top_path_t_pint").innerHTML = "";
		document.getElementById("cfglobe_toolset_top_path_s_lon").setAttribute("value", "");
		document.getElementById("cfglobe_toolset_top_path_s_lat").setAttribute("value", "");
		document.getElementById("cfglobe_toolset_top_path_e_lon").setAttribute("value", "");
		document.getElementById("cfglobe_toolset_top_path_e_lat").setAttribute("value", "");
	};
	m_div4.appendChild(m_toolset_top_path_button4);
	
//	var m_toolset_top_path_button1 = document.createElement("button");
//	m_toolset_top_path_button1.setAttribute("class", "cesium-button");
//	m_toolset_top_path_button1.innerHTML = "选取起始点";
//	m_toolset_top_path_button1.onclick = function(){
//		self._globe.pathAnalyse.selectSpoint();
//	};
//	m_info.appendChild(m_toolset_top_path_button1);
//	var m_toolset_top_path_button2 = document.createElement("button");
//	m_toolset_top_path_button2.setAttribute("class", "cesium-button");
//	m_toolset_top_path_button2.innerHTML = "选取经过点";
//	m_toolset_top_path_button2.onclick = function(){
//		self._globe.pathAnalyse.selectTpoint();
//	};
//	m_info.appendChild(m_toolset_top_path_button2);
//	var m_toolset_top_path_button3 = document.createElement("button");
//	m_toolset_top_path_button3.setAttribute("class", "cesium-button");
//	m_toolset_top_path_button3.innerHTML = "选取目标点";
//	m_toolset_top_path_button3.onclick = function(){
//		self._globe.pathAnalyse.selectEpoint();
//	};
//	m_info.appendChild(m_toolset_top_path_button3);
//	var m_toolset_top_path_button4 = document.createElement("button");
//	m_toolset_top_path_button4.setAttribute("class", "cesium-button");
//	m_toolset_top_path_button4.innerHTML = "清除";
//	m_toolset_top_path_button4.onclick = function(){
//		self._globe.pathAnalyse.clear();
//	};
//	m_info.appendChild(m_toolset_top_path_button4);
	
	m_top.appendChild(m_top_sub);
}

Toolset.prototype._loadShp = function(){
	var self = this;
	var m_top = document.getElementById("cfglobe_toolset_top");
	var m_top_sub = document.createElement("div");
	m_top_sub.setAttribute("id", "cfglobe_toolset_top_shp");
	m_top_sub.setAttribute("class", "cfglobe-toolset-top-hide");
	var m_title = document.createElement("div");
	m_title.setAttribute("class", "cfglobe-toolset-top-title");
	m_top_sub.appendChild(m_title);
	var m_icon = document.createElement("img");
	m_icon.setAttribute("class", "cfglobe-toolset-top-title-img");
	m_icon.setAttribute("src", self._globe.urlConfig.TOOLSET_SHP);
	m_title.appendChild(m_icon);
	var m_title_span = document.createElement("span");
	m_title_span.innerHTML = "导入SHP";
	m_title.appendChild(m_title_span);
	var m_title_x = document.createElement("img");
	m_title_x.setAttribute("class", "cfglobe-toolset-top-title-x");
	m_title_x.setAttribute("src", self._globe.urlConfig.TOOLSET_X);
	m_title_x.onclick = function(){
		self._closeAll();
	};
	m_title.appendChild(m_title_x);
	
	var m_info = document.createElement("div");
	m_info.setAttribute("class", "cfglobe-toolset-top-info");
	m_top_sub.appendChild(m_info);
	var m_div1 = document.createElement("div");
	m_info.appendChild(m_div1);
	var m_toolset_top_ys = document.createElement("span");
	m_toolset_top_ys.innerHTML = "颜色：";
	m_div1.appendChild(m_toolset_top_ys);
	var m_toolset_top_ys_select = document.createElement("select");
	m_toolset_top_ys_select.setAttribute("id", "cfglobe_toolset_top_ys_select");
	var m_toolset_top_ys_option1 = document.createElement("option");
	m_toolset_top_ys_option1.setAttribute("value", "RED");
	m_toolset_top_ys_option1.innerHTML = "RED";
	m_toolset_top_ys_select.appendChild(m_toolset_top_ys_option1);
	var m_toolset_top_ys_option2 = document.createElement("option");
	m_toolset_top_ys_option2.setAttribute("value", "YELLOW");
	m_toolset_top_ys_option2.innerHTML = "YELLOW";
	m_toolset_top_ys_select.appendChild(m_toolset_top_ys_option2);
	var m_toolset_top_ys_option3 = document.createElement("option");
	m_toolset_top_ys_option3.setAttribute("value", "GREEN");
	m_toolset_top_ys_option3.innerHTML = "GREEN";
	m_toolset_top_ys_select.appendChild(m_toolset_top_ys_option3);
	m_div1.appendChild(m_toolset_top_ys_select);
	var m_toolset_top_xk = document.createElement("span");
	m_toolset_top_xk.innerHTML = "线宽：";
	m_div1.appendChild(m_toolset_top_xk);
	var m_toolset_top_xk_select = document.createElement("select");
	m_toolset_top_xk_select.setAttribute("id", "cfglobe_toolset_top_xk_select");
	var m_toolset_top_xk_option1 = document.createElement("option");
	m_toolset_top_xk_option1.setAttribute("value", "50");
	m_toolset_top_xk_option1.innerHTML = "50";
	m_toolset_top_xk_select.appendChild(m_toolset_top_xk_option1);
	var m_toolset_top_xk_option2 = document.createElement("option");
	m_toolset_top_xk_option2.setAttribute("value", "100");
	m_toolset_top_xk_option2.innerHTML = "100";
	m_toolset_top_xk_select.appendChild(m_toolset_top_xk_option2);
	var m_toolset_top_xk_option3 = document.createElement("option");
	m_toolset_top_xk_option3.setAttribute("value", "200");
	m_toolset_top_xk_option3.innerHTML = "200";
	m_toolset_top_xk_select.appendChild(m_toolset_top_xk_option3);
	var m_toolset_top_xk_option4 = document.createElement("option");
	m_toolset_top_xk_option4.setAttribute("value", "500");
	m_toolset_top_xk_option4.innerHTML = "500";
	m_toolset_top_xk_select.appendChild(m_toolset_top_xk_option4);
	m_div1.appendChild(m_toolset_top_xk_select);
	var m_toolset_top_xs = document.createElement("span");
	m_toolset_top_xs.innerHTML = "线色：";
	m_div1.appendChild(m_toolset_top_xs);
	var m_toolset_top_xs_select = document.createElement("select");
	m_toolset_top_xs_select.setAttribute("id", "cfglobe_toolset_top_xs_select");
	var m_toolset_top_xs_option1 = document.createElement("option");
	m_toolset_top_xs_option1.setAttribute("value", "RED");
	m_toolset_top_xs_option1.innerHTML = "RED";
	m_toolset_top_xs_select.appendChild(m_toolset_top_xs_option1);
	var m_toolset_top_xs_option2 = document.createElement("option");
	m_toolset_top_xs_option2.setAttribute("value", "YELLOW");
	m_toolset_top_xs_option2.innerHTML = "YELLOW";
	m_toolset_top_xs_select.appendChild(m_toolset_top_xs_option2);
	var m_toolset_top_xs_option3 = document.createElement("option");
	m_toolset_top_xs_option3.setAttribute("value", "GREEN");
	m_toolset_top_xs_option3.innerHTML = "GREEN";
	m_toolset_top_xs_select.appendChild(m_toolset_top_xs_option3);
	m_div1.appendChild(m_toolset_top_xs_select);
	
	var m_div2 = document.createElement("div");
	m_div2.setAttribute("style", "margin-top: 10px;");
	m_info.appendChild(m_div2);
	var m_toolset_top_file = document.createElement("input");
	m_toolset_top_file.setAttribute("id", "cfglobe_toolset_top_shp_file");
	m_toolset_top_file.setAttribute("type", "file");
	m_toolset_top_file.setAttribute("style", "display: inline; width: 305px; height: 25px; background-color: white;");
	m_div2.appendChild(m_toolset_top_file);
	var m_toolset_top_shp_button1 = document.createElement("button");
	m_toolset_top_shp_button1.setAttribute("class", "cesium-button");
	m_toolset_top_shp_button1.innerHTML = "加载";
	m_toolset_top_shp_button1.onclick = function(){
		var m_color = Cesium.Color.RED;
		var m_lineColor = Cesium.Color.RED;
		var color = $("#cfglobe_toolset_top_ys_select").val();
		var lineWidth = $("#cfglobe_toolset_top_xk_select").val();
		var lineColor = $("#cfglobe_toolset_top_xs_select").val();
		if(color == "RED"){
			m_color = Cesium.Color.RED;
		}else if(color == "YELLOW"){
			m_color = Cesium.Color.YELLOW;
		}else if(color == "GREEN"){
			m_color = Cesium.Color.GREEN;
		}
		if(m_lineColor == "RED"){
			m_lineColor = Cesium.Color.RED;
		}else if(m_lineColor == "YELLOW"){
			m_lineColor = Cesium.Color.YELLOW;
		}else if(m_lineColor == "GREEN"){
			m_lineColor = Cesium.Color.GREEN;
		}
		self._globe.shpParser.add("cfglobe_toolset_top_shp_file",{callback:self._shpCallback,lineWidth:lineWidth,color:m_color,lineColor:m_lineColor});
	};
	m_div2.appendChild(m_toolset_top_shp_button1);
	var m_toolset_top_shp_list = document.createElement("div");
	m_toolset_top_shp_list.setAttribute("id", "cfglobe_toolset_top_shp_list");
	m_info.appendChild(m_toolset_top_shp_list);
	
	m_top.appendChild(m_top_sub);
}

Toolset.prototype._loadCsv = function(){
	var self = this;
	var m_top = document.getElementById("cfglobe_toolset_top");
	var m_top_sub = document.createElement("div");
	m_top_sub.setAttribute("id", "cfglobe_toolset_top_csv");
	m_top_sub.setAttribute("class", "cfglobe-toolset-top-hide");
	var m_title = document.createElement("div");
	m_title.setAttribute("class", "cfglobe-toolset-top-title");
	m_top_sub.appendChild(m_title);
	var m_icon = document.createElement("img");
	m_icon.setAttribute("class", "cfglobe-toolset-top-title-img");
	m_icon.setAttribute("src", self._globe.urlConfig.TOOLSET_CSV);
	m_title.appendChild(m_icon);
	var m_title_span = document.createElement("span");
	m_title_span.innerHTML = "地图标注";
	m_title.appendChild(m_title_span);
	var m_title_x = document.createElement("img");
	m_title_x.setAttribute("class", "cfglobe-toolset-top-title-x");
	m_title_x.setAttribute("src", self._globe.urlConfig.TOOLSET_X);
	m_title_x.onclick = function(){
		self._csvLabel = "";
		self._csvDraw = false;
		self._closeAll();
	};
	m_title.appendChild(m_title_x);
	
	var m_info = document.createElement("div");
	m_info.setAttribute("class", "cfglobe-toolset-top-info");
	m_top_sub.appendChild(m_info);
	
	var m_select = document.createElement("div");
	m_select.setAttribute("class", "cfglobe-toolset-top-info-radio");
	m_info.appendChild(m_select);
	var m_label = document.createElement("label");
	var m_radio = document.createElement("input");
	m_radio.setAttribute("value", "0");
	m_radio.setAttribute("type", "radio");
	m_radio.setAttribute("checked","checked");
	m_radio.setAttribute("name", "cfglobe_toolset_radio_csv");
	m_radio.setAttribute("style", "width: 20px; height: 13px;");
	m_radio.onclick = function(){
		document.getElementById("cfglobe_toolset_top_dj_div").style.display="none";
		document.getElementById("cfglobe_toolset_top_csv_div").style.display="none";
		document.getElementById("cfglobe_toolset_top_jwd_div").style.display="block";
	};
	m_label.appendChild(m_radio);
	var m_span = document.createElement("span");
	m_span.innerHTML = "经纬度添加";
	m_label.appendChild(m_span);
	m_select.appendChild(m_label);
	var m_label1 = document.createElement("label");
	m_label1.setAttribute("style", "margin-left: 10px;");
	var m_radio1 = document.createElement("input");
	m_radio1.setAttribute("value", "1");
	m_radio1.setAttribute("type", "radio");
	m_radio1.setAttribute("name", "cfglobe_toolset_radio_csv");
	m_radio1.setAttribute("style", "width: 20px; height: 13px;");
	m_radio1.onclick = function(){
		document.getElementById("cfglobe_toolset_top_jwd_div").style.display="none";
		document.getElementById("cfglobe_toolset_top_csv_div").style.display="none";
		document.getElementById("cfglobe_toolset_top_dj_div").style.display="block";
	};
	m_label1.appendChild(m_radio1);
	var m_span1 = document.createElement("span");
	m_span1.innerHTML = "点击添加";
	m_label1.appendChild(m_span1);
	m_select.appendChild(m_label1);
	var m_label2 = document.createElement("label");
	m_label2.setAttribute("style", "margin-left: 10px;");
	var m_radio2 = document.createElement("input");
	m_radio2.setAttribute("value", "1");
	m_radio2.setAttribute("type", "radio");
	m_radio2.setAttribute("name", "cfglobe_toolset_radio_csv");
	m_radio2.setAttribute("style", "width: 20px; height: 13px;");
	m_radio2.onclick = function(){
		document.getElementById("cfglobe_toolset_top_jwd_div").style.display="none";
		document.getElementById("cfglobe_toolset_top_dj_div").style.display="none";
		document.getElementById("cfglobe_toolset_top_csv_div").style.display="block";
	};
	m_label2.appendChild(m_radio2);
	var m_span2 = document.createElement("span");
	m_span2.innerHTML = "csv导入";
	m_label2.appendChild(m_span2);
	m_select.appendChild(m_label2);
	var m_toolset_top_button_clear = document.createElement("button");
	m_toolset_top_button_clear.setAttribute("class", "cesium-button");
	m_toolset_top_button_clear.setAttribute("style", "margin-left: 43px;");
	m_toolset_top_button_clear.innerHTML = "清除";
	m_toolset_top_button_clear.onclick = function(){
		self._globe.globeMenu.setType(self._showMenu);
		self._clearCsv();
	};
	m_select.appendChild(m_toolset_top_button_clear);
	
	var m_toolset_top_radio_div1 = document.createElement("div");
	m_toolset_top_radio_div1.setAttribute("id", "cfglobe_toolset_top_jwd_div");
	m_info.appendChild(m_toolset_top_radio_div1);
	var m_toolset_top_jd = document.createElement("span");
	m_toolset_top_jd.innerHTML = "经度：";
	m_toolset_top_radio_div1.appendChild(m_toolset_top_jd);
	var m_toolset_top_jd_input = document.createElement("input");
	m_toolset_top_jd_input.setAttribute("id", "cfglobe_toolset_top_csv_jd_input");
	m_toolset_top_jd_input.setAttribute("style", "width: 70px;");
	m_toolset_top_jd_input.setAttribute("value", "128.0613");
	m_toolset_top_radio_div1.appendChild(m_toolset_top_jd_input);
	var m_toolset_top_wd = document.createElement("span");
	m_toolset_top_wd.innerHTML = "纬度：";
	m_toolset_top_radio_div1.appendChild(m_toolset_top_wd);
	var m_toolset_top_wd_input = document.createElement("input");
	m_toolset_top_wd_input.setAttribute("id", "cfglobe_toolset_top_csv_wd_input");
	m_toolset_top_wd_input.setAttribute("style", "width: 60px;");
	m_toolset_top_wd_input.setAttribute("value", "42.0037");
	m_toolset_top_radio_div1.appendChild(m_toolset_top_wd_input);
	var m_toolset_top_label = document.createElement("span");
	m_toolset_top_label.innerHTML = "标注：";
	m_toolset_top_radio_div1.appendChild(m_toolset_top_label);
	var m_toolset_top_label_input = document.createElement("input");
	m_toolset_top_label_input.setAttribute("id", "cfglobe_toolset_top_csv_label_input");
	m_toolset_top_label_input.setAttribute("style", "width: 61px;");
	m_toolset_top_label_input.setAttribute("value", "");
	m_toolset_top_label_input.onkeydown = function(e){
		 if(!e){
		 	e = window.event;
		 }
		 if((e.keyCode || e.which) == 13){
		 	var m_lon = parseFloat(document.getElementById("cfglobe_toolset_top_csv_jd_input").value);
			var m_lat = parseFloat(document.getElementById("cfglobe_toolset_top_csv_wd_input").value);
			var m_label = document.getElementById("cfglobe_toolset_top_csv_label_input").value;
			self._addCsv(m_lon,m_lat,m_label);
			var options = {lon:m_lon, lat:m_lat, alt:10000, horizontal:0, pitch:-90, dist:0, callback:null};
			self._globe.flyTo(options);
		}
	}
	m_toolset_top_radio_div1.appendChild(m_toolset_top_label_input);
	var m_toolset_top_csv_button2 = document.createElement("button");
	m_toolset_top_csv_button2.setAttribute("class", "cesium-button");
	m_toolset_top_csv_button2.innerHTML = "添加";
	m_toolset_top_csv_button2.onclick = function(){
		var m_lon = parseFloat(document.getElementById("cfglobe_toolset_top_csv_jd_input").value);
		var m_lat = parseFloat(document.getElementById("cfglobe_toolset_top_csv_wd_input").value);
		var m_label = document.getElementById("cfglobe_toolset_top_csv_label_input").value;
		self._addCsv(m_lon,m_lat,m_label);
		var options = {lon:m_lon, lat:m_lat, alt:10000, horizontal:0, pitch:-90, dist:0, callback:null};
		self._globe.flyTo(options);
	};
	m_toolset_top_radio_div1.appendChild(m_toolset_top_csv_button2);

	var m_toolset_top_radio_div2 = document.createElement("div");
	m_toolset_top_radio_div2.setAttribute("id", "cfglobe_toolset_top_dj_div");
	m_toolset_top_radio_div2.setAttribute("style", "display: none;");
	m_info.appendChild(m_toolset_top_radio_div2);
	var m_toolset_top_label1 = document.createElement("span");
	m_toolset_top_label1.innerHTML = "标注：";
	m_toolset_top_radio_div2.appendChild(m_toolset_top_label1);
	var m_toolset_top_label1_input = document.createElement("input");
	m_toolset_top_label1_input.setAttribute("id", "cfglobe_toolset_top_csv_dj_label_input");
	m_toolset_top_label1_input.setAttribute("style", "width: 305px;");
	m_toolset_top_label1_input.setAttribute("value", "");
	m_toolset_top_radio_div2.appendChild(m_toolset_top_label1_input);
	var m_toolset_top_csv_button3 = document.createElement("button");
	m_toolset_top_csv_button3.setAttribute("class", "cesium-button");
	m_toolset_top_csv_button3.innerHTML = "添加";
	m_toolset_top_csv_button3.onclick = function(){
		var m_label = document.getElementById("cfglobe_toolset_top_csv_dj_label_input").value;
		self._csvLabel = m_label;
		self._csvDraw = true;
		self._showMenu = self._globe.globeMenu._showMenu;
		self._globe.globeMenu.setType(false);
	};
	m_toolset_top_radio_div2.appendChild(m_toolset_top_csv_button3);

	var m_toolset_top_radio_div3 = document.createElement("div");
	m_toolset_top_radio_div3.setAttribute("id", "cfglobe_toolset_top_csv_div");
	m_toolset_top_radio_div3.setAttribute("style", "display: none;");
	m_info.appendChild(m_toolset_top_radio_div3);
	var m_toolset_top_file = document.createElement("input");
	m_toolset_top_file.setAttribute("id", "cfglobe_toolset_top_csv_file");
	m_toolset_top_file.setAttribute("type", "file");
	m_toolset_top_file.setAttribute("style", "display: inline; width: 357px; height: 25px; background-color: white;");
	m_toolset_top_radio_div3.appendChild(m_toolset_top_file);
	var m_toolset_top_csv_button1 = document.createElement("button");
	m_toolset_top_csv_button1.setAttribute("class", "cesium-button");
	m_toolset_top_csv_button1.innerHTML = "导入";
	m_toolset_top_csv_button1.onclick = function(){
		var name,url;
		var files=document.getElementById("cfglobe_toolset_top_csv_file");
		var file=files.files;//每一个file对象对应一个文件。
		if(file && file.length>0){
			name = file[0].name;//获取本地文件系统的文件名。
			var fileType = name.split(".")[1];
			if(fileType != "csv"){
				alert("文件格式错误");
				return;
			}
			url = window.URL.createObjectURL(file[0]);
			$.ajax({
				url: url,
				dataType: 'text',
			}).done(function(data){
				var allRows = data.split(/\r?\n|\r/);
				for(var i = 0; i < allRows.length; i++){
					if(allRows[i] && allRows[i].split(",").length == 3){
						var m_infoList = allRows[i].split(",");
						var m_lon = m_infoList[0];
						var m_lat = m_infoList[1];
						var m_label = m_infoList[2];
						self._addCsv(m_lon,m_lat,m_label);
					}
				}
			});
		}else{
			alert("文件选择错误");
			return;
		}
	};
	m_toolset_top_radio_div3.appendChild(m_toolset_top_csv_button1);
	var m_desdiv = document.createElement("div");
	m_desdiv.setAttribute("style", "font-size: 12px;");
	m_desdiv.innerHTML = "*格式要求：第一列经度，第二列纬度，第三列标注名";
	m_toolset_top_radio_div3.appendChild(m_desdiv);
	
	
	
	


	
//	var m_toolset_top_csv_button4 = document.createElement("button");
//	m_toolset_top_csv_button4.setAttribute("class", "cesium-button");
//	m_toolset_top_csv_button4.innerHTML = "清除";
//	m_toolset_top_csv_button4.onclick = function(){
//		self._globe.globeMenu.setType(self._showMenu);
//		self._clearCsv();
//	};
//	m_info.appendChild(m_toolset_top_csv_button4);
	
	m_top.appendChild(m_top_sub);
}

Toolset.prototype._loadTransforming = function(){
	var self = this;
	var m_top = document.getElementById("cfglobe_toolset_top");
	var m_top_sub = document.createElement("div");
	m_top_sub.setAttribute("id", "cfglobe_toolset_top_transforming");
	m_top_sub.setAttribute("class", "cfglobe-toolset-top-hide");
	m_top.appendChild(m_top_sub);
	var m_title = document.createElement("div");
	m_title.setAttribute("class", "cfglobe-toolset-top-title");
	m_top_sub.appendChild(m_title);
	var m_icon = document.createElement("img");
	m_icon.setAttribute("class", "cfglobe-toolset-top-title-img");
	m_icon.setAttribute("src", self._globe.urlConfig.TOOLSET_TRANSFORMING);
	m_title.appendChild(m_icon);
	var m_title_span = document.createElement("span");
	m_title_span.innerHTML = "坐标转换";
	m_title.appendChild(m_title_span);
	var m_title_x = document.createElement("img");
	m_title_x.setAttribute("class", "cfglobe-toolset-top-title-x");
	m_title_x.setAttribute("src", self._globe.urlConfig.TOOLSET_X);
	m_title_x.onclick = function(){
		self._closeAll();
	};
	m_title.appendChild(m_title_x);
	
	var m_info = document.createElement("div");
	m_info.setAttribute("class", "cfglobe-toolset-top-info");
	m_top_sub.appendChild(m_info);
	var m_div_left = document.createElement("div");
	m_div_left.setAttribute("class", "cfglobe-toolset-top-transforming-left");
	m_info.appendChild(m_div_left);
	var m_select = document.createElement("div");
	m_select.setAttribute("class", "cfglobe-toolset-top-info-radio");
	m_div_left.appendChild(m_select);
	var m_label = document.createElement("label");
	var m_radio = document.createElement("input");
	m_radio.setAttribute("value", "0");
	m_radio.setAttribute("type", "radio");
	m_radio.setAttribute("checked","checked");
	m_radio.setAttribute("name", "cfglobe_toolset_radio_transforming");
	m_radio.setAttribute("style", "width: 20px; height: 13px;");
	m_radio.onclick = function(){
		document.getElementById("cfglobe_toolset_top_transforming_dfm_div").style.display="none";
		document.getElementById("cfglobe_toolset_top_transforming_sjz_div").style.display="block";
	};
	m_label.appendChild(m_radio);
	var m_span = document.createElement("span");
	m_span.innerHTML = "十进制度";
	m_label.appendChild(m_span);
	m_select.appendChild(m_label);
	var m_label1 = document.createElement("label");
	m_label1.setAttribute("style", "margin-left: 10px;");
	var m_radio1 = document.createElement("input");
	m_radio1.setAttribute("value", "1");
	m_radio1.setAttribute("type", "radio");
	m_radio1.setAttribute("name", "cfglobe_toolset_radio_transforming");
	m_radio1.setAttribute("style", "width: 20px; height: 13px;");
	m_radio1.onclick = function(){
		document.getElementById("cfglobe_toolset_top_transforming_sjz_div").style.display="none";
		document.getElementById("cfglobe_toolset_top_transforming_dfm_div").style.display="block";
	};
	m_label1.appendChild(m_radio1);
	var m_span1 = document.createElement("span");
	m_span1.innerHTML = "度分秒";
	m_label1.appendChild(m_span1);
	
	m_select.appendChild(m_label1);
	var m_toolset_top_sjz = document.createElement("div");
	m_toolset_top_sjz.setAttribute("id", "cfglobe_toolset_top_transforming_sjz_div");
	m_div_left.appendChild(m_toolset_top_sjz);
	var m_sjz_1 = document.createElement("div");
	var m_toolset_top_jd = document.createElement("span");
	m_toolset_top_jd.innerHTML = "经度：";
	m_sjz_1.appendChild(m_toolset_top_jd);
	var m_toolset_top_jd_input = document.createElement("input");
	m_toolset_top_jd_input.setAttribute("id", "cfglobe_toolset_top_transforming_jd_input");
	m_toolset_top_jd_input.setAttribute("style", "width: 143px;");
	m_sjz_1.appendChild(m_toolset_top_jd_input);
	m_toolset_top_sjz.appendChild(m_sjz_1);
	var m_sjz_2 = document.createElement("div");
	var m_toolset_top_wd = document.createElement("span");
	m_toolset_top_wd.innerHTML = "纬度：";
	m_sjz_2.appendChild(m_toolset_top_wd);
	var m_toolset_top_wd_input = document.createElement("input");
	m_toolset_top_wd_input.setAttribute("id", "cfglobe_toolset_top_transforming_wd_input");
	m_toolset_top_wd_input.setAttribute("style", "width: 143px;");
	m_sjz_2.appendChild(m_toolset_top_wd_input);
	m_toolset_top_sjz.appendChild(m_sjz_2);
	
	var m_toolset_top_dfm = document.createElement("div");
	m_toolset_top_dfm.setAttribute("id", "cfglobe_toolset_top_transforming_dfm_div");
	m_toolset_top_dfm.setAttribute("style", "display: none;");
	m_div_left.appendChild(m_toolset_top_dfm);
	var m_dfm_1 = document.createElement("div");
	var m_toolset_top_j = document.createElement("span");
	m_toolset_top_j.innerHTML = "经度：";
	m_dfm_1.appendChild(m_toolset_top_j);
	var m_toolset_top_j_d_input = document.createElement("input");
	m_toolset_top_j_d_input.setAttribute("id", "cfglobe_toolset_top_transforming_j_d_input");
	m_toolset_top_j_d_input.setAttribute("style", "width: 35px; margin-right: 0;");
	m_dfm_1.appendChild(m_toolset_top_j_d_input);
	var m_toolset_top_j_d = document.createElement("span");
	m_toolset_top_j_d.innerHTML = "°";
	m_toolset_top_j_d.setAttribute("style", "margin-right: 5px;");
	m_dfm_1.appendChild(m_toolset_top_j_d);
	var m_toolset_top_j_f_input = document.createElement("input");
	m_toolset_top_j_f_input.setAttribute("id", "cfglobe_toolset_top_transforming_j_f_input");
	m_toolset_top_j_f_input.setAttribute("style", "width: 25px; margin-right: 0;");
	m_dfm_1.appendChild(m_toolset_top_j_f_input);
	var m_toolset_top_j_f = document.createElement("span");
	m_toolset_top_j_f.innerHTML = "'";
	m_toolset_top_j_f.setAttribute("style", "margin-right: 5px;");
	m_dfm_1.appendChild(m_toolset_top_j_f);
	var m_toolset_top_j_m_input = document.createElement("input");
	m_toolset_top_j_m_input.setAttribute("id", "cfglobe_toolset_top_transforming_j_m_input");
	m_toolset_top_j_m_input.setAttribute("style", "width: 60px; margin-right: 0;");
	m_dfm_1.appendChild(m_toolset_top_j_m_input);
	var m_toolset_top_j_m = document.createElement("span");
	m_toolset_top_j_m.innerHTML = '"';
	m_toolset_top_j_m.setAttribute("style", "margin-right: 5px;");
	m_dfm_1.appendChild(m_toolset_top_j_m);
	m_toolset_top_dfm.appendChild(m_dfm_1);
	var m_dfm_2 = document.createElement("div");
	var m_toolset_top_w = document.createElement("span");
	m_toolset_top_w.innerHTML = "纬度：";
	m_dfm_2.appendChild(m_toolset_top_w);
	var m_toolset_top_w_d_input = document.createElement("input");
	m_toolset_top_w_d_input.setAttribute("id", "cfglobe_toolset_top_transforming_w_d_input");
	m_toolset_top_w_d_input.setAttribute("style", "width: 35px; margin-right: 0;");
	m_dfm_2.appendChild(m_toolset_top_w_d_input);
	var m_toolset_top_w_d = document.createElement("span");
	m_toolset_top_w_d.innerHTML = "°";
	m_toolset_top_w_d.setAttribute("style", "margin-right: 5px;");
	m_dfm_2.appendChild(m_toolset_top_w_d);
	var m_toolset_top_w_f_input = document.createElement("input");
	m_toolset_top_w_f_input.setAttribute("id", "cfglobe_toolset_top_transforming_w_f_input");
	m_toolset_top_w_f_input.setAttribute("style", "width: 25px; margin-right: 0;");
	m_dfm_2.appendChild(m_toolset_top_w_f_input);
	var m_toolset_top_w_f = document.createElement("span");
	m_toolset_top_w_f.innerHTML = "'";
	m_toolset_top_w_f.setAttribute("style", "margin-right: 5px;");
	m_dfm_2.appendChild(m_toolset_top_w_f);
	var m_toolset_top_w_m_input = document.createElement("input");
	m_toolset_top_w_m_input.setAttribute("id", "cfglobe_toolset_top_transforming_w_m_input");
	m_toolset_top_w_m_input.setAttribute("style", "width: 60px; margin-right: 0;");
	m_dfm_2.appendChild(m_toolset_top_w_m_input);
	var m_toolset_top_w_m = document.createElement("span");
	m_toolset_top_w_m.innerHTML = '"';
	m_toolset_top_w_m.setAttribute("style", "margin-right: 5px;");
	m_dfm_2.appendChild(m_toolset_top_w_m);
	m_toolset_top_dfm.appendChild(m_dfm_2);
	
	var m_div_bottom_button = document.createElement("button");
	m_div_bottom_button.setAttribute("class", "cesium-button");
	m_div_bottom_button.setAttribute("style", "margin-top: 10px; margin-left: 29px;");
	m_div_bottom_button.innerHTML = "点击获取";
	m_div_bottom_button.onclick = function(){
		self._transformingDraw = true;
	};
	m_div_left.appendChild(m_div_bottom_button);
	var m_div_bottom_button11 = document.createElement("button");
	m_div_bottom_button11.setAttribute("class", "cesium-button");
	m_div_bottom_button11.setAttribute("style", "margin-top: 10px; margin-left: 5px;");
	m_div_bottom_button11.innerHTML = "取消获取";
	m_div_bottom_button11.onclick = function(){
		self._transformingDraw = false;
	};
	m_div_left.appendChild(m_div_bottom_button11);
	
	var m_div_right = document.createElement("div");
	m_div_right.setAttribute("class", "cfglobe-toolset-top-transforming-right");
	m_info.appendChild(m_div_right);
	var m_div_top = document.createElement("div");
	m_div_top.setAttribute("class", "top");
	m_div_right.appendChild(m_div_top);
	var m_toolset_top_zhlx = document.createElement("span");
	m_toolset_top_zhlx.innerHTML = "转换类型：";
	m_div_top.appendChild(m_toolset_top_zhlx);
	var m_toolset_top_select = document.createElement("select");
	m_toolset_top_select.setAttribute("id", "cfglobe_toolset_top_transforming_select");
	m_div_top.appendChild(m_toolset_top_select);
	var m_toolset_top_option1 = document.createElement("option");
	m_toolset_top_option1.setAttribute("value", "Mercator");
	m_toolset_top_option1.innerHTML = "Web Mercator";
	m_toolset_top_select.appendChild(m_toolset_top_option1);
	var m_toolset_top_option2 = document.createElement("option");
	m_toolset_top_option2.setAttribute("value", "GCJ-02");
	m_toolset_top_option2.innerHTML = "GCJ-02";
	m_toolset_top_select.appendChild(m_toolset_top_option2);
	var m_toolset_top_option3 = document.createElement("option");
	m_toolset_top_option3.setAttribute("value", "BD-09");
	m_toolset_top_option3.innerHTML = "BD-09";
	m_toolset_top_select.appendChild(m_toolset_top_option3);
	var m_div_bottom = document.createElement("div");
	m_div_bottom.setAttribute("class", "bottom");
	m_div_right.appendChild(m_div_bottom);
	var m_div_bottom_left = document.createElement("div");
	m_div_bottom_left.setAttribute("class", "left");
	m_div_bottom.appendChild(m_div_bottom_left);
	var m_div_bottom_button1 = document.createElement("button");
	m_div_bottom_button1.setAttribute("class", "cesium-button");
	m_div_bottom_button1.innerHTML = "==>>";
	m_div_bottom_button1.onclick = function(){
		var m_lon;
		var m_lat;
		
		var m_radio = document.getElementsByName("cfglobe_toolset_radio_transforming");  
		var m_radio_value;
	    for (i=0; i<m_radio.length; i++) {  
	        if (m_radio[i].checked) {
	            m_radio_value = m_radio[i].value;
	            break;
	        }  
	    }
	    if(m_radio_value == 0){
	    	m_lon = parseFloat(document.getElementById("cfglobe_toolset_top_transforming_jd_input").value);
			m_lat = parseFloat(document.getElementById("cfglobe_toolset_top_transforming_wd_input").value);
	    }else if(m_radio_value == 1){
	    	var m_j_d = parseFloat(document.getElementById("cfglobe_toolset_top_transforming_j_d_input").value);
			var m_j_f = parseFloat(document.getElementById("cfglobe_toolset_top_transforming_j_f_input").value);
			var m_j_m = parseFloat(document.getElementById("cfglobe_toolset_top_transforming_j_m_input").value);
			var m_j = {d:m_j_d,f:m_j_f,m:m_j_m};
			m_lon = self._globe.commonFunc.degreeConvertBack(m_j);
			var m_w_d = parseFloat(document.getElementById("cfglobe_toolset_top_transforming_w_d_input").value);
			var m_w_f = parseFloat(document.getElementById("cfglobe_toolset_top_transforming_w_f_input").value);
			var m_w_m = parseFloat(document.getElementById("cfglobe_toolset_top_transforming_w_m_input").value);
			var m_w = {d:m_w_d,f:m_w_f,m:m_w_m};
			m_lat = self._globe.commonFunc.degreeConvertBack(m_w);
	    }
		var m_tp = document.getElementById("cfglobe_toolset_top_transforming_select").value;
		if(m_tp == "Mercator"){
			var m_mkt = self._globe.commonFunc.lonLat2Mercator(m_lon,m_lat);
			document.getElementById("cfglobe_toolset_top_transforming_x_input").value = m_mkt.X.toFixed(4);
			document.getElementById("cfglobe_toolset_top_transforming_y_input").value = m_mkt.Y.toFixed(4);
		}else if(m_tp == "GCJ-02"){
			var m_hx = self._globe.commonFunc.gps84_To_Gcj02(m_lon,m_lat);
			document.getElementById("cfglobe_toolset_top_transforming_x_input").value = m_hx.lon.toFixed(4);
			document.getElementById("cfglobe_toolset_top_transforming_y_input").value = m_hx.lat.toFixed(4);
		}else if(m_tp == "BD-09"){
			var m_bd = self._globe.commonFunc.gps84_To_Bd09(m_lon,m_lat);
			document.getElementById("cfglobe_toolset_top_transforming_x_input").value = m_bd.lon.toFixed(4);
			document.getElementById("cfglobe_toolset_top_transforming_y_input").value = m_bd.lat.toFixed(4);
		}
	};
	m_div_bottom_left.appendChild(m_div_bottom_button1);
	var m_div_bottom_button2 = document.createElement("button");
	m_div_bottom_button2.setAttribute("class", "cesium-button");
	m_div_bottom_button2.innerHTML = "<<==";
	m_div_bottom_button2.onclick = function(){
		var m_x = parseFloat(document.getElementById("cfglobe_toolset_top_transforming_x_input").value);
		var m_y = parseFloat(document.getElementById("cfglobe_toolset_top_transforming_y_input").value);
		var m_tp = document.getElementById("cfglobe_toolset_top_transforming_select").value;
		var m_lonlat;
		if(m_tp == "Mercator"){
			m_lonlat = self._globe.commonFunc.Mercator2lonLat({x:m_x,y:m_y});
		}else if(m_tp == "GCJ-02"){
			m_lonlat = self._globe.commonFunc.gcj02_To_Gps84(m_x,m_y);
		}else if(m_tp == "BD-09"){
			m_lonlat = self._globe.commonFunc.bd09_To_Gps84(m_x,m_y);
		}
		
	    document.getElementById("cfglobe_toolset_top_transforming_jd_input").value = m_lonlat.lon.toFixed(4);
		document.getElementById("cfglobe_toolset_top_transforming_wd_input").value = m_lonlat.lat.toFixed(4);
		var dfm_j = self._globe.commonFunc.formatDegree(m_lonlat.lon);
		var dfm_w = self._globe.commonFunc.formatDegree(m_lonlat.lat);
		document.getElementById("cfglobe_toolset_top_transforming_j_d_input").value = dfm_j.d;
		document.getElementById("cfglobe_toolset_top_transforming_j_f_input").value = dfm_j.f;
		document.getElementById("cfglobe_toolset_top_transforming_j_m_input").value = dfm_j.m.toFixed(4);
		document.getElementById("cfglobe_toolset_top_transforming_w_d_input").value = dfm_w.d;
		document.getElementById("cfglobe_toolset_top_transforming_w_f_input").value = dfm_w.f;
		document.getElementById("cfglobe_toolset_top_transforming_w_m_input").value = dfm_w.m.toFixed(4);
	};
	m_div_bottom_left.appendChild(m_div_bottom_button2);
	var m_div_bottom_right = document.createElement("div");
	m_div_bottom_right.setAttribute("class", "right");
	m_div_bottom.appendChild(m_div_bottom_right);
	var m_div_bottom_right_w = document.createElement("div");
	m_div_bottom_right_w.setAttribute("style", "padding: 26px 10px;");
	m_div_bottom_right.appendChild(m_div_bottom_right_w);
	var m_div_bottom_right_n1 = document.createElement("div");
	m_div_bottom_right_n1.setAttribute("style", "margin-bottom: 5px;");
	m_div_bottom_right_w.appendChild(m_div_bottom_right_n1);
	var m_div_bottom_right_n1_span = document.createElement("span");
	m_div_bottom_right_n1_span.innerHTML = "x：";
	m_div_bottom_right_n1.appendChild(m_div_bottom_right_n1_span);
	var m_div_bottom_right_n1_input = document.createElement("input");
	m_div_bottom_right_n1_input.setAttribute("id", "cfglobe_toolset_top_transforming_x_input");
	m_div_bottom_right_n1_input.setAttribute("style", "width: 150px;");
	m_div_bottom_right_n1.appendChild(m_div_bottom_right_n1_input);
	var m_div_bottom_right_n2 = document.createElement("div");
	m_div_bottom_right_w.appendChild(m_div_bottom_right_n2);
	var m_div_bottom_right_n2_span = document.createElement("span");
	m_div_bottom_right_n2_span.innerHTML = "y：";
	m_div_bottom_right_n2.appendChild(m_div_bottom_right_n2_span);
	var m_div_bottom_right_n2_input = document.createElement("input");
	m_div_bottom_right_n2_input.setAttribute("id", "cfglobe_toolset_top_transforming_y_input");
	m_div_bottom_right_n2_input.setAttribute("style", "width: 150px;");
	m_div_bottom_right_n2.appendChild(m_div_bottom_right_n2_input);
}


Toolset.prototype._closeAll = function(){
	var self = this;
	var m_toolset_top_address = document.getElementById("cfglobe_toolset_top_address");
	m_toolset_top_address.setAttribute("class", "cfglobe-toolset-top-hide");
	var m_toolset_top_location = document.getElementById("cfglobe_toolset_top_location");
	m_toolset_top_location.setAttribute("class", "cfglobe-toolset-top-hide");
	var m_toolset_top_measure = document.getElementById("cfglobe_toolset_top_measure");
	m_toolset_top_measure.setAttribute("class", "cfglobe-toolset-top-hide");
	var m_toolset_top_analysis = document.getElementById("cfglobe_toolset_top_analysis");
	m_toolset_top_analysis.setAttribute("class", "cfglobe-toolset-top-hide");
	var m_toolset_top_viewing = document.getElementById("cfglobe_toolset_top_viewing");
	m_toolset_top_viewing.setAttribute("class", "cfglobe-toolset-top-hide");
	var m_toolset_top_path = document.getElementById("cfglobe_toolset_top_path");
	m_toolset_top_path.setAttribute("class", "cfglobe-toolset-top-hide");
	var m_toolset_top_shp = document.getElementById("cfglobe_toolset_top_shp");
	m_toolset_top_shp.setAttribute("class", "cfglobe-toolset-top-hide");
	var m_toolset_top_csv = document.getElementById("cfglobe_toolset_top_csv");
	m_toolset_top_csv.setAttribute("class", "cfglobe-toolset-top-hide");
	var m_toolset_top_transforming = document.getElementById("cfglobe_toolset_top_transforming");
	m_toolset_top_transforming.setAttribute("class", "cfglobe-toolset-top-hide");
	self._toolsetSelect = "";
}

/*
 * 工具条点击事件
 * @author zhaoxd
 * @method _toolsetClick
 * @for Toolset
 * @param {Object} obj点击元素
 * @return {null} null
 */
Toolset.prototype._toolsetClick = function(obj){
	var self = this;
	var m_toolset_top = document.getElementById("cfglobe_toolset_top");
	var m_id = obj.getAttribute("data-tag");
	if(m_id == "open"){
		//详细信息
		var className = document.getElementById("cfglobe_toolset").className;
		if(className == "cfglobe-toolset"){
			document.getElementById("cfglobe_toolset").setAttribute("class", "cfglobe-toolset-open");
//			obj.setAttribute("class", "cfglobe-toolset-btn-close");
			obj.setAttribute("src", self._globe.urlConfig.TOOLSET_CLOSE);
		}else{
			document.getElementById("cfglobe_toolset").setAttribute("class", "cfglobe-toolset");
//			obj.setAttribute("class", "cfglobe-toolset-btn-open");
			obj.setAttribute("src", self._globe.urlConfig.TOOLSET_OPEN);
		}
		return;
	}else if(m_id == "print"){
		//高清出图
		var m_heading = CommonFunc.deg(self._viewer.scene.camera.heading);
		var m_pitch = CommonFunc.deg(self._viewer.scene.camera.pitch);
		var m_roll = CommonFunc.deg(self._viewer.scene.camera.roll);
		var m_cartographic = Cesium.Cartographic.fromCartesian(self._viewer.scene.camera.position);
		var m_lon = Cesium.Math.toDegrees(m_cartographic.longitude);
		var m_lat = Cesium.Math.toDegrees(m_cartographic.latitude);
		var m_alt = m_cartographic.height;
		var m_cameraPosition = {lon:m_lon,lat:m_lat,alt:m_alt,heading:m_heading,pitch:m_pitch,roll:m_roll};
		window.open("/static/js/globe/examples/html/print.html?lon=" + m_lon + "&lat=" + m_lat + "&alt=" + m_alt + "&heading=" + m_heading + "&pitch=" + m_pitch + "&roll=" + m_roll);
//		window.open("print.html?lon=" + m_lon + "&lat=" + m_lat + "&alt=" + m_alt + "&heading=" + m_heading + "&pitch=" + m_pitch + "&roll=" + m_roll);
	}else if(m_id == "clear"){
		//清除
		self.clearToolsetSubset();
//		//可视域分析清除
//		self._globe.viewshed.clear();
	}else if(m_id == "2d"){
		//二三维切换
		var sceneMode = self._viewer.scene.mode;
		var m_modePicker = new Cesium.SceneModePickerViewModel(self._viewer.scene, 2);
		var cameraPosition = {};
		if(sessionStorage[self._globe._sessionName]){
			cameraPosition = eval("(" + sessionStorage[self._globe._sessionName] +")");
		}
		if(sceneMode == Cesium.SceneMode.SCENE3D){
		    m_modePicker.morphTo2D();
//		    obj.parentNode.firstChild.setAttribute("class", "cfglobe-toolset-btn-3d");
		    obj.setAttribute("src", self._globe.urlConfig.TOOLSET_3D);
		}else{
		    m_modePicker.morphTo3D();
//		    obj.parentNode.firstChild.setAttribute("class", "cfglobe-toolset-btn-2d");
		    obj.setAttribute("src", self._globe.urlConfig.TOOLSET_2D);
		}
		self._viewer.scene.morphComplete.addEventListener(function(scene,time){
			var options = {lon:cameraPosition.lon, lat:cameraPosition.lat, alt:30000, heading:0, pitch:-90, roll:0};
   			self._globe.setView(options);
	    }); 
	}else if(m_id == "sunshine"){
		//光照效果
		self._viewer.scene.globe.enableLighting = !self._viewer.scene.globe.enableLighting;
		if(self._viewer.scene.globe.enableLighting){
			self._viewer.terrainShadows = Cesium.ShadowMode.ENABLED;
		}else{
			self._viewer.terrainShadows = Cesium.ShadowMode.RECEIVE_ONLY;
		}
	}else if(m_id == "globe"){
		//全球视野
		self._rotatePoint = false;
		self._globe.setView({});
	}else if(m_id == "north"){
		//朝向正北
		var sceneMode = self._viewer.scene.mode;
		if(sceneMode != Cesium.SceneMode.SCENE3D){
//			alert("2D状态下不支持此功能！");
			return;
		}
		self._rotatePoint = false;
		var cameraObj = self._viewer.scene.globe.ellipsoid.cartesianToCartographic(self._viewer.scene.camera.position);
		var lon = CommonFunc.deg(cameraObj.longitude);
		var lat = CommonFunc.deg(cameraObj.latitude);
		var alt = cameraObj.height;
		var heading = 0;
		var pitch = CommonFunc.deg(self._viewer.scene.camera.pitch);
		var roll = CommonFunc.deg(self._viewer.scene.camera.roll);
		var options = {lon:lon,lat:lat,alt:alt,heading:heading,pitch:pitch,roll:roll};
		self._globe.flyTo(options);
	}else if(m_id == "overlooking"){
		//正上俯视
		var sceneMode = self._viewer.scene.mode;
		if(sceneMode != Cesium.SceneMode.SCENE3D){
//			alert("2D状态下不支持此功能！");
			return;
		}
		self._rotatePoint = false;
		var cameraObj = self._viewer.scene.globe.ellipsoid.cartesianToCartographic(self._viewer.scene.camera.position);
		var lon = CommonFunc.deg(cameraObj.longitude);
		var lat = CommonFunc.deg(cameraObj.latitude);
		var alt = cameraObj.height;
		var extent = self._getCenter();
		var dis = CommonFunc.getDistance(lon,lat,extent.lon, extent.lat);
		var h = Math.sqrt((dis*dis + (alt-extent.alt)*(alt-extent.alt)));
		self._viewer.camera.flyTo({
		    destination : new Cesium.Cartesian3.fromDegrees(extent.lon, extent.lat, extent.alt + h),
		    orientation : {
		        heading: self._viewer.scene.camera.heading,
				pitch: Cesium.Math.toRadians(-90),
				roll: Cesium.Math.toRadians(0)
		    }
		});
		return;
	}else if(m_id == "address"){
		//地名定位
		if(self._toolsetSelect != "address"){
			self._globe.deactivateAllState();
			self._closeAll();
			setTimeout(function(){
				document.getElementById("cfglobe_toolset_top_"+m_id).setAttribute("class", "cfglobe-toolset-top-show");
			},300);
		}
	}else if(m_id == "location"){
		//快速定位
		if(self._toolsetSelect != "location"){
			self._globe.deactivateAllState();
			self._closeAll();
			setTimeout(function(){
				document.getElementById("cfglobe_toolset_top_"+m_id).setAttribute("class", "cfglobe-toolset-top-show");
			},300);
		}
	}else if(m_id == "transforming"){
		//坐标转换
		if(self._toolsetSelect != "transforming"){
			self._globe.deactivateAllState();
			self._closeAll();
			setTimeout(function(){
				document.getElementById("cfglobe_toolset_top_"+m_id).setAttribute("class", "cfglobe-toolset-top-show");
			},300);
		}
	}else if(m_id == "measure"){
		//基础量算
		if(self._toolsetSelect != "measure"){
			self._globe.deactivateAllState();
			self._closeAll();
			setTimeout(function(){
				document.getElementById("cfglobe_toolset_top_"+m_id).setAttribute("class", "cfglobe-toolset-top-show");
			},300);
		}
	}else if(m_id == "analysis"){
		//通视分析
		var sceneMode = self._viewer.scene.mode;
		if(sceneMode != Cesium.SceneMode.SCENE3D){
			alert("2D状态下不支持此功能！");
			return;
		}
		if(self._toolsetSelect != "analysis"){
			self._globe.deactivateAllState();
			self._closeAll();
			setTimeout(function(){
				document.getElementById("cfglobe_toolset_top_"+m_id).setAttribute("class", "cfglobe-toolset-top-show");
			},300);
		}
	}else if(m_id == "viewing"){
		//目标观测
		var sceneMode = self._viewer.scene.mode;
		if(sceneMode != Cesium.SceneMode.SCENE3D){
			alert("2D状态下不支持此功能！");
			return;
		}
		if(self._toolsetSelect != "viewing"){
			self._globe.deactivateAllState();
			self._closeAll();
			setTimeout(function(){
				document.getElementById("cfglobe_toolset_top_"+m_id).setAttribute("class", "cfglobe-toolset-top-show");
			},300);
		}
	}else if(m_id == "path"){
		//路径分析
		if(self._toolsetSelect != "path"){
			self._globe.deactivateAllState();
			self._closeAll();
			setTimeout(function(){
				document.getElementById("cfglobe_toolset_top_"+m_id).setAttribute("class", "cfglobe-toolset-top-show");
			},300);
		}
	}else if(m_id == "shp"){
		//导入shp
		if(self._toolsetSelect != "shp"){
			self._globe.deactivateAllState();
			self._closeAll();
			setTimeout(function(){
				document.getElementById("cfglobe_toolset_top_"+m_id).setAttribute("class", "cfglobe-toolset-top-show");
			},300);
		}
	}else if(m_id == "csv"){
		//地图编辑
		if(self._toolsetSelect != "csv"){
			self._globe.deactivateAllState();
			self._closeAll();
			setTimeout(function(){
				document.getElementById("cfglobe_toolset_top_"+m_id).setAttribute("class", "cfglobe-toolset-top-show");
			},300);
		}
	}
	self._toolsetSelect = m_id;
}

/*
 * 加载csv点
 * @author zhaoxd
 * @method _addCsv
 * @for Toolset
 * @param {float} lon：经度
 * @param {float} lat：纬度
 * @param {string} label：标识文字
 * @return {null} null
 */
Toolset.prototype._addCsv = function(lon,lat,label){
	var self = this;
	var pinBuilder = new Cesium.PinBuilder();
	var color = Cesium.Color.RED;
	if(label){
		label = label.toString();
	}else{
		label = "";
	}
	var options = {lon:lon,lat:lat,color:color,label:label};
	var mark = self._globe.placeMark.add(options);
	self._csvList.push(mark);
}

/*
 * 清除csv点
 * @author zhaoxd
 * @method _clearCsv
 * @for Toolset
 * @param {null} null
 * @return {null} null
 */
Toolset.prototype._clearCsv = function(){
	var self = this;
	self._csvLabel = "";
	self._csvDraw = false;
	var back = true;
	for(var i = self._csvList.length - 1; i >= 0; i--){
		back = self._globe.placeMark.remove(self._csvList[i]);
		if(back){
			self._csvList.splice(i, 1);
		}else{
			return back;
		}
	}
}

/*
 * 加载shp文件回调事件
 * @author zhaoxd
 * @method _shpCallback
 * @for Toolset
 * @param {string} lid：shp对象的lid，如果返回"error"表示加载错误
 * @param {string} name：shp对象的name
 * @param {Object} res：shp对象内容
 * @return {null} null
 */
Toolset.prototype._shpCallback = function(lid,name,res){
	if(lid == "error"){
		alert(name);
		return;
	}
	var m_shp_div_list = document.getElementById("cfglobe_toolset_top_shp_list");
	var m_shp_div_info = document.createElement("div");
	m_shp_div_info.setAttribute("id", "cfglobe_toolset_top_shp_info_" + lid);
	m_shp_div_info.setAttribute("class", "cfglobe-toolset-top-shp-div");
	var m_shp_span = document.createElement("span");
	m_shp_span.innerHTML = name;
	m_shp_div_info.appendChild(m_shp_span);
	var m_shp_button = document.createElement("button");
	m_shp_button.innerHTML = "删除";
	m_shp_button.onclick = function(){
		myglobe.shpParser.removeByLid(lid);
		var thisNode = document.getElementById("cfglobe_toolset_top_shp_info_" + lid);
		thisNode.parentNode.removeChild(thisNode);
	};
	m_shp_div_info.appendChild(m_shp_button);
	m_shp_div_list.appendChild(m_shp_div_info);
	
}

/*
 * 地名查询回调事件     cfglobe_toolset_top_address_list   address
 * @author zhaoxd
 * @method _addressCallback
 * @for Toolset
 * @param {null} null
 * @return {null} null
 */
Toolset.prototype._addressCallback = function(addressList){
	var self = this;
	var m_address_div_list = document.getElementById("cfglobe_toolset_top_address_list");
	m_address_div_list.setAttribute("style", "font-size: 15px;height: 300px;overflow-y: auto;");
	m_address_div_list.innerHTML = "";
	if(addressList.length == 0){
		var m_address_div_info = document.createElement("div");
		m_address_div_info.setAttribute("class", "cfglobe-toolset-top-shp-div");
		m_address_div_info.innerHTML = "查询无结果,请重新设置查询条件!";
		m_address_div_list.appendChild(m_address_div_info);
	}
	for(var i = 0; i < addressList.length; i++){
		(function(i){
			var m_address_div_info = document.createElement("div");
			m_address_div_info.setAttribute("id", "cfglobe_toolset_top_address_info_" + addressList[i].id);
			m_address_div_info.setAttribute("class", "cfglobe-toolset-top-shp-div");
			m_address_div_info.setAttribute("style", "margin-top:0;");
			var m_address_span = document.createElement("span");
			m_address_span.innerHTML = addressList[i].name;
			m_address_div_info.appendChild(m_address_span);
			var m_address_button = document.createElement("button");
			m_address_button.setAttribute("id", "cfglobe_toolset_top_address_button_" + addressList[i].id);
			m_address_button.innerHTML = "定位";
			m_address_button.onclick = function(){
				var lon = addressList[i].lon;
				var lat = addressList[i].lat;
				var alt = 5000;
				self._globe.flyTo({lon:lon,lat:lat,alt:alt});
			};
			m_address_div_info.appendChild(m_address_button);
			m_address_div_list.appendChild(m_address_div_info);
		})(i);
	}
}

/*
 * 清除地名查询结果
 * @author zhaoxd
 * @method _clearAddressList
 * @for Toolset
 * @param {null} null
 * @return {null} null
 */
Toolset.prototype._clearAddressList = function() { 
	var self = this;
    var m_address_div_list = document.getElementById("cfglobe_toolset_top_address_list");
    if(m_address_div_list){
    	m_address_div_list.setAttribute("style", "height: 0;");
		m_address_div_list.innerHTML = "";
    }
	for(var i = self._address_list.length - 1; i >= 0; i--){
		self._viewer.entities.remove(self._address_list[i]);
		self._address_list.splice(i, 1);
	}
}

Toolset.prototype._addIntersectionMark = function(lon,lat,alt,color,label){
	var self = this;
	var options = {
		clampMode:1,
	    name:"getIntersection", 
	    width:30, 
	    height:30, 
	    lon:lon, 
	    lat:lat, 
	    alt:alt, 
	    color:color,
	    showBox:false,
	    heightReference:false
	};
	if(label){
		options.label = (label/1000).toFixed(2) + "km";
		options.labelShow = true;
	}
    var mark = self._globe.placeMark.add(options);
    self._intersectionByRay_list.push(mark);
};

/*
 * 清除射线分析结果
 * @author zhaoxd
 * @method _clearIntersectionByRay
 * @for Toolset
 * @param {null} null
 * @return {null} null
 */
Toolset.prototype._clearIntersectionByRay = function(){
	var self = this;
	for(var i = self._intersectionByRay_list.length - 1; i >= 0; i--){
		if(self._intersectionByRay_list[i].polyline){
			self._viewer.entities.remove(self._intersectionByRay_list[i].polyline);
		}else{
			self._viewer.entities.remove(self._intersectionByRay_list[i]);
		}
		self._intersectionByRay_list.splice(i, 1);
	}
}

/*
 * 根据点集合观测
 * @author zhaoxd
 * @method _rotateByPointList
 * @for Toolset
 * @param {list} pointList：点集合
 * @param {int} i：点索引
 * @return {null} null
 */
Toolset.prototype._rotateByPointList = function(pointList,i){
	var self = this;
	if(self._rotatePoint){
		if(i == pointList.length){
			i = 0;
		}
		var options = {lon:pointList[i].lon, lat:pointList[i].lat, alt:pointList[i].alt, heading:pointList[i].heading, pitch:pointList[i].pitch, roll:0};
		self._globe.setView(options);
		setTimeout(function(){
			self._rotateByPointList(pointList,i+1);
		},10);
	}
}

/*
 * 清除状态
 * @author zhaoxd
 * @method clearToolsetSubset
 * @for Toolset
 * @param {null} null
 * @return {null} null
 */
Toolset.prototype.clearToolsetSubset = function(){
	var self = this;
	self._globe.deactivateAllState();
	//快速定位
	if(self._location_pos){
    	self._viewer.entities.remove(self._location_pos);
	}
	//基础量算
	self._globe.basicMeasure.removeMeasureDis();
	self._globe.basicMeasure.removeMeasureArea();
	self._globe.basicMeasure.removeMeasureHeight();
	//通视分析
	self._globe.sightAnalyse.clear();
	//两点角度
	self._globe.angleAnalyse.clear();
	//路径分析
	if(self._pathManager.spoint){
		self._viewer.entities.remove(self._pathManager.spoint);
		self._pathManager.spoint = null;
	}
	for(var i = self._pathManager.tpoints.length - 1; i >= 0; i--){
		self._viewer.entities.remove(self._pathManager.tpoints[i]);
		self._pathManager.tpoints.pop();
	}
	self._pathManager.tpoints = [];
	if(self._pathManager.epoint){
		self._viewer.entities.remove(self._pathManager.epoint);
		self._pathManager.epoint = null;
	}
	self._globe.pathAnalyse.clear();
	self._pathManager.draw = false;
	self._pathManager.selectSpoint = false;
	self._pathManager.selectTpoint = false;
	self._pathManager.selectEpoint = false;
	document.getElementById("cfglobe_toolset_top_path_t_pint").innerHTML = "";
	document.getElementById("cfglobe_toolset_top_path_s_lon").setAttribute("value", "");
	document.getElementById("cfglobe_toolset_top_path_s_lat").setAttribute("value", "");
	document.getElementById("cfglobe_toolset_top_path_e_lon").setAttribute("value", "");
	document.getElementById("cfglobe_toolset_top_path_e_lat").setAttribute("value", "");
	//可视域分析清除
	self._globe.viewshed.clear();
	//地名查询清除
	self._clearAddressList();
	//坐标转换点击状态清除
	self._transformingDraw = false;
	//射线分析清除
	self._clearIntersectionByRay();
	//csv清除
	self._clearCsv();
}

/**
 * 定位
 * @author lijy
 * @method location
 * @for Toolset
 * @param {float} lon 经度
 * @param {float} lat 纬度
 * @return {null} null
 */
Toolset.prototype.location = function(lon,lat){
	var self = this;
	var pinBuilder = new Cesium.PinBuilder();
	var position = Cesium.Cartesian3.fromDegrees(lon, lat);
	self._location_pos = self._viewer.entities.add({
	    position : position,
	    billboard : {
//	        image : pinBuilder.fromColor(Cesium.Color.ROYALBLUE, 48).toDataURL(),
	        image : self._globe.urlConfig.PUSHPIN_YELLOW,
	        width : 30,
	        height : 30,
	        verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
	        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
	        disableDepthTestDistance : Number.POSITIVE_INFINITY
	    }
	});
	var options = {lon:lon, lat:lat, alt:10000, horizontal:0, pitch:-90, dist:0, callback:null};
	self._globe.flyTo(options);
}

/*
 * 获取中心点
 * @author zhaoxd
 * @method _getCenter
 * @for Toolset
 * @param {null} null
 * @return {null} null
 */
Toolset.prototype._getCenter = function(){
	var self = this;
	// 范围对象
    var extent = {};
    
    // 得到当前三维场景
    var scene = self._viewer.scene;
    
    // 得到当前三维场景的椭球体
    var ellipsoid = scene.globe.ellipsoid;
    var canvas = scene.canvas;
    
    var ray = self._viewer.camera.getPickRay(new Cesium.Cartesian2(canvas.width/2,canvas.height/2));
    var xyz = scene.globe.pick(ray,scene);
    var cartographic = Cesium.Cartographic.fromCartesian(xyz);
	var longitude = Cesium.Math.toDegrees(cartographic.longitude);
	var latitude = Cesium.Math.toDegrees(cartographic.latitude);
	var height = cartographic.height;
	var lonlat = {lon:longitude,lat:latitude,alt:height};
    
    return lonlat;
}

return Toolset;
})



///*
//* author: 赵雪丹
//* description: Toolset-右侧工具条
//* day: 2017-9-28
//*/
//define( [ ], function( ){
//function Toolset(globe){
//	var self = this;
//	this._globe = globe;
//	this._viewer = globe._viewer;
//	this._globeId = globe._globeId;
//	this._toolsetSelect = "";
//	this._csvList = [];
//	this._csvLabel = "";
//	this._csvDraw = false;
//	this._showMenu = true;
//	this._loadToolset();
//	if(!this._globe._showToolset){
//		document.getElementById("cfglobe_toolset").style.display = "none";
//	}
//	//定位点
//	this._location_pos = null;
//	this._address_list = [];
//	//观测状态
//	this._rotatePoint = false;
//	//私有注册事件
//	this._handler = new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas);
//	//LEFT_CLICK 左键点击事件
//	this._handler.setInputAction(function (e) {
//  	self._rotatePoint = false;
//  	var lonlat = self._globe.getLonLatByPosition(e.position);
//  	if(self._csvDraw){
//			self._addCsv(lonlat.lon,lonlat.lat,self._csvLabel);
//  	}
//	}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
//	
//	//鼠标移动事件注册
//	this._handler.setInputAction(function(movement){
//		var o = document.getElementById(self._globeId);
//		var w = o.offsetWidth;
//		var m_w = w - movement.endPosition.x;
//		if(m_w < 200){
//			document.getElementById("cfglobe_toolset").style.minWidth = "70px";
//		}else{
//			document.getElementById("cfglobe_toolset").style.minWidth = "0";
//		}
//	}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
//
//	
//	//RIGHT_CLICK 右键点击事件
//	this._handler.setInputAction(function (e) {
//	  	self._rotatePoint = false;
//		var lonlat = self._globe.getLonLatByPosition(e.position);
//	  	if(lonlat.alt < 0){
//			lonlat.alt = 0;
//		}
//	}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
//	
//	
//}
//
///*
// * 设置显隐
// * @author zhaoxd
// * @method setDisplay
// * @for Toolset
// * @param {Boolean} true:显示,false:隐藏
// * @return {null} null
// */
//Toolset.prototype.setDisplay = function(display){
//	if(display){
//		document.getElementById("cfglobe_toolset").style.display = "";
//	}else{
//		document.getElementById("cfglobe_toolset").style.display = "none";
//	}
//}
//
///*
// * 初始化工具条
// * @author zhaoxd
// * @method _loadToolset
// * @for Toolset
// * @param {null} null
// * @return {null} null
// */
//Toolset.prototype._loadToolset = function(){
//	var self = this;
//	var m_toolset_top = document.createElement("div");
//	m_toolset_top.setAttribute("id", "cfglobe_toolset_top");
//	m_toolset_top.setAttribute("class", "cfglobe-toolset-top-hide");
//	document.getElementById(self._globeId).getElementsByTagName("div")[0].appendChild(m_toolset_top);
//	var btnList = [
//				{name:"open",title:""},
//				{name:"globe",title:"全球视野"},
//				{name:"2d",title:"维度切换"},
//				{name:"north",title:"正北朝向"},
//				{name:"overlooking",title:"正上俯视"},
//				{name:"sunshine",title:"光照效果"},
//				{name:"address",title:"地名定位"},
//				{name:"location",title:"快速定位"},
//				{name:"measure",title:"基础量算"},
//				{name:"analysis",title:"空间分析"},
//				{name:"viewing",title:"目标观测"},
//				{name:"path",title:"路径分析"},
//				{name:"shp",title:"导入shp"},
//				{name:"csv",title:"地图编辑"},
//				{name:"clear",title:"清除结果"}];
//	var m_toolset = document.createElement("div");
//	m_toolset.setAttribute("id", "cfglobe_toolset");
//	m_toolset.setAttribute("class", "cfglobe-toolset");
//	for(var i = 0; i < btnList.length; i++){
//		var m_toolset_list = document.createElement("div");
//		m_toolset_list.setAttribute("class", "cfglobe-toolset-list");
//		var m_toolset_icon = document.createElement("button");
//		m_toolset_icon.setAttribute("title", btnList[i].title);
//		m_toolset_icon.dataset.tag = btnList[i].name;
//		m_toolset_icon.setAttribute("class", "cfglobe-toolset-btn-" + btnList[i].name);
//		m_toolset_icon.onclick = function(){
//			self._toolsetClick(this);
//		};
//		m_toolset_list.appendChild(m_toolset_icon);
//		var m_toolset_span = document.createElement("span");
//		m_toolset_span.setAttribute("class", "cfglobe-toolset-span");
//		m_toolset_span.dataset.tag = btnList[i].name;
//		m_toolset_span.onclick = function(){
//			self._toolsetClick(this);
//		};
//		m_toolset_span.innerHTML =  btnList[i].title;
//		m_toolset_list.appendChild(m_toolset_span);
//		m_toolset.appendChild(m_toolset_list);
//	}
//	document.getElementById(self._globeId).getElementsByTagName("div")[0].appendChild(m_toolset);
//}
//
//Toolset.prototype._loadAddress = function(){
//	var m_toolset_top = document.getElementById("cfglobe_toolset_top");
//	var m_toolset_top_sub = document.createElement("div");
//	m_toolset_top_sub.setAttribute("id", "cfglobe_toolset_top_address");
//	m_toolset_top_sub.setAttribute("class", "cfglobe-toolset-top-hide");
//	m_toolset_top.appendChild(m_toolset_top_sub);
//}
//
//Toolset.prototype._loadLocation = function(){
//	var m_toolset_top = document.getElementById("cfglobe_toolset_top");
//	var m_toolset_top_sub = document.createElement("div");
//	m_toolset_top_sub.setAttribute("id", "cfglobe_toolset_top_location");
//	m_toolset_top_sub.setAttribute("class", "cfglobe-toolset-top-hide");
//	m_toolset_top.appendChild(m_toolset_top_sub);
//}
//
//Toolset.prototype._loadMeasure = function(){
//	var m_toolset_top = document.getElementById("cfglobe_toolset_top");
//	var m_toolset_top_sub = document.createElement("div");
//	m_toolset_top_sub.setAttribute("id", "cfglobe_toolset_top_measure");
//	m_toolset_top_sub.setAttribute("class", "cfglobe-toolset-top-hide");
//	m_toolset_top.appendChild(m_toolset_top_sub);
//}
//
//Toolset.prototype._loadAnalysis = function(){
//	var m_toolset_top = document.getElementById("cfglobe_toolset_top");
//	var m_toolset_top_sub = document.createElement("div");
//	m_toolset_top_sub.setAttribute("id", "cfglobe_toolset_top_analysis");
//	m_toolset_top_sub.setAttribute("class", "cfglobe-toolset-top-hide");
//	m_toolset_top.appendChild(m_toolset_top_sub);
//}
//
//Toolset.prototype._loadViewing = function(){
//	var m_toolset_top = document.getElementById("cfglobe_toolset_top");
//	var m_toolset_top_sub = document.createElement("div");
//	m_toolset_top_sub.setAttribute("id", "cfglobe_toolset_top_viewing");
//	m_toolset_top_sub.setAttribute("class", "cfglobe-toolset-top-hide");
//	m_toolset_top.appendChild(m_toolset_top_sub);
//}
//
//Toolset.prototype._loadPath = function(){
//	var m_toolset_top = document.getElementById("cfglobe_toolset_top");
//	var m_toolset_top_sub = document.createElement("div");
//	m_toolset_top_sub.setAttribute("id", "cfglobe_toolset_top_path");
//	m_toolset_top_sub.setAttribute("class", "cfglobe-toolset-top-hide");
//	m_toolset_top.appendChild(m_toolset_top_sub);
//}
//
//Toolset.prototype._loadShp = function(){
//	var m_toolset_top = document.getElementById("cfglobe_toolset_top");
//	var m_toolset_top_sub = document.createElement("div");
//	m_toolset_top_sub.setAttribute("id", "cfglobe_toolset_top_shp");
//	m_toolset_top_sub.setAttribute("class", "cfglobe-toolset-top-hide");
//	m_toolset_top.appendChild(m_toolset_top_sub);
//}
//
//Toolset.prototype._loadCsv = function(){
//	var m_toolset_top = document.getElementById("cfglobe_toolset_top");
//	var m_toolset_top_sub = document.createElement("div");
//	m_toolset_top_sub.setAttribute("id", "cfglobe_toolset_top_csv");
//	m_toolset_top_sub.setAttribute("class", "cfglobe-toolset-top-hide");
//	m_toolset_top.appendChild(m_toolset_top_sub);
//}
//
//Toolset.prototype._closeAll = function(){
//	var m_toolset_top_address = document.getElementById("cfglobe_toolset_top_address");
//	m_toolset_top_address.setAttribute("class", "cfglobe-toolset-top-hide");
//	var m_toolset_top_location = document.getElementById("cfglobe_toolset_top_location");
//	m_toolset_top_location.setAttribute("class", "cfglobe-toolset-top-hide");
//	var m_toolset_top_measure = document.getElementById("cfglobe_toolset_top_measure");
//	m_toolset_top_measure.setAttribute("class", "cfglobe-toolset-top-hide");
//	var m_toolset_top_analysis = document.getElementById("cfglobe_toolset_top_analysis");
//	m_toolset_top_analysis.setAttribute("class", "cfglobe-toolset-top-hide");
//	var m_toolset_top_viewing = document.getElementById("cfglobe_toolset_top_viewing");
//	m_toolset_top_viewing.setAttribute("class", "cfglobe-toolset-top-hide");
//	var m_toolset_top_path = document.getElementById("cfglobe_toolset_top_path");
//	m_toolset_top_path.setAttribute("class", "cfglobe-toolset-top-hide");
//	var m_toolset_top_shp = document.getElementById("cfglobe_toolset_top_shp");
//	m_toolset_top_shp.setAttribute("class", "cfglobe-toolset-top-hide");
//	var m_toolset_top_csv = document.getElementById("cfglobe_toolset_top_csv");
//	m_toolset_top_csv.setAttribute("class", "cfglobe-toolset-top-hide");
//}
//
///*
// * 工具条点击事件
// * @author zhaoxd
// * @method _toolsetClick
// * @for Toolset
// * @param {Object} obj点击元素
// * @return {null} null
// */
//Toolset.prototype._toolsetClick = function(obj){
//	var self = this;
//	var m_toolset_top = document.getElementById("cfglobe_toolset_top");
//	var m_id = obj.getAttribute("data-tag");
//	if(m_id == "open"){
//		//详细信息
//		var className = document.getElementById("cfglobe_toolset").className;
//		if(className == "cfglobe-toolset"){
//			document.getElementById("cfglobe_toolset").setAttribute("class", "cfglobe-toolset-open");
//			obj.setAttribute("class", "cfglobe-toolset-btn-close");
//		}else{
//			document.getElementById("cfglobe_toolset").setAttribute("class", "cfglobe-toolset");
//			obj.setAttribute("class", "cfglobe-toolset-btn-open");
//		}
//		return;
//	}else if(m_id == "clear"){
//		//清除
//		self.clearToolsetSubset();
//		//可视域分析清除
//		self._globe.viewshed.clear();
//	}else if(m_id == "2d"){
//		//二三维切换
//		var sceneMode = self._viewer.scene.mode;
//		var m_modePicker = new Cesium.SceneModePickerViewModel(self._viewer.scene, 2);
//		var cameraPosition = {};
//		if(sessionStorage[self._globe._sessionName]){
//			cameraPosition = eval("(" + sessionStorage[self._globe._sessionName] +")");
//		}
//		if(sceneMode == Cesium.SceneMode.SCENE3D){
//		    m_modePicker.morphTo2D();
//		    obj.parentNode.firstChild.setAttribute("class", "cfglobe-toolset-btn-3d");
//		}else{
//		    m_modePicker.morphTo3D();
//		    obj.parentNode.firstChild.setAttribute("class", "cfglobe-toolset-btn-2d");
//		}
//		self._viewer.scene.morphComplete.addEventListener(function(scene,time){
//			var options = {lon:cameraPosition.lon, lat:cameraPosition.lat, alt:30000, heading:0, pitch:-90, roll:0};
// 			self._globe.setView(options);
//	    }); 
//	}else if(m_id == "sunshine"){
//		//光照效果
//		self._viewer.scene.globe.enableLighting = !self._viewer.scene.globe.enableLighting;
//		if(self._viewer.scene.globe.enableLighting){
//			self._viewer.terrainShadows = Cesium.ShadowMode.ENABLED;
//		}else{
//			self._viewer.terrainShadows = Cesium.ShadowMode.RECEIVE_ONLY;
//		}
//	}else if(m_id == "globe"){
//		//全球视野
//		self._rotatePoint = false;
//		self._globe.setView({});
//	}else if(m_id == "north"){
//		//朝向正北
//		var sceneMode = self._viewer.scene.mode;
//		if(sceneMode != Cesium.SceneMode.SCENE3D){
////			alert("2D状态下不支持此功能！");
//			return;
//		}
//		self._rotatePoint = false;
//		var cameraObj = self._viewer.scene.globe.ellipsoid.cartesianToCartographic(self._viewer.scene.camera.position);
//		var lon = CommonFunc.deg(cameraObj.longitude);
//		var lat = CommonFunc.deg(cameraObj.latitude);
//		var alt = cameraObj.height;
//		var heading = 0;
//		var pitch = CommonFunc.deg(self._viewer.scene.camera.pitch);
//		var roll = CommonFunc.deg(self._viewer.scene.camera.roll);
//		var options = {lon:lon,lat:lat,alt:alt,heading:heading,pitch:pitch,roll:roll};
//		self._globe.flyTo(options);
//	}else if(m_id == "overlooking"){
//		//正上俯视
//		var sceneMode = self._viewer.scene.mode;
//		if(sceneMode != Cesium.SceneMode.SCENE3D){
////			alert("2D状态下不支持此功能！");
//			return;
//		}
//		self._rotatePoint = false;
//		var cameraObj = self._viewer.scene.globe.ellipsoid.cartesianToCartographic(self._viewer.scene.camera.position);
//		var lon = CommonFunc.deg(cameraObj.longitude);
//		var lat = CommonFunc.deg(cameraObj.latitude);
//		var alt = cameraObj.height;
//		var extent = self._getCenter();
//		var dis = CommonFunc.getDistance(lon,lat,extent.lon, extent.lat);
//		var h = Math.sqrt((dis*dis + (alt-extent.alt)*(alt-extent.alt)));
//		self._viewer.camera.flyTo({
//		    destination : new Cesium.Cartesian3.fromDegrees(extent.lon, extent.lat, extent.alt + h),
//		    orientation : {
//		        heading: self._viewer.scene.camera.heading,
//				pitch: Cesium.Math.toRadians(-90),
//				roll: Cesium.Math.toRadians(0)
//		    }
//		});
//		return;
//	}else if(m_id == "address"){
//		//地名定位
//		if(self._toolsetSelect != "address"){
//			self._globe.deactivateAllState();
//			m_toolset_top.innerHTML = "";
//			m_toolset_top.setAttribute("class", "cfglobe-toolset-top-hide");
//			setTimeout(function(){
//				var m_toolset_top_dm = document.createElement("span");
//				m_toolset_top_dm.innerHTML = "地名：";
//				m_toolset_top.appendChild(m_toolset_top_dm);
//				var m_toolset_top_dm_input = document.createElement("input");
//				m_toolset_top_dm_input.setAttribute("id", "cfglobe_toolset_top_dm_input");
//				m_toolset_top_dm_input.setAttribute("value", "北京市");
//				m_toolset_top.appendChild(m_toolset_top_dm_input);
//				var m_toolset_top_address_button = document.createElement("button");
//				m_toolset_top_address_button.setAttribute("class", "cesium-button");
//				m_toolset_top_address_button.innerHTML = "查询";
//				m_toolset_top_address_button.onclick = function(){
//					var m_address = document.getElementById("cfglobe_toolset_top_dm_input").value;
//					var m_filter = '<Filter>';
//					m_filter += '<PropertyIsLike wildCard=\'*\' singleChar=\'.\' escapeChar=\'!\'><PropertyName>NAME</PropertyName><Literal>*' + m_address + '*</Literal></PropertyIsLike>';
//					m_filter += '</Filter>';
//					
//					$.ajax(self._globe.urlConfig.LOCALOWS,{
//				        type: 'GET',
//				        data: {
//				            service: 'WFS',
//				            version: '1.0.0',
//				            request: 'GetFeature',
//				            typename: "cf:city_poi",
//				            maxFeatures: 500,
//				            outputFormat: 'application/json',
//							filter: m_filter
//				        },
//				        success: function(data){
//				        	if(data.features){
//				        		self._clearAddressList();
//								var addressList = [];
//				        		for(var i = 0; i < data.features.length; i++){
//				        			var coordinates = data.features[i].geometry.coordinates;
//				        			var properties = data.features[i].properties;
//				        			var info = {name:properties.NAME,id:properties.OBJECTID,lon:coordinates[0],lat:coordinates[1]};
//									addressList.push(info);
//									var position = Cesium.Cartesian3.fromDegrees(coordinates[0], coordinates[1]);
//									var addressMark = self._viewer.entities.add({
//									    position : position,
//									    billboard : {
//									        image : self._globe.urlConfig.ADDRESS_RED,
//									        width : 30,
//									        height : 30,
//									        verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
//									        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND 
//									    },
//									    label:{
//									    	text: properties.NAME,
//									    	font: "14pt sans-serif",
//									    	fillColor: Cesium.Color.WHITE,
//									    	horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
//									    	pixelOffset: new Cesium.Cartesian2(30/2, 0),
//									    	verticalOrigin : Cesium.VerticalOrigin.BASELINE,
//									        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
//									        disableDepthTestDistance : Number.POSITIVE_INFINITY
//									    }
//									});
//									self._address_list.push(addressMark);
//				        		}
//								self._addressCallback(addressList);
//				        	}
//				        },
//				        error: function(XMLHttpRequest, textStatus, errorThrown){
//				        	alert("抱歉："+textStatus);
//				        }
//				   });
//				};
//				m_toolset_top.appendChild(m_toolset_top_address_button);
//				var m_toolset_top_address_button1 = document.createElement("button");
//				m_toolset_top_address_button1.setAttribute("class", "cesium-button");
//				m_toolset_top_address_button1.setAttribute("style", "margin-bottom: 7px;");    
//				m_toolset_top_address_button1.innerHTML = "清除";
//				m_toolset_top_address_button1.onclick = function(){
//					self._clearAddressList();
//				};
//				m_toolset_top.appendChild(m_toolset_top_address_button1);
//				var m_toolset_top_address_list = document.createElement("div");
//				m_toolset_top_address_list.setAttribute("id", "cfglobe_toolset_top_address_list");
//				m_toolset_top.appendChild(m_toolset_top_address_list);
//				m_toolset_top.setAttribute("class", "cfglobe-toolset-top-show");
//			},300);
//		}else{
//			m_toolset_top.setAttribute("class", "cfglobe-toolset-top-hide");
//			self._toolsetSelect = "";
//			return;
//		}
//	}else if(m_id == "location"){
//		//快速定位
//		if(self._toolsetSelect != "location"){
//			self._globe.deactivateAllState();
//			m_toolset_top.innerHTML = "";
//			m_toolset_top.setAttribute("class", "cfglobe-toolset-top-hide");
//			setTimeout(function(){
//				var m_toolset_top_dfm = document.createElement("div");
//				var m_toolset_top_d = document.createElement("span");
//				m_toolset_top_d.innerHTML = "度：";
//				m_toolset_top_dfm.appendChild(m_toolset_top_d);
//				var m_toolset_top_d_input = document.createElement("input");
//				m_toolset_top_d_input.setAttribute("id", "cfglobe_toolset_top_d_input");
//				m_toolset_top_d_input.setAttribute("style", "width: 40px;");
//				m_toolset_top_dfm.appendChild(m_toolset_top_d_input);
//				var m_toolset_top_f = document.createElement("span");
//				m_toolset_top_f.innerHTML = "分：";
//				m_toolset_top_dfm.appendChild(m_toolset_top_f);
//				var m_toolset_top_f_input = document.createElement("input");
//				m_toolset_top_f_input.setAttribute("id", "cfglobe_toolset_top_f_input");
//				m_toolset_top_f_input.setAttribute("style", "width: 40px;");
//				m_toolset_top_dfm.appendChild(m_toolset_top_f_input);
//				var m_toolset_top_m = document.createElement("span");
//				m_toolset_top_m.innerHTML = "秒：";
//				m_toolset_top_dfm.appendChild(m_toolset_top_m);
//				var m_toolset_top_m_input = document.createElement("input");
//				m_toolset_top_m_input.setAttribute("id", "cfglobe_toolset_top_m_input");
//				m_toolset_top_m_input.setAttribute("style", "width: 40px;");
//				m_toolset_top_dfm.appendChild(m_toolset_top_m_input);
//				var m_toolset_top_location_button2 = document.createElement("button");
//				m_toolset_top_location_button2.setAttribute("class", "cesium-button");
//				m_toolset_top_location_button2.innerHTML = "转经度";
//				m_toolset_top_location_button2.onclick = function(){
//					var m_d = parseFloat(document.getElementById("cfglobe_toolset_top_d_input").value);
//					var m_f = parseFloat(document.getElementById("cfglobe_toolset_top_f_input").value);
//					var m_m = parseFloat(document.getElementById("cfglobe_toolset_top_m_input").value);
//					var m_dfm = {d:m_d,f:m_f,m:m_m};
//					var ret = self._globe.commonFunc.degreeConvertBack(m_dfm);
//					document.getElementById("cfglobe_toolset_top_jd_input").value = ret;
//				};
//				m_toolset_top_dfm.appendChild(m_toolset_top_location_button2);
//				var m_toolset_top_location_button3 = document.createElement("button");
//				m_toolset_top_location_button3.setAttribute("class", "cesium-button");
//				m_toolset_top_location_button3.innerHTML = "转纬度";
//				m_toolset_top_location_button3.onclick = function(){
//					var m_d = parseFloat(document.getElementById("cfglobe_toolset_top_d_input").value);
//					var m_f = parseFloat(document.getElementById("cfglobe_toolset_top_f_input").value);
//					var m_m = parseFloat(document.getElementById("cfglobe_toolset_top_m_input").value);
//					var m_dfm = {d:m_d,f:m_f,m:m_m};
//					var ret = self._globe.commonFunc.degreeConvertBack(m_dfm);
//					document.getElementById("cfglobe_toolset_top_wd_input").value = ret;
//				};
//				m_toolset_top_dfm.appendChild(m_toolset_top_location_button3);
//				m_toolset_top.appendChild(m_toolset_top_dfm);
//				var m_toolset_top_jd = document.createElement("span");
//				m_toolset_top_jd.innerHTML = "经度：";
//				m_toolset_top.appendChild(m_toolset_top_jd);
//				var m_toolset_top_jd_input = document.createElement("input");
//				m_toolset_top_jd_input.setAttribute("id", "cfglobe_toolset_top_jd_input");
//				m_toolset_top_jd_input.setAttribute("value", "128.0613");
//				m_toolset_top.appendChild(m_toolset_top_jd_input);
//				var m_toolset_top_wd = document.createElement("span");
//				m_toolset_top_wd.innerHTML = "纬度：";
//				m_toolset_top.appendChild(m_toolset_top_wd);
//				var m_toolset_top_wd_input = document.createElement("input");
//				m_toolset_top_wd_input.setAttribute("id", "cfglobe_toolset_top_wd_input");
//				m_toolset_top_wd_input.setAttribute("value", "42.0037");
//				m_toolset_top.appendChild(m_toolset_top_wd_input);
//				var m_toolset_top_location_button = document.createElement("button");
//				m_toolset_top_location_button.setAttribute("class", "cesium-button");
//				m_toolset_top_location_button.innerHTML = "定位";
//				m_toolset_top_location_button.onclick = function(){
//					var m_lon = parseFloat(document.getElementById("cfglobe_toolset_top_jd_input").value);
//					var m_lat = parseFloat(document.getElementById("cfglobe_toolset_top_wd_input").value);
//					if(self._location_pos){
//			        	self._viewer.entities.remove(self._location_pos);
//			    	}
//					self.location(m_lon, m_lat);
//				};
//				m_toolset_top.appendChild(m_toolset_top_location_button);
//				var m_toolset_top_location_button1 = document.createElement("button");
//				m_toolset_top_location_button1.setAttribute("class", "cesium-button");
//				m_toolset_top_location_button1.innerHTML = "清除";
//				m_toolset_top_location_button1.onclick = function(){
//					if(self._location_pos){
//			        	self._viewer.entities.remove(self._location_pos);
//			    	}
//				};
//				m_toolset_top.appendChild(m_toolset_top_location_button1);
//				m_toolset_top.setAttribute("class", "cfglobe-toolset-top-show");
//			},300);
//		}else{
//			m_toolset_top.setAttribute("class", "cfglobe-toolset-top-hide");
//			self._toolsetSelect = "";
//			return;
//		}
//	}else if(m_id == "measure"){
//		//基础量算
//		if(self._toolsetSelect != "measure"){
//			self._globe.deactivateAllState();
//			m_toolset_top.innerHTML = "";
//			m_toolset_top.setAttribute("class", "cfglobe-toolset-top-hide");
//			setTimeout(function(){
//				var m_toolset_top_measure_div1 = document.createElement("div");
//				m_toolset_top_measure_div1.setAttribute("style", "margin-bottom: 6px;");
//				var m_toolset_top_measure_span1 = document.createElement("span");
//				m_toolset_top_measure_span1.innerHTML = "基础测量：";
//				m_toolset_top_measure_div1.appendChild(m_toolset_top_measure_span1);
//				var m_toolset_top_measure_button1 = document.createElement("button");
//				m_toolset_top_measure_button1.setAttribute("class", "cesium-button");
//				m_toolset_top_measure_button1.innerHTML = "测距";
//				m_toolset_top_measure_button1.onclick = function(){
//					self._globe.basicMeasure.measureDis();
//				};
//				m_toolset_top_measure_div1.appendChild(m_toolset_top_measure_button1);
//				var m_toolset_top_measure_button2 = document.createElement("button");
//				m_toolset_top_measure_button2.setAttribute("class", "cesium-button");
//				m_toolset_top_measure_button2.innerHTML = "测面";
//				m_toolset_top_measure_button2.onclick = function(){
//					self._globe.basicMeasure.measureArea();
//				};
//				m_toolset_top_measure_div1.appendChild(m_toolset_top_measure_button2);
//				var m_toolset_top_measure_button3 = document.createElement("button");
//				m_toolset_top_measure_button3.setAttribute("class", "cesium-button");
//				m_toolset_top_measure_button3.innerHTML = "测高";
//				m_toolset_top_measure_button3.onclick = function(){
//					self._globe.basicMeasure.measureHeight();
//				};
//				m_toolset_top_measure_div1.appendChild(m_toolset_top_measure_button3);
//				var m_toolset_top_measure_button4 = document.createElement("button");
//				m_toolset_top_measure_button4.setAttribute("class", "cesium-button");
//				m_toolset_top_measure_button4.innerHTML = "清除";
//				m_toolset_top_measure_button4.onclick = function(){
//					self._globe.basicMeasure.removeMeasureDis();
//					self._globe.basicMeasure.removeMeasureArea();
//					self._globe.basicMeasure.removeMeasureHeight();
//				};
//				m_toolset_top_measure_div1.appendChild(m_toolset_top_measure_button4);
//				m_toolset_top.appendChild(m_toolset_top_measure_div1);
//				var m_toolset_top_measure_div2 = document.createElement("div");
//				var m_toolset_top_measure_span2 = document.createElement("span");
//				m_toolset_top_measure_span2.innerHTML = "角度测量：";
//				m_toolset_top_measure_div2.appendChild(m_toolset_top_measure_span2);
//				var m_toolset_top_angle_button1 = document.createElement("button");
//				m_toolset_top_angle_button1.setAttribute("class", "cesium-button");
//				m_toolset_top_angle_button1.innerHTML = "选取原点";
//				m_toolset_top_angle_button1.onclick = function(){
//					self._globe.angleAnalyse.selectSpoint();
//				};
//				m_toolset_top_measure_div2.appendChild(m_toolset_top_angle_button1);
//				var m_toolset_top_angle_button2 = document.createElement("button");
//				m_toolset_top_angle_button2.setAttribute("class", "cesium-button");
//				m_toolset_top_angle_button2.innerHTML = "选取目标点";
//				m_toolset_top_angle_button2.onclick = function(){
//					self._globe.angleAnalyse.selectEpoint();
//				};
//				m_toolset_top_measure_div2.appendChild(m_toolset_top_angle_button2);
//				var m_toolset_top_angle_button3 = document.createElement("button");
//				m_toolset_top_angle_button3.setAttribute("class", "cesium-button");
//				m_toolset_top_angle_button3.innerHTML = "清除";
//				m_toolset_top_angle_button3.onclick = function(){
//					self._globe.angleAnalyse.clear();
//				};
//				m_toolset_top_measure_div2.appendChild(m_toolset_top_angle_button3);
//				m_toolset_top.appendChild(m_toolset_top_measure_div2);
//				m_toolset_top.setAttribute("class", "cfglobe-toolset-top-show");
//			},300);
//		}else{
//			m_toolset_top.setAttribute("class", "cfglobe-toolset-top-hide");
//			self._toolsetSelect = "";
//			return;
//		}
//	}else if(m_id == "analysis"){
//		//通视分析
//		var sceneMode = self._viewer.scene.mode;
//		if(sceneMode != Cesium.SceneMode.SCENE3D){
//			alert("2D状态下不支持此功能！");
//			return;
//		}
//		if(self._toolsetSelect != "analysis"){
//			self._globe.deactivateAllState();
//			m_toolset_top.innerHTML = "";
//			m_toolset_top.setAttribute("class", "cfglobe-toolset-top-hide");
//			setTimeout(function(){
//				var m_toolset_top_tt = document.createElement("span");
//				m_toolset_top_tt.innerHTML = "塔台高度：";
//				m_toolset_top.appendChild(m_toolset_top_tt);
//				var m_toolset_top_tt_input = document.createElement("input");
//				m_toolset_top_tt_input.setAttribute("id", "cfglobe_toolset_top_tt_input");
//				m_toolset_top_tt_input.setAttribute("value", "0");
//				m_toolset_top.appendChild(m_toolset_top_tt_input);
//				var m_toolset_top_sm = document.createElement("span");
//				m_toolset_top_sm.innerHTML = "树木高度：";
//				m_toolset_top.appendChild(m_toolset_top_sm);
//				var m_toolset_top_sm_input = document.createElement("input");
//				m_toolset_top_sm_input.setAttribute("id", "cfglobe_toolset_top_sm_input");
//				m_toolset_top_sm_input.setAttribute("value", "0");
//				m_toolset_top.appendChild(m_toolset_top_sm_input);
//				var m_toolset_top_mb = document.createElement("span");
//				m_toolset_top_mb.innerHTML = "目标高度：";
//				m_toolset_top.appendChild(m_toolset_top_mb);
//				var m_toolset_top_mb_input = document.createElement("input");
//				m_toolset_top_mb_input.setAttribute("id", "cfglobe_toolset_top_mb_input");
//				m_toolset_top_mb_input.setAttribute("value", "0");
//				m_toolset_top.appendChild(m_toolset_top_mb_input);
//				var m_toolset_top_analysis_button1 = document.createElement("button");
//				m_toolset_top_analysis_button1.setAttribute("class", "cesium-button");
//				m_toolset_top_analysis_button1.innerHTML = "通视分析";
//				m_toolset_top_analysis_button1.onclick = function(){
//					self._globe.deactivateAllState();
//					var m_tt = parseFloat(document.getElementById("cfglobe_toolset_top_tt_input").value);
//					var m_sm = parseFloat(document.getElementById("cfglobe_toolset_top_sm_input").value);
//					var m_mb = parseFloat(document.getElementById("cfglobe_toolset_top_mb_input").value);
//					var options = {towerHeight:m_tt,treeHeight:m_sm,targetHeight:m_mb};
//					self._globe.sightAnalyse.actionIntervisibility(options);
//				};
//				m_toolset_top.appendChild(m_toolset_top_analysis_button1);
//				var m_toolset_top_analysis_button2 = document.createElement("button");
//				m_toolset_top_analysis_button2.setAttribute("class", "cesium-button");
//				m_toolset_top_analysis_button2.innerHTML = "可视域分析";
//				m_toolset_top_analysis_button2.onclick = function(){
//					self._globe.deactivateAllState();
//					//可视域分析
//					self._globe.viewshed.drawHandler();
//				};
//				m_toolset_top.appendChild(m_toolset_top_analysis_button2);
//				var m_toolset_top_analysis_button3 = document.createElement("button");
//				m_toolset_top_analysis_button3.setAttribute("class", "cesium-button");
//				m_toolset_top_analysis_button3.innerHTML = "清除";
//				m_toolset_top_analysis_button3.onclick = function(){
//					self._globe.sightAnalyse.clear();
//					//可视域分析清除
//					self._globe.viewshed.clear();
//				};
//				m_toolset_top.appendChild(m_toolset_top_analysis_button3);
//				m_toolset_top.setAttribute("class", "cfglobe-toolset-top-show");
//			},300);
//		}else{
//			m_toolset_top.setAttribute("class", "cfglobe-toolset-top-hide");
//			self._toolsetSelect = "";
//			return;
//		}
//	}else if(m_id == "viewing"){
//		//目标观测
//		var sceneMode = self._viewer.scene.mode;
//		if(sceneMode != Cesium.SceneMode.SCENE3D){
//			alert("2D状态下不支持此功能！");
//			return;
//		}
//		if(self._toolsetSelect != "viewing"){
//			self._globe.deactivateAllState();
//			m_toolset_top.innerHTML = "";
//			m_toolset_top.setAttribute("class", "cfglobe-toolset-top-hide");
//			setTimeout(function(){
//				var m_toolset_top_path_button1 = document.createElement("button");
//				m_toolset_top_path_button1.setAttribute("class", "cesium-button");
//				m_toolset_top_path_button1.innerHTML = "环绕观测";
//				m_toolset_top_path_button1.onclick = function(){
//					var cameraObj = self._viewer.scene.globe.ellipsoid.cartesianToCartographic(self._viewer.scene.camera.position);
//					var lon = CommonFunc.deg(cameraObj.longitude);
//					var lat = CommonFunc.deg(cameraObj.latitude);
//					var alt = cameraObj.height;
//					var heading = CommonFunc.deg(self._viewer.scene.camera.heading);
//					var pitch = CommonFunc.deg(self._viewer.scene.camera.pitch);
//					var roll = CommonFunc.deg(self._viewer.scene.camera.roll);
//					var options = {lon:lon, lat:lat, alt:alt, horizontal:heading, pitch:pitch, dist:1000000, callback:function(point){
//						if(point){
//							var dist = CommonFunc.getDistance(point.lon,point.lat,lon,lat);
//							var pointList = [];
//							for(var i = 0; i <= 720; i++){
//								var endpoint = CommonFunc.destinationVincenty(point.lon, point.lat, point.alt, heading+i*0.5+180, 0, dist);
//								pointList[pointList.length] = {lon:endpoint.lon,lat:endpoint.lat,alt:alt,heading:heading+i*0.5, pitch:pitch};
//							}
//							self._rotatePoint = true;
//							self._rotateByPointList(pointList,0);
//						}else{
//							alert("未计算出观测点，或观测点距离超过1000公里。请调整位置再试一次！");
//						}
//					}};
//					self._globe.sightAnalyse.getIntersectionByAngle(options);
//				};
//				m_toolset_top.appendChild(m_toolset_top_path_button1);
//				var m_toolset_top_path_button2 = document.createElement("button");
//				m_toolset_top_path_button2.setAttribute("class", "cesium-button");
//				m_toolset_top_path_button2.innerHTML = "椭圆观测";
//				m_toolset_top_path_button2.onclick = function(){
//					var cameraObj = self._viewer.scene.globe.ellipsoid.cartesianToCartographic(self._viewer.scene.camera.position);
//					var lon = CommonFunc.deg(cameraObj.longitude);
//					var lat = CommonFunc.deg(cameraObj.latitude);
//					var alt = cameraObj.height;
//					var heading = CommonFunc.deg(self._viewer.scene.camera.heading);
//					var pitch = CommonFunc.deg(self._viewer.scene.camera.pitch);
//					var roll = CommonFunc.deg(self._viewer.scene.camera.roll);
//					var options = {lon:lon, lat:lat, alt:alt, horizontal:heading, pitch:pitch, dist:1000000, callback:function(point){
//						if(point){
//							var dist = CommonFunc.getDistance(point.lon,point.lat,lon,lat);
//							var pointList = [];
//							var a=dist,b=dist*0.5;
//					        for (var i = 0; i <= 720; i++) {
//					        	var hudu=(Math.PI/180)*i*0.5;
//					        	var rr = (a*a*b*b)/(a*a*Math.sin(hudu)*Math.sin(hudu) + b*b*Math.cos(hudu)*Math.cos(hudu));
//					        	var r = Math.sqrt(rr);
//					        	var endpoint = CommonFunc.destinationVincenty(point.lon, point.lat, point.alt, heading+i*0.5+180, 0, r);
//					        	pointList[pointList.length] = {lon:endpoint.lon,lat:endpoint.lat,alt:alt,heading:heading+i*0.5, pitch:pitch};
//					        };
//					        self._rotatePoint = true;
//							self._rotateByPointList(pointList,0);
//						}else{
//							alert("未计算出观测点，或观测点距离超过1000公里。请调整位置再试一次！");
//						}
//					}};
//					self._globe.sightAnalyse.getIntersectionByAngle(options);
//				};
//				m_toolset_top.appendChild(m_toolset_top_path_button2);
//				m_toolset_top.setAttribute("class", "cfglobe-toolset-top-show");
//			},300);
//		}else{
//			m_toolset_top.setAttribute("class", "cfglobe-toolset-top-hide");
//			self._toolsetSelect = "";
//			return;
//		}
//	}else if(m_id == "path"){
//		//路径分析
//		if(self._toolsetSelect != "path"){
//			self._globe.deactivateAllState();
//			m_toolset_top.innerHTML = "";
//			m_toolset_top.setAttribute("class", "cfglobe-toolset-top-hide");
//			setTimeout(function(){
//				var m_toolset_top_path_button1 = document.createElement("button");
//				m_toolset_top_path_button1.setAttribute("class", "cesium-button");
//				m_toolset_top_path_button1.innerHTML = "选取起始点";
//				m_toolset_top_path_button1.onclick = function(){
//					self._globe.pathAnalyse.selectSpoint();
//				};
//				m_toolset_top.appendChild(m_toolset_top_path_button1);
//				var m_toolset_top_path_button2 = document.createElement("button");
//				m_toolset_top_path_button2.setAttribute("class", "cesium-button");
//				m_toolset_top_path_button2.innerHTML = "选取经过点";
//				m_toolset_top_path_button2.onclick = function(){
//					self._globe.pathAnalyse.selectTpoint();
//				};
//				m_toolset_top.appendChild(m_toolset_top_path_button2);
//				var m_toolset_top_path_button3 = document.createElement("button");
//				m_toolset_top_path_button3.setAttribute("class", "cesium-button");
//				m_toolset_top_path_button3.innerHTML = "选取目标点";
//				m_toolset_top_path_button3.onclick = function(){
//					self._globe.pathAnalyse.selectEpoint();
//				};
//				m_toolset_top.appendChild(m_toolset_top_path_button3);
//				var m_toolset_top_path_button4 = document.createElement("button");
//				m_toolset_top_path_button4.setAttribute("class", "cesium-button");
//				m_toolset_top_path_button4.innerHTML = "清除";
//				m_toolset_top_path_button4.onclick = function(){
//					self._globe.pathAnalyse.clear();
//				};
//				m_toolset_top.appendChild(m_toolset_top_path_button4);
//				m_toolset_top.setAttribute("class", "cfglobe-toolset-top-show");
//			},300);
//		}else{
//			m_toolset_top.setAttribute("class", "cfglobe-toolset-top-hide");
//			self._toolsetSelect = "";
//			return;
//		}
//	}else if(m_id == "shp"){
//		//导入shp
//		if(self._toolsetSelect != "shp"){
//			self._globe.deactivateAllState();
//			m_toolset_top.innerHTML = "";
//			m_toolset_top.setAttribute("class", "cfglobe-toolset-top-hide");
//			setTimeout(function(){
//				var m_toolset_top_ys = document.createElement("span");
//				m_toolset_top_ys.innerHTML = "颜色：";
//				m_toolset_top.appendChild(m_toolset_top_ys);
//				var m_toolset_top_ys_select = document.createElement("select");
//				m_toolset_top_ys_select.setAttribute("id", "cfglobe_toolset_top_ys_select");
//				var m_toolset_top_ys_option1 = document.createElement("option");
//				m_toolset_top_ys_option1.setAttribute("value", "RED");
//				m_toolset_top_ys_option1.innerHTML = "RED";
//				m_toolset_top_ys_select.appendChild(m_toolset_top_ys_option1);
//				var m_toolset_top_ys_option2 = document.createElement("option");
//				m_toolset_top_ys_option2.setAttribute("value", "YELLOW");
//				m_toolset_top_ys_option2.innerHTML = "YELLOW";
//				m_toolset_top_ys_select.appendChild(m_toolset_top_ys_option2);
//				var m_toolset_top_ys_option3 = document.createElement("option");
//				m_toolset_top_ys_option3.setAttribute("value", "GREEN");
//				m_toolset_top_ys_option3.innerHTML = "GREEN";
//				m_toolset_top_ys_select.appendChild(m_toolset_top_ys_option3);
//				m_toolset_top.appendChild(m_toolset_top_ys_select);
//				var m_toolset_top_xk = document.createElement("span");
//				m_toolset_top_xk.innerHTML = "线宽：";
//				m_toolset_top.appendChild(m_toolset_top_xk);
//				var m_toolset_top_xk_select = document.createElement("select");
//				m_toolset_top_xk_select.setAttribute("id", "cfglobe_toolset_top_xk_select");
//				var m_toolset_top_xk_option1 = document.createElement("option");
//				m_toolset_top_xk_option1.setAttribute("value", "50");
//				m_toolset_top_xk_option1.innerHTML = "50";
//				m_toolset_top_xk_select.appendChild(m_toolset_top_xk_option1);
//				var m_toolset_top_xk_option2 = document.createElement("option");
//				m_toolset_top_xk_option2.setAttribute("value", "100");
//				m_toolset_top_xk_option2.innerHTML = "100";
//				m_toolset_top_xk_select.appendChild(m_toolset_top_xk_option2);
//				var m_toolset_top_xk_option3 = document.createElement("option");
//				m_toolset_top_xk_option3.setAttribute("value", "200");
//				m_toolset_top_xk_option3.innerHTML = "200";
//				m_toolset_top_xk_select.appendChild(m_toolset_top_xk_option3);
//				var m_toolset_top_xk_option4 = document.createElement("option");
//				m_toolset_top_xk_option4.setAttribute("value", "500");
//				m_toolset_top_xk_option4.innerHTML = "500";
//				m_toolset_top_xk_select.appendChild(m_toolset_top_xk_option4);
//				m_toolset_top.appendChild(m_toolset_top_xk_select);
//				var m_toolset_top_xs = document.createElement("span");
//				m_toolset_top_xs.innerHTML = "线色：";
//				m_toolset_top.appendChild(m_toolset_top_xs);
//				var m_toolset_top_xs_select = document.createElement("select");
//				m_toolset_top_xs_select.setAttribute("id", "cfglobe_toolset_top_xs_select");
//				var m_toolset_top_xs_option1 = document.createElement("option");
//				m_toolset_top_xs_option1.setAttribute("value", "RED");
//				m_toolset_top_xs_option1.innerHTML = "RED";
//				m_toolset_top_xs_select.appendChild(m_toolset_top_xs_option1);
//				var m_toolset_top_xs_option2 = document.createElement("option");
//				m_toolset_top_xs_option2.setAttribute("value", "YELLOW");
//				m_toolset_top_xs_option2.innerHTML = "YELLOW";
//				m_toolset_top_xs_select.appendChild(m_toolset_top_xs_option2);
//				var m_toolset_top_xs_option3 = document.createElement("option");
//				m_toolset_top_xs_option3.setAttribute("value", "GREEN");
//				m_toolset_top_xs_option3.innerHTML = "GREEN";
//				m_toolset_top_xs_select.appendChild(m_toolset_top_xs_option3);
//				m_toolset_top.appendChild(m_toolset_top_xs_select);
//				var m_toolset_top_file = document.createElement("input");
//				m_toolset_top_file.setAttribute("id", "cfglobe_toolset_top_shp_file");
//				m_toolset_top_file.setAttribute("type", "file");
//				m_toolset_top_file.setAttribute("style", "display: inline; width: 250px; background-color: white;");
//				m_toolset_top.appendChild(m_toolset_top_file);
//				var m_toolset_top_shp_button1 = document.createElement("button");
//				m_toolset_top_shp_button1.setAttribute("class", "cesium-button");
//				m_toolset_top_shp_button1.innerHTML = "加载";
//				m_toolset_top_shp_button1.onclick = function(){
//					var m_color = Cesium.Color.RED;
//					var m_lineColor = Cesium.Color.RED;
//					var color = $("#cfglobe_toolset_top_ys_select").val();
//					var lineWidth = $("#cfglobe_toolset_top_xk_select").val();
//					var lineColor = $("#cfglobe_toolset_top_xs_select").val();
//					if(color == "RED"){
//						m_color = Cesium.Color.RED;
//					}else if(color == "YELLOW"){
//						m_color = Cesium.Color.YELLOW;
//					}else if(color == "GREEN"){
//						m_color = Cesium.Color.GREEN;
//					}
//					if(m_lineColor == "RED"){
//						m_lineColor = Cesium.Color.RED;
//					}else if(m_lineColor == "YELLOW"){
//						m_lineColor = Cesium.Color.YELLOW;
//					}else if(m_lineColor == "GREEN"){
//						m_lineColor = Cesium.Color.GREEN;
//					}
//					myglobe.shpParser.add("cfglobe_toolset_top_shp_file",{callback:self._shpCallback,lineWidth:lineWidth,color:m_color,lineColor:m_lineColor});
//				};
//				m_toolset_top.appendChild(m_toolset_top_shp_button1);
//				var m_toolset_top_shp_list = document.createElement("div");
//				m_toolset_top_shp_list.setAttribute("id", "cfglobe_toolset_top_shp_list");
//				m_toolset_top.appendChild(m_toolset_top_shp_list);
//				m_toolset_top.setAttribute("class", "cfglobe-toolset-top-show");
//			},300);
//		}else{
//			m_toolset_top.setAttribute("class", "cfglobe-toolset-top-hide");
//			self._toolsetSelect = "";
//			return;
//		}
//	}else if(m_id == "csv"){
//		//地图编辑
//		if(self._toolsetSelect != "csv"){
//			self._globe.deactivateAllState();
//			m_toolset_top.innerHTML = "";
//			m_toolset_top.setAttribute("class", "cfglobe-toolset-top-hide");
//			setTimeout(function(){
//				var m_toolset_top_jd = document.createElement("span");
//				m_toolset_top_jd.innerHTML = "经度：";
//				m_toolset_top.appendChild(m_toolset_top_jd);
//				var m_toolset_top_jd_input = document.createElement("input");
//				m_toolset_top_jd_input.setAttribute("id", "cfglobe_toolset_top_jd_input");
//				m_toolset_top_jd_input.setAttribute("value", "128.0613");
//				m_toolset_top.appendChild(m_toolset_top_jd_input);
//				var m_toolset_top_wd = document.createElement("span");
//				m_toolset_top_wd.innerHTML = "纬度：";
//				m_toolset_top.appendChild(m_toolset_top_wd);
//				var m_toolset_top_wd_input = document.createElement("input");
//				m_toolset_top_wd_input.setAttribute("id", "cfglobe_toolset_top_wd_input");
//				m_toolset_top_wd_input.setAttribute("value", "42.0037");
//				m_toolset_top.appendChild(m_toolset_top_wd_input);
//				var m_toolset_top_label = document.createElement("span");
//				m_toolset_top_label.innerHTML = "label：";
//				m_toolset_top.appendChild(m_toolset_top_label);
//				var m_toolset_top_label_input = document.createElement("input");
//				m_toolset_top_label_input.setAttribute("id", "cfglobe_toolset_top_label_input");
//				m_toolset_top_label_input.setAttribute("value", "1212");
//				m_toolset_top.appendChild(m_toolset_top_label_input);
//				var m_toolset_top_csv_button2 = document.createElement("button");
//				m_toolset_top_csv_button2.setAttribute("class", "cesium-button");
//				m_toolset_top_csv_button2.innerHTML = "经纬度添加";
//				m_toolset_top_csv_button2.onclick = function(){
//					var m_lon = parseFloat(document.getElementById("cfglobe_toolset_top_jd_input").value);
//					var m_lat = parseFloat(document.getElementById("cfglobe_toolset_top_wd_input").value);
//					var m_label = parseFloat(document.getElementById("cfglobe_toolset_top_label_input").value);
//					self._addCsv(m_lon,m_lat,m_label);
//				};
//				m_toolset_top.appendChild(m_toolset_top_csv_button2);
//				var m_toolset_top_csv_button3 = document.createElement("button");
//				m_toolset_top_csv_button3.setAttribute("class", "cesium-button");
//				m_toolset_top_csv_button3.innerHTML = "点击添加";
//				m_toolset_top_csv_button3.onclick = function(){
//					var m_label = parseFloat(document.getElementById("cfglobe_toolset_top_label_input").value);
//					self._csvLabel = m_label;
//					self._csvDraw = true;
//					self._showMenu = self._globe.globeMenu._showMenu;
//					self._globe.globeMenu.setType(false);
//				};
//				m_toolset_top.appendChild(m_toolset_top_csv_button3);
//				var m_toolset_top_br = document.createElement("br");
//				m_toolset_top.appendChild(m_toolset_top_br);
//				var m_toolset_top_file = document.createElement("input");
//				m_toolset_top_file.setAttribute("id", "cfglobe_toolset_top_csv_file");
//				m_toolset_top_file.setAttribute("type", "file");
//				m_toolset_top_file.setAttribute("style", "display: inline; width: 250px; background-color: white;");
//				m_toolset_top.appendChild(m_toolset_top_file);
//				var m_toolset_top_csv_button1 = document.createElement("button");
//				m_toolset_top_csv_button1.setAttribute("class", "cesium-button");
//				m_toolset_top_csv_button1.innerHTML = "导入csv";
//				m_toolset_top_csv_button1.onclick = function(){
//					var name,url;
//					var files=document.getElementById("cfglobe_toolset_top_csv_file");
//　　					var file=files.files;//每一个file对象对应一个文件。
//					if(file && file.length>0){
//						name = file[0].name;//获取本地文件系统的文件名。
//						var fileType = name.split(".")[1];
//						if(fileType != "csv"){
//							alert("文件格式错误");
//							return;
//						}
//						url = window.URL.createObjectURL(file[0]);
//						$.ajax({
//							url: url,
//							dataType: 'text',
//						}).done(function(data){
//							var allRows = data.split(/\r?\n|\r/);
//							for(var i = 0; i < allRows.length; i++){
//								if(allRows[i] && allRows[i].split(",").length == 3){
//									var m_infoList = allRows[i].split(",");
//									var m_lon = m_infoList[0];
//									var m_lat = m_infoList[1];
//									var m_label = m_infoList[2];
//									self._addCsv(m_lon,m_lat,m_label);
//								}
//							}
//						});
//					}else{
//						alert("文件选择错误");
//						return;
//					}
//				};
//				m_toolset_top.appendChild(m_toolset_top_csv_button1);
//				var m_toolset_top_csv_button4 = document.createElement("button");
//				m_toolset_top_csv_button4.setAttribute("class", "cesium-button");
//				m_toolset_top_csv_button4.innerHTML = "清除";
//				m_toolset_top_csv_button4.onclick = function(){
//					self._globe.globeMenu.setType(self._showMenu);
//					self._clearCsv();
//				};
//				m_toolset_top.appendChild(m_toolset_top_csv_button4);
//				m_toolset_top.setAttribute("class", "cfglobe-toolset-top-show");
//			},300);
//		}else{
//			m_toolset_top.setAttribute("class", "cfglobe-toolset-top-hide");
//			self._toolsetSelect = "";
//			return;
//		}
//	}
//	self._toolsetSelect = m_id;
//}
//
///*
// * 加载csv点
// * @author zhaoxd
// * @method _addCsv
// * @for Toolset
// * @param {float} lon：经度
// * @param {float} lat：纬度
// * @param {string} label：标识文字
// * @return {null} null
// */
//Toolset.prototype._addCsv = function(lon,lat,label){
//	var self = this;
//	var pinBuilder = new Cesium.PinBuilder();
//	var color = Cesium.Color.RED;
//	var options = {lon:lon,lat:lat,color:color,label:label.toString()};
//	var mark = self._globe.placeMark.add(options);
//	self._csvList.push(mark);
//}
//
///*
// * 清除csv点
// * @author zhaoxd
// * @method _clearCsv
// * @for Toolset
// * @param {null} null
// * @return {null} null
// */
//Toolset.prototype._clearCsv = function(){
//	var self = this;
//	self._csvLabel = "";
//	self._csvDraw = false;
//	var back = true;
//	for(var i = self._csvList.length - 1; i >= 0; i--){
//		back = self._globe.placeMark.remove(self._csvList[i]);
//		if(back){
//			self._csvList.splice(i, 1);
//		}else{
//			return back;
//		}
//	}
//}
//
///*
// * 加载shp文件回调事件
// * @author zhaoxd
// * @method _shpCallback
// * @for Toolset
// * @param {string} lid：shp对象的lid，如果返回"error"表示加载错误
// * @param {string} name：shp对象的name
// * @param {Object} res：shp对象内容
// * @return {null} null
// */
//Toolset.prototype._shpCallback = function(lid,name,res){
//	if(lid == "error"){
//		alert(name);
//		return;
//	}
//	var m_shp_div_list = document.getElementById("cfglobe_toolset_top_shp_list");
//	var m_shp_div_info = document.createElement("div");
//	m_shp_div_info.setAttribute("id", "cfglobe_toolset_top_shp_info_" + lid);
//	m_shp_div_info.setAttribute("class", "cfglobe-toolset-top-shp-div");
//	var m_shp_span = document.createElement("span");
//	m_shp_span.innerHTML = name;
//	m_shp_div_info.appendChild(m_shp_span);
//	var m_shp_button = document.createElement("button");
//	m_shp_button.innerHTML = "删除";
//	m_shp_button.onclick = function(){
//		myglobe.shpParser.removeByLid(lid);
//		var thisNode = document.getElementById("cfglobe_toolset_top_shp_info_" + lid);
//		thisNode.parentNode.removeChild(thisNode);
//	};
//	m_shp_div_info.appendChild(m_shp_button);
//	m_shp_div_list.appendChild(m_shp_div_info);
//	
//}
//
///*
// * 地名查询回调事件     cfglobe_toolset_top_address_list   address
// * @author zhaoxd
// * @method _addressCallback
// * @for Toolset
// * @param {null} null
// * @return {null} null
// */
//Toolset.prototype._addressCallback = function(addressList){
//	var self = this;
//	var m_address_div_list = document.getElementById("cfglobe_toolset_top_address_list");
//	m_address_div_list.setAttribute("style", "font-size: 15px;height: 300px;overflow-y: auto;");
//	m_address_div_list.innerHTML = "";
//	if(addressList.length == 0){
//		var m_address_div_info = document.createElement("div");
//		m_address_div_info.setAttribute("class", "cfglobe-toolset-top-shp-div");
//		m_address_div_info.innerHTML = "查询无结果,请重新设置查询条件!";
//		m_address_div_list.appendChild(m_address_div_info);
//	}
//	for(var i = 0; i < addressList.length; i++){
//		(function(i){
//			var m_address_div_info = document.createElement("div");
//			m_address_div_info.setAttribute("id", "cfglobe_toolset_top_address_info_" + addressList[i].id);
//			m_address_div_info.setAttribute("class", "cfglobe-toolset-top-shp-div");
//			m_address_div_info.setAttribute("style", "margin-top:0;");
//			var m_address_span = document.createElement("span");
//			m_address_span.innerHTML = addressList[i].name;
//			m_address_div_info.appendChild(m_address_span);
//			var m_address_button = document.createElement("button");
//			m_address_button.setAttribute("id", "cfglobe_toolset_top_address_button_" + addressList[i].id);
//			m_address_button.innerHTML = "定位";
//			m_address_button.onclick = function(){
//				var lon = addressList[i].lon;
//				var lat = addressList[i].lat;
//				var alt = 5000;
//				self._globe.flyTo({lon:lon,lat:lat,alt:alt});
//			};
//			m_address_div_info.appendChild(m_address_button);
//			m_address_div_list.appendChild(m_address_div_info);
//		})(i);
//	}
//}
//
///*
// * 清除地名查询结果
// * @author zhaoxd
// * @method _clearAddressList
// * @for Toolset
// * @param {null} null
// * @return {null} null
// */
//Toolset.prototype._clearAddressList = function() { 
//	var self = this;
//  var m_address_div_list = document.getElementById("cfglobe_toolset_top_address_list");
//  if(m_address_div_list){
//  	m_address_div_list.setAttribute("style", "height: 0;");
//		m_address_div_list.innerHTML = "";
//  }
//	for(var i = self._address_list.length - 1; i >= 0; i--){
//		self._viewer.entities.remove(self._address_list[i]);
//		self._address_list.splice(i, 1);
//	}
//}
//
///*
// * 根据点集合观测
// * @author zhaoxd
// * @method _rotateByPointList
// * @for Toolset
// * @param {list} pointList：点集合
// * @param {int} i：点索引
// * @return {null} null
// */
//Toolset.prototype._rotateByPointList = function(pointList,i){
//	var self = this;
//	if(self._rotatePoint){
//		if(i == pointList.length){
//			i = 0;
//		}
//		var options = {lon:pointList[i].lon, lat:pointList[i].lat, alt:pointList[i].alt, heading:pointList[i].heading, pitch:pointList[i].pitch, roll:0};
//		self._globe.setView(options);
//		setTimeout(function(){
//			self._rotateByPointList(pointList,i+1);
//		},10);
//	}
//}
//
///*
// * 清除状态
// * @author zhaoxd
// * @method clearToolsetSubset
// * @for Toolset
// * @param {null} null
// * @return {null} null
// */
//Toolset.prototype.clearToolsetSubset = function(){
//	var self = this;
//	self._globe.deactivateAllState();
//	//快速定位
//	if(self._location_pos){
//  	self._viewer.entities.remove(self._location_pos);
//	}
//	//基础量算
//	self._globe.basicMeasure.removeMeasureDis();
//	self._globe.basicMeasure.removeMeasureArea();
//	self._globe.basicMeasure.removeMeasureHeight();
//	//通视分析
//	self._globe.sightAnalyse.clear();
//	//两点角度
//	self._globe.angleAnalyse.clear();
//	//路径分析
//	self._globe.pathAnalyse.clear();
//	//可视域分析清除
//	self._globe.viewshed.clear();
//	//地名查询清除
//	self._clearAddressList();
//}
//
///**
// * 定位
// * @author lijy
// * @method location
// * @for Toolset
// * @param {float} lon 经度
// * @param {float} lat 纬度
// * @return {null} null
// */
//Toolset.prototype.location = function(lon,lat){
//	var self = this;
//	var pinBuilder = new Cesium.PinBuilder();
//	var position = Cesium.Cartesian3.fromDegrees(lon, lat);
//	self._location_pos = self._viewer.entities.add({
//	    position : position,
//	    billboard : {
////	        image : pinBuilder.fromColor(Cesium.Color.ROYALBLUE, 48).toDataURL(),
//	        image : self._globe.urlConfig.PUSHPIN_YELLOW,
//	        width : 30,
//	        height : 30,
//	        verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
//	        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
//	    }
//	});
//	var options = {lon:lon, lat:lat, alt:10000, horizontal:0, pitch:-90, dist:0, callback:null};
//	self._globe.flyTo(options);
//}
//
///*
// * 获取中心点
// * @author zhaoxd
// * @method _getCenter
// * @for Toolset
// * @param {null} null
// * @return {null} null
// */
//Toolset.prototype._getCenter = function(){
//	var self = this;
//	// 范围对象
//  var extent = {};
//  
//  // 得到当前三维场景
//  var scene = self._viewer.scene;
//  
//  // 得到当前三维场景的椭球体
//  var ellipsoid = scene.globe.ellipsoid;
//  var canvas = scene.canvas;
//  
//  var ray = self._viewer.camera.getPickRay(new Cesium.Cartesian2(canvas.width/2,canvas.height/2));
//  var xyz = scene.globe.pick(ray,scene);
//  var cartographic = Cesium.Cartographic.fromCartesian(xyz);
//	var longitude = Cesium.Math.toDegrees(cartographic.longitude);
//	var latitude = Cesium.Math.toDegrees(cartographic.latitude);
//	var height = cartographic.height;
//	var lonlat = {lon:longitude,lat:latitude,alt:height};
//  
//  return lonlat;
//}
//
//return Toolset;
//})