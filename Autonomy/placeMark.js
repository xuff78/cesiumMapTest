/*
* author: 赵雪丹
* description: PlaceMark-地标
* day: 2017-9-28
*/
define( [], function(){
function PlaceMark(globe){
	var self = this;
	this._globe = globe;
	this._viewer = globe._viewer;
	this._globeId = globe._globeId;
	this._minHeight = 0;
	this._maxHeight = 1000000;
	this._catalog = "default";
	this._subcatalog = "default";
	this._layer = [];
	this._layer_dataSource = [];
	this._selectMark;
	this._selectMarkShow = false;
//	this.position = Cesium.Cartesian3.fromDegrees(112, 42);
//	this._showLabel = this._viewer.entities.add({
//	    position : new Cesium.CallbackProperty(function(){ return self.position; }, false),
//	    label:{
//	    	text: "default",
//	    	font: "10pt sans-serif",
//	    	show: true,
//	    	horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
//	    	pixelOffset: new Cesium.Cartesian2(30/2, 0),
//	    	verticalOrigin : Cesium.VerticalOrigin.BASELINE,
//	        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND,
//	        disableDepthTestDistance : Number.POSITIVE_INFINITY
//	    }
//	});
	this._options = {
		draw: false,
		minHeight: 0,
		maxHeight: 1000000,
		catalog: "default",
		subcatalog: "default",
		handlerCallback: null,
		options: null};
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
				self._layer[i].show = true;
			}else{
				self._layer[i].show = false;
			}
		}
		for(var i = 0; i < self._layer_dataSource.length; i++){
			if(m_alt >= self._layer_dataSource[i].minHeight && m_alt <= self._layer_dataSource[i].maxHeight){
				self._layer_dataSource[i].showHeight = true;
			}else{
				self._layer_dataSource[i].showHeight = false;
			}
			if(self._layer_dataSource[i].showHeight && self._layer_dataSource[i].showLayer && self._layer_dataSource[i].showEntity){
				self._layer_dataSource[i].show = true;
			}else{
				self._layer_dataSource[i].show = false;
			}
		}
	});
	//私有注册事件
	this._handler = new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas);
	//LEFT_CLICK 左键点击事件
	this._handler.setInputAction(function (e) {
		var lonlat = self._globe.getLonLatByPosition(e.position);
		if(self._options.draw){
			var m_options = {};
			for (var key in self._options.options){
				if(key!="color" && key!="layer"){
					m_options[key] = typeof self._options.options[key]==="object"? deepCoyp(self._options.options[key]): self._options.options[key];
				}
			}
    		m_options.lon = lonlat.lon;
    		m_options.lat = lonlat.lat;
    		m_options.alt = lonlat.alt;
			m_options.layer = self._options.options.layer ? self._options.options.layer : null;
    		var m_mark = self.add(m_options);
    		if(self._options.handlerCallback){
    			self._options.handlerCallback(m_mark);
    		}
    	}else{
    		var pick = self._viewer.scene.pick(e.position);
	        if(Cesium.defined(pick)){
	            if(pick.id){
			        //回调函数
			        if(pick.id._leftClick){
			        	pick.id._leftClick(pick.id);
			        }
	            }
	        }	
    	}
	}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
//	//RIGHT_CLICK 右键点击事件
//	this._handler.setInputAction(function (e) {
//		var pick = self._viewer.scene.pick(e.position);
//		if(Cesium.defined(pick)){
//			if(pick.id){
//				if(pick.id._rightClick){
//		        	pick.id._rightClick(pick.id);
//		        }
//			}
//		}
//	}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
	//MOUSE_MOVE 鼠标移动事件
	this._handler.setInputAction(function(movement){
		var pick = self._globe._viewer.scene.pick(movement.endPosition);
        if(Cesium.defined(pick)){
            if(pick.id && pick.id.constructor != Array){
            	if(pick.id.mousemoveShowLabel){
            		if(self._selectMark){
               			self._selectMark._label._show._value = self._selectMarkShow;
              		}
            		self._selectMark = pick.id;
	            	self._selectMarkShow = self._selectMark._label._show._value;
			        pick.id._label._show._value = true;
			        var m_text = pick.id._label._text;
			        
            	}
            }
        }else if(self._selectMark){
        	self._selectMark._label._show._value = self._selectMarkShow;
        	self._selectMark = null;
        }
	}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
	
	this._dataSource = new Cesium.CustomDataSource('myData');
	this._pixelRange = 15;
    this._minimumClusterSize = 3;
    this._dataSource.clustering.enabled = true;
    this._dataSource.clustering.pixelRange = this._pixelRange;
    this._dataSource.clustering.minimumClusterSize = this._minimumClusterSize;
	var pinBuilder = new Cesium.PinBuilder();
    var pin50 = pinBuilder.fromText('50+', Cesium.Color.fromCssColorString('#f30707'), 48).toDataURL();
    var pin40 = pinBuilder.fromText('40+', Cesium.Color.fromCssColorString('#f93737'), 48).toDataURL();
    var pin30 = pinBuilder.fromText('30+', Cesium.Color.fromCssColorString('#ec5834'), 48).toDataURL();
    var pin20 = pinBuilder.fromText('20+', Cesium.Color.fromCssColorString('#ff7d5d'), 48).toDataURL();
    var pin10 = pinBuilder.fromText('10+', Cesium.Color.fromCssColorString('#fda38d'), 48).toDataURL();
	var singleDigitPins = new Array(8);
    for (var i = 0; i < singleDigitPins.length; ++i) {
		singleDigitPins[i] = pinBuilder.fromText('' + (i + 2), Cesium.Color.fromCssColorString('#f1dfc7'), 48).toDataURL();
    }
    var removeListener = this._dataSource.clustering.clusterEvent.addEventListener(function(clusteredEntities, cluster) {
        cluster.label.show = false;
        cluster.billboard.show = true;
        cluster.billboard.id = cluster.label.id;
        cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.BOTTOM;
        cluster.billboard.heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
        cluster.billboard.disableDepthTestDistance = Number.POSITIVE_INFINITY;
        if (clusteredEntities.length >= 50) {
            cluster.billboard.image = pin50;
//          cluster.billboard.width = 80;
//			cluster.billboard.height = 80;
        } else if (clusteredEntities.length >= 40) {
            cluster.billboard.image = pin40;
//          cluster.billboard.width = 75;
//			cluster.billboard.height = 75;
        } else if (clusteredEntities.length >= 30) {
            cluster.billboard.image = pin30;
//          cluster.billboard.width = 70;
//			cluster.billboard.height = 70;
        } else if (clusteredEntities.length >= 20) {
            cluster.billboard.image = pin20;
//          cluster.billboard.width = 65;
//			cluster.billboard.height = 65;
        } else if (clusteredEntities.length >= 10) {
            cluster.billboard.image = pin10;
//          cluster.billboard.width = 60;
//			cluster.billboard.height = 60;
        } else {
            cluster.billboard.image = singleDigitPins[clusteredEntities.length - 2];
            cluster.billboard.width = 40;
			cluster.billboard.height = 40;
        }
    });
	this._viewer.dataSources.add(this._dataSource);
}

PlaceMark.prototype.setDataSources = function(options){
	var self = this;
	var pixelRange = options.pixelRange ? options.pixelRange : 15;
    var minimumClusterSize = options.minimumClusterSize ? options.minimumClusterSize : 3;
    self._dataSource.clustering.enabled = true;
    self._dataSource.clustering.pixelRange = pixelRange;
    self._dataSource.clustering.minimumClusterSize = minimumClusterSize;
}

/*
 * 添加聚合地标
 * @author zhaoxd
 * @method addToDataSources
 * @for PlaceMark
 * @param {Object} 地标参数
 * @return {Cesium.Entity} mark
 */
PlaceMark.prototype.addToDataSources = function(options){
	var self = this;
	var pinBuilder = new Cesium.PinBuilder();
	var mid = options.mid ? options.mid : "";
	var name = options.name ? options.name : "default";	
	var width = options.width ? parseInt(options.width) : 30;
	var height = options.height ? parseInt(options.height) : 30;
	var lon = options.lon ? parseFloat(options.lon) : 0;
	var lat = options.lat ? parseFloat(options.lat) : 0;
	var alt = options.alt ? parseFloat(options.alt) : 0;
	var color = options.color ? options.color : Cesium.Color.YELLOW;
	var url = options.url ? options.url : pinBuilder.fromColor(color, 48).toDataURL();
	var callback = options.callback ? options.callback : null;
	var setMenu = options.setMenu ? options.setMenu : null;
	var leftClick = options.leftClick ? options.leftClick : null;
	var rightClick = options.rightClick ? options.rightClick : null;
	var description = options.description ? options.description : "";
	var showBox = options.showBox !== false;
	var windowWidth = options.windowWidth ? parseInt(options.windowWidth) : 100;
	var windowHeight = options.windowHeight ? parseInt(options.windowHeight) : 80;
	var src = options.src ? options.src : "";
	var showWindow = options.showWindow !== false;
//	var layer = options.layer ? options.layer : self._defaultLayer;
	var catalog = options.catalog ? options.catalog : self._catalog;
	var subcatalog = options.subcatalog ? options.subcatalog : self._subcatalog;
	var minHeight = options.minHeight ? options.minHeight : self._minHeight;
	var maxHeight = options.maxHeight ? options.maxHeight : self._maxHeight;
	var label = options.label ? options.label : "";
	var labelSize = options.labelSize ? options.labelSize : 14;
	var labelFamily = options.labelFamily ? options.labelFamily : "sans-serif";
	var mousemoveShowLabel = options.mousemoveShowLabel !== false;
//	var labelColor = options.labelColor ? options.labelColor : Cesium.Color.WHITE;
	var labelColor;
	if(options.labelColor){
		if(options.labelColor.indexOf("#") != -1){
			labelColor = Cesium.Color.fromCssColorString(options.labelColor);
		}else{
			labelColor = options.labelColor;
		}
	}else{
		labelColor = Cesium.Color.WHITE;
	}
	var labelShow = options.labelShow !== false;
	var heightReference;
	var position;
	var clampMode = options.clampMode ? options.clampMode : 0;
	if(clampMode == 0){
		heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
		position = Cesium.Cartesian3.fromDegrees(lon, lat);
	}else {
		heightReference = Cesium.HeightReference.NONE;
		position = Cesium.Cartesian3.fromDegrees(lon, lat, alt);
    }
	
	var markPoint = {lon:lon,lat:lat,alt:alt};
	var mark = self._dataSource.entities.add({
	    mid : mid,
	    name : name,
//	    layer:layer,
	    showBox : showBox,
	    showWindow : showWindow,
	    windowWidth : windowWidth,
	    windowHeight : windowHeight,
	    src : src,
	    callback : callback,
	    setMenu : setMenu,
	    leftClick : leftClick,
	    rightClick : rightClick,
	    position : position,
	    description : description,
	    markPoint: markPoint,
	    options: options,
	    mousemoveShowLabel: mousemoveShowLabel,
	    catalog: catalog,
	    subcatalog: subcatalog,
	    minHeight: minHeight,
	    maxHeight: maxHeight,
	    showHeight: true,
	    showLayer: true,
	    showEntity: true,
	    billboard : {
	        image : url,
	    	show: true,
	        width : width,
	        height : height,
	        verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
	        heightReference: heightReference,
	        disableDepthTestDistance : Number.POSITIVE_INFINITY
	    },
	    label:{
	    	text: label.toString(),
	    	font: labelSize + "pt " + labelFamily,
	    	fillColor: labelColor,
	    	show: false,
	    	horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
	    	pixelOffset: new Cesium.Cartesian2(width/2, 0),
	    	verticalOrigin : Cesium.VerticalOrigin.BASELINE,
	        heightReference: heightReference,
	        disableDepthTestDistance : Number.POSITIVE_INFINITY
	    }
	});
	self._layer_dataSource.push(mark);
	var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
	self._globe.layerManager._add("entityLayer",startTime,catalog,subcatalog);
	return mark;
}

/*
 * 添加地标
 * @author zhaoxd
 * @method add
 * @for PlaceMark
 * @param {Object} 地标参数
 * @return {Cesium.Entity} mark
 */
PlaceMark.prototype.add = function(options){
	var self = this;
	var pinBuilder = new Cesium.PinBuilder();
	var mid = options.mid ? options.mid : "";
	var name = options.name ? options.name : "default";
	var width = options.width ? parseInt(options.width) : 30;
	var height = options.height ? parseInt(options.height) : 30;
	var lon = options.lon ? parseFloat(options.lon) : 0;
	var lat = options.lat ? parseFloat(options.lat) : 0;
	var alt = options.alt ? parseFloat(options.alt) : 0;
	var color = options.color ? options.color : Cesium.Color.YELLOW;
	var url = options.url ? options.url : pinBuilder.fromColor(color, 48).toDataURL();
	var callback = options.callback ? options.callback : null;
	var setMenu = options.setMenu ? options.setMenu : null;
	var leftClick = options.leftClick ? options.leftClick : null;
	var rightClick = options.rightClick ? options.rightClick : null;
	var description = options.description ? options.description : "";
	var showBox = options.showBox !== false;
	var windowWidth = options.windowWidth ? parseInt(options.windowWidth) : 100;
	var windowHeight = options.windowHeight ? parseInt(options.windowHeight) : 80;
	var src = options.src ? options.src : "";
	var showWindow = options.showWindow !== false;
	var catalog = options.catalog ? options.catalog : self._catalog;
	var subcatalog = options.subcatalog ? options.subcatalog : self._subcatalog;
	var minHeight = options.minHeight ? options.minHeight : self._minHeight;
	var maxHeight = options.maxHeight ? options.maxHeight : self._maxHeight;
	var label = options.label ? options.label : "";
	var labelSize = options.labelSize ? options.labelSize : 14;
	var labelFamily = options.labelFamily ? options.labelFamily : "sans-serif";
	var mousemoveShowLabel = options.mousemoveShowLabel !== false;
	var nearFarScalarImage = options.nearFarScalarImage ? options.nearFarScalarImage : null;
	var nearFarScalarLabel = options.nearFarScalarLabel ? options.nearFarScalarLabel : null;
	var m_nearFarScalarImage = new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e6, 1.0);
	var m_nearFarScalarLabel = new Cesium.NearFarScalar(1.5e2, 1.0, 1.5e6, 1.0);
	if(nearFarScalarImage && nearFarScalarImage.length == 4){
		m_nearFarScalarImage = new Cesium.NearFarScalar(nearFarScalarImage[0], nearFarScalarImage[1], nearFarScalarImage[2], nearFarScalarImage[3]);
	}
	if(nearFarScalarLabel && nearFarScalarLabel.length == 4){
		m_nearFarScalarLabel = new Cesium.NearFarScalar(nearFarScalarLabel[0], nearFarScalarLabel[1], nearFarScalarLabel[2], nearFarScalarLabel[3]);
	}
	
	var labelColor;
	if(options.labelColor){
		if(options.labelColor.indexOf("#") != -1){
			labelColor = Cesium.Color.fromCssColorString(options.labelColor);
		}else{
			labelColor = options.labelColor;
		}
	}else{
		labelColor = Cesium.Color.WHITE;
	}
	var labelShow = options.labelShow !== false;
//	var showBackground = options.showBackground !== false;
	var showBackground = false;
	if(options.showBackground){
		showBackground = options.showBackground
	}
	var backgroundColor;
	if(options.backgroundColor){
		if(options.backgroundColor.indexOf("#") != -1){
			backgroundColor = Cesium.Color.fromCssColorString(options.backgroundColor);
		}else{
			backgroundColor = options.backgroundColor;
		}
	}else{
		backgroundColor = Cesium.Color.BLUE;
	}
	var heightReference;
	var position;
	var clampMode = options.clampMode ? options.clampMode : 0;
	if(clampMode == 0){
		heightReference = Cesium.HeightReference.RELATIVE_TO_GROUND;
		position = Cesium.Cartesian3.fromDegrees(lon, lat);
	}else {
		heightReference = Cesium.HeightReference.NONE;
		position = Cesium.Cartesian3.fromDegrees(lon, lat, alt);
    }
	
	var markPoint = {lon:lon,lat:lat,alt:alt};
	var mark = self._viewer.entities.add({
	    mid : mid,
	    name : name,
	    catalog : catalog,
	    subcatalog : subcatalog,
//	    layer:layer,
	    showBox : showBox,
	    showWindow : showWindow,
	    windowWidth : windowWidth,
	    windowHeight : windowHeight,
	    src : src,
	    callback : callback,
	    setMenu : setMenu,
	    leftClick : leftClick,
	    rightClick : rightClick,
	    position : position,
	    description : description,
	    markPoint: markPoint,
	    options: options,
	    mousemoveShowLabel: mousemoveShowLabel,
	    minHeight: minHeight,
	    maxHeight: maxHeight,
	    showHeight: true,
	    showLayer: true,
	    showEntity: true,
	    billboard : {
	        image : url,
	    	show: true,
	        width : width,
	        height : height,
	        verticalOrigin : Cesium.VerticalOrigin.BOTTOM,
	        heightReference: heightReference,
	        disableDepthTestDistance : Number.POSITIVE_INFINITY,
//	        scaleByDistance : new Cesium.NearFarScalar(1.5e2, 1.5, 1.5e7, 0.5)
	        scaleByDistance : m_nearFarScalarImage
	    },
	    label:{
	    	text: label.toString(),
	    	font: labelSize + "pt " + labelFamily,
	    	fillColor: labelColor,
	    	showBackground: showBackground,
	    	backgroundColor: backgroundColor,
	    	show: labelShow,
	    	horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
	    	pixelOffset: new Cesium.Cartesian2(width/2, 0),
	    	verticalOrigin : Cesium.VerticalOrigin.BASELINE,
	        heightReference: heightReference,
	        disableDepthTestDistance : Number.POSITIVE_INFINITY,
	        scaleByDistance : m_nearFarScalarLabel
	    }
	});
	self._layer[self._layer.length] = mark;
	var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
	self._globe.layerManager._add("entityLayer",startTime,catalog,subcatalog);
	return mark;
}

