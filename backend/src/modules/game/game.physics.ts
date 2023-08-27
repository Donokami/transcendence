import { Precalcs } from './game.precalcs'
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
  ballSpeed: number
  gameDuration: number
  tps: number
}

export class PhysicsEngine {
  private readonly logger = new Logger('PhysicsEngine')
  public precalcs = new Precalcs(this.metrics)

  constructor(
    private gameState: gameState,
    private metrics: Metrics,
    private readonly server: Server // Added for emitting events, like collisions
  ) {
    this.gameState.players[0].paddle.position.set(
      0,
      this.metrics.fieldHeight,
      this.precalcs.halfFieldDepth + this.precalcs.halfPaddleDepth
    )

    // In case there is no 2nd player
    if (this.gameState.players.length === 1) {
      this.gameState.players.push({
        userId: 'bot',
        paddle: new Object3D() as SimObject3D,
        score: 0
      })
    }

    this.gameState.players[1].paddle.position.set(
      0,
      this.metrics.fieldHeight,
      -this.precalcs.halfFieldDepth - this.precalcs.halfPaddleDepth
    )

    this.gameState.ball.position.set(0, this.precalcs.initBallPosY, 0)
  }

  private resetBall(ball: SimObject3D): void {
    ball.position.x = ball.position.z = 0
    ball.position.y = this.precalcs.initBallPosY

    ball.velocity.x = ball.velocity.y = ball.velocity.z = 0
    ball.stopped = true
  }

  private startBallMov(ball: SimObject3D): void {
    ball.position.x = ball.position.z
    ball.position.y = this.precalcs.initBallPosY

    const direction: number = Math.random() > 0.5 ? -1 : 1
    ball.velocity = {
      x: 0,
      y: 0,
      z: direction * this.metrics.ballSpeed
    }
    ball.stopped = false
  }

  private updateBallPosition(ball: SimObject3D): void {
    const ballPos = ball.position
    const delta = this.gameState.deltaTime

    ballPos.x += ball.velocity.x * delta * 60
    ballPos.z += ball.velocity.z * delta * 60

    ballPos.y = this.precalcs.calculateBallY(ballPos.z)

    ballPos.x = Math.min(
      Math.max(ballPos.x, -this.metrics.fieldWidth * 0.5),
      this.metrics.fieldWidth * 0.5
    )
  }

  private hitBallBack(ball: SimObject3D, paddle: SimObject3D): void {
    ball.velocity.x = (ball.position.x - paddle.position.x) / 5
    ball.velocity.z *= -1
  }

  private isPastPaddle1(ball: SimObject3D): boolean {
    return (
      ball.position.z >
      this.precalcs.halfFieldDepth + this.metrics.paddleDepth * 2
    )
  }

  private isPastPaddle2(ball: SimObject3D): boolean {
    return (
      ball.position.z <
      -this.precalcs.halfFieldDepth - this.metrics.paddleDepth * 2
    )
  }

  private isSideCollision(ball: SimObject3D): boolean {
    const ballX = ball.position.x
    return (
      ballX >= this.precalcs.halfFieldWidth - this.precalcs.halfBall ||
      ballX <= -this.precalcs.halfFieldWidth + this.precalcs.halfBall
    )
  }

  private isPaddle1Collision(ball: SimObject3D, paddle1: SimObject3D): boolean {
    return (
      ball.position.z + this.metrics.ballRadius >
        paddle1.position.z + this.metrics.paddleDepth * 0.8 &&
      this.isBallAlignedWithPaddle(ball, paddle1)
    )
  }

  private isPaddle2Collision(ball: SimObject3D, paddle2: SimObject3D): boolean {
    return (
      ball.position.z - this.metrics.ballRadius <
        paddle2.position.z - this.metrics.paddleDepth * 0.8 &&
      this.isBallAlignedWithPaddle(ball, paddle2)
    )
  }

  private isBallAlignedWithPaddle(
    ball: SimObject3D,
    paddle: SimObject3D
  ): boolean {
    const paddleX = paddle.position.x
    const ballX = ball.position.x
    return (
      ballX > paddleX - this.precalcs.halfPaddleWidth * 1.2 &&
      ballX < paddleX + this.precalcs.halfPaddleWidth * 1.2
    )
  }

  private processBallMovement(): void {
    const ball = this.gameState.ball
    const paddle1 = this.gameState.players[0].paddle
    const paddle2 = this.gameState.players[1].paddle

    if (ball.stopped) {
      return
    }

    if (
      ball.velocity === undefined ||
      (ball.velocity.x === 0 && ball.velocity.y === 0 && ball.velocity.z === 0)
    ) {
      this.startBallMov(ball)
    }

    this.updateBallPosition(ball)

    if (this.isSideCollision(ball)) {
      ball.velocity.x *= -1
      ball.velocity.y *= -1
    }

    if (this.isPaddle1Collision(ball, paddle1)) {
      this.hitBallBack(ball, paddle1)
      console.log('paddle1 collision')
    }

    if (this.isPaddle2Collision(ball, paddle2)) {
      this.hitBallBack(ball, paddle2)
      console.log('paddle2 collision')
    }

    if (this.isPastPaddle1(ball)) {
      this.gameState.players[1].score += 1
      this.logger.log(`player 2 score: ${this.gameState.players[0].score}`)
      this.resetBall(ball)
      setTimeout(() => {
        ball.stopped = false
      }, 2000)
    }

    if (this.isPastPaddle2(ball)) {
      this.gameState.players[0].score += 1
      this.logger.log(`player 1 score: ${this.gameState.players[1].score}`)
      this.resetBall(ball)
      setTimeout(() => {
        ball.stopped = false
      }, 2000)
    }
  }

  private processCpuPaddle(): void {
    const ballPos = this.gameState.ball.position
    const normalize = (val: number, min: number, max: number): number =>
      (val - min) / (max - min)
    const velocity = Math.min(
      normalize(
        ballPos.z,
        this.precalcs.halfFieldDepth,
        -this.precalcs.halfFieldDepth
      ),
      0.2 // This set the difficulty of the bot
    )

    const cpuPos = this.gameState.players[1].paddle.position
    const newPosX = Math.min(
      Math.max(
        ballPos.x,
        -this.metrics.fieldWidth * 0.5 + this.precalcs.halfPaddleWidth
      ),
      this.metrics.fieldWidth * 0.5 - this.precalcs.halfPaddleWidth
    )

    this.gameState.players[1].paddle.position.lerpVectors(
      cpuPos,
      new Vector3(newPosX, cpuPos.y, cpuPos.z),
      velocity
    )
  }

  public calculateFrame(gameState: gameState) {
    this.gameState = gameState

    if (this.gameState.players[1].userId === 'bot') this.processCpuPaddle()
    this.processBallMovement()
    return this.gameState
  }
}
