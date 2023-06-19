<template>
  <p>{{ gameState.posX }}</p>
  <TresCanvas shadows @mousemove="MovePaddle">
    <TresScene>
      <TresAmbientLight :color="0xffffff" :intensity="2" cast-shadow />
      <TresDirectionalLight :color="0xffaaaa" :intensity="2" cast-shadow />
      <TresPerspectiveCamera :position="[0, 0, 10]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
      <TresGroup ref="groupRef">
        <TresMesh :position="[-1, -2, 1]" :scale="1.25" receive-shadow>
          <TresSphereGeometry />
          <TresMeshToonMaterial color="beige" />
        </TresMesh>
        <TresMesh :position="[1, -2, 1]" :scale="1.25" receive-shadow>
          <TresSphereGeometry />
          <TresMeshToonMaterial color="beige" />
        </TresMesh>
        <TresMesh :position="[0, 4.8, 0]" :scale="1" receive-shadow>
          <TresSphereGeometry :args="[1]" />
          <TresMeshToonMaterial color="pink" />
        </TresMesh>
        <TresMesh :position="[0, 1, 0]" :scale="1" cast-shadow>
          <!-- <TresSphereGeometry /> -->
          <TresCylinderGeometry :args="[1, 1, 7.5]" />
          <TresMeshToonMaterial color="beige" />
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
import { type ShallowRef, shallowRef, reactive } from 'vue'
import { useRenderLoop } from '@tresjs/core'
import { OrbitControls, Environment } from '@tresjs/cientos'

const groupRef: ShallowRef = shallowRef(null)
const envRef: ShallowRef = shallowRef(null)

const { onLoop } = useRenderLoop()

const gameState =  reactive({
  score: 0,
  lives: 3,
  level: 1,
  gameOver: false,
  paused: false,
  started: false,
  posX: 0,
  posY: 0,
})

const MovePaddle = (e: MouseEvent): void => {
  gameState.posX = e.offsetX
}

onLoop(({ delta, elapsed }) => {
  if (groupRef.value != null) {
    groupRef.value.rotateX(delta)
    groupRef.value.rotateY(-delta)
  }
})
</script>
