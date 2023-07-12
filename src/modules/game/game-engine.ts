import { Logger } from '@nestjs/common'
import { Object3D, Vector3 } from 'three'
import { GameGateway } from './game.gateway'
import { Room } from './room'

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
  timeout: 120000,
  tps: 5
}

export class Game {
  private readonly logger = new Logger(Game.name)

  private paddle1: SimObject3D
  private paddle2: SimObject3D
  private ball: SimObject3D
  private testBall: SimObject3D = new Object3D() as SimObject3D
  private timeout: number = gm.timeout
  private readonly metrics: Metrics = gm

  constructor(
    private readonly roomState: Room,
    private readonly gameGateway: GameGateway
  ) {}

  private async gameLoop() {
    const startTime = Date.now()
    const endTime = startTime + this.metrics.timeout

    while (Date.now() < endTime) {
      const deltaTime = Date.now() - startTime
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
      0,
      -this.metrics.fieldDepth / 2
    )
    const maxPos = new Vector3(
      this.metrics.fieldWidth / 2,
      0,
      this.metrics.fieldDepth / 2
    )
    this.testBall.position.lerpVectors(minPos, maxPos, Math.random())
  }

  private async broadcastUpdate() {
    const { x, y, z } = this.testBall.position
    this.gameGateway.server
      .to(this.roomState.id)
      .emit('update:testBall', { x, y, z })
  }

  public startGame() {
    this.gameLoop()
    this.logger.log('start of game!')
  }

  public endGame() {
    this.logger.log('end of game!')
  }
}
