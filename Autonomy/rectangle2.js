/*
 * author: 徐义超
 * description: 矩形
 * day: 2019-3-8
 */
define( [], function(){
    function Rectangle2(globe){
        var self = this;
        this._globe = globe;
        this._viewer = globe._viewer;
        this._scene = globe._viewer.scene;
        this._globeId = globe._globeId;
        this._minHeight = 0;
        this._maxHeight = 1000000;
        this._catalog = "default";
        this._subcatalog = "default";
        this._layer = [];
        this._options = {
            draw: false,
            minHeight: 0,
            maxHeight: 1000000,
            catalog: "default",
            subcatalog: "default",
            handlerCallback: null,
            options: null,
            drawid: ""
        };

        this._isdrag = false;
        this._dragNun = 0;
        this._dragObjNun = 0;
        this._dragList = [];
        this._positionList = [];
        this._showMenu = true;
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
                    self._layer[i].polygon.show = true;
                    if(self._layer[i].clampMode == 0){
                        self._layer[i].polyline.show = true;
                    }
                }else{
                    self._layer[i].polygon.show = false;
                    self._layer[i].polyline.show = false;
                }
            }
        });
        //私有注册事件
        this._handler = new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas);
        //结束画矩形事件
        var endDrawAction = function (e) {
            var lonlat = self._globe.getLonLatByPosition(e.position);
            if(lonlat.alt < 0){
                lonlat.alt = 0;
            }
            if(self._options.draw){
                if(self._options.handlerCallback){
                    for(var i = 0; i < self._layer.length; i++){
                        var layer=self._layer[i];
                        if(layer.polygon.id == self._options.drawid){
                            var m_options = layer.polygon.options;
                            var clampMode = m_options.clampMode ? m_options.clampMode : 0;
                            layer.polygon.show = true;
                            if(clampMode == 1){
                                layer.polyline.show = true;
                            }
                            self._options.drawid = "";
                            self._options.handlerCallback(layer);
                            break;
                        }
                    }
                }else{
                    self._options.drawid = "";
                }
            }
        }
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
                if(self._options.drawid == ""){
                    var mid = m_options.mid ? m_options.mid : "";
                    var name = m_options.name ? m_options.name : "default";
                    var wlpha = m_options.wlpha ? m_options.wlpha : 0.3;
                    var clampMode = m_options.clampMode ? m_options.clampMode : 0;
                    var height = m_options.height ? m_options.height : 2000;
                    var rightClick = m_options.rightClick ? m_options.rightClick : null;
                    var color = self._options.options.color ? self._options.options.color : Cesium.Color.fromCssColorString('#66cccc');
                    var colorBorder = self._options.options.colorBorder ? self._options.options.colorBorder : Cesium.Color.fromCssColorString('#66cccc');
                    var m_layer = self._options.options.layer ? self._options.options.layer : self._globe._defaultLayer;
                    var catalog = m_options.catalog ? m_options.catalog : self._catalog;
                    var subcatalog = m_options.subcatalog ? m_options.subcatalog : self._subcatalog;
                    var minHeight = m_options.minHeight ? m_options.minHeight : self._minHeight;
                    var maxHeight = m_options.maxHeight ? m_options.maxHeight : self._maxHeight;
                    var pointList = [lonlat];
                    var m_obj = {
                        mid: mid,
                        name: name,
                        polygon: null,
                        polyline: null,
                        pointList: pointList,
                        vertexList: null,
                        vertexLineList: null,
                        layer: m_layer,
                        catalog: catalog,
                        subcatalog: subcatalog,
                        minHeight: minHeight,
                        maxHeight: maxHeight,
                        showHeight: true,
                        showLayer: true,
                        showEntity: true,
                        clampMode: clampMode
                    };
                    var polygon={
                        hierarchy: new Cesium.CallbackProperty(function(){ return m_obj.vertexList; }, false),
                        material: color.withAlpha(wlpha),
                    }
                    //贴地就用corridor，否则用polyline
                    if(clampMode == 0){
                        polygon.height=height;
                        m_obj.polyline = self._viewer.entities.add({
                            mid:mid,
                            name:name,
                            options:m_options,
                            polyline: {
                                positions: new Cesium.CallbackProperty(function(){ return m_obj.vertexLineList; }, false),
                                width: 2,
                                material: colorBorder,
                            }
                        });
                    }else{
                        m_obj.polyline = self._viewer.entities.add({
                            mid:mid,
                            name:name,
                            options:m_options,
                            corridor: {
                                positions: new Cesium.CallbackProperty(function(){ return m_obj.vertexLineList; }, false),
                                width: 50,
                                material: colorBorder,
                            }
                        });
                    }
                    m_obj.polygon = self._viewer.entities.add({
                        mid:mid,
                        name:name,
                        options:m_options,
                        show:false,
                        rightClick : rightClick,
                        polygon: polygon
                    });
                    self._layer[self._layer.length] = m_obj;
                    self._options.drawid = m_obj.polygon.id;
                    var startTime = new Date().getTime() + "a" + parseInt(100*Math.random());
                    // self._globe.layerManager._add("entityLayer",startTime,catalog,subcatalog);
                }else{
                    endDrawAction(e);
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        //RIGHT_CLICK 右键点击事件
        this._handler.setInputAction(function (e) {
            endDrawAction(e);
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        //MOUSE_MOVE 鼠标移动事件
        var height = self._options.height ? self._options.height : 2000;
        this._handler.setInputAction(function (movement) {
            var lonlat = self._globe.getLonLatByPosition(movement.endPosition);
            if(self._options.draw){
                for(var i = 0; i < self._layer.length; i++){
                    if(self._layer[i].polygon.id == self._options.drawid){
                        var m_pointList = self._layer[i].pointList;
                        m_pointList[1] = lonlat;

                        var m_array = new Array();
                        var m_arrayLine = new Array();
                        m_array.push(m_pointList[0].lon);
                        m_array.push(m_pointList[0].lat);
                        m_array.push(m_pointList[0].alt);
                        m_arrayLine.push(m_pointList[0].lon);
                        m_arrayLine.push(m_pointList[0].lat);
                        m_arrayLine.push(height);

                        m_array.push(m_pointList[0].lon);
                        m_array.push(m_pointList[1].lat);
                        m_array.push(m_pointList[0].alt);
                        m_arrayLine.push(m_pointList[1].lon);
                        m_arrayLine.push(m_pointList[0].lat);
                        m_arrayLine.push(height);

                        m_array.push(m_pointList[1].lon);
                        m_array.push(m_pointList[1].lat);
                        m_array.push(m_pointList[1].alt);
                        m_arrayLine.push(m_pointList[1].lon);
                        m_arrayLine.push(m_pointList[1].lat);
                        m_arrayLine.push(height);

                        m_array.push(m_pointList[1].lon);
                        m_array.push(m_pointList[0].lat);
                        m_array.push(m_pointList[1].alt);
                        m_arrayLine.push(m_pointList[0].lon);
                        m_arrayLine.push(m_pointList[1].lat);
                        m_arrayLine.push(height);

                        m_arrayLine.push(m_pointList[0].lon);
                        m_arrayLine.push(m_pointList[0].lat);
                        m_arrayLine.push(height);
                        self._layer[i].vertexList = Cesium.Cartesian3.fromDegreesArrayHeights(m_array);
                        self._layer[i].vertexLineList = Cesium.Cartesian3.fromDegreesArrayHeights(m_arrayLine);
                    }
                }
            }else if(self._isdrag){

            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        this._handler.setInputAction(function (e) {
            var pick = self._viewer.scene.pick(e.position);
            if(Cesium.defined(pick)){
                if(pick.id){
                    if(pick.id.drag){
                        self._isdrag = true;
                        // 如果为真，则允许用户旋转相机。如果为假，相机将锁定到当前标题。此标志仅适用于2D和3D。
                        self._scene.screenSpaceCameraController.enableRotate = false;
                        // 如果为true，则允许用户平移地图。如果为假，相机将保持锁定在当前位置。此标志仅适用于2D和Columbus视图模式。
                        self._scene.screenSpaceCameraController.enableTranslate = false;
                        // 如果为真，允许用户放大和缩小。如果为假，相机将锁定到距离椭圆体的当前距离
                        self._scene.screenSpaceCameraController.enableZoom = false;
                        // 如果为真，则允许用户倾斜相机。如果为假，相机将锁定到当前标题。这个标志只适用于3D和哥伦布视图。
                        self._scene.screenSpaceCameraController.enableTilt = false;
                        // 如果为true，则允许用户使用免费外观。如果错误，摄像机视图方向只能通过转换或旋转进行更改。此标志仅适用于3D和哥伦布视图模式。
                        self._scene.screenSpaceCameraController.enableLook = false;
                        document.getElementById(self._globeId).style.cursor='pointer';
                        for(var i = 0; i < self._dragList.length; i++){
                            if(self._dragList[i].obj == pick.id){
                                self._dragObjNun = i;
                            }
                        }
                    }
                }
            }
        }, Cesium.ScreenSpaceEventType.LEFT_DOWN );

        this._handler.setInputAction(function (e) {
            if(self._isdrag){
                self._isdrag = false;
                // 如果为真，则允许用户旋转相机。如果为假，相机将锁定到当前标题。此标志仅适用于2D和3D。
                self._scene.screenSpaceCameraController.enableRotate = true;
                // 如果为true，则允许用户平移地图。如果为假，相机将保持锁定在当前位置。此标志仅适用于2D和Columbus视图模式。
                self._scene.screenSpaceCameraController.enableTranslate = true;
                // 如果为真，允许用户放大和缩小。如果为假，相机将锁定到距离椭圆体的当前距离
                self._scene.screenSpaceCameraController.enableZoom = true;
                // 如果为真，则允许用户倾斜相机。如果为假，相机将锁定到当前标题。这个标志只适用于3D和哥伦布视图。
                self._scene.screenSpaceCameraController.enableTilt = true;
                // 如果为true，则允许用户使用免费外观。如果错误，摄像机视图方向只能通过转换或旋转进行更改。此标志仅适用于3D和哥伦布视图模式。
                self._scene.screenSpaceCameraController.enableLook = true;
                document.getElementById(self._globeId).style.cursor='default';
                self._dragObjNun = 0;
            }
        }, Cesium.ScreenSpaceEventType.LEFT_UP );
    }

    /*
     * 拖拽编辑面对象
     * @author zhaoxd
     * @method editByHandler
     * @for Rectangle2
     * @param {Object} 面对象
     * @return {null} null
     */
    Rectangle2.prototype.editByHandler = function(obj){
        var self = this;
        self._clearDrag();
        for(var i = self._layer.length - 1; i >= 0; i--){
            if(self._layer[i] == obj){
                self._dragNun = i;
                break;
            }
        }
        var pointList = self._layer[self._dragNun].pointList;
        for(var i = 0; i < pointList.length; i++){
            self._addDrag(pointList[i]);
        }
    }

    /*
     * 结束拖拽编辑面对象
     * @author zhaoxd
     * @method editByHandlerEnd
     * @for Rectangle2
     * @param {null} null
     * @return {null} null
     */
    Rectangle2.prototype.editByHandlerEnd = function(){
        var self = this;
        self._clearDrag();
    }

    /*
     * 清除拖拽点
     * @author zhaoxd
     * @method _clearDrag
     * @for Rectangle2
     * @param {null} null
     * @return {null} null
     */
    Rectangle2.prototype._clearDrag = function(){
        var self = this;
        for(var i = self._dragList.length - 1; i >= 0; i--){
            self._viewer.entities.remove(self._dragList[i].obj);
            self._dragList.splice(i, 1);
        }
        self._dragList = [];
    }

    /*
     * 添加拖拽点
     * @author zhaoxd
     * @method _addDrag
     * @for Rectangle2
     * @param {point} 拖拽点对象
     * @return {null} null
     */
    Rectangle2.prototype._addDrag = function(point){
        var self = this;
        var m_drag = {obj:null,position:null};
        m_drag.position = Cesium.Cartesian3.fromDegrees(point.lon, point.lat);
        m_drag.obj = self._viewer.entities.add({
            drag : true,
            position : new Cesium.CallbackProperty(function(){ return m_drag.position; }, false),
            ellipse : {
                semiMinorAxis : 150,
                semiMajorAxis : 150,
                material : Cesium.Color.RED.withAlpha(1)
            }
        });
        self._dragList[self._dragList.length] = m_drag;
    }

    /*
     * 球体点击添加面
     * @author zhaoxd
     * @method drawHandler
     * @for Rectangle2
     * @param {Object} 面对象参数
     * @return {null} null
     */
    Rectangle2.prototype.drawHandler = function(options){
        var self = this;
        self._options.draw = true;
        self._options.drawid = "";
        self._options.options = options;
        handlerCallback = options.handlerCallback ? options.handlerCallback : null;
        self._options.handlerCallback = handlerCallback;
        self._showMenu = self._globe.globeMenu._showMenu;
        self._globe.globeMenu.setType(false);
    }

    /*
     * 暂停球体点击添加面
     * @author zhaoxd
     * @method deactivateHandler
     * @for Rectangle2
     * @param {null} null
     * @return {null} null
     */
    Rectangle2.prototype.deactivateHandler = function(){
        var self = this;
        self._options.draw = false;
        self._globe.globeMenu.setType(self._showMenu);
    }

    /*
     * 移除面
     * @author zhaoxd
     * @method remove
     * @for Rectangle2
     * @param {Cesium.Entity} 面对象
     * @return {Boolean} true:成功,false:失败
     */
    Rectangle2.prototype.remove = function(polygon){
        var self = this;
        for(var i = self._layer.length - 1; i >= 0; i--){
            if(self._layer[i].polygon == polygon){
                var catalog = self._layer[i].catalog;
                var subcatalog = self._layer[i].subcatalog;
                var back = self._viewer.entities.remove(self._layer[i].polygon);
                back = self._viewer.entities.remove(self._layer[i].polyline);
                self._layer.splice(i, 1);
                // self._globe.layerManager._remove("entityLayer",catalog,subcatalog);
                return back;
            }
        }
    }

    /*
     * 根据mid移除面
     * @author zhaoxd
     * @method removeByMid
     * @for Rectangle2
     * @param {string} 面对象mid
     * @return {Boolean} true:成功,false:失败
     */
    Rectangle2.prototype.removeByMid = function(mid){
        var self = this;
        var back = true;
        for(var i = self._layer.length - 1; i >= 0; i--){
            if(self._layer[i].polygon.mid == mid){
                var catalog = self._layer[i].catalog;
                var subcatalog = self._layer[i].subcatalog;
                back = self._viewer.entities.remove(self._layer[i].polygon);
                back = self._viewer.entities.remove(self._layer[i].polyline);
                self._layer.splice(i, 1);
                // self._globe.layerManager._remove("entityLayer",catalog,subcatalog);
                if(!back){
                    console.log("false!!!!");
                    return back;
                }
            }
        }
        return back;
    }

    /*
     * 根据name移除面
     * @author zhaoxd
     * @method removeByName
     * @for Rectangle2
     * @param {string} 面对象name
     * @return {Boolean} true:成功,false:失败
     */
    Rectangle2.prototype.removeByName = function(name){
        var self = this;
        var back = true;
        for(var i = self._layer.length - 1; i >= 0; i--){
            if(self._layer[i].polygon.name == name){
                var catalog = self._layer[i].catalog;
                var subcatalog = self._layer[i].subcatalog;
                back = self._viewer.entities.remove(self._layer[i].polygon);
                back = self._viewer.entities.remove(self._layer[i].polyline);
                self._layer.splice(i, 1);
                // self._globe.layerManager._remove("entityLayer",catalog,subcatalog);
                if(!back){
                    return back;
                }
            }
        }
        return back;
    }

    /*
     * 根据mid获取面
     * @author zhaoxd
     * @method getByMid
     * @for Rectangle2
     * @param {string} 面对象mid
     * @return {list} list
     */
    Rectangle2.prototype.getByMid = function(mid){
        var self = this;
        var list = [];
        for(var i = self._layer.length - 1; i >= 0; i--){
            if(self._layer[i].polygon.mid == mid){
                list[list.length] = self._layer[i].polygon;
            }
        }
        return list;
    }

    /*
     * 根据name获取面
     * @author zhaoxd
     * @method getByName
     * @for Rectangle2
     * @param {string} 面对象name
     * @return {list} list
     */
    Rectangle2.prototype.getByName = function(name){
        var self = this;
        var list = [];
        for(var i = self._layer.length - 1; i >= 0; i--){
            if(self._layer[i].polygon.name == name){
                list[list.length] = self._layer[i].polygon;
            }
        }
        return list;
    }

    return Rectangle2;
})