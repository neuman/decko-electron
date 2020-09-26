<template>
  <div>
    <canvas ref="canvas"/>
    <Three v-if="canvas">
      <Renderer :canvas="canvas" camera="main" scene="scene1" :clearColor="0xCCCCCC" antialias shadows/>

  <AssetBundle name="cube" preload>
    <Material name="cube_Mat" :factory="cubeMaterialFactory"/>
    <Geometry name="cube_Geom" :factory="cubeGeometryFactory"/>
  </AssetBundle>

     <Scene name="scene1" assets="cube">

    <Camera name="main" :factory="perspectiveCameraFactory">
      <Position :value="{ x: -3.5, y: 1.75, z: 2.25 }"/>
      <Rotation :value="{ x: -41, y: -52, z: -35 }" />
    </Camera>

    <Light :factory="pointLightFactory">
      <Position :value="{ x: 0, y: 10, z: 5 }"/>
      <Shadows cast/>
    </Light>

    <Mesh material="cube_Mat" geometry="cube_Geom">
      <Position :value="{ x: 0, y: 0, z: 0 }"/>
      <Shadows cast receive/>
    </Mesh>

  </Scene>
      

    </Three>
  </div>
</template>

<script>
import * as THREE from 'three'
import { components } from 'vue-threejs-composer'

export default {
  name: "ThreeApp",
  components: {
    ...components,
  },
  data() {
    return {
      canvas: null
    }
  },
  mounted() {
    this.canvas = this.$refs.canvas;
  },
  methods: {
        // you always need to return Promises from factory functions
    async cubeMaterialFactory() {
      return new THREE.MeshStandardMaterial({
        color: "#DDDDDD",
        metalness: 0.01
      });
    },
    async cubeGeometryFactory() {
      return new THREE.BoxBufferGeometry(1, 1, 1);
    },
    async perspectiveCameraFactory() {
      const viewAngle = 60;
      const nearClipping = 0.1;
      const farClipping = 1000;
      return new THREE.PerspectiveCamera(
        viewAngle,
        window.innerWidth / window.innerHeight,
        nearClipping,
        farClipping
      );
    },
    async pointLightFactory() {
      return new THREE.PointLight(0xffffff, 1, 100);
    }
  },
}
</script>