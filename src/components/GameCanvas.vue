<template>
  <TresCanvas shadows>
    <TresScene>
      <TresAmbientLight :color="0xffffff" :intensity="2" cast-shadow />
      <TresDirectionalLight :color="0xffaaaa" :intensity="2" cast-shadow />
      <TresPerspectiveCamera :position="[0, 0, 10]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
      <TresGroup ref="groupRef">
        <TresMesh :position="[-1, -2, 1]" :scale="1.25" receive-shadow>
          <TresSphereGeometry />
          <TresMeshToonMaterial color="brown" />
        </TresMesh>
        <TresMesh :position="[1, -2, 1]" :scale="1.25" receive-shadow>
          <TresSphereGeometry />
          <TresMeshToonMaterial color="brown" />
        </TresMesh>
        <TresMesh :position="[0, 2.3, 0]" :scale="1" receive-shadow>
          <TresSphereGeometry :args="[1]" />
          <TresMeshToonMaterial color="pink" />
        </TresMesh>
        <TresMesh :scale="1" cast-shadow>
          <!-- <TresSphereGeometry /> -->
          <TresCylinderGeometry :args="[1, 1, 5]" />
          <TresMeshToonMaterial color="brown" />
        </TresMesh>
      </TresGroup>
      <Suspense>
        <Environment ref="envRef" :files="'game/environment.hdr'" />
      </Suspense>
    </TresScene>
    <OrbitControls />
  </TresCanvas>
</template>

<script setup lang="ts">
import { type ShallowRef, shallowRef, watch } from 'vue'
import { useRenderLoop } from '@tresjs/core'
import { OrbitControls, Environment } from '@tresjs/cientos'
import type { Texture } from 'three';

const groupRef: ShallowRef = shallowRef(null)
const envRef: ShallowRef = shallowRef(null)

const { onLoop } = useRenderLoop()

let envMap: null = null

watch(envRef, ({ getTexture }) => {
  envMap = getTexture()
})

onLoop(({ delta, elapsed }) => {
  if (groupRef.value != null) {
    groupRef.value.rotateX(delta)
    groupRef.value.rotateY(-delta)
  }
})
</script>
