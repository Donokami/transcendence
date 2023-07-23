import { Server } from 'socket.io'
import { Object3D, Vector3 } from 'three'
import { type gameState } from './game.engine'
import { Logger } from '@nestjs/common'

export type SimObject3D = Object3D & {
  velocity: {
    x: number
    y: number
    z: number
  }
  stopped: boolean
}

export type Metrics = {
  canvasHeight: number
  canvasWidth: number
  fieldWidth: number
  fieldHeight: number
  fieldDepth: number
  paddleRatio: number
  paddleHeight: number
  paddleDepth: number
  ballRadius: number
  timeout: number
  tps: number
}

export class PhysicsEngine {
  private readonly logger = new Logger('PhysicsEngine')

  constructor(
    private gameState: gameState,
    private metrics: Metrics,
    private readonly server: Server
  ) {
    this.getPlayer(0).paddle.position.set(
      0,
      this.metrics.fieldHeight,
      this.metrics.fieldDepth * 0.5 + this.metrics.paddleDepth * 0.5
    )

    // In case there is no 2nd player
    if (this.getPlayer(1) === undefined) {
      this.gameState.players['bot'] = {
        paddle: new Object3D() as SimObject3D,
        score: 0
      }
    }

    this.getPlayer(1).paddle.position.set(
      0,
      this.metrics.fieldHeight,
      -this.metrics.fieldDepth * 0.5 - this.metrics.paddleDepth * 0.5
    )
  }

  private resetBall(ball: SimObject3D): void {
    ball.position.x = ball.position.z = 0
    ball.position.y =
      -((0 - 1) ** 2 / this.metrics.fieldDepth ** 2) *
        this.metrics.fieldDepth *
        0.5 +
      1.4 * this.metrics.fieldDepth * 0.1
    ball.velocity.x = ball.velocity.y = ball.velocity.z = 0
    ball.stopped = true
  }

  private startBallMov(ball: SimObject3D): void {
    ball.position.x = ball.position.z
    ball.position.y =
      -((0 - 1) ** 2 / this.metrics.fieldDepth ** 2) *
        this.metrics.fieldDepth *
        0.5 +
      1.4 * this.metrics.fieldDepth * 0.1

    const direction: number = Math.random() > 0.5 ? -1 : 1
    ball.velocity = {
      x: 0,
      y: 0,
      z: direction
    }
    ball.stopped = false
  }

  private updateBallPosition(ball: SimObject3D): void {
    const ballPos = ball.position
    const delta = this.gameState.deltaTime

    // update the ballRef's position.
    ballPos.x += ball.velocity.x * delta * 60
    ballPos.z += ball.velocity.z * delta * 60

    // add an arc to the ballRef's flight. Comment this out for boring, flat pong.
    // ballPos.y = -(((ballPos.z - 1) * (ballPos.z - 1)) / 5000) + 2
    ballPos.y =
      -((ballPos.z - 1) ** 2 / this.metrics.fieldDepth ** 2) *
        this.metrics.fieldDepth *
        0.5 +
      1.4 * this.metrics.fieldDepth * 0.1

    // -(((0 - 1) * (0 - 1)) / (60 * 60)) * 60 * 0.5 + 1.4 * 60 * 0.1
  }

  private hitBallBack(ball: SimObject3D, paddle: SimObject3D): void {
    ball.velocity.x = (ball.position.x - paddle.position.x) / 5
    ball.velocity.z *= -1
  }

  private isPastPaddle1(ball: SimObject3D): boolean {
    return (
      ball.position.z >
      this.metrics.fieldDepth * 0.5 + this.metrics.paddleDepth * 0.5
    )
  }

  private isPastPaddle2(ball: SimObject3D): boolean {
    return (
      ball.position.z <
      this.metrics.fieldDepth * -0.5 - this.metrics.paddleDepth * 0.5
    )
  }

  private isSideCollision(ball: SimObject3D): boolean {
    const ballX = ball.position.x
    const halfFieldWidth = this.metrics.fieldWidth * 0.5
    return (
      ballX >= halfFieldWidth + this.metrics.ballRadius * 0.5 ||
      ballX <= -halfFieldWidth - this.metrics.ballRadius * 0.5
    )
  }

  private isPaddle1Collision(ball: SimObject3D, paddle1: SimObject3D): boolean {
    return (
      ball.position.z + this.metrics.ballRadius >
        paddle1.position.z - this.metrics.paddleDepth &&
      this.isBallAlignedWithPaddle(ball, paddle1)
    )
  }

  private isPaddle2Collision(ball: SimObject3D, paddle2: SimObject3D): boolean {
    return (
      ball.position.z - this.metrics.ballRadius <
        paddle2.position.z + this.metrics.paddleDepth &&
      this.isBallAlignedWithPaddle(ball, paddle2)
    )
  }

  private isBallAlignedWithPaddle(
    ball: SimObject3D,
    paddle: SimObject3D
  ): boolean {
    const halfPaddleWidth =
      this.metrics.fieldWidth * this.metrics.paddleRatio * 0.6
    const paddleX = paddle.position.x
    const ballX = ball.position.x
    return (
      ballX > paddleX - halfPaddleWidth && ballX < paddleX + halfPaddleWidth
    )
  }

  private processBallMovement(): void {
    const ball = this.gameState.ball
    const paddle1 = this.getPlayer(0).paddle
    const paddle2 = this.getPlayer(1).paddle

    if (ball.stopped) {
      return
    }

    if (
      ball.velocity === undefined ||
      (ball.velocity.x === 0 && ball.velocity.y === 0 && ball.velocity.z === 0)
    ) {
      // this.logger.log('ball.velocity is undefined')
      this.startBallMov(ball)
    }

    this.updateBallPosition(ball)

    if (this.isSideCollision(ball)) {
      ball.velocity.x *= -1
      ball.velocity.y *= -1
    }

    if (this.isPaddle1Collision(ball, paddle1)) {
      this.hitBallBack(ball, paddle1)
    }

    if (this.isPaddle2Collision(ball, paddle2)) {
      this.hitBallBack(ball, paddle2)
    }

    if (this.isPastPaddle1(ball)) {
      this.getPlayer(0).score += 1
      this.logger.log(`player 1 score: ${this.getPlayer(0).score}`)
      this.resetBall(ball)
      setTimeout(() => {
        ball.stopped = false
      }, 2000)
    }

    if (this.isPastPaddle2(ball)) {
      this.getPlayer(1).score += 1
      this.logger.log(`player 2 score: ${this.getPlayer(1).score}`)
      this.resetBall(ball)
      // After 2s, the ballRef will start moving again.
      setTimeout(() => {
        ball.stopped = false
      }, 2000)
    }
  }

  private getPlayer(index: number) {
    const playersArray = Object.keys(this.gameState.players).map(
      (key) => this.gameState.players[key]
    )

    return playersArray[index]
  }

  public calculateFrame(gameState: gameState) {
    this.gameState = gameState

    this.processBallMovement()
  }
}