/*
 * 修改地标
 * @author zhaoxd
 * @method revise
 * @for PlaceMark
 * @param {Cesium.Entity} mark-地标
 * @param {Object} options-地标参数
 * @return {null} null
 */
PlaceMark.prototype.revise = function(mark,options){
	var self = this;
	for(var i = self._layer.length - 1; i >= 0; i--){
		if(self._layer[i] == mark){
			var width = options.width ? parseInt(options.width) : self._layer[i]._billboard._width._value;
			var height = options.height ? parseInt(options.height) : self._layer[i]._billboard._height._value;
			var url = options.url ? options.url : self._layer[i]._billboard._image._value;
			var cartographic = Cesium.Cartographic.fromCartesian(self._layer[i]._position._value);
			var longitude = Cesium.Math.toDegrees(cartographic.longitude);
			var latitude = Cesium.Math.toDegrees(cartographic.latitude);
			var altitude = cartographic.height;
			var lon = options.lon ? parseFloat(options.lon) : longitude;
			var lat = options.lat ? parseFloat(options.lat) : latitude;
			var alt = options.alt ? parseFloat(options.alt) : altitude;
			var label = options.label ? options.label : self._layer[i]._label._text._value;
			var labelShow = self._layer[i]._label._show._value;
			if(!!options.labelShow === options.labelShow){
				labelShow = options.labelShow;
			}
			var show = self._layer[i].showEntity;
			if(!!options.show === options.show){
				show = options.show;
			}
			var markPoint = {lon:lon,lat:lat,alt:alt};
			self._layer[i]._billboard._width._value = width;
			self._layer[i]._billboard._height._value = height;
			self._layer[i]._billboard._image._value = url;
			self._layer[i]._position._value = Cesium.Cartesian3.fromDegrees(lon, lat, alt);
			self._layer[i]._label._text._value = label;
			self._layer[i]._label._show._value = labelShow;
			self._layer[i]._markPoint = markPoint;
			self._layer[i].showEntity = show;
		}
	}
	for(var i = self._layer_dataSource.length - 1; i >= 0; i--){
		if(self._layer_dataSource[i] == mark){
			var width = options.width ? parseInt(options.width) : self._layer_dataSource[i]._billboard._width._value;
			var height = options.height ? parseInt(options.height) : self._layer_dataSource[i]._billboard._height._value;
			var url = options.url ? options.url : self._layer_dataSource[i]._billboard._image._value;
			var cartographic = Cesium.Cartographic.fromCartesian(self._layer_dataSource[i]._position._value);
			var longitude = Cesium.Math.toDegrees(cartographic.longitude);
			var latitude = Cesium.Math.toDegrees(cartographic.latitude);
			var altitude = cartographic.height;
			var lon = options.lon ? parseFloat(options.lon) : longitude;
			var lat = options.lat ? parseFloat(options.lat) : latitude;
			var alt = options.alt ? parseFloat(options.alt) : altitude;
//			var label = options.label ? options.label : self._layer_dataSource[i]._label._text._value;
//			var labelShow = self._layer_dataSource[i]._label._show._value;
//			if(!!options.labelShow === options.labelShow){
//				labelShow = options.labelShow;
//			}
			var show = self._layer_dataSource[i]._show;
			if(!!options.show === options.show){
				show = options.show;
			}
			var markPoint = {lon:lon,lat:lat,alt:alt};
			self._layer_dataSource[i]._billboard._width._value = width;
			self._layer_dataSource[i]._billboard._height._value = height;
			self._layer_dataSource[i]._billboard._image._value = url;
			self._layer_dataSource[i]._position._value = Cesium.Cartesian3.fromDegrees(lon, lat, alt);
//			self._layer_dataSource[i]._label._text._value = label;
//			self._layer_dataSource[i]._label._show._value = labelShow;
			self._layer_dataSource[i]._markPoint = markPoint;
			self._layer_dataSource[i].show = show;
		}
	}
}

