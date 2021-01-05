/*
* author: 赵雪丹
* description: SHPParser-shp文件加载
* day: 2017-9-28
*/
define( [  ], function(  ){
function SHPParser(globe){
	var self = this;
	this._globe = globe;
	this._viewer = globe._viewer;
	this._scene = globe._viewer.scene;  
	this._globeId = globe._globeId;
	this._layer = [];
}

/*
 * 加载shp文件
 * @author zhaoxd
 * @method add
 * @for SHPParser
 * @param {string} fileid：文件选择器id
 * @param {Object} options：样式参数
 * @return {null} null
 */
SHPParser.prototype.add = function(fileid,options){
	var self = this;
	var name,url;
	var files=document.getElementById(fileid);
　　var file=files.files;//每一个file对象对应一个文件。
	var callback = options.callback ? options.callback : null;
	if(file && file.length>0){
		name = file[0].name;//获取本地文件系统的文件名。
		var fileType = name.split(".")[1];
		if(fileType != "shp"){
			callback("error","文件格式错误");
			return;
		}
		url = window.URL.createObjectURL(file[0]);
	}else{
		if(callback){
			callback("error","文件选择错误");
			return;
		}else{
			console.log("shp error:" + "文件选择错误");
			return;
		}
	}
	var lineWidth = options.lineWidth ? options.lineWidth : 50;
	var color = options.color ? options.color : Cesium.Color.GREEN;
	var lineColor = options.lineColor ? options.lineColor : Cesium.Color.RED;
	this.load(url, 
		function(res) {
			var instances = [];  
			var lineList = [];
			var instancesline = [];  
			var pointPrimitive;
			var shapeType = res.shapeType;
			var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
			if(shapeType == 1){
				pointPrimitive = self._scene.primitives.add(new Cesium.PointPrimitiveCollection());
				self._globe.layerManager._add("shpLayer",startTime,name);
			}
			for(var i = 0; i < res.records.length; i++){
				var entity;
				if(shapeType == 0){
					console.log("shp shapeType:" + shapeType);
					return;
				}else if(shapeType == 1){
					var points = res.records[i].shape.content.points;
					var m_point = pointPrimitive.add({
						position : Cesium.Cartesian3.fromDegrees(points[0], points[1]),
						color : color
					});
					m_point.url = url;
					m_point.name = name;
					m_point.lid = startTime;
					self._layer[self._layer.length] = m_point;
				}else if(shapeType == 3){
					var m_array = [];
					var points = res.records[i].shape.content.points;
				    for(var j = 0; j < points.length; j++){
				    	m_array[m_array.length] = points[j];
				    }
				    var len = lineList.length - 1;
				    if(i%1000==0){
				    	len = lineList.length;
						lineList[lineList.length] = [];
					}
				    lineList[len].push( new Cesium.GeometryInstance( {  
						geometry : new Cesium.CorridorGeometry( {  
							vertexFormat : Cesium.VertexFormat.POSITION_ONLY,
							positions : Cesium.Cartesian3.fromDegreesArray(m_array),
							width : lineWidth
    					} ),  
					    attributes : {  
					  		color : Cesium.ColorGeometryInstanceAttribute.fromColor( lineColor )
					  	}  
					} ) );
				}else if(shapeType == 5){
					var m_array = [];
					var points = res.records[i].shape.content.points;
				    for(var j = 0; j < points.length; j++){
				    	m_array[m_array.length] = points[j];
				    }
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
					
				    var len = lineList.length - 1;
				    if(i%1000==0){
				    	len = lineList.length;
						lineList[lineList.length] = [];
					}
				    lineList[len].push( new Cesium.GeometryInstance( {  
						geometry : new Cesium.CorridorGeometry( {  
							vertexFormat : Cesium.VertexFormat.POSITION_ONLY,
							positions : Cesium.Cartesian3.fromDegreesArray(m_array),
							width : lineWidth
    					} ),  
					    attributes : {  
					  		color : Cesium.ColorGeometryInstanceAttribute.fromColor( lineColor )
					  	}  
					} ) );
				}else if(shapeType == 8){
					console.log("shp shapeType:" + shapeType);
					return;
				}else if(shapeType == 11){
					console.log("shp shapeType:" + shapeType);
					return;
				}else if(shapeType == 13){
					console.log("shp shapeType:" + shapeType);
					return;
				}else if(shapeType == 15){
					console.log("shp shapeType:" + shapeType);
					return;
				}else if(shapeType == 18){
					console.log("shp shapeType:" + shapeType);
					return;
				}else if(shapeType == 21){
					console.log("shp shapeType:" + shapeType);
					return;
				}else if(shapeType == 23){
					console.log("shp shapeType:" + shapeType);
					return;
				}else if(shapeType == 25){
					console.log("shp shapeType:" + shapeType);
					return;
				}else if(shapeType == 28){
					console.log("shp shapeType:" + shapeType);
					return;
				}else if(shapeType == 31){
					console.log("shp shapeType:" + shapeType);
					return;
				}
			}
			if(shapeType == 1){
				
			}else if(shapeType == 3){
				for(var i = 0; i < lineList.length; i++){
					var obj = new Cesium.GroundPrimitive( {  
					    geometryInstances : lineList[i], //合并  
					    //某些外观允许每个几何图形实例分别指定某个属性，例如：  
					    appearance : new Cesium.PerInstanceColorAppearance()  
					} ) ;
					obj.url = url;
					obj.name = name;
					obj.lid = startTime;
					self._layer[self._layer.length] = obj;
					self._scene.primitives.add( obj ); 
				}
				self._globe.layerManager._add("shpLayer",startTime,name);
			}else if(shapeType == 5){
				var obj = new Cesium.GroundPrimitive( {  
				    geometryInstances : instances, //合并  
				    //某些外观允许每个几何图形实例分别指定某个属性，例如：  
				    appearance : new Cesium.PerInstanceColorAppearance()  
				} ) ;
				obj.url = url;
				obj.name = name;
				obj.lid = startTime;
				self._layer[self._layer.length] = obj;
				self._scene.primitives.add( obj ); 
				
				for(var i = 0; i < lineList.length; i++){
					var obj = new Cesium.GroundPrimitive( {  
					    geometryInstances : lineList[i], //合并  
					    //某些外观允许每个几何图形实例分别指定某个属性，例如：  
					    appearance : new Cesium.PerInstanceColorAppearance()  
					} ) ;
					obj.url = url;
					obj.name = name;
					obj.lid = startTime;
					self._layer[self._layer.length] = obj;
					self._scene.primitives.add( obj ); 
				}
				self._globe.layerManager._add("shpLayer",startTime,name);
			}
			if(callback){
				callback(startTime,name,res);
			}
		},
		function(res){ 
			if(callback){
				callback("error","error",res);
			}else{
				console.log("shp error:" + res);
			}
		}
	);
}

/*
 * 根据id移除shp
 * @author zhaoxd
 * @method removeByLid
 * @for SHPParser
 * @param {string} lid:shp对象lid
 * @return {null} null
 */
SHPParser.prototype.removeByLid = function(lid){
	var self = this;
	for(var i = self._layer.length - 1; i >= 0; i--){
		if(self._layer[i].lid == lid){
			var back = self._scene.primitives.remove(self._layer[i]);
			self._layer.splice(i, 1); 
		}
	}
	self._globe.layerManager._remove("shpLayer",lid);
}

/*
 * 根据name移除shp
 * @author zhaoxd
 * @method removeByName
 * @for SHPParser
 * @param {string} name:shp对象name
 * @return {null} null
 */
SHPParser.prototype.removeByName = function(name){
	var self = this;
	var lid;
	for(var i = self._layer.length - 1; i >= 0; i--){
		if(self._layer[i].name == name){
			lid = self._layer[i].lid;
			var back = self._scene.primitives.remove(self._layer[i]);
			self._layer.splice(i, 1);
		}
	}
	self._globe.layerManager._remove("shpLayer",lid);
}

/*
 * 根据url移除shp
 * @author zhaoxd
 * @method removeByUrl
 * @for SHPParser
 * @param {string} url:shp对象url
 * @return {null} null
 */
SHPParser.prototype.removeByUrl = function(url){
	var self = this;
	var lid;
	for(var i = self._layer.length - 1; i >= 0; i--){
		if(self._layer[i].url == url){
			lid = self._layer[i].lid;
			var back = self._scene.primitives.remove(self._layer[i]);
			self._layer.splice(i, 1);
		}
	}
	self._globe.layerManager._remove("shpLayer",lid);
}

/*
 * 读取shp文件
 * @author zhaoxd
 * @method load
 * @for SHPParser
 * @param {string} src:shp文件src
 * @param {function} callback:成功回调事件
 * @param {function} onerror:失败回调事件
 * @return {null} null
 */
SHPParser.prototype.load = function(src, callback, onerror) {
	var self = this;
	var xhr = new XMLHttpRequest();
	xhr.responseType = 'arraybuffer';
	xhr.onload = function() {
//		console.log(xhr.response);
		var d = new SHPParser(self._globe).parse(xhr.response);
		callback(d);
	};
	xhr.onerror = onerror;
	xhr.open('GET', src);
	xhr.send(null);
};

/*
 * 读取shp文件内容
 * @author zhaoxd
 * @method parse
 * @for SHPParser
 * @param {Object} arrayBuffer:文件内容
 * @return {Object} 文件内容对象
 */
SHPParser.prototype.parse = function(arrayBuffer) {
	var o = {};
	var dv = new DataView(arrayBuffer);
	var idx = 0;
	o.fileCode = dv.getInt32(idx, false);
	if (o.fileCode != 0x0000270a) {
		throw (new Error("Unknown file code: " + o.fileCode));
	}
	idx += 6*4;
	o.wordLength = dv.getInt32(idx, false);
	o.byteLength = o.wordLength * 2;
	idx += 4;
	o.version = dv.getInt32(idx, true);
	idx += 4;
	o.shapeType = dv.getInt32(idx, true);
	idx += 4;
	o.minX = dv.getFloat64(idx, true);
	o.minY = dv.getFloat64(idx+8, true);
	o.maxX = dv.getFloat64(idx+16, true);
	o.maxY = dv.getFloat64(idx+24, true);
	o.minZ = dv.getFloat64(idx+32, true);
	o.maxZ = dv.getFloat64(idx+40, true);
	o.minM = dv.getFloat64(idx+48, true);
	o.maxM = dv.getFloat64(idx+56, true);
	idx += 8*8;
	o.records = [];
	while (idx < o.byteLength) {
		var record = {};
		record.number = dv.getInt32(idx, false);
		idx += 4;
		record.length = dv.getInt32(idx, false);
		idx += 4;
		try {
			record.shape = this.parseShape(dv, idx, record.length);
		} catch(e) {
			console.log(e, record);
		}
		idx += record.length * 2;
		o.records.push(record);
	}
	return o;
};

/*
 * 类型解析
 * @author zhaoxd
 * @method parseShape
 * @for SHPParser
 * @param {null} null
 * @return {null} null
 */
SHPParser.prototype.parseShape = function(dv, idx, length) {
	var i=0, c=null;
	var shape = {};
	shape.type = dv.getInt32(idx, true);
	idx += 4;
	var byteLen = length * 2;
	switch (shape.type) {
		case SHP.NULL: // Null
			break;
		
		case SHP.POINT: // Point (x,y)
			shape.content = {
				x: dv.getFloat64(idx, true),
				y: dv.getFloat64(idx+8, true)
			};
			break;
		case SHP.POLYLINE: // Polyline (MBR, partCount, pointCount, parts, points)
		case SHP.POLYGON: // Polygon (MBR, partCount, pointCount, parts, points)
			c = shape.content = {
				minX: dv.getFloat64(idx, true),
				minY: dv.getFloat64(idx+8, true),
				maxX: dv.getFloat64(idx+16, true),
				maxY: dv.getFloat64(idx+24, true),
				parts: new Int32Array(dv.getInt32(idx+32, true)),
				points: new Float64Array(dv.getInt32(idx+36, true)*2)
			};
			idx += 40;
			for (i=0; i<c.parts.length; i++) {
				c.parts[i] = dv.getInt32(idx, true);
				idx += 4;
			}
			for (i=0; i<c.points.length; i++) {
				c.points[i] = dv.getFloat64(idx, true);
				idx += 8;
			}
			break;
		
		case 8: // MultiPoint (MBR, pointCount, points)
		case 11: // PointZ (X, Y, Z, M)
		case 13: // PolylineZ
		case 15: // PolygonZ
		case 18: // MultiPointZ
		case 21: // PointM (X, Y, M)
		case 23: // PolylineM
		case 25: // PolygonM
		case 28: // MultiPointM
		case 31: // MultiPatch
			throw new Error("Shape type not supported: "
						+ shape.type + ':' +
						+ SHP.getShapeName(shape.type));
		default:
			throw new Error("Unknown shape type at " + (idx-4) + ': ' + shape.type);
	}
	return shape;
};

SHP = {
	NULL: 0,
	POINT: 1,
	POLYLINE: 3,
	POLYGON: 5
};

SHP.getShapeName = function(id) {
	for (name in this) {
		if (id === this[name]) {
			return name;
		}
	}
};

return SHPParser;
})