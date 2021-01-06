<template>
  <div>
    <div id="cesiumContainer"></div>
  </div>
</template>

<script>
  import mapControl from './map'
  export default {
    components: {
    },
    data(){
      return {

      }
    },
    computed:{

    },
    mounted(){
      mapControl.init('cesiumContainer')
      mapControl.loadGoogleMap()
      // mapControl.loadGaodeMapVEC()
      // mapControl.createModel('./Shadow_Tester_4.gltf', 200)
      mapControl.add3DTile()
    },
    methods: {
      moveToMarker(){

      },
    }
  }
</script>

<style>
#cesiumContainer {
  width: 100vw;
  height: 100vh;
}
body {
  margin: 0;
  padding: 0;
}
</style>