/*
 * 根据mid修改地标
 * @author zhaoxd
 * @method reviseByMid
 * @for PlaceMark
 * @param {string} mid-地标mid
 * @param {Object} options-地标参数
 * @return {null} null
 */
PlaceMark.prototype.reviseByMid = function(mid,options){
	var self = this;
	for(var i = self._layer.length - 1; i >= 0; i--){
		if(self._layer[i].mid == mid){
			var width = options.width ? parseInt(options.width) : self._layer[i]._billboard._width._value;
			var height = options.height ? parseInt(options.height) : self._layer[i]._billboard._height._value;
			var url = options.url ? options.url : self._layer[i]._billboard._image._value;
			var cartographic = Cesium.Cartographic.fromCartesian(self._layer[i]._position._value);
			var longitude = Cesium.Math.toDegrees(cartographic.longitude);
			var latitude = Cesium.Math.toDegrees(cartographic.latitude);
			var altitude = cartographic.height;
			var lon = options.lon ? parseFloat(options.lon) : longitude;
			var lat = options.lat ? parseFloat(options.lat) : latitude;
			var alt = options.alt ? parseFloat(options.alt) : altitude;
			var label = options.label ? options.label : self._layer[i]._label._text._value;
			var labelShow = self._layer[i]._label._show._value;
			if(!!options.labelShow === options.labelShow){
				labelShow = options.labelShow;
			}
			var show = self._layer[i]._show;
			if(!!options.show === options.show){
				show = options.show;
			}
			var markPoint = {lon:lon,lat:lat,alt:alt};
			self._layer[i]._billboard._width._value = width;
			self._layer[i]._billboard._height._value = height;
			self._layer[i]._billboard._image._value = url;
			self._layer[i]._position._value = Cesium.Cartesian3.fromDegrees(lon, lat, alt);
			self._layer[i]._label._text._value = label;
			self._layer[i]._label._show._value = labelShow;
			self._layer[i]._markPoint = markPoint;
			self._layer[i].show = show;
		}
	}
	for(var i = self._layer_dataSource.length - 1; i >= 0; i--){
		if(self._layer_dataSource[i].mid == mid){
			var width = options.width ? parseInt(options.width) : self._layer_dataSource[i]._billboard._width._value;
			var height = options.height ? parseInt(options.height) : self._layer_dataSource[i]._billboard._height._value;
			var url = options.url ? options.url : self._layer_dataSource[i]._billboard._image._value;
			var cartographic = Cesium.Cartographic.fromCartesian(self._layer_dataSource[i]._position._value);
			var longitude = Cesium.Math.toDegrees(cartographic.longitude);
			var latitude = Cesium.Math.toDegrees(cartographic.latitude);
			var altitude = cartographic.height;
			var lon = options.lon ? parseFloat(options.lon) : longitude;
			var lat = options.lat ? parseFloat(options.lat) : latitude;
			var alt = options.alt ? parseFloat(options.alt) : altitude;
//			var label = options.label ? options.label : self._layer_dataSource[i]._label._text._value;
//			var labelShow = self._layer_dataSource[i]._label._show._value;
//			if(!!options.labelShow === options.labelShow){
//				labelShow = options.labelShow;
//			}
			var show = self._layer_dataSource[i]._show;
			if(!!options.show === options.show){
				show = options.show;
			}
			var markPoint = {lon:lon,lat:lat,alt:alt};
			self._layer_dataSource[i]._billboard._width._value = width;
			self._layer_dataSource[i]._billboard._height._value = height;
			self._layer_dataSource[i]._billboard._image._value = url;
			self._layer_dataSource[i]._position._value = Cesium.Cartesian3.fromDegrees(lon, lat, alt);
//			self._layer_dataSource[i]._label._text._value = label;
//			self._layer_dataSource[i]._label._show._value = labelShow;
			self._layer_dataSource[i]._markPoint = markPoint;
			self._layer_dataSource[i].show = show;
		}
	}
}

