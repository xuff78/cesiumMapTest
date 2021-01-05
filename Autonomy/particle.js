/*
* author: 赵雪丹
* description: particle-粒子系统
* day: 2018-4-3
*/
define( [], function(){
function Particle(globe){
	var self = this;
	this._globe = globe;
	this._viewer = globe._viewer;
	this._globeId = globe._globeId;
	this._minHeight = 0;
	this._maxHeight = 1000000;
	this._catalog = "default";
	this._subcatalog = "default";
	this._layer = [];
	
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
	});
}

/*
 * 添加粒子系统
 * @author zhaoxd
 * @method add
 * @for Particle
 * @param {Object} 粒子参数
 * @return {Cesium.Entity} particle
 */
Particle.prototype.add = function(options){
	var self = this;
	var mid = options.mid ? options.mid : "";						//mid
	var name = options.name ? options.name : "default";				//name
	var lon = options.lon ? parseFloat(options.lon) : 0;			//经度
	var lat = options.lat ? parseFloat(options.lat) : 0;			//纬度
	var alt = options.alt ? parseFloat(options.alt) : 0;			//高程
	var catalog = options.catalog ? options.catalog : self._catalog;
	var subcatalog = options.subcatalog ? options.subcatalog : self._subcatalog;
	var minHeight = options.minHeight ? options.minHeight : self._minHeight;
	var maxHeight = options.maxHeight ? options.maxHeight : self._maxHeight;
	var image = options.image ? options.image : self._globe.urlConfig.PARTICLE_FIRE;
	var startScale = options.startScale ? parseFloat(options.startScale) : 4.0;
	var endScale = options.endScale ? parseFloat(options.endScale) : 6.0;
	var minimumLife = options.minimumLife ? parseFloat(options.minimumLife) : 1.0;
	var maximumLife = options.maximumLife ? parseFloat(options.maximumLife) : 1.5;
	var speed = options.speed ? parseFloat(options.speed) : 5.0;
	var width = options.width ? parseInt(options.width) : 20;
	var height = options.height ? parseInt(options.height) : 20;
	var lifeTime = options.lifeTime ? parseFloat(options.lifeTime) : 16.0;
	var rate = options.rate ? parseFloat(options.rate) : 50.0;
	var emitter = options.emitter ? parseFloat(options.emitter) : 45.0;
	var startColor = options.startColor ? options.startColor : Cesium.Color.RED;
	var startAlpha = options.startAlpha ? parseFloat(options.startAlpha) : 0.7;
	var endColor = options.endColor ? options.endColor : Cesium.Color.YELLOW;
	var endAlpha = options.endAlpha ? parseFloat(options.endAlpha) : 0.3;
	
	var particle = self._viewer.scene.primitives.add(new Cesium.ParticleSystem({
	    //用于广告牌的URI，HTMLImageElement或HTMLCanvasElement。
	    image : image,
	    //粒子出生时的比例。
	    startScale : startScale,
	    //粒子死亡时的比例。
	    endScale : endScale,
	    //以秒为单位设置粒子的最短寿命。
	    minimumLife : minimumLife,
	    //以秒为单位设置粒子的最大寿命。
	    maximumLife : maximumLife,
	    //设置以米/秒为单位的最小和最大速度。
	    speed : speed,
	    //设置粒子的最小和最大宽度（以像素为单位）。
	    width : width,
	    //设置粒子的最小和最大高度（以像素为单位）。
	    height : height,
	    //粒子系统将以秒为单位发射粒子。
	    lifeTime : lifeTime,
	    //粒子出生时的颜色。
	    startColor: startColor.withAlpha(startAlpha),
	    //粒子死亡时的颜色。
	    endColor: endColor.withAlpha(endAlpha),
	    //每秒发射的粒子数量。
	    rate : rate,
	    //主模型参数(位置)  4x4转换矩阵，可将粒子系统从模型转换为世界坐标。
	    modelMatrix : Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(lon, lat, alt), undefined, new Cesium.Matrix4()),
	    // 发射器参数
	    emitter : new Cesium.ConeEmitter(Cesium.Math.toRadians(emitter))
	}));
	particle.mid = mid;
	particle.name = name;
	particle.catalog = catalog;
	particle.subcatalog = subcatalog;
	particle.minHeight = minHeight;
	particle.maxHeight = maxHeight;
	particle.showHeight = true;
	particle.showLayer = true;
	particle.showEntity = true;
	self._layer[self._layer.length] = particle;
	var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
	self._globe.layerManager._add("entityLayer",startTime,catalog,subcatalog);
	return particle;
}

/*
 * 移除粒子系统
 * @author zhaoxd
 * @method remove
 * @for Particle
 * @param {Cesium.Entity} 粒子系统
 * @return {Boolean} true:成功,false:失败
 */
Particle.prototype.remove = function(particle){
	var self = this;
	for(var i = self._layer.length - 1; i >= 0; i--){
		if(self._layer[i] == particle){
			var catalog = self._layer[i].catalog;
			var subcatalog = self._layer[i].subcatalog;
			var back = self._viewer.scene.primitives.remove(particle);
			self._layer.splice(i, 1);
			self._globe.layerManager._remove("entityLayer",catalog,subcatalog);
			return back;
		}
	}
}

/*
 * 根据mid移除粒子系统
 * @author zhaoxd
 * @method removeByMid
 * @for Particle
 * @param {string} 粒子系统mid
 * @return {Boolean} true:成功,false:失败
 */
Particle.prototype.removeByMid = function(mid){
	var self = this;
	var back = true;
	for(var i = self._layer.length - 1; i >= 0; i--){
		if(self._layer[i].mid == mid){
			var catalog = self._layer[i].catalog;
			var subcatalog = self._layer[i].subcatalog;
			back = self._viewer.scene.primitives.remove(self._layer[i]);
			self._layer.splice(i, 1);
			self._globe.layerManager._remove("entityLayer",catalog,subcatalog);
			if(!back){
				return back;
			}
		}
	}
	return back;
}

/*
 * 根据name移除粒子系统
 * @author zhaoxd
 * @method removeByName
 * @for Particle
 * @param {string} 粒子系统name
 * @return {Boolean} true:成功,false:失败
 */
Particle.prototype.removeByName = function(name){
	var self = this;
	var back = true;
	for(var i = self._layer.length - 1; i >= 0; i--){
		if(self._layer[i].name == name){
			var catalog = self._layer[i].catalog;
			var subcatalog = self._layer[i].subcatalog;
			back = self._viewer.scene.primitives.remove(self._layer[i]);
			self._layer.splice(i, 1);
			self._globe.layerManager._remove("entityLayer",catalog,subcatalog);
			if(!back){
				return back;
			}
		}
	}
	return back;
}

/*
 * 根据mid获取粒子系统
 * @author zhaoxd
 * @method getByMid
 * @for Particle
 * @param {string} 粒子系统mid
 * @return {list} list
 */
Particle.prototype.getByMid = function(mid){
	var self = this;
	var list = [];
	for(var i = self._layer.length - 1; i >= 0; i--){
		if(self._layer[i].mid == mid){
			list[list.length] = self._layer[i];
		}
	}
	return list;
}

/*
 * 根据name获取粒子系统
 * @author zhaoxd
 * @method getByName
 * @for Particle
 * @param {string} 粒子系统name
 * @return {list} list
 */
Particle.prototype.getByName = function(name){
	var self = this;
	var list = [];
	for(var i = self._layer.length - 1; i >= 0; i--){
		if(self._layer[i].name == name){
			list[list.length] = self._layer[i];
		}
	}
	return list;
}


return Particle;
})