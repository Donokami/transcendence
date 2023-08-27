<template>
  <div
    class="p-4 m-auto italic text-center"
    v-if="gameState.players[1].userId === 'bot'">
    <span class="font-bold">Warning:</span> You are playing with the bot, this
    game won't appear on your profile.
  </div>
  <div
    class="max-w-[960px] aspect-video relative mx-auto border-black border-2">
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
      @mousemove="MovePaddle"
      :camera="camera"
      class="absolute">
      <TresPerspectiveCamera
        :rotation-y="cameraRotation"
        :position="camera.position"
        :fov="isSpectator ? 80 : 25"
        :aspect="1"
        :near="0.1"
        :far="1000"
        ref="camera" />
      <TresAmbientLight color="#ffffff" :position="[0, 3, 0]" :intensity="1" />
      <TresDirectionalLight
        color="#ffffff"
        cast-shadow
        :position="[-15, 25, 0]"
        :intensity="2" />
      <TresGroup>
        <TresMesh receive-shadow>
          <TresBoxGeometry
            :args="[
              gameMetrics.fieldWidth,
              gameMetrics.fieldHeight,
              gameMetrics.fieldDepth
            ]" />
          <TresMeshStandardMaterial color="#fb923c" />
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
      <TresMesh cast-shadow ref="ballRef">
        <TresSphereGeometry :args="[gameMetrics.ballRadius]" />
        <TresMeshToonMaterial color="#ff0" />
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
          cast-shadow
          font="https://raw.githubusercontent.com/Tresjs/assets/main/fonts/FiraCodeRegular.json">
          <TresMeshToonMaterial color="#fff" />
        </Text3D>
      </Suspense>
    </TresCanvas>
  </div>
</template>

<script setup lang="ts">
import { type ShallowRef, shallowRef, ref, type Ref, computed } from 'vue'
import { useRenderLoop, TresCanvas, type TresCamera } from '@tresjs/core'
import { Text3D } from '@tresjs/cientos'
import type { Room, Game, Metrics } from '@/types'
import { Vector3, type Object3D, Camera, PerspectiveCamera } from 'three'
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
    if (gameState.value.players[0].userId === 'bot') {
      return 'Bot wins!'
    } else {
      const user = room.value?.players.find(
        (player) => player.id === gameState.value.players[0].userId
      )
      return `${user?.username ?? 'player'} wins!`
    }
  } else if (
    gameState.value.players[0].score < gameState.value.players[1].score
  ) {
    if (gameState.value.players[1].userId === 'bot') {
      return 'Bot wins!'
    } else {
      const user = room.value?.players.find(
        (player) => player.id === gameState.value.players[1].userId
      )
      return `${user?.username ?? 'player'} wins!`
    }
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
const camera: Ref<TresCamera> = ref(new PerspectiveCamera(0, 5, 0))

const gameMetrics: Metrics = {
  fieldWidth: 30,
  fieldHeight: 1,
  fieldDepth: 60,
  paddleHeight: 1,
  paddleDepth: 1,
  ballRadius: 0.8,
  tps: 15
}

const ballRef: ShallowRef<Object3D | null> = shallowRef(null)
const paddle1Ref: ShallowRef<Object3D | null> = shallowRef(null)
const paddle2Ref: ShallowRef<Object3D | null> = shallowRef(null)
const canvasRef: Ref<HTMLElement | null> = ref(null)
const { onLoop } = useRenderLoop()

const lastPos: Ref<number | null> = ref(null)

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
  // Prevent sending too many events by adding a threshold
  if (lastPos.value === null || Math.abs(lastPos.value - posX) > 0.015) {
    lastPos.value = posX
    socket.emit('game:move', {
      roomId: room.value.id,
      posX
    })
  }
}

onLoop(({ delta }) => {
  gameState.value.fps = delta
  if (
    ballRef.value != null &&
    paddle1Ref.value != null &&
    paddle2Ref.value != null &&
    camera.value != null
  ) {
    renderPong(
      delta,
      gameMetrics,
      ballRef.value,
      paddle1Ref.value,
      paddle2Ref.value,
      camera.value,
      scoreText
    )
  }
})

function renderPong(
  delta: number,
  gameMetrics: Metrics,
  ball: Object3D,
  paddle1: Object3D,
  paddle2: Object3D,
  camera: Camera,
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