/*
 * 球体点击添加地标
 * @author zhaoxd
 * @method drawHandler
 * @for PlaceMark
 * @param {Object} 地标参数
 * @return {null} null
 */
PlaceMark.prototype.drawHandler = function(options){
	var self = this;
	self._options.draw = true;
	self._options.options = options;
	var handlerCallback = options.handlerCallback ? options.handlerCallback : null;
	self._options.handlerCallback = handlerCallback;
}

/*
 * 暂停球体点击添加地标
 * @author zhaoxd
 * @method deactivateHandler
 * @for PlaceMark
 * @param {null} null
 * @return {null} null
 */
PlaceMark.prototype.deactivateHandler = function(){
	var self = this;
	self._options.draw = false;
}

/*
 * 移除地标
 * @author zhaoxd
 * @method remove
 * @for PlaceMark
 * @param {Cesium.Entity} 地标
 * @return {Boolean} true:成功,false:失败
 */
PlaceMark.prototype.remove = function(mark){
	var self = this;
//	self._removeInfoWindow(mark._id);
	for(var i = self._layer.length - 1; i >= 0; i--){
		if(self._layer[i] == mark){
			var catalog = self._layer[i].catalog;
			var subcatalog = self._layer[i].subcatalog;
			var back = self._viewer.entities.remove(mark);
			self._layer.splice(i, 1);
			self._globe.layerManager._remove("entityLayer",catalog,subcatalog);
			return back;
		}
	}
	for(var i = self._layer_dataSource.length - 1; i >= 0; i--){
		if(self._layer_dataSource[i] == mark){
			var catalog = self._layer_dataSource[i].catalog;
			var subcatalog = self._layer_dataSource[i].subcatalog;
			var back = self._dataSource.entities.remove(mark);
			self._layer_dataSource.splice(i, 1);
			self._globe.layerManager._remove("entityLayer",catalog,subcatalog);
			return back;
		}
	}
}

