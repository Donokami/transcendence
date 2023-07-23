import { Vector3, type Object3D } from 'three'
import type { Game } from '@/types/Game'
import type { Metrics } from '@/types/Metrics'
// import { reactive } from 'vue'

type SimObject3D = Object3D & {
  velocity: {
    x: number
    y: number
    z: number
  }
  stopped: boolean
}

// const gameState = reactive({
//   connected: false,
//   score1: 0,
//   score2: 0,
//   posX: 0,
//   posY: 0,
//   fps: 0,
//   activeCanvas: false,
//   testBallPos: new Vector3(0, 5, 0),
//   paddle1Pos: new Vector3(0, 5, 0)
// })

function renderPong(
  delta: number,
  gameState: Game,
  gameMetrics: Metrics,
  ball: SimObject3D,
  paddle1: SimObject3D,
  paddle2: SimObject3D,
  camera: SimObject3D
): void {
  const animationTime = delta / (1 / gameMetrics.tps)
  ball.position.lerp(gameState.ballPos, animationTime)
  paddle1.position.lerp(gameState.paddle1Pos, animationTime)
  paddle2.position.lerp(gameState.paddle2Pos, animationTime)
  camera.position.lerp(
    new Vector3(gameState.paddle1Pos.x, 5, gameMetrics.fieldDepth),
    animationTime
  )
}

export { renderPong, type SimObject3D }
