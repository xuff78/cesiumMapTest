/*
* author: 赵雪丹
* description: GlobeLayer-图层
* day: 2017-9-28
*/
define( [ ], function( ){
function GlobeLayer(globe){
	this._globe = globe;
	this._viewer = globe._viewer;
	this._globeId = globe._globeId;
	this._widget = this._viewer.cesiumWidget;
	this._layerList = [];
	this._vectorLayerList = [];
	this._stk = null;
}

/*
 * 加载本地缓存
 * @author zhaoxd
 * @method addLocalTileLayer
 * @for GlobeLayer
 * @param {string} url-本地缓存地址
 * @param {string} name-图层名
 * @return {ImageryLayer} backLayer
 */
GlobeLayer.prototype.addLocalTileLayer = function(options){
	var self = this;
	try{
		var m_show = true;
		if(options && typeof options.show === 'boolean'){
			m_show = options.show;
		}
		var m_url = options.url ? options.url : "";
		var m_name = options.name ? options.name : "";
		var m_minimumLevel = options.minimumLevel ? options.minimumLevel : 0;
		var m_maximumLevel = options.maximumLevel ? options.maximumLevel : 20;
		var m_west = options.west ? options.west : -180;
		var m_south = options.south ? options.south : -90;
		var m_east = options.east ? options.east : 180;
		var m_north = options.north ? options.north : 90;
		var layers = self._viewer.imageryLayers;
		var tmsLayer = new Cesium.createTileMapServiceImageryProvider({
			minimumLevel : m_minimumLevel,
			maximumLevel : m_maximumLevel,
			url : m_url,
			credit : m_name,
			rectangle : Cesium.Rectangle.fromDegrees(m_west, m_south, m_east, m_north)
		});
		var backLayer = layers.addImageryProvider(tmsLayer);
		var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
		backLayer.lid = startTime;
		backLayer.show = m_show;
		self._layerList[self._layerList.length] = backLayer;
		self._globe.layerManager._add("globeLayer",startTime,m_name,"",m_show);
		return backLayer;
    }
    catch(e){
        if (self._widget._showRenderLoopErrors) {
            var title = '请检查本地缓存地址！';
            self._widget.showErrorPanel(title, undefined, e);
        }
        return;
    }
}

/*
 * 加载本地STK
 * @author zhaoxd
 * @method addLocalSTKLayer
 * @for GlobeLayer
 * @param {string} url-本地STK地址
 * @return {null} null
 */
GlobeLayer.prototype.addLocalSTKLayer = function(url){
	var self = this;
	try{
		var cesiumTerrainProviderMeshes = new Cesium.CesiumTerrainProvider({
		    url : url,
		    requestWaterMask : true,
		    requestVertexNormals : true
		});
		var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
		cesiumTerrainProviderMeshes.lid = startTime;
		self._viewer.terrainProvider = cesiumTerrainProviderMeshes;
		self._stk = Object.create(cesiumTerrainProviderMeshes);
//		self._globe.layerManager._add("stkLayer",startTime,"本地STK");
    }
    catch(e){
        if (self._widget._showRenderLoopErrors) {
            var title = '请检查本地STK地址！';
            self._widget.showErrorPanel(title, undefined, e);
        }
    }
}

/*
* 加载BingMap
* @author zhaoxd
* @method loadBingMap
* @for GlobeLayer
* @param {null} null
* @return {ImageryLayer} bingMapLayer
*/
GlobeLayer.prototype.loadBingMap = function(options){
	var self = this;
	options = options ? options : {};
	var m_name = options.name ? options.name : "BingMap";
	var m_show = true;
	if(typeof options.show === 'boolean'){
		m_show = options.show;
	}
	var layers = self._viewer.imageryLayers;
	var bingMap = new Cesium.BingMapsImageryProvider({
		key : "AjQhMyw76oicHqFz7cUc3qTEy3M2fC2YIbcHjqgyMPuQprNVBr3SsvVdOfmlVc0v",//可至官网（https://www.bingmapsportal.com/）申请key
		url : self._globe.urlConfig.BINGMAP
	});
	var bingMapLayer = layers.addImageryProvider(bingMap);
	var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
	bingMapLayer.lid = startTime;
	bingMapLayer.show = m_show;
	self._layerList[self._layerList.length] = bingMapLayer;
	self._globe.layerManager._add("globeLayer",startTime,m_name,"",m_show);
	return bingMapLayer;
}

/*
* 加载高德影像地图服务
* @author zhaoxd
* @method loadGaodeMapIMG
* @for GlobeLayer
* @param {null} null
* @return {ImageryLayer} gaodeMapLayer
*/
GlobeLayer.prototype.loadGaodeMapIMG = function(options){
	var self = this;
	options = options ? options : {};
	var m_name = options.name ? options.name : "高德影像地图";
	var m_show = true;
	if(typeof options.show === 'boolean'){
		m_show = options.show;
	}
	var layers = self._viewer.imageryLayers;
	var gaodeMap = new Cesium.UrlTemplateImageryProvider({
		url: 'http://{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
        credit: new Cesium.Credit('高德影像地图服务'),
        subdomains: ['webst01', 'webst02', 'webst03', 'webst04'],
        tilingScheme: new Cesium.WebMercatorTilingScheme(),
	    maximumLevel: 20,
	    show: false
	});
	var gaodeMapLayer = layers.addImageryProvider(gaodeMap);
	var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
	gaodeMapLayer.lid = startTime;
	gaodeMapLayer.show = m_show;
	self._layerList[self._layerList.length] = gaodeMapLayer;
	self._globe.layerManager._add("globeLayer",startTime,m_name,"",m_show);
	return gaodeMapLayer;
}

/*
* 加载高德矢量地图服务
* @author zhaoxd
* @method loadGaodeMapVEC
* @for GlobeLayer
* @param {null} null
* @return {ImageryLayer} gaodeMapLayer
*/
GlobeLayer.prototype.loadGaodeMapVEC = function(options){
	var self = this;
	options = options ? options : {};
	var m_name = options.name ? options.name : "高德矢量地图";
	var m_show = true;
	if(typeof options.show === 'boolean'){
		m_show = options.show;
	}
	var layers = self._viewer.imageryLayers;
	var gaodeMap = new Cesium.UrlTemplateImageryProvider({
		url: 'http://wprd{s}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=8&ltype=11',
	    credit: new Cesium.Credit('高德矢量地图服务'),
	    subdomains: ['01', '02', '03', '04'],
	    tilingScheme: new Cesium.WebMercatorTilingScheme(),
	    maximumLevel: 20,
	    show: false
	});
	var gaodeMapLayer = layers.addImageryProvider(gaodeMap);
	var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
	gaodeMapLayer.lid = startTime;
	gaodeMapLayer.show = m_show;
	self._layerList[self._layerList.length] = gaodeMapLayer;
	self._globe.layerManager._add("globeLayer",startTime,m_name,"",m_show);
	return gaodeMapLayer;
}

/*
* 加载高德矢量地图中文注记服务服务
* @author zhaoxd
* @method loadGaodeMapCIA 
* @for GlobeLayer
* @param {null} null
* @return {ImageryLayer} gaodeMapLayer
*/
GlobeLayer.prototype.loadGaodeMapCIA = function(options){
	var self = this;
	options = options ? options : {};
	var m_name = options.name ? options.name : "高德中文注记";
	var m_show = true;
	if(typeof options.show === 'boolean'){
		m_show = options.show;
	}
	var layers = self._viewer.imageryLayers;
	var gaodeMap = new Cesium.UrlTemplateImageryProvider({
		url: 'http://{s}.is.autonavi.com/appmaptile??lang=zh_cn&size=1&scale=1&style=8&L={z}&Z={z}&Y={y}&X={x}',
	    credit: new Cesium.Credit('高德中文注记服务'),
	    subdomains: ['webst01', 'webst02', 'webst03', 'webst04'],
	    tilingScheme: new Cesium.WebMercatorTilingScheme(),
	    maximumLevel: 20,
	    show: false
	});
	var gaodeMapLayer = layers.addImageryProvider(gaodeMap);
	var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
	gaodeMapLayer.lid = startTime;
	gaodeMapLayer.show = m_show;
	self._layerList[self._layerList.length] = gaodeMapLayer;
	self._globe.layerManager._add("globeLayer",startTime,m_name,"",m_show);
	return gaodeMapLayer;
}

/*
* 加载腾讯地图中文注记服务服务
* @author zhaoxd
* @method loadQQMapCIA 
* @for GlobeLayer
* @param {null} null
* @return {ImageryLayer} gaodeMapLayer
*/
GlobeLayer.prototype.loadQQMapCIA = function(options){
	var self = this;
	options = options ? options : {};
	var m_name = options.name ? options.name : "腾讯中文注记";
	var m_show = true;
	if(typeof options.show === 'boolean'){
		m_show = options.show;
	}
	var layers = self._viewer.imageryLayers;
	var gaodeMap = new Cesium.UrlTemplateImageryProvider({
//		url: 'http://{s}.map.gtimg.com/appmaptile??lang=zh_cn&size=1&scale=1&style=8&L={z}&Z={z}&Y={y}&X={x}',
		//y=int.Parse(Math.Pow(2,z).ToString())-1-y;
//		y=parseInt(Math.pow(2,z).toString())-1-y;
		url: 'http://{s}.map.gtimg.com/tile?z={z}&x={x}&y={reverseY}&styleid=3&version=110',
		//http://rt0.map.gtimg.com/tile?z=2&x=2&y=0&styleid=2&version=110
		//http://rt3.map.gtimg.com/tile?z=13&x=6949&y=5209&styleid=2&version=110
	    credit: new Cesium.Credit('腾讯中文注记服务'),
	    subdomains: ['rt0', 'rt1', 'rt2', 'rt3'],
	    tilingScheme: new Cesium.WebMercatorTilingScheme(),
	    maximumLevel: 18,
	    show: false
	});
//	gaodeMap._urlParts[ 3 ] = function( imageryProvider, x, y, level) ) {
//		
//	}
	var gaodeMapLayer = layers.addImageryProvider(gaodeMap);
	var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
	gaodeMapLayer.lid = startTime;
	gaodeMapLayer.show = m_show;
	self._layerList[self._layerList.length] = gaodeMapLayer;
	self._globe.layerManager._add("globeLayer",startTime,m_name,"",m_show);
	return gaodeMapLayer;
}

/*
* 加载GoogleMap
* @author zhaoxd
* @method loadGoogleMap
* @for GlobeLayer
* @param {null} null
* @return {ImageryLayer} googleMapLayer
*/
GlobeLayer.prototype.loadGoogleMap = function(options){
	var self = this;
	options = options ? options : {};
	var m_name = options.name ? options.name : "GoogleMap";
	var m_show = true;
	if(typeof options.show === 'boolean'){
		m_show = options.show;
	}
//	var m_minimumLevel = options.minimumLevel ? options.minimumLevel : 0;
//	var m_maximumLevel = options.maximumLevel ? options.maximumLevel : 30;
	var layers = self._viewer.imageryLayers;
	var googleMap = new Cesium.UrlTemplateImageryProvider({
//		minimumLevel : m_minimumLevel,
//		maximumLevel : m_maximumLevel,
		url : self._globe.urlConfig.GOOGLEMAP
	});
	var googleMapLayer = layers.addImageryProvider(googleMap);
	var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
	googleMapLayer.lid = startTime;
	googleMapLayer.show = m_show;
	self._layerList[self._layerList.length] = googleMapLayer;
	self._globe.layerManager._add("globeLayer",startTime,m_name,"",m_show);
	return googleMapLayer;
}

/*
* 加载天地图全球矢量地图服务
* @author zhaoxd
* @method loadTiandituMapVEC
* @for GlobeLayer
* @param {null} null
* @return {ImageryLayer} tiandituMapLayer
*/
GlobeLayer.prototype.loadTiandituMapVEC = function(options){
	var self = this;
	options = options ? options : {};
	var m_name = options.name ? options.name : "天地图矢量地图";
	var m_show = true;
	if(typeof options.show === 'boolean'){
		m_show = options.show;
	}
	var layers = self._viewer.imageryLayers;
	var tiandituMap = new Cesium.WebMapTileServiceImageryProvider({
	    url: self._globe.urlConfig.TDT_VEC,
	    layer: "tdtVecBasicLayer",
        style: "default",
        format: "image/jpeg",
        tileMatrixSetID: "GoogleMapsCompatible",
        show: false
	});
	var tiandituMapLayer = layers.addImageryProvider(tiandituMap);
	var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
	tiandituMapLayer.lid = startTime;
	tiandituMapLayer.show = m_show;
	self._layerList[self._layerList.length] = tiandituMapLayer;
	self._globe.layerManager._add("globeLayer",startTime,m_name,"",m_show);
	return tiandituMapLayer;
}

/*
* 加载天地图全球影像地图服务
* @author zhaoxd
* @method loadTiandituMapIMG
* @for GlobeLayer
* @param {null} null
* @return {ImageryLayer} tiandituMapLayer
*/
GlobeLayer.prototype.loadTiandituMapIMG = function(options){
	var self = this;
	options = options ? options : {};
	var m_name = options.name ? options.name : "天地图影像地图";
	var m_show = true;
	if(typeof options.show === 'boolean'){
		m_show = options.show;
	}
	var layers = self._viewer.imageryLayers;
	var tiandituMap = new Cesium.WebMapTileServiceImageryProvider({
	    url: self._globe.urlConfig.TDT_IMG,
	    layer: "tdtBasicLayer",
        style: "default",
        format: "image/jpeg",
        tileMatrixSetID: "GoogleMapsCompatible",
        show: false
	});
	var tiandituMapLayer = layers.addImageryProvider(tiandituMap);
	var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
	tiandituMapLayer.lid = startTime;
	tiandituMapLayer.show = m_show;
	self._layerList[self._layerList.length] = tiandituMapLayer;
	self._globe.layerManager._add("globeLayer",startTime,m_name,"",m_show);
	return tiandituMapLayer;
}

/*
* 加载天地图全球影像中文注记服务
* @author zhaoxd
* @method loadTiandituMapCIA
* @for GlobeLayer
* @param {null} null
* @return {ImageryLayer} tiandituMapLayer
*/
GlobeLayer.prototype.loadTiandituMapCIA = function(options){
	var self = this;
	options = options ? options : {};
	var m_name = options.name ? options.name : "影像注记";
	var m_show = true;
	if(typeof options.show === 'boolean'){
		m_show = options.show;
	}
	var layers = self._viewer.imageryLayers;
	var tiandituMap = new Cesium.WebMapTileServiceImageryProvider({
	    url: self._globe.urlConfig.TDT_CIA,
	    layer: "tdtAnnoLayer",
	    style: "default",
	    format: "image/jpeg",
	    tileMatrixSetID: "GoogleMapsCompatible",
	    show: false,
//	    rectangle: new Cesium.Rectangle.fromDegrees(129.1353862556219, 42.60635007462175, 131.35293626966484, 44.230768258540245)
	});
	var tiandituMapLayer = layers.addImageryProvider(tiandituMap);
	var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
	tiandituMapLayer.lid = startTime;
	tiandituMapLayer.show = m_show;
	self._layerList[self._layerList.length] = tiandituMapLayer;
	self._globe.layerManager._add("globeLayer",startTime,m_name,"",m_show);
	return tiandituMapLayer;
}

/*
* 加载天地图全球矢量中文注记服务
* @author zhaoxd
* @method loadTiandituMapCVA
* @for GlobeLayer
* @param {null} null
* @return {ImageryLayer} tiandituMapLayer
*/
GlobeLayer.prototype.loadTiandituMapCVA = function(options){
	var self = this;
	options = options ? options : {};
	var m_name = options.name ? options.name : "矢量注记";
	var m_show = true;
	if(typeof options.show === 'boolean'){
		m_show = options.show;
	}
	var layers = self._viewer.imageryLayers;
	var tiandituMap = new Cesium.WebMapTileServiceImageryProvider({
	    url: self._globe.urlConfig.TDT_CVA,
	    layer: "tdtAnnoLayer",
	    style: "default",
	    format: "image/jpeg",
	    tileMatrixSetID: "GoogleMapsCompatible"
	});
	var tiandituMapLayer = layers.addImageryProvider(tiandituMap);
	var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
	tiandituMapLayer.lid = startTime;
	tiandituMapLayer.show = m_show;
	self._layerList[self._layerList.length] = tiandituMapLayer;
	self._globe.layerManager._add("globeLayer",startTime,m_name,"",m_show);
	return tiandituMapLayer;
}

/*
 * 加载WMS
 * @author zhaoxd
 * @method addWMSLayer
 * @for GlobeLayer
 * @param {string} url-WMS地址
 * @param {string} name-图层名
 * @param {string} layer-图层属性
 * @param {float} alpha-透明度
 * @return {ImageryLayer} backLayer
 */
GlobeLayer.prototype.addWMSLayer = function(url, name, layer, alpha, show){
	var self = this;
	var m_show = true;
	if(typeof show === 'boolean'){
		m_show = show;
	}
	var m_name = name ? name : "";
	var m_alpha = alpha ? alpha : 0.5;
	var layers = self._viewer.imageryLayers;
	var tmsLayer = new Cesium.WebMapServiceImageryProvider({
		url : url,
		layers : layer,
		credit : m_name,
		parameters : {
	        transparent : true,
	        format : 'image/png'
	    }
	});
	var backLayer = layers.addImageryProvider(tmsLayer);
	backLayer.alpha = m_alpha;
	var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
	backLayer.lid = startTime;
	backLayer.show = m_show;
	self._vectorLayerList.push(backLayer);
	self._globe.layerManager._add("vectorLayer",startTime,name,"",m_show);
	return backLayer;
}

/*
* 移除集合中的一个图层
* @author zhaoxd
* @method removeImageryLayer
* @for GlobeLayer
* @param {ImageryLayer} 待移除的图层
* @return {null} null
*/
GlobeLayer.prototype.removeImageryLayer = function(layer){
	try{
		var self = this;
		var lid = layer.lid;
		for(var i = self._layerList.length - 1; i >= 0; i--){
			if(self._layerList[i].lid == lid){
				self._layerList.splice(i, 1);
				self._globe.layerManager._remove("globeLayer",lid);
				break;
			}
		}
		for(var i = self._vectorLayerList.length - 1; i >= 0; i--){
			if(self._vectorLayerList[i].lid == lid){
				self._vectorLayerList.splice(i, 1);
				self._globe.layerManager._remove("vectorLayer",lid);
				break;
			}
		}
		var layers = self._viewer.imageryLayers;
		layers.remove(layer,true);
    }
    catch(e){
        if (self._widget._showRenderLoopErrors) {
            var title = '请检查图层类型！';
            self._widget.showErrorPanel(title, undefined, e);
        }
        return;
    }
}

/*
* 范围查询
* @author zhaoxd
* @method informationInquiryByRange
* @for GlobeLayer
* @param {Object} options.dist：半径  options.point：点坐标
* @return {null} null
*/
GlobeLayer.prototype.informationInquiryByRange = function(options){
	var self = this;
	var m_dist = options.dist ? options.dist : 1000;
	var m_point = options.point;
	var pointList = [];
	for(var i = 0; i < 36; i++){
		var endpoint = CommonFunc.destinationVincenty(m_point.lon, m_point.lat, m_point.alt, i*10, 0, m_dist);
		pointList[pointList.length] = {lon:endpoint.lon,lat:endpoint.lat};
	}
	options.typegml = "Polygon";
	options.points = pointList;
	self.informationInquiry(options);
}

/*
* 查询
* @author zhaoxd
* @method informationInquiry
* @for GlobeLayer
* @param {null} null
* @return {null} null
*/
GlobeLayer.prototype.informationInquiry = function(options){
	var typename = options.typename ? options.typename : "";
	var spatial = options.spatial ? options.spatial : "Intersects";
	var typegml = options.typegml ? options.typegml : "Point";
	var points = options.points ? options.points : [];
	var callback = options.callback ? options.callback : null;
	if(typename == ""){
		alert("抱歉：typename不能为空！");
		return;
	}
	if(points.length == 0){
		alert("抱歉：points不能为空！");
		return;
	}
	var m_filter = '';
	if(typegml == "Point"){
		m_filter += '<Filter xmlns="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml">';
		m_filter += '<'+spatial+'>';
		m_filter += '<PropertyName>the_geom</PropertyName>';
		m_filter += '<gml:Point>';
		m_filter += '<gml:coordinates>' + points[0].lon + ',' + points[0].lat + '</gml:coordinates>';
		m_filter += '</gml:Point>';
		m_filter += '</'+spatial+'>';
		m_filter += '</Filter>';
	}else if(typegml == "Polygon"){
		m_filter += '<Filter xmlns="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml">';
		m_filter += '<'+spatial+'>';
		m_filter += '<PropertyName>the_geom</PropertyName>';
		m_filter += '<gml:Polygon>';
		m_filter += '<gml:outerBoundaryIs>';
		m_filter += '<gml:LinearRing>';
		var strlonlat = "";
		for(var i = 0; i < points.length; i++){
			strlonlat += points[i].lon + ',' + points[i].lat + ' ';
		}
		strlonlat += points[0].lon + ',' + points[0].lat;
		m_filter += '<gml:coordinates>' + strlonlat + '</gml:coordinates>';
		m_filter += '</gml:LinearRing>';
		m_filter += '</gml:outerBoundaryIs>';
		m_filter += '</gml:Polygon>';
		m_filter += '</'+spatial+'>';
//		m_filter += '<And>';
//	    m_filter += '<PropertyIsEqualTo><PropertyName>林场</PropertyName><Literal>西林河林场</Literal></PropertyIsEqualTo>';
//	    m_filter += '</And>';
		m_filter += '</Filter>';
	}else if(typegml == "Polyline"){
		m_filter += '<Filter xmlns="http://www.opengis.net/ogc" xmlns:gml="http://www.opengis.net/gml">';
		m_filter += '<'+spatial+'>';
		m_filter += '<PropertyName>the_geom</PropertyName>';
		m_filter += '<gml:LineString>';
		var strlonlat = "";
		for(var i = 0; i < points.length; i++){
			if(i == points.length - 1){
				strlonlat += points[i].lon + ',' + points[i].lat;
			}else{
				strlonlat += points[i].lon + ',' + points[i].lat + ' ';
			}
		}
		m_filter += '<gml:coordinates>' + strlonlat + '</gml:coordinates>';
		m_filter += '</gml:LineString>';
		m_filter += '</'+spatial+'>';
		m_filter += '</Filter>';
	}
	
	$.ajax(self._globe.urlConfig.LOCALOWS,{
        type: 'GET',
        data: {
            service: 'WFS',
            version: '1.0.0',
            request: 'GetFeature',
            typename: typename,
            outputFormat: 'application/json',
//          cql_filter: 'UserID like %1%',
            filter: m_filter
        },
        success: function(data){
        	if(callback){
        		callback(data);
        	}
        },
        error: function(XMLHttpRequest, textStatus, errorThrown){
        	alert("抱歉："+textStatus);
        }
    });


//	$.ajax(self._globe.urlConfig.LOCALOWS,{
//      type: 'GET',
//      data: {
//          service: 'WFS',
//          version: '1.0.0',
//          request: 'GetFeature',
//          typename: "cf:city_poi",
//          outputFormat: 'application/json',
////          cql_filter: 'NAME="海口市"',
//          filter: m_filter
//      },
//      success: function(data){
//      	if(callback){
//      		callback(data);
//      	}
//      },
//      error: function(XMLHttpRequest, textStatus, errorThrown){
//      	alert("抱歉："+textStatus);
//      }
//  });
}

/*
* 专题地图
* @author zhaoxd
* @method thematicMap
* @for GlobeLayer
* @param {Object} options：参数 
* @return {null} null
*/
GlobeLayer.prototype.thematicMap = function(options){
	var self = this;
	var m_url = options.url ? options.url : "";
	var m_typename = options.typename ? options.typename : "";
	if(m_url == "" || m_typename == ""){
		return;
	}
	var m_maxFeatures = options.maxFeatures ? options.maxFeatures : 1000;
	var m_typegml = options.typegml ? options.typegml : "Polygon";
	var m_lineWidth = options.lineWidth ? options.lineWidth : 100;
	var m_color = options.color ? options.color : null;
	var m_callback = options.callback ? options.callback : null;
	$.ajax(m_url,{
        type: 'GET',
        data: {
            service: 'WFS',
            version: '1.0.0',
            request: 'GetFeature',
            typename: m_typename,
            maxFeatures: m_maxFeatures,
            outputFormat: 'application/json'
        },
        success: function(data){
        	if(data.features){
        		var instances = [];
        		for(var i = 0; i < data.features.length; i++){
        			var m_array = []; //[-115.0, 37.0, -107.0, 33.0]
        			var coordinates = data.features[i].geometry.coordinates[0];
        			for(var k = 0; k < coordinates.length; k++){
        				for(var j = 0; j < coordinates[k].length; j++){
        					var m_dat = coordinates[k][j];
        					m_array.push(m_dat[0]);
        					m_array.push(m_dat[1]);
        				}
        			}
        			var color = Cesium.Color.fromRandom();
        			if(m_color){
        				color = m_color;
        			}
        			if(m_typegml == "Polygon"){
        				instances.push( new Cesium.GeometryInstance( {  
							geometry : new Cesium.PolygonGeometry( {  
								polygonHierarchy : new Cesium.PolygonHierarchy(
					    			Cesium.Cartesian3.fromDegreesArray(m_array)
								)
	    					} ),  
						    attributes : {  
						  		color : Cesium.ColorGeometryInstanceAttribute.fromColor( color )
						  	}
						} ) );
        			}else if(m_typegml == "Polyline"){
        				instances.push( new Cesium.GeometryInstance( {  
							geometry : new Cesium.CorridorGeometry( {  
								vertexFormat : Cesium.VertexFormat.POSITION_ONLY,
								positions : Cesium.Cartesian3.fromDegreesArray(m_array),
								width : m_lineWidth
	    					} ),  
						    attributes : {  
						  		color : Cesium.ColorGeometryInstanceAttribute.fromColor( color )
						  	}  
						} ) );
        			}
        		}
				
				var obj = new Cesium.Primitive( {  
    				geometryInstances : instances,
    				appearance : new Cesium.PerInstanceColorAppearance({
    					flat : true
    				})
				}  );
        		self._globe._viewer.scene.primitives.add( obj );
  		      	if(m_callback){
        			m_callback(obj,options);
        		}
        	}
        },
        error: function(XMLHttpRequest, textStatus, errorThrown){
        	alert("抱歉："+textStatus);
        }
    });
}

/*
* 添加GeoJson
* @author zhaoxd
* @method addGeoJson
* @for GlobeLayer
* @param {Object} options：参数 
* @return {dataSource} dataSource
*/
GlobeLayer.prototype.addGeoJson = function(options){
	var self = this;
	var m_url = options.url ? options.url : "";
	if(m_url == ""){
		return;
	}
	var m_stroke = options.stroke ? options.stroke : Cesium.Color.HOTPINK;
	var m_fill = options.fill ? options.fill : Cesium.Color.PINK;
	var m_alpha = options.alpha ? options.alpha : 0.5;
	var dataSource = self._globe._viewer.dataSources.add(Cesium.GeoJsonDataSource.load(m_url, {
        stroke: m_stroke,
        fill: m_fill.withAlpha(m_alpha),
        strokeWidth: 3
    }));
    return dataSource;
}

/*
* 添加kml
* @author zhaoxd
* @method addKml
* @for GlobeLayer
* @param {Object} options：参数 
* @return {dataSource} dataSource
*/
GlobeLayer.prototype.addKml = function(options){
	var self = this;
	var m_url = options.url ? options.url : "";
	if(m_url == ""){
		return;
	}
	var m_options = {
	    camera : self._globe._viewer.scene.camera,
	    canvas : self._globe._viewer.scene.canvas
	};
	var dataSource = self._globe._viewer.dataSources.add(Cesium.KmlDataSource.load(m_url, m_options));
    return dataSource;
}

/*
* 移除DataSource
* @author zhaoxd
* @method removeDataSource
* @for GlobeLayer
* @param {dataSource} dataSource
* @return {Boolean} true:成功,false:失败
*/
GlobeLayer.prototype.removeDataSource = function(dataSource){
	var self = this;
	var back = self._globe._viewer.dataSources.remove(dataSource);
	return back;
}

return GlobeLayer;
})