/*
 * 根据mid移除地标
 * @author zhaoxd
 * @method removeByMid
 * @for PlaceMark
 * @param {string} 地标mid
 * @return {Boolean} true:成功,false:失败
 */
PlaceMark.prototype.removeByMid = function(mid){
	var self = this;
	var back = true;
	for(var i = self._layer.length - 1; i >= 0; i--){
		if(self._layer[i].mid == mid){
			var catalog = self._layer[i].catalog;
			var subcatalog = self._layer[i].subcatalog;
			back = self._viewer.entities.remove(self._layer[i]);
			self._layer.splice(i, 1);
			self._globe.layerManager._remove("entityLayer",catalog,subcatalog);
			if(!back){
				return back;
			}
		}
	}
	for(var i = self._layer_dataSource.length - 1; i >= 0; i--){
		if(self._layer_dataSource[i].mid == mid){
			var catalog = self._layer_dataSource[i].catalog;
			var subcatalog = self._layer_dataSource[i].subcatalog;
			back = self._dataSource.entities.remove(self._layer_dataSource[i]);
			self._layer_dataSource.splice(i, 1);
			self._globe.layerManager._remove("entityLayer",catalog,subcatalog);
			if(!back){
				return back;
			}
		}
	}
	return back;
}

/*
 * 根据name移除地标
 * @author zhaoxd
 * @method removeByName
 * @for PlaceMark
 * @param {string} 地标name
 * @return {Boolean} true:成功,false:失败
 */
