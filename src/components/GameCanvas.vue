<template>
  <div class="">
    <p class="">{{ scoring }} ({{ Math.round(1 / gs.fps) }} fps)</p>
    <div class="w-[720px] h-[480px]">
      <TresCanvas clear-color="#005" shadows @mousemove="MovePaddle">
        <TresScene>
          <TresAmbientLight color="#ffffff" :intensity="1" />
          <TresDirectionalLight color="#ffffff" :intensity="2" />
          <TresPerspectiveCamera :position="[
            paddlePos(gs.posX),
            5,
            gm.fieldDepth
          ]
            " :fov="30" :aspect="1" :near="0.1" :far="1000" />
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
import { Text3D, Stars } from '@tresjs/cientos'
import { gm, gs, renderPong, type SimObject3D } from '@/includes/gameEngine'

// const groupRef: ShallowRef = shallowRef(null)
// const envRef: ShallowRef = shallowRef(null)

const scoring = computed(() => {
  return `${gs.score1} - ${gs.score2}`
})

const ballRef: ShallowRef<SimObject3D | null> = shallowRef(null)
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

onLoop(({ delta }) => {
  gs.fps = delta
  if (ballRef.value != null && paddle1Ref.value != null && paddle2Ref.value != null) {
    renderPong(ballRef.value, paddle1Ref.value, paddle2Ref.value)
  }
})

</script>
