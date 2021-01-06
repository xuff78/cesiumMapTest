// import * as Cesium from 'cesium'
import {URLCONFIG} from './config'
let Cesium = window.Cesium
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2ZmU3MzVhMC02NTNkLTRmNzAtYTExNi1kMjVkZmY5MTY1YWIiLCJpZCI6OTcxNywiaWF0IjoxNjA5NDcwNDc5fQ.2KkFzL1wq__W1S7VzO1fbwvUNxXKrZwW434_BxKw1Q8'

export default {
    config: new URLCONFIG(),
    isFirst: true,
    init (id) {
        this.viewer = new Cesium.Viewer(id, {
            // terrainProvider: Cesium.createWorldTerrain()
        })
        // this.viewer.scene.primitives.add(Cesium.createOsmBuildings());
        // this.viewer.camera.flyTo({
        //     destination : Cesium.Cartesian3.fromDegrees(-122.4175, 37.655, 1000),
        //     orientation : {
        //         heading : Cesium.Math.toRadians(0.0),
        //         pitch : Cesium.Math.toRadians(-80.0),
        //     }
        // })
        this.setView({lon:113.06559697993666-0.0015,lat:22.64617101228423-0.0030,alt:20000000,pitch:0, heading:0});
    },
    loadGoogleMap (options){
        options = options ? options : {}
        // let m_name = options.name ? options.name : "GoogleMap"
        let m_show = true
        if(typeof options.show === 'boolean'){
            m_show = options.show
        }
        let layers = this.viewer.imageryLayers
        let googleMap = new Cesium.UrlTemplateImageryProvider({
            url : this.config.TDT_VEC
        });
        let googleMapLayer = layers.addImageryProvider(googleMap)
        let startTime = new Date().getTime() + 'a' + parseInt(100*Math.random())
        googleMapLayer.lid = startTime
        googleMapLayer.show = m_show
        // self._layerList[self._layerList.length] = googleMapLayer
        // layerManager._add('globeLayer',startTime,m_name,'',m_show)
        return googleMapLayer
    },
    add3DTile () {
        let helper = new Cesium.EventHelper();
        helper.add(this.viewer.scene.globe.tileLoadProgressEvent, (event) => {
                if (event == 0) {
                    if (this.isFirst) {
                        this.isFirst = false
                        let tileset = this.viewer.scene.primitives.add(new Cesium.Cesium3DTileset({
                            url: 'http://122.70.158.52:8080/tdt/3dtile/tileset.json',
                            // url: 'http://120.27.63.12:6080/south/tileset.json',
                            imageBasedLightingFactor: new Cesium.Cartesian2(8, 2),
                        }));
                        tileset.readyPromise.then(() => {
                            let translation = Cesium.Cartesian3.fromArray([0, 0, -180]);
                            let m = Cesium.Matrix4.fromTranslation(translation);
                            tileset._modelMatrix = m;
                            // let boundingSphere = tileset.boundingSphere;
                            // this.viewer.camera.viewBoundingSphere(boundingSphere, new Cesium.HeadingPitchRange(0.0, -0.5, boundingSphere.radius + 500.0));
                            // this.viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
                            // this.setView({lon:113.06559697993666-0.0015,lat:22.64617101228423-0.0030,alt:250,pitch:-25, heading:-40});
                            setTimeout(() => {
                                this.viewer.camera.flyTo({
                                    destination: Cesium.Cartesian3.fromDegrees(113.06559697993666 - 0.0030, 22.64617101228423 - 0.0010, 1800),
                                    orientation: {
                                        heading: Cesium.Math.toRadians(0),
                                        pitch: Cesium.Math.toRadians(-90),
                                    },
                                    complete: () => {
                                        this.viewer.camera.flyTo({
                                            destination: Cesium.Cartesian3.fromDegrees(113.06559697993666 - 0.0030, 22.64617101228423 - 0.0110, 800),
                                            orientation: {
                                                heading: Cesium.Math.toRadians(0),
                                                pitch: Cesium.Math.toRadians(-40),
                                            }
                                        })
                                    }
                                })
                            }, 1000)
                        })
                    }
                }
        })

    },
    loadGaodeMapVEC () {
        var layers = this.viewer.imageryLayers;
        var gaodeMap = new Cesium.UrlTemplateImageryProvider({
            url: 'http://{s}.is.autonavi.com/appmaptile?style=7&x={x}&y={y}&z={z}',
            // url: 'http://wprd{s}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scl=1&style=8&ltype=11',
            credit: new Cesium.Credit('高德影像地图服务'),
            subdomains: ['webst01', 'webst02', 'webst03', 'webst04'],
            tilingScheme: new Cesium.WebMercatorTilingScheme(),
            maximumLevel: 20,
            show: false
        });
        var gaodeMapLayer = layers.addImageryProvider(gaodeMap);
        return gaodeMapLayer;
    },
    setView (options){
        let m_options = options ? options : {};
        let lon = m_options.lon ? parseFloat(m_options.lon) : 109;	//经度
        let lat = m_options.lat ? parseFloat(m_options.lat) : 31;	//纬度
        let alt = m_options.alt ? parseFloat(m_options.alt) : 5000000;	//高程
        let heading = m_options.heading ? parseFloat(m_options.heading) : 0;	//水平角
        let pitch = m_options.pitch ? parseFloat(m_options.pitch) : -90;	//俯仰角
        let roll = m_options.roll ? parseFloat(m_options.roll) : 0;		//翻滚角
        this.viewer.scene.camera.setView({
            destination: new Cesium.Cartesian3.fromDegrees(lon, lat, alt),
            orientation: {
                heading: Cesium.Math.toRadians(heading),
                pitch: Cesium.Math.toRadians(pitch),
                roll: Cesium.Math.toRadians(roll)
            }
        });
    },
    createModel(url, height) {
        this.viewer.entities.removeAll();
        let position = Cesium.Cartesian3.fromDegrees(
            -122.4175, 37.655,
            height
        );
        let heading = Cesium.Math.toRadians(135);
        let pitch = 0;
        let roll = 0;
        let hpr = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        let orientation = Cesium.Transforms.headingPitchRollQuaternion(
            position,
            hpr
        );
        let entity = this.viewer.entities.add({
            name: url,
            position: position,
            orientation: orientation,
            model: {
                uri: url,
                minimumPixelSize: 128,
                maximumScale: 1,
            },
        });
        this.viewer.entities = [entity];
    }
}