PlaceMark.prototype.removeByName = function(name){
	var self = this;
	var back = true;
	for(var i = self._layer.length - 1; i >= 0; i--){
		if(self._layer[i].name == name){
			var catalog = self._layer[i].catalog;
			var subcatalog = self._layer[i].subcatalog;
			back = self._viewer.entities.remove(self._layer[i]);
			self._layer.splice(i, 1);
			self._globe.layerManager._remove("entityLayer",catalog,subcatalog);
			if(!back){
				return back;
			}
		}
	}
	for(var i = self._layer_dataSource.length - 1; i >= 0; i--){
		if(self._layer_dataSource[i].name == name){
			var catalog = self._layer_dataSource[i].catalog;
			var subcatalog = self._layer_dataSource[i].subcatalog;
			back = self._dataSource.entities.remove(self._layer_dataSource[i]);
			self._layer_dataSource.splice(i, 1);
			self._globe.layerManager._remove("entityLayer",catalog,subcatalog);
			if(!back){
				return back;
			}
		}
	}
	return back;
}

/*
 * 根据mid获取地标
 * @author zhaoxd
 * @method getByMid
 * @for PlaceMark
 * @param {string} 地标mid
 * @return {list} list
 */
PlaceMark.prototype.getByMid = function(mid){
	var self = this;
	var list = [];
	for(var i = self._layer.length - 1; i >= 0; i--){
		if(self._layer[i].mid == mid){
			list.push(self._layer[i]);
		}
	}
	for(var i = self._layer_dataSource.length - 1; i >= 0; i--){
		if(self._layer_dataSource[i].mid == mid){
			list.push(self._layer_dataSource[i]);
		}
	}
	return list;
}

/*
 * 根据name获取地标
 * @author zhaoxd
 * @method getByName
 * @for PlaceMark
 * @param {string} 地标name
 * @return {list} list
 */
PlaceMark.prototype.getByName = function(name){
	var self = this;
	var list = [];
	for(var i = self._layer.length - 1; i >= 0; i--){
		if(self._layer[i].name == name){
			list.push(self._layer[i]);
		}
	}
	for(var i = self._layer_dataSource.length - 1; i >= 0; i--){
		if(self._layer_dataSource[i].name == name){
			list.push(self._layer_dataSource[i]);
		}
	}
	return list;
}

return PlaceMark;
})