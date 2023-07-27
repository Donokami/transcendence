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
      <TresCanvas clear-color="#7dd3fc" shadows @mousemove="MovePaddle">
        <TresScene>
          <TresAmbientLight
            color="#ffffff"
            :position="[0, 3, 0]"
            :intensity="1" />
          <TresDirectionalLight color="#ffffff" :intensity="2" />
          <!-- <TresDirectionalLight color="#ffaaaa" :position="[0, 5, 3]" :intensity="0.5" /> -->
          <TresPerspectiveCamera
            ref="cameraRef"
            :rotation-y="
              loggedUser?.id === gameState.players[1].userId ? 1 * Math.PI : 0
            "
            :position="[0, 1, 0]"
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
          <TresMesh ref="paddle2Ref">
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
              :text="scoreText"
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
        <!-- <OrbitControls v-if="isSpectator" /> -->
      </TresCanvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type ShallowRef, shallowRef, ref, type Ref, computed } from 'vue'
import { useRenderLoop } from '@tresjs/core'
import { Text3D } from '@tresjs/cientos'
import type { Room, Game, Metrics } from '@/types'
import { Vector3, type Object3D } from 'three'
import { socket } from '@/includes/gameSocket'
import { useUserStore } from '@/stores/UserStore'

const { loggedUser } = useUserStore()

const isSpectator = computed(() => {
  return (
    loggedUser?.id !== gameState.value.players[0].userId &&
    loggedUser?.id !== gameState.value.players[1].userId
  )
})

function cameraPos(): Vector3 {
  if (isSpectator.value) {
    return new Vector3(0, 1, 0)
  } else if (loggedUser?.id === gameState.value.players[1].userId) {
    return new Vector3(
      gameState.value.players[1].paddlePos.x,
      5,
      -gameMetrics.fieldDepth
    )
  }
  return new Vector3(
    gameState.value.players[0].paddlePos.x,
    5,
    gameMetrics.fieldDepth
  )
}

const props = defineProps<{
  room: Room
  game: Game
}>()

const room: Ref<Room> = ref(props.room)
const gameState: Ref<Game> = ref(props.game)
const scoreText: Ref<string> = ref('0 - 0')
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

const cameraRef: ShallowRef<Object3D | null> = shallowRef(null)
const ballRef: ShallowRef<Object3D | null> = shallowRef(null)
const paddle1Ref: ShallowRef<Object3D | null> = shallowRef(null)
const paddle2Ref: ShallowRef<Object3D | null> = shallowRef(null)

const { onLoop } = useRenderLoop()

const MovePaddle = (e: MouseEvent): void => {
  socket.emit('game:move', {
    roomId: room.value.id,
    posX: e.offsetX / gameMetrics.canvasWidth
  })
}

onLoop(({ delta }) => {
  gameState.value.fps = delta
  if (
    ballRef.value != null &&
    paddle1Ref.value != null &&
    paddle2Ref.value != null &&
    cameraRef.value != null
  ) {
    renderPong(
      delta,
      gameMetrics,
      // gameState.value,
      ballRef.value,
      paddle1Ref.value,
      paddle2Ref.value,
      cameraRef.value,
      scoreText
    )
  }
})

function renderPong(
  delta: number,
  gameMetrics: Metrics,
  // gameState: Game,
  ball: Object3D,
  paddle1: Object3D,
  paddle2: Object3D,
  camera: Object3D,
  scoreText: Ref<string>
): void {
  const animationTime = delta / (1 / gameMetrics.tps)
  ball.position.lerp(gameState.value.ballPos, animationTime)
  paddle1.position.lerp(gameState.value.players[0].paddlePos, animationTime)
  paddle2.position.lerp(gameState.value.players[1].paddlePos, animationTime)
  camera.position.lerp(cameraPos(), animationTime)
  scoreText.value = `${gameState.value.players[0].score} - ${gameState.value.players[1].score}`
}
</script>
