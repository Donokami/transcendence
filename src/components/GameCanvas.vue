<template>
  <div class="">
    <!-- <p class="">
      {{ scoring }} ({{ Math.round(1 / gameState.fps) }} fps) -
      {{
        Math.round(ballRef?.position.z) +
        ' - ' +
        Math.round(ballRef?.position.y * 100) / 100 +
        ' - ' +
        Math.round(ballRef?.position.x * 100) / 100
      }}
      -
      {{ Math.round(game.remainingTime) }}
    </p> -->
    <div class="w-[720px] h-[480px]">
      <TresCanvas clear-color="#005" shadows @mousemove="MovePaddle">
        <TresScene>
          <TresAmbientLight
            color="#ffffff"
            :position="[0, 3, 0]"
            :intensity="1" />
          <TresDirectionalLight color="#ffffff" :intensity="2" />
          <!-- <TresDirectionalLight color="#ffaaaa" :position="[0, 5, 3]" :intensity="0.5" /> -->
          <TresPerspectiveCamera
            ref="cameraRef"
            :position="[
              0,
              gameMetrics.fieldHeight * 2,
              gameMetrics.fieldDepth * 0.5 + gameMetrics.paddleDepth * 0.5
            ]"
            :fov="25"
            :aspect="1"
            :near="0.1"
            :far="1000" />
          <!-- <TresPerspectiveCamera :position="[
            10,
            40,
            5
          ]" :fov="45" :aspect="1" :near="0.1" :far="1000" /> -->
          <TresGroup>
            <TresMesh>
              <TresBoxGeometry
                :args="[
                  gameMetrics.fieldWidth,
                  gameMetrics.fieldHeight,
                  gameMetrics.fieldDepth
                ]" />
              <TresMeshToonMaterial color="#f80" />
            </TresMesh>
            <TresMesh
              :rotate-x="-Math.PI * 0.5"
              :position-y="gameMetrics.fieldHeight * 0.5 + 0.01">
              <TresPlaneGeometry :args="[gameMetrics.fieldWidth, 1]" />
              <TresMeshToonMaterial color="#fff" />
            </TresMesh>
          </TresGroup>
          <!-- <TresMesh :position="[
            paddlePos(gameState.posX),
            gameMetrics.fieldHeight,
            gameMetrics.fieldDepth * 0.5 + gameMetrics.paddleDepth * 0.5
          ]" ref="paddle1Ref"> -->
          <TresMesh ref="paddle1Ref">
            <TresBoxGeometry
              :args="[
                gameMetrics.paddleRatio * gameMetrics.fieldWidth,
                gameMetrics.paddleHeight,
                gameMetrics.paddleDepth
              ]" />
            <TresMeshToonMaterial color="#fff" />
          </TresMesh>
          <TresMesh
            :position="[
              0,
              gameMetrics.fieldHeight,
              -gameMetrics.fieldDepth * 0.5 - gameMetrics.paddleDepth * 0.5
            ]"
            ref="paddle2Ref">
            <TresBoxGeometry
              :args="[
                gameMetrics.paddleRatio * gameMetrics.fieldWidth,
                gameMetrics.paddleHeight,
                gameMetrics.paddleDepth
              ]" />
            <TresMeshToonMaterial color="#fff" />
          </TresMesh>
          <TresMesh ref="ballRef">
            <TresSphereGeometry :args="[gameMetrics.ballRadius]" />
            <TresMeshToonMaterial color="yellow" />
          </TresMesh>
          <!-- <TresMesh ref="testBallRef">
            <TresSphereGeometry :args="[gameMetrics.ballRadius]" />
            <TresMeshToonMaterial color="blue" />
          </TresMesh> -->
          <Suspense>
            <Text3D
              :size="3"
              :height="1"
              :position="[
                0,
                (gameMetrics.fieldHeight + gameMetrics.paddleHeight) * 4,
                -gameMetrics.fieldDepth * 0.5
              ]"
              ref="textRef"
              :text="scoring"
              center
              need-updates
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
import { type ShallowRef, shallowRef, computed, ref, type Ref } from 'vue'
import { useRenderLoop } from '@tresjs/core'
import { Text3D, Stars } from '@tresjs/cientos'
import { renderPong, type SimObject3D } from '@/includes/gameEngine'
import type { Room } from '@/types/Room'
import type { Game } from '@/types/Game'
import type { Metrics } from '@/types/Metrics'
import { socket } from '@/includes/gameSocket'

const props = defineProps<{
  room: Room
  game: Game
}>()

const room: Ref<Room> = ref(props.room)
const gameState: Ref<Game> = ref(props.game)

// const groupRef: ShallowRef = shallowRef(null)
// const envRef: ShallowRef = shallowRef(null)

const gameMetrics: Metrics = {
  canvasHeight: 480,
  canvasWidth: 720,
  fieldWidth: 30,
  fieldHeight: 1,
  fieldDepth: 60,
  paddleRatio: 0.3,
  paddleHeight: 1,
  paddleDepth: 1,
  ballRadius: 0.8,
  timeout: 30000,
  tps: 20
}

const scoring = computed(() => {
  return `${gameState.value.score1} - ${gameState.value.score2}`
})

const cameraRef: ShallowRef<SimObject3D | null> = shallowRef(null)
const ballRef: ShallowRef<SimObject3D | null> = shallowRef(null)
// const testBallRef: ShallowRef<SimObject3D | null> = shallowRef(null)
const paddle1Ref: ShallowRef<SimObject3D | null> = shallowRef(null)
const paddle2Ref: ShallowRef<SimObject3D | null> = shallowRef(null)
const textRef: ShallowRef<SimObject3D | null> = shallowRef(null)

const { onLoop } = useRenderLoop()

const MovePaddle = (e: MouseEvent): void => {
  socket.emit('game:move', {
    roomId: room.value.id,
    posX: e.offsetX / gameMetrics.canvasWidth
  })
  // gameState.posY = e.offsetY
}

// const paddlePos = (x: number): number => {
//   const newMin = -gameMetrics.fieldWidth * 0.5 + gameMetrics.paddleRatio * gameMetrics.fieldWidth * 0.5
//   const newMax = gameMetrics.fieldWidth * 0.5 - gameMetrics.paddleRatio * gameMetrics.fieldWidth * 0.5
//   return (x * (newMax - newMin)) / gameMetrics.canvasWidth + newMin
// }

onLoop(({ delta }) => {
  gameState.value.fps = delta
  // gameState.value.testBallPos = gameState.value.testBallPos
  // gameState.value.paddle1Pos = gameState.value.paddle1Pos
  if (
    ballRef.value != null &&
    paddle1Ref.value != null &&
    paddle2Ref.value != null &&
    cameraRef.value != null
  ) {
    renderPong(
      delta,
      gameState.value,
      gameMetrics,
      ballRef.value,
      paddle1Ref.value,
      paddle2Ref.value,
      cameraRef.value
    )
  }
})
</script>
