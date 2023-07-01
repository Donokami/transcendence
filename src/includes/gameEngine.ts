import type { Object3D } from 'three'
import { reactive } from 'vue'

const gs = reactive({
  score1: 0,
  score2: 0,
  gameOver: false,
  posX: 0,
  posY: 0,
  fps: 0,
  activeCanvas: false
})

const gm = {
  canvasHeight: 480,
  canvasWidth: 720,
  fieldWidth: 30,
  fieldHeight: 1,
  fieldDepth: 60,
  paddleRatio: 0.3,
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
  ball.position.y = -((0 - 1) ** 2 / gm.fieldDepth ** 2) * gm.fieldDepth * 0.5 + 1.4 * gm.fieldDepth * 0.1

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
  ballPos.y = -((ballPos.z - 1) ** 2 / gm.fieldDepth ** 2) * gm.fieldDepth * 0.5 + 1.4 * gm.fieldDepth * 0.1

  // -(((0 - 1) * (0 - 1)) / (60 * 60)) * 60 * 0.5 + 1.4 * 60 * 0.1
}

function hitBallBack(ball: SimObject3D, paddle: SimObject3D): void {
  ball.velocity.x = (ball.position.x - paddle.position.x) / 5
  ball.velocity.z *= -1
}

function isPastPaddle1(ball: SimObject3D): boolean {
  return ball.position.z > gm.fieldDepth * 0.5 + gm.paddleDepth * 0.5
}

function isPastPaddle2(ball: SimObject3D): boolean {
  return ball.position.z < gm.fieldDepth * -0.5 - gm.paddleDepth * 0.5
}

function isSideCollision(ball: SimObject3D): boolean {
  const ballX = ball.position.x
  const halfFieldWidth = gm.fieldWidth * 0.5
  return (
    ballX >= halfFieldWidth - gm.ballRadius * 0.5 || ballX <= -halfFieldWidth + gm.ballRadius * 0.5
  )
}

function isPaddle1Collision(ball: SimObject3D, paddle1: SimObject3D): boolean {
  return (
    ball.position.z + gm.ballRadius > paddle1.position.z - gm.paddleDepth &&
    isBallAlignedWithPaddle(ball, paddle1)
  )
}

function isPaddle2Collision(ball: SimObject3D, paddle2: SimObject3D): boolean {
  return (
    ball.position.z - gm.ballRadius < paddle2.position.z + gm.paddleDepth &&
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
  if (ball.stopped) {
    return
  }

  if (
    ball.velocity === undefined ||
    (ball.velocity.x === 0 && ball.velocity.y === 0 && ball.velocity.z === 0)
  ) {
    startBallMov(ball)
  }

  updateBallPosition(ball)

  if (isSideCollision(ball)) {
    ball.velocity.x *= -1
    ball.velocity.y *= -1
  }

  if (isPaddle1Collision(ball, paddle1)) {
    hitBallBack(ball, paddle1)
  }

  if (isPaddle2Collision(ball, paddle2)) {
    hitBallBack(ball, paddle2)
  }

  if (isPastPaddle1(ball)) {
    console.log('player2 scored', gs.score2)
    gs.score2 += 1
    resetBall(ball)
    setTimeout(() => {
      ball.stopped = false
    }, 1000)
  }

  if (isPastPaddle2(ball)) {
    console.log('player1 scored', gs.score1)
    gs.score1 += 1
    resetBall(ball)
    // After 2s, the ballRef will start moving again.
    setTimeout(() => {
      ball.stopped = false
    }, 2000)
  }
}

function processCpuPaddle(ball: SimObject3D, paddle2: SimObject3D): void {
  const ballPos = ball.position
  const cpuPos = paddle2.position
  let newPos = cpuPos.x

  if (cpuPos.x - gm.paddleRatio * gm.fieldWidth * 0.5 > ballPos.x) {
    newPos -= cpuPos.x - ballPos.x
  } else if (cpuPos.x - gm.paddleRatio * gm.fieldWidth * 0.5 < ballPos.x) {
    newPos += ballPos.x - cpuPos.x
  }

  // To prevent the bot from going out of bounds, we need to clamp the new position.
  if (newPos < 0)
    newPos = Math.max(newPos, -gm.fieldWidth * 0.5 + gm.paddleRatio * gm.fieldWidth * 0.5)
  else newPos = Math.min(newPos, gm.fieldWidth * 0.5 - gm.paddleRatio * gm.fieldWidth * 0.5)
  cpuPos.x = newPos
}

function resetBall(ball: SimObject3D): void {
  ball.position.x = ball.position.z = 0
  ball.position.y = -((0 - 1) ** 2 / gm.fieldDepth ** 2) * gm.fieldDepth * 0.5 + 1.4 * gm.fieldDepth * 0.1
  ball.velocity.x = ball.velocity.y = ball.velocity.z = 0
  ball.stopped = true
}

function renderPong(ball: SimObject3D, paddle1: SimObject3D, paddle2: SimObject3D): void {
  processCpuPaddle(ball, paddle2)
  processBallMovement(ball, paddle1, paddle2)
}

export { gm, gs, renderPong, resetBall, type SimObject3D }
