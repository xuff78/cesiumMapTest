// import * as Cesium from 'cesium'
import {URLCONFIG} from './config'
let Cesium = window.Cesium
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2ZmU3MzVhMC02NTNkLTRmNzAtYTExNi1kMjVkZmY5MTY1YWIiLCJpZCI6OTcxNywiaWF0IjoxNjA5NDcwNDc5fQ.2KkFzL1wq__W1S7VzO1fbwvUNxXKrZwW434_BxKw1Q8'

export default {
    config: new URLCONFIG(),
    init (id) {
        this.viewer = new Cesium.Viewer(id, {
            terrainProvider: Cesium.createWorldTerrain()
        })
        this.viewer.scene.primitives.add(Cesium.createOsmBuildings());
        this.viewer.camera.flyTo({
            destination : Cesium.Cartesian3.fromDegrees(-122.4175, 37.655, 1000),
            orientation : {
                heading : Cesium.Math.toRadians(0.0),
                pitch : Cesium.Math.toRadians(-80.0),
            }
        });
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
            url : this.config.GOOGLEMAP
        });
        let googleMapLayer = layers.addImageryProvider(googleMap)
        let startTime = new Date().getTime() + 'a' + parseInt(100*Math.random())
        googleMapLayer.lid = startTime
        googleMapLayer.show = m_show
        // self._layerList[self._layerList.length] = googleMapLayer
        // layerManager._add('globeLayer',startTime,m_name,'',m_show)
        return googleMapLayer
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