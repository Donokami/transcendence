<template>
  <div class="">
    <p class="">{{ scoring }} ({{ Math.round(1 / gs.fps) }} fps) - {{ Math.round(ballRef?.position.z) + " - " +
      Math.round(ballRef?.position.y * 100) / 100 + " - " + Math.round(ballRef?.position.x * 100) / 100 }}</p>
    <div class="w-[720px] h-[480px]">
      <TresCanvas clear-color="#005" shadows @mousemove="MovePaddle">
        <TresScene>
          <TresAmbientLight color="#ffffff" :position="[0, 3, 0]" :intensity="1" />
          <TresDirectionalLight color="#ffffff" :intensity="2" />
          <!-- <TresDirectionalLight color="#ffaaaa" :position="[0, 5, 3]" :intensity="0.5" /> -->
          <TresPerspectiveCamera :position="[
            paddlePos(gs.posX),
            5,
            gm.fieldDepth
          ]" ref="cameraRef" :fov="25" :aspect="1" :near="0.1" :far="1000" />
          <!-- <TresPerspectiveCamera :position="[
            10,
            40,
            5
          ]" :fov="45" :aspect="1" :near="0.1" :far="1000" /> -->
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
          ]
            " ref="paddle1Ref">
            <TresBoxGeometry :args="[
              gm.paddleRatio * gm.fieldWidth,
              gm.paddleHeight,
              gm.paddleDepth
            ]
              " />
            <TresMeshToonMaterial color="#fff" />
          </TresMesh>
          <TresMesh :position="[
            0,
            gm.fieldHeight,
            -gm.fieldDepth * 0.5 - gm.paddleDepth * 0.5
          ]
            " ref="paddle2Ref">
            <TresBoxGeometry :args="[
              gm.paddleRatio * gm.fieldWidth,
              gm.paddleHeight,
              gm.paddleDepth
            ]
              " />
            <TresMeshToonMaterial color="#fff" />
          </TresMesh>
          <TresMesh ref="ballRef">
            <TresSphereGeometry :args="[gm.ballRadius]" />
            <TresMeshToonMaterial color="yellow" />
          </TresMesh>
          <TresMesh ref="testBallRef">
            <TresSphereGeometry :args="[gm.ballRadius]" />
            <TresMeshToonMaterial color="red" />
          </TresMesh>
          <Suspense>
            <Text3D :size="3" :height="1" :position="[0, (gm.fieldHeight + gm.paddleHeight) * 4, -gm.fieldDepth * 0.5]"
              ref="textRef" :text="scoring" center need-updates
              font="https://raw.githubusercontent.com/Tresjs/assets/main/fonts/FiraCodeRegular.json">

              <TresMeshToonMaterial color="#fff" />
            </Text3D>
          </Suspense>

          <!-- <Suspense>
            <Environment ref="envRef" :files="'game/environment.hdr'" />
          </Suspense> -->
        </TresScene>
        <Stars :size="1" />
        <!-- <OrbitControls /> -->
      </TresCanvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type ShallowRef, shallowRef, computed } from 'vue';
import { useRenderLoop } from '@tresjs/core'
import { Text3D, Stars, OrbitControls } from '@tresjs/cientos'
import { gm, gs, renderPong, type SimObject3D } from '@/includes/gameEngine'
import type { Object3D } from 'three'

// const groupRef: ShallowRef = shallowRef(null)
// const envRef: ShallowRef = shallowRef(null)

const scoring = computed(() => {
  return `${gs.score1} - ${gs.score2}`
})

const cameraRef: ShallowRef<Object3D | null> = shallowRef(null)
const ballRef: ShallowRef<SimObject3D | null> = shallowRef(null)
const testBallRef: ShallowRef<SimObject3D | null> = shallowRef(null)
const paddle1Ref: ShallowRef<SimObject3D | null> = shallowRef(null)
const paddle2Ref: ShallowRef<SimObject3D | null> = shallowRef(null)

const { onLoop } = useRenderLoop()

const paddlePos = (x: number): number => {
  const newMin = -gm.fieldWidth * 0.5 + (gm.paddleRatio * gm.fieldWidth * 0.5);
  const newMax = gm.fieldWidth * 0.5 - (gm.paddleRatio * gm.fieldWidth * 0.5);
  return x * (newMax - newMin) / gm.canvasWidth + newMin;
}

const MovePaddle = (e: MouseEvent): void => {
  gs.posX = e.offsetX
  gs.posY = e.offsetY
}

// A loop that switch the TestBall position each second
setInterval(() => {
  gs.testBallPos.x = Math.random() * gm.fieldWidth - gm.fieldWidth * 0.5
  gs.testBallPos.z = Math.random() * gm.fieldDepth - gm.fieldDepth * 0.5
}, 1000)


onLoop(({ delta }) => {
  gs.fps = delta
  if (
    ballRef.value != null
    && testBallRef.value != null
    && paddle1Ref.value != null
    && paddle2Ref.value != null
  ) {
    renderPong(
      delta,
      ballRef.value,
      testBallRef.value,
      paddle1Ref.value,
      paddle2Ref.value
    )
  }
})

</script>
