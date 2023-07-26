import { Vector3, type Object3D } from 'three'
import type { Game, Metrics } from '@/types'
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
  camera: SimObject3D,
  score: SimObject3D
): void {
  const animationTime = delta / (1 / gameMetrics.tps)
  ball.position.lerp(gameState.ballPos, animationTime)
  paddle1.position.lerp(gameState.players[0].paddlePos, animationTime)
  paddle2.position.lerp(gameState.players[1].paddlePos, animationTime)
  camera.position.lerp(
    new Vector3(gameState.players[0].paddlePos.x, 5, gameMetrics.fieldDepth),
    animationTime
  )
}

export { renderPong, type SimObject3D }
