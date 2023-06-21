import type { Object3D } from 'three'
import { reactive } from 'vue'

const gs = reactive({
  score1: 0,
  score2: 0,
  gameOver: false,
  posX: 0,
  posY: 0,
  fps: 0
})

const gm = {
  canvasHeight: 480,
  canvasWidth: 720,
  fieldWidth: 20,
  fieldHeight: 1,
  fieldDepth: 40,
  paddleRatio: 0.4,
  paddleHeight: 1,
  paddleDepth: 1,
  ballRadius: 0.8
}

type SimObject3D = Object3D & {
  velocity: {
    x: number
    y: number
    z: number
  }
  stopped: boolean
}

function startBallMov(ball: SimObject3D): void {
  ball.position.x = ball.position.z
  ball.position.y = gm.fieldHeight + gm.ballRadius * 0.5
  const direction: number = Math.random() > 0.5 ? -1 : 1
  ball.velocity = {
    x: 0,
    y: 0,
    z: direction
  }
  ball.stopped = false
}

function updateBallPosition(ball: SimObject3D): void {
  const ballPos = ball.position

  // update the ballRef's position.
  ballPos.x += ball.velocity.x
  ballPos.z += ball.velocity.z

  // add an arc to the ballRef's flight. Comment this out for boring, flat pong.
  // ballPos.y = -(((ballPos.z - 1) * (ballPos.z - 1)) / 5000) + 2
}

function hitBallBack(ball: SimObject3D, paddle: SimObject3D): void {
  ball.velocity.x = (ball.position.x - paddle.position.x) / 5
  ball.velocity.z *= -1
}

function isPastPaddle1(ball: SimObject3D, paddle1: SimObject3D): boolean {
  return ball.position.z > paddle1.position.z + gm.paddleDepth * 0.5
}

function isPastPaddle2(ball: SimObject3D, paddle2: SimObject3D): boolean {
  return ball.position.z < paddle2.position.z - gm.paddleDepth * 0.5
}

function isSideCollision(ball: SimObject3D): boolean {
  const ballX = ball.position.x
  const halfFieldWidth = gm.fieldWidth * 0.5
  return ballX - gm.ballRadius < -halfFieldWidth || ballX + gm.ballRadius > halfFieldWidth
}

function isPaddle1Collision(ball: SimObject3D, paddle1: SimObject3D): boolean {
  return (
    ball.position.z + gm.ballRadius >= paddle1.position.z - gm.paddleDepth &&
    isBallAlignedWithPaddle(ball, paddle1)
  )
}

function isPaddle2Collision(ball: SimObject3D, paddle2: SimObject3D): boolean {
  return (
    ball.position.z - gm.ballRadius <= paddle2.position.z + gm.paddleDepth &&
    isBallAlignedWithPaddle(ball, paddle2)
  )
}

function isBallAlignedWithPaddle(ball: SimObject3D, paddle: SimObject3D): boolean {
  const halfPaddleWidth = gm.fieldWidth * gm.paddleRatio * 0.6
  const paddleX = paddle.position.x
  const ballX = ball.position.x
  return ballX > paddleX - halfPaddleWidth && ballX < paddleX + halfPaddleWidth
}

function processBallMovement(ball: SimObject3D, paddle1: SimObject3D, paddle2: SimObject3D): void {
  if (
    ball.velocity === undefined ||
    (ball.velocity.x === 0 && ball.velocity.y === 0 && ball.velocity.z === 0)
  ) {
    startBallMov(ball)
  }

  if (ball.stopped) {
    return
  }

  updateBallPosition(ball)

  if (isSideCollision(ball)) {
    ball.velocity.x *= -1
  }

  if (isPaddle1Collision(ball, paddle1)) {
    hitBallBack(ball, paddle1)
  }

  if (isPaddle2Collision(ball, paddle2)) {
    hitBallBack(ball, paddle2)
  }

  if (isPastPaddle1(ball, paddle1)) {
    console.log('player2 scored', gs.score2)
    gs.score2 += 1
    resetBall(ball)
  }

  if (isPastPaddle2(ball, paddle2)) {
    console.log('player1 scored', gs.score1)
    gs.score1 += 1
    resetBall(ball)
  }
}

function processCpuPaddle(ball: SimObject3D, paddle2: SimObject3D): void {
  const ballPos = ball.position
  const cpuPos = paddle2.position

  if (cpuPos.x - 100 > ballPos.x) {
    cpuPos.x -= Math.min(cpuPos.x - ballPos.x, 6)
  } else if (cpuPos.x - 100 < ballPos.x) {
    cpuPos.x += Math.min(ballPos.x - cpuPos.x, 6)
  }
}

function resetBall(ball: SimObject3D): void {
  ball.position.set(0, gm.fieldHeight, 0)
  ball.velocity.x = ball.velocity.y = ball.velocity.z = 0
}

function renderPong(ball: SimObject3D, paddle1: SimObject3D, paddle2: SimObject3D): void {
  processBallMovement(ball, paddle1, paddle2)
  processCpuPaddle(ball, paddle2)
}

export { gm, gs, renderPong, resetBall, type SimObject3D }
