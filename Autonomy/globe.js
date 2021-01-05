/*
* author: 赵雪丹
* description: CFGLOBE主函数
* day: 2017-08-10
*/

define( [
	"Cesium",
	"./config",
	"./commonFunc",
	"./globeLayer",
	"./layerManager",
	"./bottomInfo",
	"./toolset",
	"./placeMark",
	"./polyline",
	"./polygon",
	"./model",
	"./arrow",
	"./battleLine",
	"./isolationBelt",
	"./globeMenu",
	"./infoWindow",
	"./sightAnalyse",
	"./pathAnalyse",
	"./basicMeasure",
	"./rectangle",
	"./rectangle2",
	"./circle",
	"./ellipse",
	"./freeline",
	"./doubleArrow",
	"./shpParser",
	"./angleAnalyse",
	"./point",
	"./flight",
	"./heatPoint",
	"./viewshed",
	"./particle",
	"Globe/Autonomy/css/globe.css",
	"Globe/Cesium/Widgets/widgets.css",
	// "Cesium/Widgets/widgets.css" 
	],
function( Cesium, 
	URLCONFIG,  
	CommonFunc, 
	GlobeLayer, 
	LayerManager, 
	BottomInfo, 
	Toolset, 
	PlaceMark, 
	Polyline, 
	Polygon, 
	Model, 
	Arrow, 
	BattleLine, 
	IsolationBelt, 
	GlobeMenu, 
	InfoWindow, 
	SightAnalyse, 
	PathAnalyse, 
	BasicMeasure, 
	Rectangle,
	Rectangle2,
	Circle,
	Ellipse,
	Freeline,
	DoubleArrow,
	SHPParser,
	AngleAnalyse,
	Point,
	Flight,
	HeatPoint,
	Viewshed,
	Particle) {
// loadStyles(_cts + "Cesium/Widgets/widgets.css");
// loadStyles(_cts + "Autonomy/css/globe.css");

/*
 * 构造CFGLOBE
 * @author zhaoxd
 * @method CFGLOBE
 * @for null
 * @param {string} 要显示球体的div的id
 * @return {null} null
 */
function CFGLOBE(id,options){
	var self = this;
	this._globeId = id;
	this.commonFunc = CommonFunc;
	var m_options = options ? options : {};
	this._sessionName = m_options.sessionName ? m_options.sessionName : "cfglobeSession";
//	this._showLayerManager = m_options.showLayerManager ? m_options.showLayerManager : true;
//	this._showToolset = m_options.showToolset ? m_options.showToolset : true;
	this._showToolset = true;
	if(typeof(m_options.showToolset) == "boolean"){
		this._showToolset = m_options.showToolset;
	}
	this._showNavigation = true;
	if(typeof(m_options.showNavigation) == "boolean"){
		this._showNavigation = m_options.showNavigation;
	}
	this._showBottomInfo = true;
	if(typeof(m_options.showBottomInfo) == "boolean"){
		this._showBottomInfo = m_options.showBottomInfo;
	}
	this.sceneMode = Cesium.SceneMode.SCENE3D;
	if(m_options.sceneMode == "2D"){
		this.sceneMode = Cesium.SceneMode.SCENE2D;
	}
	this._toolsetCloseList = m_options.toolsetCloseList ? m_options.toolsetCloseList : [];
	this.urlConfig = new URLCONFIG(m_options);
	this._viewer = new Cesium.Viewer(id,{
		sceneMode : this.sceneMode,
		infoBox : false,
		homeButton : false,
		animation : false,
		geocoder : false,
		timeline : false,
		sceneModePicker : false,
		navigationHelpButton : false,
		fullscreenButton : false,
		selectionIndicator: false
	});
	this._viewer._cesiumWidget._creditContainer.style.display="none";
	this._widget = this._viewer.cesiumWidget;
	this._viewer.scene.globe.depthTestAgainstTerrain = true;
	var btnlist = document.getElementsByClassName("cesium-toolbar-button");
	for(var i = 0; i < btnlist.length; i++){
		btnlist[i].style.display="none";
	}
	
    //私有渲染事件-实时记录镜头位置
	this._viewer.scene.postRender.addEventListener(function(){
		var sceneMode = self._viewer.scene.mode;
		if(sceneMode == Cesium.SceneMode.SCENE3D){
			var m_heading = CommonFunc.deg(self._viewer.scene.camera.heading);
			var m_pitch = CommonFunc.deg(self._viewer.scene.camera.pitch);
			var m_roll = CommonFunc.deg(self._viewer.scene.camera.roll);
			var m_cartographic = Cesium.Cartographic.fromCartesian(self._viewer.scene.camera.position);
			var m_lon = Cesium.Math.toDegrees(m_cartographic.longitude);
			var m_lat = Cesium.Math.toDegrees(m_cartographic.latitude);
			var m_alt = m_cartographic.height;
			var m_cameraPosition = {lon:m_lon,lat:m_lat,alt:m_alt,heading:m_heading,pitch:m_pitch,roll:m_roll};
			sessionStorage[self._sessionName] = JSON.stringify(m_cameraPosition);
			if(document.getElementById('cfglobe_navigation')){
				document.getElementById('cfglobe_navigation').style.transform = 'rotate('+ -m_heading +'deg)';
			}
		}else{
		    var cartographic = self._viewer.scene.mapProjection.unproject(self._viewer.camera.position);
		    var position = self._viewer.scene.mapProjection.ellipsoid.cartographicToCartesian(cartographic);
			var m_cartographic = Cesium.Cartographic.fromCartesian(position);
			var m_lon = Cesium.Math.toDegrees(m_cartographic.longitude);
			var m_lat = Cesium.Math.toDegrees(m_cartographic.latitude);
			var m_alt = Math.ceil(self._viewer.camera.positionCartographic.height);
			var m_cameraPosition = {lon:m_lon,lat:m_lat,alt:m_alt,heading:0,pitch:-90,roll:0};
			sessionStorage[self._sessionName] = JSON.stringify(m_cameraPosition);
		}
	});
	
	//鼠标点击类型
	this.LEFT_CLICK = Cesium.ScreenSpaceEventType.LEFT_CLICK;
	this.LEFT_DOUBLE_CLICK = Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK;
	this.RIGHT_CLICK = Cesium.ScreenSpaceEventType.RIGHT_CLICK;
	this.MOUSE_MOVE = Cesium.ScreenSpaceEventType.MOUSE_MOVE;
	
	this._viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
	
	var handler = new Cesium.ScreenSpaceEventHandler(self._viewer.scene.canvas);
	handler.setInputAction(function(e){
		var sceneMode = self._viewer.scene.mode;
		if(sceneMode == Cesium.SceneMode.SCENE3D){
			var lonlat = self.getLonLatByPosition(e.position);
			var options = {lon:lonlat.lon,lat:lonlat.lat,alt:10000,heading:0,pitch:-90,roll:0};
			self.flyTo(options);
		}
    }, self.LEFT_DOUBLE_CLICK);
	
	//颜色对象
	this.Color = Cesium.Color;
	
//	this._defaultLayer = {layer:"default",layerTitle:"default",name:"default",nameTitle:"default"};
	this._defaultLayer = {catalog:"default",subcatalog:"default"};
	
	//影像和STK图层管理
	this.globeLayer = new GlobeLayer(this);
	
	//STK级别
	this._stkLevel = 14;
	//图层管理
	this.layerManager = new LayerManager(this);
	//地图信息显示
	this.bottomInfo = new BottomInfo(this);
	//加载工具条
	this.toolset = new Toolset(this);
	//PlaceMark-点对象
	this.placeMark = new PlaceMark(this);
	//Polyline-线对象
	this.polyline = new Polyline(this);
	//Polygon-面对象
	this.polygon = new Polygon(this);
	//Model-模型对象
	this.model = new Model(this);
	//Arrow-箭头
	this.arrow = new Arrow(this);
	//BattleLine-扑火线
	this.battleLine = new BattleLine(this);
	//IsolationBelt-隔离带
	this.isolationBelt = new IsolationBelt(this);
	//GlobeMenu-球体右键菜单
	this.globeMenu = new GlobeMenu(this);
	//InfoWindow-气泡窗口
	this.infoWindow = new InfoWindow(this);
	//SightAnalyse-视域分析
	this.sightAnalyse = new SightAnalyse(this);
	//PathAnalyse-路径分析
	this.pathAnalyse = new PathAnalyse(this);
	//AngleAnalyse-角度分析
	this.angleAnalyse = new AngleAnalyse(this);
	//BasicMeasure-基础量算
	this.basicMeasure = new BasicMeasure(this);
	//Rectangle-可旋转图片
	this.rectangle = new Rectangle(this);
    //Rectangle2-矩形工具
    this.rectangle2 = new Rectangle2(this);
	//Circle-画圆
	this.circle = new Circle(this);
	//Ellipse-画椭圆
	this.ellipse = new Ellipse(this);
	//Freeline-自由线
	this.freeline = new Freeline(this);
	//Double-双箭头
	this.doubleArrow = new DoubleArrow(this);
	//shpParser-shp文件
	this.shpParser = new SHPParser(this);
	//点
	this.point = new Point(this);
	//飞行浏览
	this.flight = new Flight(this);
	//热点
	this.heatPoint = new HeatPoint(this);
	//可视域
	this.viewshed = new Viewshed(this);
	//可视域
	this.particle = new Particle(this);
	
	if(this._showNavigation){
		var m_navigation = document.createElement("img");
		m_navigation.setAttribute("id", "cfglobe_navigation");
		m_navigation.setAttribute("class", "cfglobe-navigation");
		m_navigation.setAttribute("src", this.urlConfig.NAVIGATION);
		document.getElementById(this._globeId).getElementsByTagName("div")[0].appendChild(m_navigation);
	}
	
	if (navigator.onLine) {
		//正常工作
//		var googleMap = this.globeLayer.loadGoogleMap();
//		var m_url_d = "http://175.25.177.128:8080/geoserver/tiger/wms";
//		var m_name_d = "底图";
//		var m_layer_d = "tiger:giant_polygon";
//		var m_alpha_d = "1";
//		var localTileLayer_d = this.globeLayer.addWMSLayer(m_url_d, m_name_d, m_layer_d, m_alpha_d);
		
//		var m_url = "http://175.25.177.128:8080/geoserver/cf/wms";
//		var m_name = "吉林省";
//		var m_layer = "cf:jl_xj";
//		var m_alpha = "1";
//		var localTileLayer = this.globeLayer.addWMSLayer(m_url, m_name, m_layer, m_alpha);
		
//		var options = {show: false};
//		var googleMap = this.globeLayer.loadGoogleMap();	//加载GoogleMap
//		this.globeLayer.loadTiandituMapVEC(options);	//加载天地图全球矢量地图服务
//		this.globeLayer.loadTiandituMapIMG(options);	//加载天地图全球影像地图服务
//		this.globeLayer.loadTiandituMapCIA(options);	//加载天地图全球影像中文注记服务
//		this.globeLayer.loadTiandituMapCVA(options);	//加载天地图全球矢量中文注记服务
//		this.globeLayer.loadQQMapCIA(options);			//加载腾讯地图中文注记服务服务
//		this.globeLayer.loadGaodeMapIMG(options);		//加载高德影像地图服务
//		this.globeLayer.loadGaodeMapVEC(options);		//加载高德矢量地图服务
//		this.globeLayer.loadGaodeMapCIA(options);		//加载高德矢量地图中文注记服务服务
//		var localTileLayer = this.globeLayer.addLocalTileLayer({url:self.urlConfig.LOCALTMS,name:"本地影像",maximumLevel:20,west:75.0,south:10,east:147.0,north:55});
//		var localTileLayer = this.globeLayer.addLocalTileLayer({url:self.urlConfig.LOCALTMS,name:"本地影像",minimumLevel:0,maximumLevel:18});
	} else { 
		//执行离线状态时的任务
		//var localTileLayer = this.globeLayer.addLocalTileLayer({url:self.urlConfig.LOCALTMS,name:"本地影像"});
	}
//	this._stk = Object.create(this._viewer.terrainProvider);
//	this.globeLayer.addLocalSTKLayer(self.urlConfig.LOCALSTK);
//	this.globeLayer.addLocalSTKLayer("http://192.168.1.193:8090/3DTerrian/");
//	this.globeLayer.addLocalSTKLayer("http://192.168.1.193:8090/3DTerrian_o/");
	
	this._flyOrientation;
	this._flyPoint;
	
//	var cameraPosition = {};
//	if(sessionStorage[self._sessionName]){
//		var cameraPosition = eval("(" + sessionStorage[self._sessionName] +")");
//	}
//	this.flyTo(cameraPosition);
	
	
	
//	var tileset = this._viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
//	    url : 'https://beta.cesium.com/api/assets/1460?access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIyMzk2YzJiOS1jZGFmLTRlZmYtYmQ4MS00NTA3NjEwMzViZTkiLCJpZCI6NDQsImFzc2V0cyI6WzE0NjBdLCJpYXQiOjE0OTkyNjQ3NTV9.oWjvN52CRQ-dk3xtvD4e8ZnOHZhoWSpJLlw115mbQJM'
//	}));
//	
//	tileset.readyPromise.then(function() {
//	    var boundingSphere = tileset.boundingSphere;
//	    this._viewer.camera.viewBoundingSphere(boundingSphere, new Cesium.HeadingPitchRange(0.0, -0.5, boundingSphere.radius));
//	    this._viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
//	}).otherwise(function(error) {
//	    throw(error);
//	});
	
	
//	var tileset = this._viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
//	    url : 'https://beta.cesium.com/api/assets/1458?access_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxYmJiNTAxOC1lOTg5LTQzN2EtODg1OC0zMWJjM2IxNGNlYmMiLCJpZCI6NDQsImFzc2V0cyI6WzE0NThdLCJpYXQiOjE0OTkyNjM4MjB9.1WKijRa-ILkmG6utrhDWX6rDgasjD7dZv-G5ZyCmkKg'
//	}));
	
//	tileset.readyPromise.then(function() {
//	    var boundingSphere = tileset.boundingSphere;
//	    this._viewer.camera.viewBoundingSphere(boundingSphere, new Cesium.HeadingPitchRange(0.0, -0.5, boundingSphere.radius));
//	    this._viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
//	}).otherwise(function(error) {
//	    throw(error);
//	});
}

/*
 * 结束绘制状态
 * @author zhaoxd
 * @method deactivateAllState
 * @for CFGLOBE
 * @param {null} null
 * @return {null} null
 */
CFGLOBE.prototype.deactivateAllState = function(){
	var self = this;
	//结束添加模型
	self.model._options.draw = false;
	//结束添加mark
	self.placeMark._options.draw = false;
	//结束添加polyline
	self.polyline._options.draw = false;
	self.polyline._options.drawid = "";
	//结束添加polygon
	self.polygon._options.draw = false;
	self.polygon._options.drawid = "";
	//结束添加扑火线
	self.battleLine._layer.draw = false;
	self.battleLine._layer.drawid = "";
	//结束添加隔离带
	self.isolationBelt._layer.draw = false;
	self.isolationBelt._layer.drawid = "";
	//结束添加箭头
	self.arrow._layer.draw = false;
	self.arrow._layer.drawid = "";
	//结束环绕观测  椭圆观测
	self.toolset._rotatePoint = false;
	//结束路径分析
	self.pathAnalyse._path_manager.draw = false;
	self.pathAnalyse._path_manager.selectSpoint = false;
	//结束基础量算
	self.basicMeasure._disOptions.draw = false;
	self.basicMeasure._areaOptions.draw = false;
	self.basicMeasure._heightOptions.draw = false;
	//结束两点角度
	self.angleAnalyse._angle_manager.draw = false;
	self.angleAnalyse._angle_manager.selectSpoint = false;
	//结束通视分析
	self.sightAnalyse.endIntervisibility();
	
	//结束添加风向
	self.rectangle._options.draw = false;
	//self.rectangle._options.drawid = '';
	//结束添加双箭头
	self.doubleArrow._options.draw = false;
	//结束添加圆
	self.circle._options.draw = false;
	//结束添加椭圆
	self.ellipse._options.draw = false;
	//结束添加自由线
	self.freeline._options.draw = false;
	//结束添加点
	self.point._options.draw = false;
}

/*
 * 获取鼠标事件
 * @author zhaoxd
 * @method getHandler
 * @for CFGLOBE
 * @param {null} null
 * @return {EventHandler} handler
 */
 CFGLOBE.prototype.getHandler = function(){
	var self = this;
	var handler = new Cesium.ScreenSpaceEventHandler(self._viewer.scene.canvas);
	return handler;
}

/*
 * 摄像机飞行定位
 * @author zhaoxd
 * @method flyTo
 * @for CFGLOBE
 * @param {Object} 摄像机参数
 * @return {null} null
 */
CFGLOBE.prototype.flyTo = function(options){
	var self = this;
	var m_options = options ? options : {};
//	var lon = m_options.lon ? parseFloat(m_options.lon) : 105;	//经度
//	var lat = m_options.lat ? parseFloat(m_options.lat) : 30;	//纬度
//	var alt = m_options.alt ? parseFloat(m_options.alt) : 13751015;	//高程
//	var heading = m_options.heading ? parseFloat(m_options.heading) : 0;	//水平角
//	var pitch = m_options.pitch ? parseFloat(m_options.pitch) : -90;	//俯仰角
//	var roll = m_options.roll ? parseFloat(m_options.roll) : 0;		//翻滚角
//	var callback = m_options.callback ? m_options.callback : null;		//完成后回调方法
	
	var lon = m_options.lon ? parseFloat(m_options.lon) : 109;	//经度
	var lat = m_options.lat ? parseFloat(m_options.lat) : 31;	//纬度
	var alt = m_options.alt ? parseFloat(m_options.alt) : 5000000;	//高程
	var heading = m_options.heading ? parseFloat(m_options.heading) : 0;	//水平角
	var pitch = m_options.pitch ? parseFloat(m_options.pitch) : -90;	//俯仰角
	var roll = m_options.roll ? parseFloat(m_options.roll) : 0;		//翻滚角
	var callback = m_options.callback ? m_options.callback : null;		//完成后回调方法
	self._viewer.scene.camera.flyTo({
		destination: new Cesium.Cartesian3.fromDegrees(lon, lat, alt),
		orientation: {
			heading: Cesium.Math.toRadians(heading),
			pitch: Cesium.Math.toRadians(pitch),
			roll: Cesium.Math.toRadians(roll)
		},
		complete: function() {
			if(callback){
				callback();
			}
        }
	});
}

/*
 * 摄像机直接定位
 * @author zhaoxd
 * @method setView
 * @for CFGLOBE
 * @param {Object} 摄像机参数
 * @return {null} null
 */
CFGLOBE.prototype.setView = function(options){
	var self = this;
	var m_options = options ? options : {};
	var lon = m_options.lon ? parseFloat(m_options.lon) : 105;	//经度
	var lat = m_options.lat ? parseFloat(m_options.lat) : 30;	//纬度
	var alt = m_options.alt ? parseFloat(m_options.alt) : 13751015;	//高程
	var heading = m_options.heading ? parseFloat(m_options.heading) : 0;	//水平角
	var pitch = m_options.pitch ? parseFloat(m_options.pitch) : -90;	//俯仰角
	var roll = m_options.roll ? parseFloat(m_options.roll) : 0;		//翻滚角
	self._viewer.scene.camera.setView({
		destination: new Cesium.Cartesian3.fromDegrees(lon, lat, alt),
		orientation: {
			heading: Cesium.Math.toRadians(heading),
			pitch: Cesium.Math.toRadians(pitch),
			roll: Cesium.Math.toRadians(roll)
		}
	});
}

/*
 * 摄像机根据点集合飞行定位
 * @author zhaoxd
 * @method flyToByPoints
 * @for CFGLOBE
 * @param {Object} pointList-点集合
 * @return {null} null
 */
CFGLOBE.prototype.flyToByPoints = function(pointList){
	var self = this;
	if(pointList && pointList.length>0){
		var m_array = new Array();
	    for(var i = 0; i < pointList.length; i++){
//	    	self.placeMark.add({lon:pointList[i].lon,lat:pointList[i].lat});
	    	m_array.push(pointList[i].lon);
	    	m_array.push(pointList[i].lat);
	  		m_array.push(pointList[i].alt);
	    }
		var positions = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
		var m_obj;
		if(pointList.length == 1){
			var options = {lon:pointList[0].lon,lat:pointList[0].lat,alt:3000};
			self.flyTo(options);
			return;
			m_obj = self._viewer.entities.add({
//				show:false,
				position : Cesium.Cartesian3.fromDegrees(pointList[0].lon, pointList[0].lat),
				point : {
			        heightReference: Cesium.HeightReference.RELATIVE_TO_GROUND
			    }
			});
		}else if(pointList.length == 2){
			m_obj = self._viewer.entities.add({
//				show:false,
				polyline: {
				    positions: positions,
				    material: self.Color.RED.withAlpha(0)
				}
			});
		}else{
			m_obj = self._viewer.entities.add({
				show:false,
				polygon: {
				    hierarchy: positions,
				    material: self.Color.RED.withAlpha(0)
				}
			});
		}
		self._viewer.flyTo(m_obj);
		setTimeout(function(){
			self._viewer.entities.remove(m_obj);
		},5000);
	}
}

/*
 * 根据屏幕坐标获取经纬度坐标
 * @author zhaoxd
 * @method getLonLatByPosition
 * @for CFGLOBE
 * @param {position} 屏幕坐标集
 * @return {Object} 经纬度坐标集
 */
CFGLOBE.prototype.getLonLatByPosition = function(position){
	try{
		var self = this;
		var sceneMode = self._viewer.scene.mode;
		if(sceneMode == Cesium.SceneMode.SCENE3D){
			var pos = self._viewer.scene.pickPosition(position);
			if(pos){
				var cartographic = Cesium.Cartographic.fromCartesian(pos);
				var longitude = Cesium.Math.toDegrees(cartographic.longitude);
				var latitude = Cesium.Math.toDegrees(cartographic.latitude);
				var height = cartographic.height;
				var lonlat = {lon:longitude,lat:latitude,alt:height};
				return lonlat;
			}else{
				return null;
//				return {lon:0,lat:0,alt:0};
			}
		}else{
			var pick= new Cesium.Cartesian2(position.x,position.y);
			var cartesian = self._viewer.camera.pickEllipsoid(pick, self._viewer.scene.globe.ellipsoid);
			if(cartesian){
				var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
				var longitude = Cesium.Math.toDegrees(cartographic.longitude);
				var latitude = Cesium.Math.toDegrees(cartographic.latitude);
				var height = cartographic.height;
				var lonlat = {lon:longitude,lat:latitude,alt:height};
				return lonlat;
			}else{
				return null;
//				return {lon:0,lat:0,alt:0};
			}
		}
    }
    catch(e){
		return null;
//		return {lon:0,lat:0,alt:0};
    }
}

/*
 * 根据经纬度获取高程
 * @author zhaoxd
 * @method getAltByLonlat
 * @for CFGLOBE
 * @param {object} pointList：点集合
 * @param {function} callback：回调函数
 * @param {object} options：其他参数
 * @return {null} null
 */
CFGLOBE.prototype.getAltByLonlat = function(pointList, callback, options){
	var self = this;
	var terrainSamplePositions = [];
	for(var i = 0; i < pointList.length; i++){
		var _lon = Cesium.Math.toRadians(pointList[i].lon);
		var _lat = Cesium.Math.toRadians(pointList[i].lat);
		var position = new Cesium.Cartographic(_lon, _lat);
    	terrainSamplePositions.push(position);
	}
    var promise = Cesium.sampleTerrain(self._viewer.terrainProvider, self._stkLevel, terrainSamplePositions);
    Cesium.when(promise, function(updatedPositions) {
    	for(var i = 0; i < updatedPositions.length; i++){
    		updatedPositions[i].lon = CommonFunc.deg(updatedPositions[i].longitude);
    		updatedPositions[i].lat = CommonFunc.deg(updatedPositions[i].latitude);
    		updatedPositions[i].alt = updatedPositions[i].height;
    	}
    	callback(updatedPositions, options);
    });
}

/*
 * 获取两点之间的间隔点
 * @author zhaoxd
 * @method getIntervalPoints
 * @for CFGLOBE
 * @param {point} point0：点1
 * @param {point} point1：点2
 * @param {int} interval：间隔距离
 * @return {list} points
 */
CFGLOBE.prototype.getIntervalPoints = function(point0,point1,interval){
	var self = this;
	try{
		var p0 = Cesium.Cartesian3.fromDegrees(point0.lon,point0.lat,point0.alt);
		var p1 = Cesium.Cartesian3.fromDegrees(point1.lon,point1.lat,point1.alt);
		var direction = new Cesium.Cartesian3();
		Cesium.Cartesian3.subtract(p1, p0, direction);
	    Cesium.Cartesian3.normalize(direction, direction);
	    var ray = new Cesium.Ray(p0, direction);
	    var rayPositions = [];
	    var dist = self.commonFunc.getDistanceByline(point0.lon,point0.lat, point1.lon,point1.lat);
	    for(i = 0; i < dist; i++){
			var t = i * interval;
			var pt = Cesium.Ray.getPoint(ray, t);
			if(t > dist){
				pt = Cesium.Ray.getPoint(ray, dist);
			}
			var cartographic = Cesium.Cartographic.fromCartesian(pt);
			var longitude = Cesium.Math.toDegrees(cartographic.longitude);
			var latitude = Cesium.Math.toDegrees(cartographic.latitude);
			var height = cartographic.height;
			rayPositions.push({lon:longitude,lat:latitude,alt:height});
			if(t > dist){
				break;
			}
		}
	    return rayPositions;
	}
    catch(e){
        return null;
    }
}


// 动态加载css文件
function loadStyles(url) {
	var link = document.createElement("link");
	link.type = "text/css";
	link.rel = "stylesheet";
	link.href = url;
	document.getElementsByTagName("head")[0].appendChild(link);
}

return CFGLOBE;
});

