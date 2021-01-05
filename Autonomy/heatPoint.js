/*
* author: 赵雪丹
* description: heatPoint-热点
* day: 2017-12-25
*/
define( [ "./heatmap" ], function( h337 ){
function heatPoint(globe){
	this._globe = globe;
	this._viewer = globe._viewer;
	this._globeId = globe._globeId;
	this.viewshedLayers = null;
	this.WMP = new Cesium.WebMercatorProjection();
	this.defaults = {
		useEntitiesIfAvailable: true, 
		minCanvasSize: 700, 
		maxCanvasSize: 2000,
		radiusFactor: 10,
		spacingFactor: 1.5,
		maxOpacity: 0.8,
		minOpacity: 0.1,
		blur: 0.85,
		gradient: {
			'.3': 'blue',
			'.65': 'yellow',
			'.8': 'orange',
			'.95': 'red'
		},
	}
}

heatPoint.prototype.clear = function(){
	var self = this;
	if(self.viewshedLayers){
		self._viewer.imageryLayers.remove(self.viewshedLayers);
		self.viewshedLayers = null;
	}
}

heatPoint.prototype.loadData = function(data){
	if(!data){
		return;
	}
	var self = this;
	var min = 0;
	var max = 0;
	var west = 0;
	var south = 0;
	var east = 0;
	var north = 0;
	for(var i = 0; i < data.length; i++){
		var lon = data[i].lon;
		var lat = data[i].lat;
		var val = data[i].value;
		data[i].x = lon;
		data[i].y = lat;
		if(i == 0){
			west = lon;
			east = lon;
			south = lat;
			north = lat;
			min = val;
			max = val;
		}else{
			west = Math.min(west, lon);
			east = Math.max(east, lon);
			south = Math.min(south, lat);
			north = Math.max(north, lat);
			min = Math.min(min, val);
			max = Math.max(max, val);
		}
	}
	var rectangle =  { north: north, east: east, south: south, west: west };
	self.build(rectangle);
	self.setWGS84Data(min,max,data);
}

heatPoint.prototype.build = function(rectangle){
	var self = this;
	self._options = { container: document.querySelector('#'+self._globeId) };;
	self._id = self._getID();
	
	self._options.gradient = ((self._options.gradient) ? self._options.gradient : self.defaults.gradient);
	self._options.maxOpacity = ((self._options.maxOpacity) ? self._options.maxOpacity : self.defaults.maxOpacity);
	self._options.minOpacity = ((self._options.minOpacity) ? self._options.minOpacity : self.defaults.minOpacity);
	self._options.blur = ((self._options.blur) ? self._options.blur : self.defaults.blur);
	
	self._mbounds = self.wgs84ToMercatorBB(rectangle);
	self._setWidthAndHeight(self._mbounds);
	
	self._options.radius = Math.round((self._options.radius) ? self._options.radius : ((self.width > self.height) ? self.width / self.defaults.radiusFactor : self.height / self.defaults.radiusFactor));
	
	self._spacing = self._options.radius * self.defaults.spacingFactor;
	self._xoffset = self._mbounds.west;
	self._yoffset = self._mbounds.south;
	
	self.width = Math.round(self.width + self._spacing * 2);
	self.height = Math.round(self.height + self._spacing * 2);
	
	self._mbounds.west -= self._spacing * self._factor;
	self._mbounds.east += self._spacing * self._factor;
	self._mbounds.south -= self._spacing * self._factor;
	self._mbounds.north += self._spacing * self._factor;
	
	self.bounds = self.mercatorToWgs84BB(self._mbounds);
	
	self._rectangle = Cesium.Rectangle.fromDegrees(self.bounds.west, self.bounds.south, self.bounds.east, self.bounds.north);
	self._container = self._getContainer(self.width, self.height, self._id);
	self._options.container = self._container;
	self._heatmap = h337.create(self._options);
	self._container.children[0].setAttribute("id", self._id + "-hm");
}

heatPoint.prototype.setWGS84Data = function(min, max, data) {
	var self = this;
	if (data && data.length > 0 && min !== null && min !== false && max !== null && max !== false) {
		var convdata = [];
		
		for (var i = 0; i < data.length; i++) {
			var gp = data[i];
			
			var hp = self.wgs84PointToHeatmapPoint(gp);
			if (gp.value || gp.value === 0) { hp.value = gp.value; }
			
			convdata.push(hp);
		}
		
		return self.setData(min, max, convdata);
	}
	
	return false;
};

heatPoint.prototype.wgs84PointToHeatmapPoint = function(p) {
	var self = this;
	return self.mercatorPointToHeatmapPoint(self.wgs84ToMercator(p));
};

heatPoint.prototype.wgs84ToMercator = function(p) {
	var self = this;
	var mp = self.WMP.project(Cesium.Cartographic.fromDegrees(p.x, p.y));
	return {
		x: mp.x,
		y: mp.y
	};
};

heatPoint.prototype.mercatorPointToHeatmapPoint = function(p) {
	var self = this;
	var pn = {};
	
	pn.x = Math.round((p.x - self._xoffset) / self._factor + self._spacing);
	pn.y = Math.round((p.y - self._yoffset) / self._factor + self._spacing);
	pn.y = self.height - pn.y;
	
	return pn;
};

heatPoint.prototype.setData = function(min, max, data) {
	var self = this;
	if (data && data.length > 0 && min !== null && min !== false && max !== null && max !== false) {
		self._heatmap.setData({
			min: min,
			max: max,
			data: data
		});
		
		self.updateLayer();
		return true;
	}
	
	return false;
};

heatPoint.prototype.updateLayer = function() {
	var self = this;
	var imgData = self._heatmap._renderer.canvas.toDataURL("image/png");	
	var layers = self._viewer.imageryLayers;
	if(self.viewshedLayers){
		layers.remove(self.viewshedLayers);
	}
	self.viewshedLayers = layers.addImageryProvider(new Cesium.SingleTileImageryProvider({
	    url : imgData,
	    rectangle : self._rectangle
	}));
	self.viewshedLayers.alpha = 0.8;
};

heatPoint.prototype._getID = function(len) {
	var self = this;
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for( var i=0; i < ((len) ? len : 8); i++ )
		text += possible.charAt(Math.floor(Math.random() * possible.length));

	return text;
};

heatPoint.prototype.wgs84ToMercatorBB = function(bb) {
	var self = this;
	var sw = self.WMP.project(Cesium.Cartographic.fromDegrees(bb.west, bb.south));
	var ne = self.WMP.project(Cesium.Cartographic.fromDegrees(bb.east, bb.north));
	return {
		north: ne.y,
		east: ne.x,
		south: sw.y,
		west: sw.x
	};
};

heatPoint.prototype._setWidthAndHeight = function(mbb) {
	var self = this;
	self.width = ((mbb.east > 0 && mbb.west < 0) ? mbb.east + Math.abs(mbb.west) : Math.abs(mbb.east - mbb.west));
	self.height = ((mbb.north > 0 && mbb.south < 0) ? mbb.north + Math.abs(mbb.south) : Math.abs(mbb.north - mbb.south));
	self._factor = 1;
	
	if (self.width > self.height && self.width > self.defaults.maxCanvasSize) {
		self._factor = self.width / self.defaults.maxCanvasSize;
		
		if (self.height / self._factor < self.defaults.minCanvasSize) {
			self._factor = self.height / self.defaults.minCanvasSize;
		}
	} else if (self.height > self.width && self.height > self.defaults.maxCanvasSize) {
		self._factor = self.height / self.defaults.maxCanvasSize;
		
		if (self.width / self._factor < self.defaults.minCanvasSize) {
			self._factor = self.width / self.defaults.minCanvasSize;
		}
	} else if (self.width < self.height && self.width < self.defaults.minCanvasSize) {
		self._factor = self.width / self.defaults.minCanvasSize;

		if (self.height / self._factor > self.defaults.maxCanvasSize) {
			self._factor = self.height / self.defaults.maxCanvasSize;
		}
	} else if (self.height < self.width && self.height < self.defaults.minCanvasSize) {
		self._factor = self.height / self.defaults.minCanvasSize;

		if (self.width / self._factor > self.defaults.maxCanvasSize) {
			self._factor = self.width / self.defaults.maxCanvasSize;
		}
	}
	
	self.width = self.width / self._factor;
	self.height = self.height / self._factor;
};

heatPoint.prototype.mercatorToWgs84BB = function(bb) {
	var self = this;
	var sw = self.WMP.unproject(new Cesium.Cartesian3(bb.west, bb.south));
	var ne = self.WMP.unproject(new Cesium.Cartesian3(bb.east, bb.north));
	return {
		north: self.rad2deg(ne.latitude),
		east: self.rad2deg(ne.longitude),
		south: self.rad2deg(sw.latitude),
		west: self.rad2deg(sw.longitude)
	};
};

heatPoint.prototype._getContainer = function(width, height, id) {
	var self = this;
	var c = document.createElement("div");
	if (id) { c.setAttribute("id", id); }
	c.setAttribute("style", "width: " + width + "px; height: " + height + "px; margin: 0px; display: none;");
	document.body.appendChild(c);
	return c;
};

heatPoint.prototype.deg2rad = function(d) {
	var r = d * (Math.PI / 180.0);
	return r;
};

heatPoint.prototype.rad2deg = function(r) {
	var d = r / (Math.PI / 180.0);
	return d;
};

return heatPoint;
})