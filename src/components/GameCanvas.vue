<template>
  <div class="">
    <p class="">{{ gameState.posX + ' - ' + gameState.posY }}</p>
    <div class="w-[720px] h-[480px]">
      <TresCanvas shadows @mousemove="MovePaddle">
        <TresScene>
          <TresAmbientLight :color="0xffffff" :intensity="1" />
          <TresDirectionalLight :color="'#ffffff'" :intensity="2" />
          <TresPerspectiveCamera :position="[
            paddlePos(gameState.posX),
            5,
            gameMetrics.fieldDepth
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
          <TresMesh>
            <TresBoxGeometry :args="[gameMetrics.fieldWidth, gameMetrics.fieldHeight, gameMetrics.fieldDepth]" />
            <TresMeshToonMaterial color="#005" />
          </TresMesh>
          <TresMesh :position="[
            paddlePos(gameState.posX),
            gameMetrics.fieldHeight,
            gameMetrics.fieldDepth / 2 + gameMetrics.paddleDepth / 2
          ]">
            <TresBoxGeometry :args="[
              gameMetrics.paddleRatio * gameMetrics.fieldWidth,
              gameMetrics.paddleHeight,
              gameMetrics.paddleDepth
            ]" />
            <TresMeshToonMaterial color="red" />
          </TresMesh>
          <TresMesh :position="[
            0,
            gameMetrics.fieldHeight,
            -gameMetrics.fieldDepth / 2 - gameMetrics.paddleDepth / 2
          ]">
            <TresBoxGeometry :args="[
              gameMetrics.paddleRatio * gameMetrics.fieldWidth,
              gameMetrics.paddleHeight,
              gameMetrics.paddleDepth
            ]" />
            <TresMeshToonMaterial color="blue" />
          </TresMesh>
          <TresMesh :position="[
            0,
            gameMetrics.fieldHeight + gameMetrics.ballRadius / 2,
            0
          ]">
            <TresSphereGeometry :args="[gameMetrics.ballRadius]" />
            <TresMeshToonMaterial color="yellow" />
          </TresMesh>
          <!-- <Suspense>
            <Environment ref="envRef" :files="'game/environment.hdr'" />
          </Suspense> -->
        </TresScene>
        <!-- <OrbitControls /> -->
      </TresCanvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type ShallowRef, shallowRef, reactive } from 'vue'
import { useRenderLoop } from '@tresjs/core'
import { OrbitControls } from '@tresjs/cientos'

const groupRef: ShallowRef = shallowRef(null)
// const envRef: ShallowRef = shallowRef(null)

const { onLoop } = useRenderLoop()

const gameState = reactive({
  score: 0,
  lives: 3,
  level: 1,
  gameOver: false,
  paused: false,
  started: false,
  posX: 0,
  posY: 0,
})

const gameMetrics = {
  canvasHeight: 480,
  canvasWidth: 720,
  fieldWidth: 20,
  fieldHeight: 1,
  fieldDepth: 40,
  paddleRatio: 0.4,
  paddleHeight: 1,
  paddleDepth: 1,
  ballRadius: 0.8,
}

const paddlePos = (x: number): number => {
  const newMin = -gameMetrics.fieldWidth / 2 + (gameMetrics.paddleRatio * gameMetrics.fieldWidth / 2);
  const newMax = gameMetrics.fieldWidth / 2 - (gameMetrics.paddleRatio * gameMetrics.fieldWidth / 2);
  return x * (newMax - newMin) / gameMetrics.canvasWidth + newMin;
}

const MovePaddle = (e: MouseEvent): void => {
  gameState.posX = e.offsetX
  gameState.posY = e.offsetY
}

onLoop(({ delta, elapsed }) => {
  console.log(delta, elapsed)
  if (groupRef.value != null) {
    groupRef.value.rotateX(delta)
    groupRef.value.rotateY(-delta)
  }
})
</script>
