import { Logger } from '@nestjs/common'
import { Object3D, Vector3 } from 'three'
import { GameGateway } from './game.gateway'
import { Room, RoomStatus } from './room'
import { User } from '@/modules/users/user.entity'

type SimObject3D = Object3D & {
  velocity: {
    x: number
    y: number
    z: number
  }
  stopped: boolean
}

type Metrics = {
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

const gm: Metrics = {
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
  tps: 5
}

export class Game {
  private readonly logger = new Logger(Game.name)

  private paddle1: SimObject3D = new Object3D() as SimObject3D
  private paddle2: SimObject3D = new Object3D() as SimObject3D
  private ball: SimObject3D = new Object3D() as SimObject3D
  private testBall: SimObject3D = new Object3D() as SimObject3D
  private readonly metrics: Metrics = gm
  private startTime: number
  private endTime: number

  constructor(
    private readonly roomState: Room,
    private readonly gameGateway: GameGateway
  ) {
    this.paddle1.position.set(
      0,
      this.metrics.fieldHeight,
      this.metrics.fieldDepth * 0.5 + this.metrics.paddleDepth * 0.5
    )
    this.paddle2.position.set(
      0,
      this.metrics.fieldHeight,
      -this.metrics.fieldDepth * 0.5 - this.metrics.paddleDepth * 0.5
    )
  }

  private async gameLoop() {
    this.startTime = Date.now()
    this.endTime = this.startTime + this.metrics.timeout

    while (Date.now() < this.endTime) {
      const deltaTime = Date.now() - this.startTime
      this.calculatePhysics(deltaTime)
      await this.broadcastUpdate()

      await new Promise((resolve) =>
        setTimeout(resolve, 1000 / this.metrics.tps)
      )
    }

    this.endGame()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private calculatePhysics(deltaTime: number) {
    // Gives to testBall a random position
    const minPos = new Vector3(
      -this.metrics.fieldWidth / 2,
      2,
      -this.metrics.fieldDepth / 2
    )
    const maxPos = new Vector3(
      this.metrics.fieldWidth / 2,
      8,
      this.metrics.fieldDepth / 2
    )
    this.testBall.position.lerpVectors(minPos, maxPos, Math.random())
  }

  private async broadcastUpdate() {
    const { x, y, z } = this.testBall.position
    this.gameGateway.server
      .to(this.roomState.id)
      .emit('game:testBall', { x, y, z })
    this.gameGateway.server
      .to(this.roomState.id)
      .emit('game:remainingTime', (this.endTime - Date.now()) / 1000)
    this.gameGateway.server
      .to(this.roomState.id)
      .emit(`game:paddle1`, { ...this.paddle1.position })
    this.gameGateway.server
      .to(this.roomState.id)
      .emit(`game:paddle2`, { ...this.paddle2.position })
  }

  public startGame() {
    this.gameLoop()
    this.logger.log('start of game!')
  }

  public endGame() {
    this.roomState.update({ ...this.roomState, status: RoomStatus.OPEN })
    this.logger.log('end of game!')
  }

  public getUserPaddle(User: User): SimObject3D {
    if (this.roomState.players[0].id === User.id) {
      return this.paddle1
    }
    return this.paddle2
  }

  public updatePaddlePosition(normalizedPos: number, paddle: SimObject3D) {
    paddle.position.lerpVectors(
      new Vector3(
        -this.metrics.fieldWidth / 2,
        paddle.position.y,
        paddle.position.z
      ),
      new Vector3(
        this.metrics.fieldWidth / 2,
        paddle.position.y,
        paddle.position.z
      ),
      normalizedPos
    )
  }
}
