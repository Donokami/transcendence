import { Object3D, Vector3 } from 'three'
import type { Game, Metrics } from '@/types'
import type { Ref } from 'vue'
// import { reactive, shallowRef } from 'vue';

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
  ball: Object3D,
  paddle1: Object3D,
  paddle2: Object3D,
  camera: Object3D,
  scoreText: Ref<string>
): void {
  const animationTime = delta / (1 / gameMetrics.tps)
  ball.position.lerp(gameState.ballPos, animationTime)
  paddle1.position.lerp(gameState.players[0].paddlePos, animationTime)
  paddle2.position.lerp(gameState.players[1].paddlePos, animationTime)
  camera.position.lerp(
    new Vector3(gameState.players[0].paddlePos.x, 5, gameMetrics.fieldDepth),
    animationTime
  )
  scoreText.value = `${gameState.players[0].score} - ${gameState.players[1].score}`
}

export { renderPong, type Object3D }
