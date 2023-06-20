<template>
  <div class="">
    <p class="">{{ gs.posX + ' - ' + gs.posY }}</p>
    <div class="w-[720px] h-[480px]">
      <TresCanvas shadows @mousemove="MovePaddle">
        <TresScene>
          <TresAmbientLight color="#ffffff" :intensity="1" />
          <TresDirectionalLight color="#ffffff" :intensity="2" />
          <!-- <TresPerspectiveCamera :position="[
            paddlePos(gs.posX),
            5,
            gm.fieldDepth
          ]" :fov="45" :aspect="1" :near="0.1" :far="1000" /> -->
          <TresPerspectiveCamera :position="[
            10,
            40,
            5
          ]" :fov="45" :aspect="1" :near="0.1" :far="1000" />
          <!-- <TresGroup ref="groupRef">
            <TresMesh :position="[-1, -2, 1]" :scale="1.25">
              <TresSphereGeometry />
              <TresMeshToonMaterial color="beige" />
            </TresMesh>
            <TresMesh :position="[1, -2, 1]" :scale="1.25">
              <TresSphereGeometry />
              <TresMeshToonMaterial color="beige" />
            </TresMesh>
            <TresMesh :position="[0, 4.8, 0]" :scale="1">
              <TresSphereGeometry :args="[1]" />
              <TresMeshToonMaterial color="pink" />
            </TresMesh>
            <TresMesh :position="[0, 1, 0]" :scale="1">
          <TresCylinderGeometry :args="[1, 1, 7.5]" />
          <TresMeshToonMaterial color="beige" />
          </TresMesh>
          </TresGroup> -->
          <TresGroup>
            <TresMesh>
              <TresBoxGeometry :args="[gm.fieldWidth, gm.fieldHeight, gm.fieldDepth]" />
              <TresMeshToonMaterial color="#f80" />
            </TresMesh>
            <TresMesh :rotate-x="-Math.PI * 0.5" :position-y="gm.fieldHeight * 0.5 + 0.01">
              <TresPlaneGeometry :args="[gm.fieldWidth, 1]" />
              <TresMeshToonMaterial color="#fff" />
            </TresMesh>
          </TresGroup>
          <TresMesh :position="[
            paddlePos(gs.posX),
            gm.fieldHeight,
            gm.fieldDepth * 0.5 + gm.paddleDepth * 0.5
          ]" ref="paddle1Ref">
            <TresBoxGeometry :args="[
              gm.paddleRatio * gm.fieldWidth,
              gm.paddleHeight,
              gm.paddleDepth
            ]" />
            <TresMeshToonMaterial color="#fff" />
          </TresMesh>
          <TresMesh :position="[
            0,
            gm.fieldHeight,
            -gm.fieldDepth * 0.5 - gm.paddleDepth * 0.5
          ]" ref="paddle2Ref">
            <TresBoxGeometry :args="[
              gm.paddleRatio * gm.fieldWidth,
              gm.paddleHeight,
              gm.paddleDepth
            ]" />
            <TresMeshToonMaterial color="#fff" />
          </TresMesh>
          <TresMesh :position="[
            0,
            gm.fieldHeight + gm.ballRadius * 0.5,
            0
          ]" ref="ballRef">
            <TresSphereGeometry :args="[gm.ballRadius]" />
            <TresMeshToonMaterial color="yellow" />
          </TresMesh>
          <!-- <Suspense>
            <Environment ref="envRef" :files="'game/environment.hdr'" />
          </Suspense> -->
        </TresScene>
        <OrbitControls />
      </TresCanvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type ShallowRef, shallowRef, reactive } from 'vue'
import { useRenderLoop } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'
import type { Object3D } from 'three';
import { gm, renderPong } from '@/includes/gameEngine'

// const groupRef: ShallowRef = shallowRef(null)
// const envRef: ShallowRef = shallowRef(null)

interface SimObject3D extends Object3D {
  velocity: {
    x: number,
    y: number,
    z: number,
  },
  stopped: boolean,
}

const ballRef: ShallowRef<SimObject3D | null> = shallowRef(null)
const paddle1Ref: ShallowRef<SimObject3D | null> = shallowRef(null)
const paddle2Ref: ShallowRef<SimObject3D | null> = shallowRef(null)

const { onLoop } = useRenderLoop()

const gs = reactive({
  score: 0,
  lives: 3,
  level: 1,
  gameOver: false,
  paused: false,
  started: false,
  posX: 0,
  posY: 0,
})

const paddlePos = (x: number): number => {
  const newMin = -gm.fieldWidth * 0.5 + (gm.paddleRatio * gm.fieldWidth * 0.5);
  const newMax = gm.fieldWidth * 0.5 - (gm.paddleRatio * gm.fieldWidth * 0.5);
  return x * (newMax - newMin) / gm.canvasWidth + newMin;
}

const MovePaddle = (e: MouseEvent): void => {
  gs.posX = e.offsetX
  gs.posY = e.offsetY
}

onLoop(() => {
  if (ballRef.value != null && paddle1Ref.value != null && paddle2Ref.value != null) {
    renderPong(ballRef.value, paddle1Ref.value, paddle2Ref.value)
  }
})

</script>
