<template>
  <div
    class="max-w-[720px] aspect-video relative mx-auto border-black border-2">
    <div
      class="absolute z-10 flex items-center w-full m-auto text-white sm:text-2xl">
      <span class="m-auto">{{ calculatedRemainingTime }}</span>
    </div>
    <span class="block w-full" ref="canvasRef"></span>
    <div
      class="absolute z-10 flex items-center w-full h-full bg-black bg-opacity-30"
      v-if="gameState.ended">
      <span class="m-auto text-2xl font-semibold text-white sm:text-5xl">
        {{ winnerMessage }}
      </span>
    </div>
    <TresCanvas
      clear-color="#7dd3fc"
      shadows
      @mousemove="MovePaddle"
      class="absolute">
      <TresScene>
        <TresAmbientLight
          color="#ffffff"
          :position="[0, 3, 0]"
          :intensity="1" />
        <TresDirectionalLight color="#ffffff" :intensity="2" />
        <!-- <TresDirectionalLight color="#ffaaaa" :position="[0, 5, 3]" :intensity="0.5" /> -->
        <TresPerspectiveCamera
          ref="cameraRef"
          :rotation-y="cameraRotation"
          :position="[0, 5, 0]"
          :fov="isSpectator ? 80 : 25"
          :aspect="1"
          :near="0.1"
          :far="1000" />
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
        <TresMesh ref="paddle1Ref">
          <TresBoxGeometry
            :args="[
              room.paddleRatio * gameMetrics.fieldWidth,
              gameMetrics.paddleHeight,
              gameMetrics.paddleDepth
            ]" />
          <TresMeshToonMaterial color="#fff" />
        </TresMesh>
        <TresMesh ref="paddle2Ref">
          <TresBoxGeometry
            :args="[
              room.paddleRatio * gameMetrics.fieldWidth,
              gameMetrics.paddleHeight,
              gameMetrics.paddleDepth
            ]" />
          <TresMeshToonMaterial color="#fff" />
        </TresMesh>
        <TresMesh ref="ballRef">
          <TresSphereGeometry :args="[gameMetrics.ballRadius]" />
          <TresMeshToonMaterial color="yellow" />
        </TresMesh>
        <Suspense>
          <Text3D
            :size="8"
            :height="0.01"
            :position="[
              -gameMetrics.fieldWidth * 0.5 - 1,
              gameMetrics.fieldHeight + 3.3,
              0
            ]"
            :text="scoreText"
            :rotation-y="Math.PI * 0.5"
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

const calculatedRemainingTime = computed(() => {
  function fancyTimeFormat(duration: number): string {
    const hrs = ~~(duration / 3600)
    const mins = ~~((duration % 3600) / 60)
    const secs = ~~duration % 60

    let ret = ''

    if (hrs > 0) {
      ret += `${hrs}:${mins < 10 ? '0' : ''}`
    }

    ret += `${mins}:${secs < 10 ? '0' : ''}`
    ret += `${secs}`

    return ret
  }
  return fancyTimeFormat(Math.round(gameState.value.remainingTime))
})

const isSpectator = computed(() => {
  return (
    loggedUser?.id !== gameState.value.players[0].userId &&
    loggedUser?.id !== gameState.value.players[1].userId
  )
})

const winnerMessage = computed(() => {
  if (gameState.value.players[0].score > gameState.value.players[1].score) {
    const username: string =
      room.value?.players[0]?.username ??
      gameState.value.players[0].userId === 'bot'
        ? 'bot'
        : loggedUser?.username ?? 'player'
    return `${username} wins!`
  } else if (
    gameState.value.players[0].score < gameState.value.players[1].score
  ) {
    const username: string =
      room.value?.players[1]?.username ??
      gameState.value.players[1].userId === 'bot'
        ? 'bot'
        : loggedUser?.username ?? 'player'
    return `${username} wins!`
  }
  return 'Draw'
})

const cameraRotation = computed(() => {
  if (isSpectator.value) return 0.5 * Math.PI
  if (loggedUser?.id === gameState.value.players[1].userId) return 1 * Math.PI
  return 0
})

function cameraPosition(): Vector3 {
  if (isSpectator.value) {
    return new Vector3(gameMetrics.fieldWidth, 10, 0)
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
  fieldWidth: 30,
  fieldHeight: 1,
  fieldDepth: 60,
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
const canvasRef: Ref<HTMLElement | null> = ref(null)
const { onLoop } = useRenderLoop()

const MovePaddle = (e: MouseEvent): void => {
  if (isSpectator.value) return
  if (!canvasRef.value) return
  const canvasWidth = canvasRef.value.clientWidth
  const normalize = (val: number, min: number, max: number): number =>
    (val - min) / (max - min)
  const posX = normalize(
    Math.max(0.1 * canvasWidth, Math.min(e.offsetX, 0.9 * canvasWidth)),
    canvasWidth * 0.1,
    canvasWidth * 0.9
  )
  socket.emit('game:move', {
    roomId: room.value.id,
    posX
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
  camera.position.lerp(cameraPosition(), animationTime)
  scoreText.value = `${gameState.value.players[0].score} - ${gameState.value.players[1].score}`
}
</script>
