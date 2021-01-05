/*
* author: 赵雪丹
* description: LayerManager-图层管理
* day: 2017-9-28
*/
define( [], function(){
function LayerManager(globe){
	var self = this;
	this._globe = globe;
	this._viewer = globe._viewer;
	this._globeId = globe._globeId;
	this._layer_manager_bottom;
	this._layer_manager_top;
	this._layerManager = [{id:"entityLayer",title:"标绘图层",subset:[]},{id:"shpLayer",title:"SHP图层",subset:[]},{id:"globeLayer",title:"影像图层",subset:[]},{id:"vectorLayer",title:"业务图层",subset:[]}];
	if(!this._globe._showBottomInfo){
		return;
	}
	this._loadLayerManager();
    //私有渲染事件-实时修改LayerManager位置
	this._viewer.scene.postRender.addEventListener(function(){
		var h_w = self._viewer._lastHeight;
		var h_n = self._viewer.scene.canvas.height;
		var h = h_w-h_n;
		if(self._layer_manager_bottom){
			self._layer_manager_bottom.setAttribute("style", "bottom: " + h + "px;");
		}
		if(self._layer_manager_top){
			self._layer_manager_top.setAttribute("style", "bottom: " + (h+27) + "px;");
		}
	});
	var _handler = new Cesium.ScreenSpaceEventHandler(self._viewer.scene.canvas);
	_handler.setInputAction(function(e){
		self._closeManager();
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
}

/*
 * 初始化图层管理器
 * @author zhaoxd
 * @method _loadLayerManager
 * @for LayerManager
 * @param {null} null
 * @return {null} null
 */
LayerManager.prototype._loadLayerManager = function(){
	var self = this;
	if(!self._globe._showBottomInfo){
		return;
	}
	self._layer_manager_bottom = document.createElement("div");
	self._layer_manager_bottom.setAttribute("class", "cfglobe-layer-manager-bottom");
	self._layer_manager_bottom.setAttribute("id", "cfglobe_layer_manager_bottom");
	self._layer_manager_bottom.innerHTML = "图层管理器  ▲";
	self._layer_manager_bottom.onclick = function(){
		self._showManager(this);
	};
	document.getElementById(self._globeId).getElementsByTagName("div")[0].appendChild(self._layer_manager_bottom);
	self._layer_manager_top = document.createElement("div");
	self._layer_manager_top.setAttribute("id", "cfglobe_layer_manager-top");
	self._layer_manager_top.setAttribute("class", "cfglobe-layer-manager-top-hide");
	document.getElementById(self._globeId).getElementsByTagName("div")[0].appendChild(self._layer_manager_top);
	var m_layer_manager_list = document.createElement("div");
	m_layer_manager_list.setAttribute("id", "cfglobe_layer_manager_list");
	m_layer_manager_list.setAttribute("class", "cfglobe-layer-manager-list");
	self._layer_manager_top.appendChild(m_layer_manager_list);
	for(var i = 0; i < self._layerManager.length; i++){
		var m_cfglobe_layer_info = document.createElement("div");
		m_cfglobe_layer_info.setAttribute("class", "cfglobe-layer-info");
		if(i == 0){
			m_cfglobe_layer_info.setAttribute("style", "border-top: 0;");
		}
		var m_cfglobe_layer_checkbox = document.createElement("input");
		m_cfglobe_layer_checkbox.setAttribute("type", "checkbox");
		m_cfglobe_layer_checkbox.setAttribute("id", "cfglobe_layer_checkbox_" + self._layerManager[i].id);
		m_cfglobe_layer_checkbox.onclick = function(){
			self._layerCheckManager(1,this);
		};
		m_cfglobe_layer_checkbox.checked = true;
//		m_cfglobe_layer_checkbox.setAttribute("checked", "true");
		m_cfglobe_layer_info.appendChild(m_cfglobe_layer_checkbox);
		var m_cfglobe_layer_title = document.createElement("span");
		m_cfglobe_layer_title.innerHTML = self._layerManager[i].title;
		m_cfglobe_layer_info.appendChild(m_cfglobe_layer_title);
		var m_cfglobe_layer_button = document.createElement("button");
		m_cfglobe_layer_button.setAttribute("id", "cfglobe_layer_button_" + self._layerManager[i].id);
		m_cfglobe_layer_button.innerHTML =  "▼";	//▲
		m_cfglobe_layer_button.onclick = function(){
			self._layerListManager(this);
		};
		m_cfglobe_layer_info.appendChild(m_cfglobe_layer_button);
		m_layer_manager_list.appendChild(m_cfglobe_layer_info);
		var cfglobe_layer_sub = document.createElement("div");
		cfglobe_layer_sub.setAttribute("id", "cfglobe_layer_" + self._layerManager[i].id);
		cfglobe_layer_sub.setAttribute("style", "display: none; padding-bottom: 10px;");
		
		m_layer_manager_list.appendChild(cfglobe_layer_sub);
	}
}

/*
 * 设置显隐
 * @author zhaoxd
 * @method _showManager
 * @for LayerManager
 * @param {Object} obj
 * @return {null} null
 */
LayerManager.prototype._showManager = function(obj){
	var self = this;
	if(!self._globe._showBottomInfo){
		return;
	}
	if(obj.innerHTML == "图层管理器  ▼"){
		document.getElementById("cfglobe_layer_manager-top").setAttribute("class", "cfglobe-layer-manager-top-hide");
		obj.innerHTML = "图层管理器  ▲";
	}else{
		document.getElementById("cfglobe_layer_manager-top").setAttribute("class", "cfglobe-layer-manager-top-show");
		obj.innerHTML = "图层管理器  ▼";
	}
}

/*
 * 关闭图层管理器
 * @author zhaoxd
 * @method _closeManager
 * @for LayerManager
 * @param {null} null
 * @return {null} null
 */
LayerManager.prototype._closeManager = function(){
	document.getElementById("cfglobe_layer_manager-top").setAttribute("class", "cfglobe-layer-manager-top-hide");
	document.getElementById("cfglobe_layer_manager_bottom").innerHTML = "图层管理器  ▲";
}

/*
 * 二级图层列表显隐控制
 * @author zhaoxd
 * @method _layerListManager
 * @for LayerManager
 * @param {object} button
 * @return {null} null
 */
LayerManager.prototype._layerListManager = function(obj){
	var self = this;
	if(!self._globe._showBottomInfo){
		return;
	}
	if(obj.innerHTML == "▼"){
		document.getElementById("cfglobe_layer_" + obj.id.replace("cfglobe_layer_button_","")).style.display = "block";
		obj.innerHTML = "▲";
	}else{
		document.getElementById("cfglobe_layer_" + obj.id.replace("cfglobe_layer_button_","")).style.display = "none";
		obj.innerHTML = "▼";
	}
}

/*
 * 增加图层数据
 * @author zhaoxd
 * @method _add
 * @for LayerManager
 * @param {string} flayer：父节点
 * @param {string} layer：标识
 * @param {string} title：标题
 * @return {null} null
 */
LayerManager.prototype._add = function(flayer,layer,title,subtitle,checked){
	var self = this;
	if(!self._globe._showBottomInfo){
		return;
	}
	var m_checked = true;
	if(typeof checked === 'boolean'){
		m_checked = checked;
	}
	if(flayer == "entityLayer"){
		var m_is_title = true;
		var m_is_subtitle = true;
		var m_flayer = "";
		for(var i = 0; i < self._layerManager[0].subset.length; i++){
			if(self._layerManager[0].subset[i].title == title){
				m_is_title = false;
				if(m_flayer == ""){
					m_flayer = self._layerManager[0].subset[i].fid;
				}
				if(self._layerManager[0].subset[i].subtitle == subtitle){
					m_is_subtitle = false;
				}
			}
		}
		if(m_is_title || m_is_subtitle){
			if(m_flayer == ""){
				m_flayer = layer;
			}
			var m_sub = {layer:layer,title:title,subtitle:subtitle,fid:m_flayer};
			self._layerManager[0].subset[self._layerManager[0].subset.length] = m_sub;
		}
//		if(m_is_title || m_is_subtitle){
//			var m_sub = {layer:layer,title:title,subtitle:subtitle};
//			self._layerManager[0].subset[self._layerManager[0].subset.length] = m_sub;
//		}
		if(m_is_title){
			var cfglobe_layer_sub = document.getElementById("cfglobe_layer_" + flayer);
			var cfglobe_layer_sub_list = document.createElement("div");
			cfglobe_layer_sub_list.setAttribute("class", "cfglobe-layer-list");
			cfglobe_layer_sub_list.setAttribute("id", "cfglobe_layer_div_" + flayer + "splitLayer" + layer);
			var m_cfglobe_layer_sub_checkbox = document.createElement("input");
			m_cfglobe_layer_sub_checkbox.setAttribute("type", "checkbox");
//			m_cfglobe_layer_sub_checkbox.checked = checked;
			m_cfglobe_layer_sub_checkbox.setAttribute("id", "cfglobe_layer_checkbox_" + flayer + "splitLayer" + layer);
			m_cfglobe_layer_sub_checkbox.onclick = function(){
				self._layerCheckManager(2,this);
			};
			m_cfglobe_layer_sub_checkbox.setAttribute("checked", "true");
			cfglobe_layer_sub_list.appendChild(m_cfglobe_layer_sub_checkbox);
			var m_cfglobe_layer_sub_title = document.createElement("span");
			m_cfglobe_layer_sub_title.innerHTML = title;
			cfglobe_layer_sub_list.appendChild(m_cfglobe_layer_sub_title);
//			if(m_is_subtitle){
				var cfglobe_layer_sub_catalog_list = document.createElement("div");
				cfglobe_layer_sub_catalog_list.setAttribute("class", "cfglobe-layer-list-catalog");
				var m_cfglobe_layer_sub_catalog_checkbox = document.createElement("input");
				m_cfglobe_layer_sub_catalog_checkbox.setAttribute("type", "checkbox");
//				m_cfglobe_layer_sub_catalog_checkbox.checked = checked;
				m_cfglobe_layer_sub_catalog_checkbox.setAttribute("id", "cfglobe_layer_checkbox_" + flayer + "splitSubLayer" + layer);
				m_cfglobe_layer_sub_catalog_checkbox.onclick = function(){
					self._layerCheckManager(3,this);
				};
				m_cfglobe_layer_sub_catalog_checkbox.setAttribute("checked", "true");
				cfglobe_layer_sub_catalog_list.appendChild(m_cfglobe_layer_sub_catalog_checkbox);
				var m_cfglobe_layer_sub_catalog_title = document.createElement("span");
				m_cfglobe_layer_sub_catalog_title.setAttribute("id", "cfglobe_layer_span_" + flayer + "splitLayer" + layer);
				m_cfglobe_layer_sub_catalog_title.innerHTML = subtitle;
				m_cfglobe_layer_sub_catalog_title.onclick = function(){
					self._layerSelectManager(this);
				};
				cfglobe_layer_sub_catalog_list.appendChild(m_cfglobe_layer_sub_catalog_title);
				cfglobe_layer_sub_list.appendChild(cfglobe_layer_sub_catalog_list);
//			}
			cfglobe_layer_sub.appendChild(cfglobe_layer_sub_list);
			var fcheckbox = document.getElementById("cfglobe_layer_checkbox_" + flayer);
			fcheckbox.checked = true;
		}else if(m_is_subtitle){
			var cfglobe_layer_sub_catalog_list = document.createElement("div");
			cfglobe_layer_sub_catalog_list.setAttribute("class", "cfglobe-layer-list-catalog");
			var m_cfglobe_layer_sub_catalog_checkbox = document.createElement("input");
			m_cfglobe_layer_sub_catalog_checkbox.setAttribute("type", "checkbox");
//			m_cfglobe_layer_sub_catalog_checkbox.checked = checked;
			m_cfglobe_layer_sub_catalog_checkbox.setAttribute("id", "cfglobe_layer_checkbox_" + flayer + "splitSubLayer" + layer);
			m_cfglobe_layer_sub_catalog_checkbox.onclick = function(){
				self._layerCheckManager(3,this);
			};
			m_cfglobe_layer_sub_catalog_checkbox.setAttribute("checked", "true");
			cfglobe_layer_sub_catalog_list.appendChild(m_cfglobe_layer_sub_catalog_checkbox);
			var m_cfglobe_layer_sub_catalog_title = document.createElement("span");
			m_cfglobe_layer_sub_catalog_title.setAttribute("id", "cfglobe_layer_span_" + flayer + "splitLayer" + layer);
			m_cfglobe_layer_sub_catalog_title.innerHTML = subtitle;
			m_cfglobe_layer_sub_catalog_title.onclick = function(){
				self._layerSelectManager(this);
			};
			cfglobe_layer_sub_catalog_list.appendChild(m_cfglobe_layer_sub_catalog_title);
			var cfglobe_layer_sub_list = document.getElementById("cfglobe_layer_div_" + flayer + "splitLayer" + m_flayer);
			cfglobe_layer_sub_list.appendChild(cfglobe_layer_sub_catalog_list);
		}
	}else{
		var m_sub = {layer:layer,title:title};
		if(flayer == "globeLayer"){
			self._layerManager[2].subset[self._layerManager[2].subset.length] = m_sub;
		}else if(flayer == "vectorLayer"){
			self._layerManager[3].subset[self._layerManager[3].subset.length] = m_sub;
		}else if(flayer == "shpLayer"){
			self._layerManager[1].subset[self._layerManager[1].subset.length] = m_sub;
		}
		var cfglobe_layer_sub = document.getElementById("cfglobe_layer_" + flayer);
		var cfglobe_layer_sub_list = document.createElement("div");
		cfglobe_layer_sub_list.setAttribute("class", "cfglobe-layer-list");
		var m_cfglobe_layer_sub_checkbox = document.createElement("input");
		m_cfglobe_layer_sub_checkbox.setAttribute("type", "checkbox");
		m_cfglobe_layer_sub_checkbox.checked = m_checked;
		m_cfglobe_layer_sub_checkbox.setAttribute("id", "cfglobe_layer_checkbox_" + flayer + "splitLayer" + layer);
		m_cfglobe_layer_sub_checkbox.onclick = function(){
			self._layerCheckManager(2,this);
		};
//		m_cfglobe_layer_sub_checkbox.setAttribute("checked", "true");
		cfglobe_layer_sub_list.appendChild(m_cfglobe_layer_sub_checkbox);
		var m_cfglobe_layer_sub_title = document.createElement("span");
		m_cfglobe_layer_sub_title.innerHTML = title;
		cfglobe_layer_sub_list.appendChild(m_cfglobe_layer_sub_title);
		cfglobe_layer_sub.appendChild(cfglobe_layer_sub_list);
		var fcheckbox = document.getElementById("cfglobe_layer_checkbox_" + flayer);
		fcheckbox.checked = true;
	}
}

/*
 * 图层显隐控制
 * @author zhaoxd
 * @method _layerCheckManager
 * @for LayerManager
 * @param {int} 层级
 * @param {object} checkbox
 * @return {null} null
 */
LayerManager.prototype._layerCheckManager = function(nun,obj){
	var self = this;
	if(!self._globe._showBottomInfo){
		return;
	}
	var checked = obj.checked;
	if(nun == "1"){
		var flayer = obj.id.replace("cfglobe_layer_checkbox_","");
		var divList = document.getElementById("cfglobe_layer_" + flayer).getElementsByTagName("div");
		for(var i = 0; i < divList.length; i++){
			var m_check = divList[i].getElementsByTagName("input")[0];
			m_check.checked = checked;
		}
		if(flayer == "globeLayer"){
			var m_globeLayer = self._globe.globeLayer._layerList;
			for(var i = 0; i < m_globeLayer.length; i++){
				m_globeLayer[i].show = checked;
			}
		}else if(flayer == "vectorLayer"){
			var m_vectorLayer = self._globe.globeLayer._vectorLayerList;
			for(var i = 0; i < m_vectorLayer.length; i++){
				m_vectorLayer[i].show = checked;
			}
		}else if(flayer == "shpLayer"){
			var m_shpLayer = self._globe.shpParser._layer;
			for(var i = 0; i < m_shpLayer.length; i++){
				m_shpLayer[i].show = checked;
			}
		}else if(flayer == "entityLayer"){
			for(var i = 0; i < self._layerManager[0].subset.length; i++){
				var m_catalog = self._layerManager[0].subset[i].title;
				var m_subcatalog = self._layerManager[0].subset[i].subtitle;
				self._setShowByCatalog(m_catalog,m_subcatalog,checked);
			}
		}
	}else if(nun == "2"){
		var flayer = obj.id.replace("cfglobe_layer_checkbox_","").split("splitLayer")[0];
		var layer = obj.id.replace("cfglobe_layer_checkbox_","").split("splitLayer")[1];
		if(flayer == "globeLayer"){
			var m_globeLayer = self._globe.globeLayer._layerList;
			for(var i = 0; i < m_globeLayer.length; i++){
				if(m_globeLayer[i].lid == layer){
					m_globeLayer[i].show = checked;
				}
			}
		}else if(flayer == "vectorLayer"){
			var m_vectorLayer = self._globe.globeLayer._vectorLayerList;
			for(var i = 0; i < m_vectorLayer.length; i++){
				if(m_vectorLayer[i].lid == layer){
					m_vectorLayer[i].show = checked;
				}
			}
		}else if(flayer == "shpLayer"){
			var m_shpLayer = self._globe.shpParser._layer;
			for(var i = 0; i < m_shpLayer.length; i++){
				if(m_shpLayer[i].lid == layer){
					m_shpLayer[i].show = checked;
				}
			}
		}else if(flayer == "entityLayer"){
			var divList = document.getElementById("cfglobe_layer_div_" + flayer + "splitLayer" + layer).getElementsByTagName("div");
			for(var i = 0; i < divList.length; i++){
				var m_check = divList[i].getElementsByTagName("input")[0];
				m_check.checked = checked;
			}
			var m_catalog = "";
			for(var i = 0; i < self._layerManager[0].subset.length; i++){
				if(layer == self._layerManager[0].subset[i].layer){
					m_catalog = self._layerManager[0].subset[i].title;
					break;
				}
			}
			for(var i = 0; i < self._layerManager[0].subset.length; i++){
				if(m_catalog == self._layerManager[0].subset[i].title){
					var m_subcatalog = self._layerManager[0].subset[i].subtitle;
					self._setShowByCatalog(m_catalog,m_subcatalog,checked);
				}
			}
		}
		var is = false;
		var divListw = document.getElementById("cfglobe_layer_" + flayer).getElementsByTagName("div");
		for(var i = 0; i < divListw.length; i++){
			var m_check = divListw[i].getElementsByTagName("input")[0];
			if(m_check.checked){
				is = true;
			}
		}
		document.getElementById("cfglobe_layer_checkbox_" + flayer).checked = is;
	}else if(nun == "3"){
		var m_catalog = "";
		var m_subcatalog = "";
		var layer = obj.id.replace("cfglobe_layer_checkbox_","").split("splitSubLayer")[1];
		for(var i = 0; i < self._layerManager[0].subset.length; i++){
			if(layer == self._layerManager[0].subset[i].layer){
				m_catalog = self._layerManager[0].subset[i].title;
				m_subcatalog = self._layerManager[0].subset[i].subtitle;
				self._setShowByCatalog(m_catalog,m_subcatalog,checked);
				break;
			}
		}
	}
}

/*
 * 点击飞行到第一个标绘对象
 * @author zhaoxd
 * @method _layerSelectManager
 * @for LayerManager
 * @param {Object} Object
 * @return {null} null
 */
LayerManager.prototype._layerSelectManager = function(obj){
	var self = this;
	if(!self._globe._showBottomInfo){
		return;
	}
	var layer = obj.id.replace("cfglobe_layer_span_","").split("splitLayer")[1];
	var catalog = "";
	var subcatalog = "";
	for(var i = 0; i < self._layerManager[0].subset.length; i++){
		if(self._layerManager[0].subset[i].layer == layer){
			catalog = self._layerManager[0].subset[i].title;
			subcatalog = self._layerManager[0].subset[i].subtitle;
			break;
		}
	}
	var m_untity = self._getUntityByName(catalog,subcatalog);
	if(m_untity){
		if(m_untity.isMark){
			var m_point = m_untity.markPoint;
			var options = {lon:m_point.lon,lat:m_point.lat,alt:3000};
			self._globe.flyTo(options);
		}else{
			self._viewer.flyTo(m_untity);
		}
	}
}

/*
 * 根据name获取标绘对象
 * @author zhaoxd
 * @method _getUntityByName
 * @for LayerManager
 * @param {string} catalog
 * @param {string} subcatalog
 * @return {untity} 标绘对象
 */
LayerManager.prototype._getUntityByName = function(catalog,subcatalog){
	var self = this;
	if(!self._globe._showBottomInfo){
		return;
	}
	for(var i = 0; i < self._globe.placeMark._layer.length; i++){
		if(self._globe.placeMark._layer[i].catalog == catalog && self._globe.placeMark._layer[i].subcatalog == subcatalog){
			var m_untity = self._globe.placeMark._layer[i];
			m_untity.isMark = true;
			return m_untity;
		}
	}
	for(var i = 0; i < self._globe.placeMark._layer_dataSource.length; i++){
		if(self._globe.placeMark._layer_dataSource[i].catalog == catalog && self._globe.placeMark._layer_dataSource[i].subcatalog == subcatalog){
			var m_untity =  self._globe.placeMark._layer_dataSource[i];
			m_untity.isMark = true;
			return m_untity;
		}
	}
	for(var i = 0; i < self._globe.model._layer.length; i++){
		if(self._globe.model._layer[i].catalog == catalog && self._globe.model._layer[i].subcatalog == subcatalog){
			return self._globe.model._layer[i];
		}
	}
	for(var i = 0; i < self._globe.particle._layer.length; i++){
		if(self._globe.particle._layer[i].catalog == catalog && self._globe.particle._layer[i].subcatalog == subcatalog){
			return self._globe.particle._layer[i];
		}
	}
	for(var i = 0; i < self._globe.point._layer.length; i++){
		if(self._globe.point._layer[i].catalog == layer && self._globe.point._layer[i].subcatalog == sublayer){
			return self._globe.point._layer[i];
		}
	}
	for(var i = 0; i < self._globe.polyline._layer.length; i++){
		if(self._globe.polyline._layer[i].catalog == catalog && self._globe.polyline._layer[i].subcatalog == subcatalog){
			return self._globe.polyline._layer[i].polyline;
		}
	}
	for(var i = 0; i < self._globe.polygon._layer.length; i++){
		if(self._globe.polygon._layer[i].catalog == catalog && self._globe.polygon._layer[i].subcatalog == subcatalog){
			return self._globe.polygon._layer[i].polygon;
		}
	}
	for(var i = 0; i < self._globe.freeline._layer.length; i++){
		if(self._globe.freeline._layer[i].catalog == layer && self._globe.freeline._layer[i].subcatalog == sublayer){
			return self._globe.freeline._layer[i].freeline;
		}
	}
	for(var i = 0; i < self._globe.arrow._layer.subset.length; i++){
		if(self._globe.arrow._layer.subset[i].catalog == catalog && self._globe.arrow._layer.subset[i].subcatalog == subcatalog){
			return self._globe.arrow._layer.subset[i].polygon;
		}
	}
	for(var i = 0; i < self._globe.doubleArrow._layer.length; i++){
		if(self._globe.doubleArrow._layer[i].catalog == layer && self._globe.doubleArrow._layer[i].subcatalog == sublayer){
			return self._globe.doubleArrow._layer[i].polygon;
		}
	}
	for(var i = 0; i < self._globe.battleLine._layer.subset.length; i++){
		if(self._globe.battleLine._layer.subset[i].catalog == catalog && self._globe.battleLine._layer.subset[i].subcatalog == subcatalog){
			return self._globe.battleLine._layer.subset[i].polygon;
		}
	}
	for(var i = 0; i < self._globe.isolationBelt._layer.subset.length; i++){
		if(self._globe.isolationBelt._layer.subset[i].catalog == catalog && self._globe.isolationBelt._layer.subset[i].subcatalog == subcatalog){
			return self._globe.isolationBelt._layer.subset[i].polygon;
		}
	}
	for(var i = 0; i < self._globe.ellipse._layer.length; i++){
		if(self._globe.ellipse._layer[i].catalog == layer && self._globe.ellipse._layer[i].subcatalog == sublayer){
			return self._globe.ellipse._layer[i].ellipse;
		}
	}
	for(var i = 0; i < self._globe.circle._layer.length; i++){
		if(self._globe.circle._layer[i].catalog == layer && self._globe.circle._layer[i].subcatalog == sublayer){
			return self._globe.circle._layer[i].circle;
		}
	}
}

/*
 * 根据catalog设置显隐
 * @author zhaoxd
 * @method _setShowByCatalog
 * @for LayerManager
 * @param {string} catalog
 * @param {string} subcatalog
 * @param {Boolean} true:显示,false:隐藏
 * @return {null} null
 */
LayerManager.prototype._setShowByCatalog = function(catalog,subcatalog,show){
	var self = this;
	if(!self._globe._showBottomInfo){
		return;
	}
	for(var i = 0; i < self._globe.placeMark._layer.length; i++){
		if(self._globe.placeMark._layer[i].catalog == catalog && self._globe.placeMark._layer[i].subcatalog == subcatalog){
			self._globe.placeMark._layer[i].showLayer = show;
		}
	}
	for(var i = 0; i < self._globe.placeMark._layer_dataSource.length; i++){
		if(self._globe.placeMark._layer_dataSource[i].catalog == catalog && self._globe.placeMark._layer_dataSource[i].subcatalog == subcatalog){
			self._globe.placeMark._layer_dataSource[i].showLayer = show;
		}
	}
	for(var i = 0; i < self._globe.model._layer.length; i++){
		if(self._globe.model._layer[i].catalog == catalog && self._globe.model._layer[i].subcatalog == subcatalog){
			self._globe.model._layer[i].showLayer = show;
		}
	}
	for(var i = 0; i < self._globe.particle._layer.length; i++){
		if(self._globe.particle._layer[i].catalog == catalog && self._globe.particle._layer[i].subcatalog == subcatalog){
			self._globe.particle._layer[i].showLayer = show;
		}
	}
	for(var i = 0; i < self._globe.point._layer.length; i++){
		if(self._globe.point._layer[i].catalog == catalog && self._globe.point._layer[i].subcatalog == subcatalog){
			self._globe.point._layer[i].showLayer = show;
		}
	}
	for(var i = 0; i < self._globe.polyline._layer.length; i++){
		if(self._globe.polyline._layer[i].catalog == catalog && self._globe.polyline._layer[i].subcatalog == subcatalog){
			self._globe.polyline._layer[i].showLayer = show;
		}
	}
	for(var i = 0; i < self._globe.polygon._layer.length; i++){
		if(self._globe.polygon._layer[i].catalog == catalog && self._globe.polygon._layer[i].subcatalog == subcatalog){
			self._globe.polygon._layer[i].showLayer = show;
		}
	}
	for(var i = 0; i < self._globe.freeline._layer.length; i++){
		if(self._globe.freeline._layer[i].catalog == catalog && self._globe.freeline._layer[i].subcatalog == subcatalog){
			self._globe.freeline._layer[i].showLayer = show;
		}
	}
	for(var i = 0; i < self._globe.arrow._layer.subset.length; i++){
		if(self._globe.arrow._layer.subset[i].catalog == catalog && self._globe.arrow._layer.subset[i].subcatalog == subcatalog){
			self._globe.arrow._layer.subset[i].showLayer = show;
		}
	}
	for(var i = 0; i < self._globe.doubleArrow._layer.length; i++){
		if(self._globe.doubleArrow._layer[i].catalog == catalog && self._globe.doubleArrow._layer[i].subcatalog == subcatalog){
			self._globe.doubleArrow._layer[i].showLayer = show;
		}
	}
	for(var i = 0; i < self._globe.battleLine._layer.subset.length; i++){
		if(self._globe.battleLine._layer.subset[i].catalog == catalog && self._globe.battleLine._layer.subset[i].subcatalog == subcatalog){
			self._globe.battleLine._layer.subset[i].showLayer = show;
		}
	}
	for(var i = 0; i < self._globe.isolationBelt._layer.subset.length; i++){
		if(self._globe.isolationBelt._layer.subset[i].catalog == catalog && self._globe.isolationBelt._layer.subset[i].subcatalog == subcatalog){
			self._globe.isolationBelt._layer.subset[i].showLayer = show;
		}
	}
	for(var i = 0; i < self._globe.ellipse._layer.length; i++){
		if(self._globe.ellipse._layer[i].catalog == catalog && self._globe.ellipse._layer[i].subcatalog == subcatalog){
			self._globe.ellipse._layer[i].showLayer = show;
		}
	}
	for(var i = 0; i < self._globe.circle._layer.length; i++){
		if(self._globe.circle._layer[i].catalog == catalog && self._globe.circle._layer[i].subcatalog == subcatalog){
			self._globe.circle._layer[i].showLayer = show;
		}
	}
	for(var i = 0; i < self._globe.rectangle._layer.length; i++){
		if(self._globe.rectangle._layer[i].catalog == catalog && self._globe.rectangle._layer[i].subcatalog == subcatalog){
			self._globe.rectangle._layer[i].showLayer = show;
		}
	}
}

/*
 * 移除图层数据
 * @author zhaoxd
 * @method _remove
 * @for LayerManager
 * @param {null} null
 * @return {null} null
 */
LayerManager.prototype._remove = function(flayer,layer,sublayer){
	var self = this;
	if(!self._globe._showBottomInfo){
		return;
	}
	if(flayer == "globeLayer"){
		for(var i = 0; i < self._layerManager[2].subset.length; i++){
			if(self._layerManager[2].subset[i].layer == layer){
				self._layerManager[2].subset.splice(i, 1);
			}
		}
		var obj = document.getElementById("cfglobe_layer_checkbox_" + flayer + "splitLayer" + layer);
		obj.parentNode.parentNode.removeChild(obj.parentNode);
	}else if(flayer == "vectorLayer"){
		for(var i = 0; i < self._layerManager[3].subset.length; i++){
			if(self._layerManager[3].subset[i].layer == layer){
				self._layerManager[3].subset.splice(i, 1);
			}
		}
		var obj = document.getElementById("cfglobe_layer_checkbox_" + flayer + "splitLayer" + layer);
		obj.parentNode.parentNode.removeChild(obj.parentNode);
	}else if(flayer == "shpLayer"){
		for(var i = 0; i < self._layerManager[1].subset.length; i++){
			if(self._layerManager[1].subset[i].layer == layer){
				self._layerManager[1].subset.splice(i, 1);
			}
		}
		var obj = document.getElementById("cfglobe_layer_checkbox_" + flayer + "splitLayer" + layer);
		obj.parentNode.parentNode.removeChild(obj.parentNode);
	}else if(flayer == "entityLayer"){
		var m_is = true;
		for(var i = 0; i < self._globe.placeMark._layer.length; i++){
			if(self._globe.placeMark._layer[i].catalog == layer && self._globe.placeMark._layer[i].subcatalog == sublayer){
				m_is = false;
				break;
			}
		}
		for(var i = 0; i < self._globe.placeMark._layer_dataSource.length; i++){
			if(self._globe.placeMark._layer_dataSource[i].catalog == layer && self._globe.placeMark._layer_dataSource[i].subcatalog == sublayer){
				m_is = false;
				break;
			}
		}
		for(var i = 0; i < self._globe.model._layer.length; i++){
			if(self._globe.model._layer[i].catalog == layer && self._globe.model._layer[i].subcatalog == sublayer){
				m_is = false;
				break;
			}
		}
		for(var i = 0; i < self._globe.particle._layer.length; i++){
			if(self._globe.particle._layer[i].catalog == layer && self._globe.particle._layer[i].subcatalog == sublayer){
				m_is = false;
				break;
			}
		}
		for(var i = 0; i < self._globe.point._layer.length; i++){
			if(self._globe.point._layer[i].catalog == layer && self._globe.point._layer[i].subcatalog == sublayer){
				m_is = false;
				break;
			}
		}
		for(var i = 0; i < self._globe.polyline._layer.length; i++){
			if(self._globe.polyline._layer[i].catalog == layer && self._globe.polyline._layer[i].subcatalog == sublayer){
				m_is = false;
				break;
			}
		}
		for(var i = 0; i < self._globe.polygon._layer.length; i++){
			if(self._globe.polygon._layer[i].catalog == layer && self._globe.polygon._layer[i].subcatalog == sublayer){
				m_is = false;
				break;
			}
		}
		for(var i = 0; i < self._globe.freeline._layer.length; i++){
			if(self._globe.freeline._layer[i].catalog == layer && self._globe.freeline._layer[i].subcatalog == sublayer){
				m_is = false;
				break;
			}
		}
		for(var i = 0; i < self._globe.arrow._layer.subset.length; i++){
			if(self._globe.arrow._layer.subset[i].catalog == layer && self._globe.arrow._layer.subset[i].subcatalog == sublayer){
				m_is = false;
				break;
			}
		}
		for(var i = 0; i < self._globe.doubleArrow._layer.length; i++){
			if(self._globe.doubleArrow._layer[i].catalog == layer && self._globe.doubleArrow._layer[i].subcatalog == sublayer){
				m_is = false;
				break;
			}
		}
		for(var i = 0; i < self._globe.battleLine._layer.subset.length; i++){
			if(self._globe.battleLine._layer.subset[i].catalog == layer && self._globe.battleLine._layer.subset[i].subcatalog == sublayer){
				m_is = false;
				break;
			}
		}
		for(var i = 0; i < self._globe.isolationBelt._layer.subset.length; i++){
			if(self._globe.isolationBelt._layer.subset[i].catalog == layer && self._globe.isolationBelt._layer.subset[i].subcatalog == sublayer){
				m_is = false;
				break;
			}
		}
		for(var i = 0; i < self._globe.ellipse._layer.length; i++){
			if(self._globe.ellipse._layer[i].catalog == layer && self._globe.ellipse._layer[i].subcatalog == sublayer){
				m_is = false;
				break;
			}
		}
		for(var i = 0; i < self._globe.circle._layer.length; i++){
			if(self._globe.circle._layer[i].catalog == layer && self._globe.circle._layer[i].subcatalog == sublayer){
				m_is = false;
				break;
			}
		}
		if(m_is){
			var obj;
			var m_is_e = true;
			for(var i = 0; i < self._layerManager[0].subset.length; i++){
				var m_subset = self._layerManager[0].subset[i];
				if(m_subset.title == layer && m_subset.subtitle == sublayer){
					obj = document.getElementById("cfglobe_layer_checkbox_" + flayer + "splitSubLayer" + m_subset.layer);
					self._layerManager[0].subset.splice(i, 1);
					break;
				}
			}
			for(var i = 0; i < self._layerManager[0].subset.length; i++){
				var m_subset = self._layerManager[0].subset[i];
				if(m_subset.title == layer){
					m_is_e = false;
					break;
				}
			}
			if(m_is_e){
				obj.parentNode.parentNode.parentNode.removeChild(obj.parentNode.parentNode);
			}else{
				obj.parentNode.parentNode.removeChild(obj.parentNode);
			}
		}
	}
}

return LayerManager;
})

///*
//* author: 赵雪丹
//* description: LayerManager-图层管理
//* day: 2017-9-28
//*/
//define( [], function(){
//function LayerManager(globe){
//	var self = this;
//	this._globe = globe;
//	this._viewer = globe._viewer;
//	this._globeId = globe._globeId;
//	this._layer_manager_bottom;
//	this._layer_manager_top;
////	this._layerManager = [{id:"entityLayer",title:"标绘图层",subset:[]},{id:"shpLayer",title:"shp图层",subset:[]},{id:"globeLayer",title:"影像图层",subset:[]},{id:"stkLayer",title:"地形图层",subset:[]}];
//	this._layerManager = [{id:"entityLayer",title:"标绘图层",subset:[]},{id:"shpLayer",title:"shp图层",subset:[]},{id:"globeLayer",title:"影像图层",subset:[]},{id:"vectorLayer",title:"矢量图层",subset:[]}];
//	this._loadLayerManager();
////	if(!this._globe._showLayerManager){
////		document.getElementById("cfglobe_layer_manager").style.display = "none";
////	}
//  //私有渲染事件-实时修改LayerManager位置
//	this._viewer.scene.postRender.addEventListener(function(){
//		var h_w = self._viewer._lastHeight;
//		var h_n = self._viewer.scene.canvas.height;
//		var h = h_w-h_n;
//		if(self._layer_manager_bottom){
//			self._layer_manager_bottom.setAttribute("style", "bottom: " + h + "px;");
//		}
//		if(self._layer_manager_top){
//			self._layer_manager_top.setAttribute("style", "bottom: " + (h+27) + "px;");
//		}
//	});
//}
//
///*
// * 设置显隐
// * @author zhaoxd
// * @method setDisplay
// * @for LayerManager
// * @param {Boolean} true:显示,false:隐藏
// * @return {null} null
// */
//LayerManager.prototype.setDisplay = function(display){
////	if(display){
////		document.getElementById("cfglobe_layer_manager").style.display = "";
////	}else{
////		document.getElementById("cfglobe_layer_manager").style.display = "none";
////	}
//}
//
//LayerManager.prototype._showManager = function(obj){
//	var self = this;
//	if(obj.innerHTML == "图层管理器  ▼"){
//		document.getElementById("cfglobe_layer_manager-top").setAttribute("class", "cfglobe-layer-manager-top-hide");
//		obj.innerHTML = "图层管理器  ▲";
//	}else{
//		document.getElementById("cfglobe_layer_manager-top").setAttribute("class", "cfglobe-layer-manager-top-show");
//		obj.innerHTML = "图层管理器  ▼";
//	}
//}
//
///*
// * 初始化图层管理器
// * @author zhaoxd
// * @method _loadLayerManager
// * @for LayerManager
// * @param {null} null
// * @return {null} null
// */
//LayerManager.prototype._loadLayerManager = function(){
//	var self = this;
//	self._layer_manager_bottom = document.createElement("div");
//	self._layer_manager_bottom.setAttribute("class", "cfglobe-layer-manager-bottom");
//	self._layer_manager_bottom.innerHTML = "图层管理器  ▲";
//	self._layer_manager_bottom.onclick = function(){
//		self._showManager(this);
//	};
//	document.getElementById(self._globeId).getElementsByTagName("div")[0].appendChild(self._layer_manager_bottom);
//	self._layer_manager_top = document.createElement("div");
//	self._layer_manager_top.setAttribute("id", "cfglobe_layer_manager-top");
//	self._layer_manager_top.setAttribute("class", "cfglobe-layer-manager-top-hide");
//	document.getElementById(self._globeId).getElementsByTagName("div")[0].appendChild(self._layer_manager_top);
//	var m_layer_manager_list = document.createElement("div");
//	m_layer_manager_list.setAttribute("id", "cfglobe_layer_manager_list");
//	m_layer_manager_list.setAttribute("class", "cfglobe-layer-manager-list");
//	self._layer_manager_top.appendChild(m_layer_manager_list);
//	for(var i = 0; i < self._layerManager.length; i++){
//		var m_cfglobe_layer_info = document.createElement("div");
//		m_cfglobe_layer_info.setAttribute("class", "cfglobe-layer-info");
//		if(i == 0){
//			m_cfglobe_layer_info.setAttribute("style", "border-top: 0;");
//		}
//		var m_cfglobe_layer_checkbox = document.createElement("input");
//		m_cfglobe_layer_checkbox.setAttribute("type", "checkbox");
//		m_cfglobe_layer_checkbox.setAttribute("id", "cfglobe_layer_checkbox_" + self._layerManager[i].id);
//		m_cfglobe_layer_checkbox.onclick = function(){
//			self._layerCheckManager(1,this);
//		};
//		m_cfglobe_layer_checkbox.setAttribute("checked", "true");
//		m_cfglobe_layer_info.appendChild(m_cfglobe_layer_checkbox);
//		var m_cfglobe_layer_title = document.createElement("span");
//		m_cfglobe_layer_title.innerHTML = self._layerManager[i].title;
//		m_cfglobe_layer_info.appendChild(m_cfglobe_layer_title);
//		var m_cfglobe_layer_button = document.createElement("button");
//		m_cfglobe_layer_button.setAttribute("id", "cfglobe_layer_button_" + self._layerManager[i].id);
//		m_cfglobe_layer_button.innerHTML =  "▼";	//▲
//		m_cfglobe_layer_button.onclick = function(){
//			self._layerListManager(this);
//		};
//		m_cfglobe_layer_info.appendChild(m_cfglobe_layer_button);
//		m_layer_manager_list.appendChild(m_cfglobe_layer_info);
//		var cfglobe_layer_sub = document.createElement("div");
//		cfglobe_layer_sub.setAttribute("id", "cfglobe_layer_" + self._layerManager[i].id);
//		cfglobe_layer_sub.setAttribute("style", "display: none; padding-bottom: 10px;");
//		
//		m_layer_manager_list.appendChild(cfglobe_layer_sub);
//	}
//}
//
///*
// * 二级图层列表显隐控制
// * @author zhaoxd
// * @method _layerListManager
// * @for LayerManager
// * @param {object} button
// * @return {null} null
// */
//LayerManager.prototype._layerListManager = function(obj){
//	var self = this;
//	if(obj.innerHTML == "▼"){
//		document.getElementById("cfglobe_layer_" + obj.id.replace("cfglobe_layer_button_","")).style.display = "block";
//		obj.innerHTML = "▲";
//	}else{
//		document.getElementById("cfglobe_layer_" + obj.id.replace("cfglobe_layer_button_","")).style.display = "none";
//		obj.innerHTML = "▼";
//	}
//}
//
///*
// * 增加图层数据
// * @author zhaoxd
// * @method _add
// * @for LayerManager
// * @param {string} flayer：父节点
// * @param {string} layer：标识
// * @param {string} title：标题
// * @return {null} null
// */
//LayerManager.prototype._add = function(flayer,layer,title,subtitle){
//	var self = this;
//	if(flayer == "entityLayer"){
//		var m_is_title = true;
//		var m_is_subtitle = true;
//		var m_flayer = "";
//		for(var i = 0; i < self._layerManager[0].subset.length; i++){
//			if(self._layerManager[0].subset[i].title == title){
//				m_is_title = false;
//				if(m_flayer == ""){
//					m_flayer = self._layerManager[0].subset[i].layer;
//				}
//				if(self._layerManager[0].subset[i].subtitle == subtitle){
//					m_is_subtitle = false;
//				}
//			}
//		}
//		if(m_is_title || m_is_subtitle){
//			m_sub = {layer:layer,title:title,subtitle:subtitle};
//			self._layerManager[0].subset[self._layerManager[0].subset.length] = m_sub;
//		}
//		if(m_is_title){
//			var cfglobe_layer_sub = document.getElementById("cfglobe_layer_" + flayer);
//			var cfglobe_layer_sub_list = document.createElement("div");
//			cfglobe_layer_sub_list.setAttribute("class", "cfglobe-layer-list");
//			cfglobe_layer_sub_list.setAttribute("id", "cfglobe_layer_div_" + flayer + "splitLayer" + layer);
//			var m_cfglobe_layer_sub_checkbox = document.createElement("input");
//			m_cfglobe_layer_sub_checkbox.setAttribute("type", "checkbox");
//			m_cfglobe_layer_sub_checkbox.setAttribute("id", "cfglobe_layer_checkbox_" + flayer + "splitLayer" + layer);
//			m_cfglobe_layer_sub_checkbox.onclick = function(){
//				self._layerCheckManager(2,this);
//			};
//			m_cfglobe_layer_sub_checkbox.setAttribute("checked", "true");
//			cfglobe_layer_sub_list.appendChild(m_cfglobe_layer_sub_checkbox);
//			var m_cfglobe_layer_sub_title = document.createElement("span");
//			m_cfglobe_layer_sub_title.setAttribute("id", "cfglobe_layer_span_" + flayer + "splitLayer" + layer);
//			m_cfglobe_layer_sub_title.innerHTML = title;
//			cfglobe_layer_sub_list.appendChild(m_cfglobe_layer_sub_title);
//			if(m_is_subtitle){
//				var cfglobe_layer_sub_catalog_list = document.createElement("div");
//				cfglobe_layer_sub_catalog_list.setAttribute("class", "cfglobe-layer-list-catalog");
//				var m_cfglobe_layer_sub_catalog_checkbox = document.createElement("input");
//				m_cfglobe_layer_sub_catalog_checkbox.setAttribute("type", "checkbox");
//				m_cfglobe_layer_sub_catalog_checkbox.setAttribute("id", "cfglobe_layer_checkbox_" + flayer + "splitSubLayer" + layer);
//				m_cfglobe_layer_sub_catalog_checkbox.onclick = function(){
//					self._layerCheckManager(3,this);
//				};
//				m_cfglobe_layer_sub_catalog_checkbox.setAttribute("checked", "true");
//				cfglobe_layer_sub_catalog_list.appendChild(m_cfglobe_layer_sub_catalog_checkbox);
//				var m_cfglobe_layer_sub_catalog_title = document.createElement("span");
//				m_cfglobe_layer_sub_catalog_title.setAttribute("id", "cfglobe_layer_span_" + flayer + "splitSubLayer" + layer);
//				m_cfglobe_layer_sub_catalog_title.innerHTML = subtitle;
//				m_cfglobe_layer_sub_catalog_title.onclick = function(){
//					self._layerSelectManager(this);
//				};
//				cfglobe_layer_sub_catalog_list.appendChild(m_cfglobe_layer_sub_catalog_title);
//				cfglobe_layer_sub_list.appendChild(cfglobe_layer_sub_catalog_list);
//			}
//			cfglobe_layer_sub.appendChild(cfglobe_layer_sub_list);
//			var fcheckbox = document.getElementById("cfglobe_layer_checkbox_" + flayer);
//			fcheckbox.checked = true;
//		}else if(m_is_subtitle){
//			var cfglobe_layer_sub_catalog_list = document.createElement("div");
//			cfglobe_layer_sub_catalog_list.setAttribute("class", "cfglobe-layer-list-catalog");
//			var m_cfglobe_layer_sub_catalog_checkbox = document.createElement("input");
//			m_cfglobe_layer_sub_catalog_checkbox.setAttribute("type", "checkbox");
//			m_cfglobe_layer_sub_catalog_checkbox.setAttribute("id", "cfglobe_layer_checkbox_" + flayer + "splitSubLayer" + layer);
//			m_cfglobe_layer_sub_catalog_checkbox.onclick = function(){
//				self._layerCheckManager(3,this);
//			};
//			m_cfglobe_layer_sub_catalog_checkbox.setAttribute("checked", "true");
//			cfglobe_layer_sub_catalog_list.appendChild(m_cfglobe_layer_sub_catalog_checkbox);
//			var m_cfglobe_layer_sub_catalog_title = document.createElement("span");
//			m_cfglobe_layer_sub_catalog_title.setAttribute("id", "cfglobe_layer_span_" + flayer + "splitSubLayer" + layer);
//			m_cfglobe_layer_sub_catalog_title.innerHTML = subtitle;
//			m_cfglobe_layer_sub_catalog_title.onclick = function(){
//				self._layerSelectManager(this);
//			};
//			cfglobe_layer_sub_catalog_list.appendChild(m_cfglobe_layer_sub_catalog_title);
//			cfglobe_layer_sub_list = document.getElementById("cfglobe_layer_div_" + flayer + "splitLayer" + m_flayer);
//			cfglobe_layer_sub_list.appendChild(cfglobe_layer_sub_catalog_list);
//		}
//	}else{
//		var m_sub = {layer:layer,title:title};
//		if(flayer == "globeLayer"){
//			self._layerManager[2].subset[self._layerManager[2].subset.length] = m_sub;
//		}else if(flayer == "vectorLayer"){
//			self._layerManager[3].subset[self._layerManager[3].subset.length] = m_sub;
//		}else if(flayer == "shpLayer"){
//			self._layerManager[1].subset[self._layerManager[1].subset.length] = m_sub;
//		}
//		var cfglobe_layer_sub = document.getElementById("cfglobe_layer_" + flayer);
//		var cfglobe_layer_sub_list = document.createElement("div");
//		cfglobe_layer_sub_list.setAttribute("class", "cfglobe-layer-list");
//		var m_cfglobe_layer_sub_checkbox = document.createElement("input");
//		m_cfglobe_layer_sub_checkbox.setAttribute("type", "checkbox");
//		m_cfglobe_layer_sub_checkbox.setAttribute("id", "cfglobe_layer_checkbox_" + flayer + "splitLayer" + layer);
//		m_cfglobe_layer_sub_checkbox.onclick = function(){
//			self._layerCheckManager(2,this);
//		};
//		m_cfglobe_layer_sub_checkbox.setAttribute("checked", "true");
//		cfglobe_layer_sub_list.appendChild(m_cfglobe_layer_sub_checkbox);
//		var m_cfglobe_layer_sub_title = document.createElement("span");
//		m_cfglobe_layer_sub_title.setAttribute("id", "cfglobe_layer_span_" + flayer + "splitLayer" + layer);
//		m_cfglobe_layer_sub_title.innerHTML = title;
//		cfglobe_layer_sub_list.appendChild(m_cfglobe_layer_sub_title);
//		cfglobe_layer_sub.appendChild(cfglobe_layer_sub_list);
//		var fcheckbox = document.getElementById("cfglobe_layer_checkbox_" + flayer);
//		fcheckbox.checked = true;
//	}
//}
//
///*
// * 图层显隐控制
// * @author zhaoxd
// * @method _layerCheckManager
// * @for LayerManager
// * @param {int} 层级
// * @param {object} checkbox
// * @return {null} null
// */
//LayerManager.prototype._layerCheckManager = function(nun,obj){
//	var self = this;
//	var checked = obj.checked;
//	if(nun == "1"){
//		var flayer = obj.id.replace("cfglobe_layer_checkbox_","");
//		var divList = document.getElementById("cfglobe_layer_" + flayer).getElementsByTagName("div");
//		for(var i = 0; i < divList.length; i++){
//			var m_check = divList[i].getElementsByTagName("input")[0];
//			m_check.checked = checked;
//		}
//		if(flayer == "globeLayer"){
//			var m_globeLayer = self._globe.globeLayer._layerList;
//			for(var i = 0; i < m_globeLayer.length; i++){
//				m_globeLayer[i].show = checked;
//			}
//		}else if(flayer == "vectorLayer"){
//			var m_vectorLayer = self._globe.globeLayer._vectorLayerList;
//			for(var i = 0; i < m_vectorLayer.length; i++){
//				m_vectorLayer[i].show = checked;
//			}
//		}else if(flayer == "stkLayer"){
////			if(checked){
////				self._viewer.terrainProvider = self._globe.globeLayer._stk;
////			}else{
////				self._viewer.terrainProvider = self._globe._stk;
////			}
//		}else if(flayer == "shpLayer"){
//			var m_shpLayer = self._globe.shpParser._layer;
//			for(var i = 0; i < m_shpLayer.length; i++){
//				m_shpLayer[i].show = checked;
//			}
//		}else if(flayer == "entityLayer"){
//			for(var i = 0; i < self._layerManager[0].subset.length; i++){
//				var m_name = self._layerManager[0].subset[i].title;
//				self._setShowByName(m_name,checked);
//			}
//		}
//	}else if(nun == "2"){
//		var flayer = obj.id.replace("cfglobe_layer_checkbox_","").split("splitLayer")[0];
//		var layer = obj.id.replace("cfglobe_layer_checkbox_","").split("splitLayer")[1];
//		if(flayer == "globeLayer"){
//			var m_globeLayer = self._globe.globeLayer._layerList;
//			for(var i = 0; i < m_globeLayer.length; i++){
//				if(m_globeLayer[i].lid == layer){
//					m_globeLayer[i].show = checked;
//				}
//			}
//		}else if(flayer == "vectorLayer"){
//			var m_vectorLayer = self._globe.globeLayer._vectorLayerList;
//			for(var i = 0; i < m_vectorLayer.length; i++){
//				if(m_vectorLayer[i].lid == layer){
//					m_vectorLayer[i].show = checked;
//				}
//			}
//		}else if(flayer == "shpLayer"){
//			var m_shpLayer = self._globe.shpParser._layer;
//			for(var i = 0; i < m_shpLayer.length; i++){
//				if(m_shpLayer[i].lid == layer){
//					m_shpLayer[i].show = checked;
//				}
//			}
//		}else if(flayer == "entityLayer"){
//			var m_name = "";
//			for(var i = 0; i < self._layerManager[0].subset.length; i++){
//				if(layer == self._layerManager[0].subset[i].layer){
//					m_name = self._layerManager[0].subset[i].title;
//					break;
//				}
//			}
//			self._setShowByName(m_name,checked);
//		}
//		var is = false;
//		var divList = document.getElementById("cfglobe_layer_" + flayer).getElementsByTagName("div");
//		for(var i = 0; i < divList.length; i++){
//			var m_check = divList[i].getElementsByTagName("input")[0];
//			if(m_check.checked){
//				is = true;
//			}
//		}
//		document.getElementById("cfglobe_layer_checkbox_" + flayer).checked = is;
//	}
//}
//
///*
// * 点击飞行到第一个标绘对象
// * @author zhaoxd
// * @method _layerSelectManager
// * @for LayerManager
// * @param {Object} Object
// * @return {null} null
// */
//LayerManager.prototype._layerSelectManager = function(obj){
//	var self = this;
//	var layer = obj.id.replace("cfglobe_layer_span_","").split("splitLayer")[1];
//	var title = "";
//	for(var i = 0; i < self._layerManager[0].subset.length; i++){
//		if(self._layerManager[0].subset[i].layer == layer){
//			title = self._layerManager[0].subset[i].title;
//			break;
//		}
//	}
//	var m_untity = self._getUntityByName(title);
//	if(m_untity){
//		self._viewer.flyTo(m_untity);
//	}
//}
//
///*
// * 根据name获取标绘对象
// * @author zhaoxd
// * @method _getUntityByName
// * @for LayerManager
// * @param {string} name
// * @return {untity} 标绘对象
// */
//LayerManager.prototype._getUntityByName = function(name){
//	var self = this;
//	for(var i = 0; i < self._globe.placeMark._layer.length; i++){
//		if(self._globe.placeMark._layer[i].name == name){
//			return self._globe.placeMark._layer[i];
//		}
//	}
//	for(var i = 0; i < self._globe.placeMark._layer_dataSource.length; i++){
//		if(self._globe.placeMark._layer_dataSource[i].name == name){
//			return self._globe.placeMark._layer_dataSource[i];
//		}
//	}
//	for(var i = 0; i < self._globe.polyline._layer.length; i++){
//		if(self._globe.polyline._layer[i].polyline.name == name){
//			return self._globe.polyline._layer[i].polyline;
//		}
//	}
//	for(var i = 0; i < self._globe.polygon._layer.length; i++){
//		if(self._globe.polygon._layer[i].polygon.name == name){
//			return self._globe.polygon._layer[i].polygon;
//		}
//	}
//	for(var i = 0; i < self._globe.model._layer.length; i++){
//		if(self._globe.model._layer[i].name == name){
//			return self._globe.model._layer[i];
//		}
//	}
//	for(var i = 0; i < self._globe.arrow._layer.subset.length; i++){
//		if(self._globe.arrow._layer.subset[i].name == name){
//			return self._globe.arrow._layer.subset[i].polygon;
//		}
//	}
//	for(var i = 0; i < self._globe.battleLine._layer.subset.length; i++){
//		if(self._globe.battleLine._layer.subset[i].name == name){
//			return self._globe.battleLine._layer.subset[i].polygon;
//		}
//	}
//	for(var i = 0; i < self._globe.isolationBelt._layer.subset.length; i++){
//		if(self._globe.isolationBelt._layer.subset[i].name == name){
//			return self._globe.isolationBelt._layer.subset[i].polygon;
//		}
//	}
//}
//
///*
// * 根据name设置显隐
// * @author zhaoxd
// * @method _setShowByName
// * @for LayerManager
// * @param {string} name
// * @param {Boolean} true:显示,false:隐藏
// * @return {null} null
// */
//LayerManager.prototype._setShowByName = function(name,show){
//	var self = this;
//	for(var i = 0; i < self._globe.doubleArrow._layer.length; i++){
//		if(self._globe.doubleArrow._layer[i].polygon.name == name){
//			self._globe.doubleArrow._layer[i].polygon.show = show;
//		}
//	}
//	for(var i = 0; i < self._globe.freeline._layer.length; i++){
//		if(self._globe.freeline._layer[i].freeline.name == name){
//			self._globe.freeline._layer[i].freeline.show = show;
//		}
//	}
//	for(var i = 0; i < self._globe.ellipse._layer.length; i++){
//		if(self._globe.ellipse._layer[i].ellipse.name == name){
//			self._globe.ellipse._layer[i].ellipse.show = show;
//		}
//	}
//	for(var i = 0; i < self._globe.circle._layer.length; i++){
//		if(self._globe.circle._layer[i].circle.name == name){
//			self._globe.circle._layer[i].circle.show = show;
//		}
//	}
//	for(var i = 0; i < self._globe.point._layer.length; i++){
//		if(self._globe.point._layer[i].name == name){
//			self._globe.point._layer[i].show = show;
//		}
//	}
//	for(var i = 0; i < self._globe.placeMark._layer.length; i++){
//		if(self._globe.placeMark._layer[i].name == name){
//			self._globe.placeMark._layer[i].show = show;
//		}
//	}
//	for(var i = 0; i < self._globe.placeMark._layer_dataSource.length; i++){
//		if(self._globe.placeMark._layer_dataSource[i].name == name){
//			self._globe.placeMark._layer_dataSource[i].show = show;
//		}
//	}
//	for(var i = 0; i < self._globe.polyline._layer.length; i++){
//		if(self._globe.polyline._layer[i].polyline.name == name){
//			self._globe.polyline._layer[i].polyline.show = show;
//		}
//	}
//	for(var i = 0; i < self._globe.polygon._layer.length; i++){
//		if(self._globe.polygon._layer[i].polygon.name == name){
//			self._globe.polygon._layer[i].polygon.show = show;
//			if(self._globe.polygon._layer[i].clampMode == 0){
//				self._globe.polygon._layer[i].polyline.show = show;
//			}
//		}
//	}
//	for(var i = 0; i < self._globe.model._layer.length; i++){
//		if(self._globe.model._layer[i].name == name){
//			self._globe.model._layer[i].show = show;
//		}
//	}
//	for(var i = 0; i < self._globe.arrow._layer.subset.length; i++){
//		if(self._globe.arrow._layer.subset[i].name == name){
//			self._globe.arrow._layer.subset[i].polygon.show = show;
//			if(self._globe.arrow._layer.subset[i].clampMode == 0){
//				self._globe.arrow._layer.subset[i].polyline.show = show;
//			}
//		}
//	}
//	for(var i = 0; i < self._globe.battleLine._layer.subset.length; i++){
//		if(self._globe.battleLine._layer.subset[i].name == name){
//			self._globe.battleLine._layer.subset[i].polygon.show = show;
//		}
//	}
//	for(var i = 0; i < self._globe.isolationBelt._layer.subset.length; i++){
//		if(self._globe.isolationBelt._layer.subset[i].name == name){
//			self._globe.isolationBelt._layer.subset[i].polygon.show = show;
//			self._globe.isolationBelt._layer.subset[i].polygonHat.show = show;
//		}
//	}
//}
//
///*
// * 移除图层数据
// * @author zhaoxd
// * @method _remove
// * @for LayerManager
// * @param {null} null
// * @return {null} null
// */
//LayerManager.prototype._remove = function(flayer,layer){
//	var self = this;
//	if(flayer == "globeLayer"){
//		for(var i = 0; i < self._layerManager[2].subset.length; i++){
//			if(self._layerManager[2].subset[i].layer == layer){
//				self._layerManager[2].subset.splice(i, 1);
//			}
//		}
//		var obj = document.getElementById("cfglobe_layer_checkbox_" + flayer + "splitLayer" + layer);
//		obj.parentNode.parentNode.removeChild(obj.parentNode);
//	}else if(flayer == "vectorLayer"){
//		for(var i = 0; i < self._layerManager[3].subset.length; i++){
//			if(self._layerManager[3].subset[i].layer == layer){
//				self._layerManager[3].subset.splice(i, 1);
//			}
//		}
//		var obj = document.getElementById("cfglobe_layer_checkbox_" + flayer + "splitLayer" + layer);
//		obj.parentNode.parentNode.removeChild(obj.parentNode);
//	}else if(flayer == "shpLayer"){
//		for(var i = 0; i < self._layerManager[1].subset.length; i++){
//			if(self._layerManager[1].subset[i].layer == layer){
//				self._layerManager[1].subset.splice(i, 1);
//			}
//		}
//		var obj = document.getElementById("cfglobe_layer_checkbox_" + flayer + "splitLayer" + layer);
//		obj.parentNode.parentNode.removeChild(obj.parentNode);
//	}else if(flayer == "entityLayer"){
//		var m_is = true;
//		for(var i = 0; i < self._globe.doubleArrow._layer.length; i++){
//			if(self._globe.doubleArrow._layer[i].polygon.name == name){
//				m_is = false;
//				break;
//			}
//		}
//		for(var i = 0; i < self._globe.freeline._layer.length; i++){
//			if(self._globe.freeline._layer[i].freeline.name == name){
//				m_is = false;
//				break;
//			}
//		}
//		for(var i = 0; i < self._globe.ellipse._layer.length; i++){
//			if(self._globe.ellipse._layer[i].ellipse.name == name){
//				m_is = false;
//				break;
//			}
//		}
//		for(var i = 0; i < self._globe.circle._layer.length; i++){
//			if(self._globe.circle._layer[i].circle.name == name){
//				m_is = false;
//				break;
//			}
//		}
//		for(var i = 0; i < self._globe.point._layer.length; i++){
//			if(self._globe.point._layer[i].name == name){
//				m_is = false;
//				break;
//			}
//		}
//		for(var i = 0; i < self._globe.placeMark._layer.length; i++){
//			if(self._globe.placeMark._layer[i].name == name){
//				m_is = false;
//				break;
//			}
//		}
//		for(var i = 0; i < self._globe.placeMark._layer_dataSource.length; i++){
//			if(self._globe.placeMark._layer_dataSource[i].name == name){
//				m_is = false;
//				break;
//			}
//		}
//		for(var i = 0; i < self._globe.polyline._layer.length; i++){
//			if(self._globe.polyline._layer[i].polyline.name == name){
//				m_is = false;
//				break;
//			}
//		}
//		for(var i = 0; i < self._globe.polygon._layer.length; i++){
//			if(self._globe.polygon._layer[i].polygon.name == name){
//				m_is = false;
//				break;
//			}
//		}
//		for(var i = 0; i < self._globe.model._layer.length; i++){
//			if(self._globe.model._layer[i].name == name){
//				m_is = false;
//				break;
//			}
//		}
//		for(var i = 0; i < self._globe.arrow._layer.subset.length; i++){
//			if(self._globe.arrow._layer.subset[i].name == name){
//				m_is = false;
//				break;
//			}
//		}
//		for(var i = 0; i < self._globe.battleLine._layer.subset.length; i++){
//			if(self._globe.battleLine._layer.subset[i].name == name){
//				m_is = false;
//				break;
//			}
//		}
//		for(var i = 0; i < self._globe.isolationBelt._layer.subset.length; i++){
//			if(self._globe.isolationBelt._layer.subset[i].name == name){
//				m_is = false;
//				break;
//			}
//		}
//		if(m_is){
//			for(var i = 0; i < self._layerManager[0].subset.length; i++){
//				if(self._layerManager[0].subset[i].title == layer){
//					var obj = document.getElementById("cfglobe_layer_checkbox_" + flayer + "splitLayer" + self._layerManager[0].subset[i].layer);
//					obj.parentNode.parentNode.removeChild(obj.parentNode);
//					self._layerManager[0].subset.splice(i, 1);
//					break;
//				}
//			}
//		}
//	}
//}
//
//return LayerManager;
//})