import { Logger } from '@nestjs/common'
import { Object3D, Vector3 } from 'three'
import { GameGateway } from './game.gateway'
import { Room, RoomStatus } from './room'
import { User } from '@/modules/users/user.entity'
import { type SimObject3D, type Metrics, PhysicsEngine } from './game.physics'

const metrics: Metrics = {
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
  tps: 20
}

export type gameState = {
  deltaTime: number
  ball: SimObject3D
  players: {
    [id: string]: {
      paddle: SimObject3D
      score: number
    }
  }
  startTime: number
  endTime: number
}

export class Game {
  private readonly logger = new Logger(Game.name)

  private gameState: gameState
  private physicsEngine: PhysicsEngine
  private readonly metrics: Metrics = metrics

  constructor(
    private readonly roomState: Room,
    private readonly gameGateway: GameGateway
  ) {
    // this.paddle1.position.set(
    //   0,
    //   this.metrics.fieldHeight,
    //   this.metrics.fieldDepth * 0.5 + this.metrics.paddleDepth * 0.5
    // )
    // this.paddle2.position.set(
    //   0,
    //   this.metrics.fieldHeight,
    //   -this.metrics.fieldDepth * 0.5 - this.metrics.paddleDepth * 0.5
    // )
    const additionalPlayer =
      this.roomState.players.length > 1
        ? {
            [this.roomState.players[1].id]: {
              paddle: new Object3D() as SimObject3D,
              score: 0
            }
          }
        : {}

    this.gameState = {
      deltaTime: 0,
      ball: new Object3D() as SimObject3D,
      players: {
        [this.roomState.players[0].id]: {
          paddle: new Object3D() as SimObject3D,
          score: 0
        },
        ...additionalPlayer
      },
      startTime: 0,
      endTime: 0
    }
    this.physicsEngine = new PhysicsEngine(
      this.gameState,
      this.metrics,
      this.gameGateway.server
    )
  }

  private async gameLoop() {
    const startTime = (this.gameState.startTime = Date.now())
    const endTime = (this.gameState.endTime = startTime + this.metrics.timeout)

    while (Date.now() < endTime) {
      const deltaStart = Date.now()

      this.physicsEngine.calculateFrame(this.gameState)
      await this.broadcastUpdate()

      // Imprecise timer, but probably good enough for our purposes.
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 / this.metrics.tps)
      )
      this.gameState.deltaTime = (Date.now() - deltaStart) / 1000
    }

    this.endGame()
  }

  private async broadcastUpdate() {
    this.gameGateway.server
      .to(this.roomState.id)
      .emit('game:ball', { ...this.gameState.ball.position })
    this.gameGateway.server
      .to(this.roomState.id)
      .emit('game:remainingTime', (this.gameState.endTime - Date.now()) / 1000)
    this.gameGateway.server
      .to(this.roomState.id)
      .emit(`game:player1`, [
        { ...this.getPlayer(0).paddle.position },
        this.getPlayer(0).score
      ])
    this.gameGateway.server
      .to(this.roomState.id)
      .emit(`game:player2`, [
        { ...this.getPlayer(1).paddle.position },
        this.getPlayer(1).score
      ])
  }

  public startGame() {
    this.gameLoop()
    this.logger.log('start of game!')
  }

  public endGame() {
    this.gameState.endTime = Date.now()
    this.roomState.update({ ...this.roomState, status: RoomStatus.OPEN })
    this.logger.log('end of game!')
  }

  private getPlayer(index: number) {
    const playersArray = Object.keys(this.gameState.players).map(
      (key) => this.gameState.players[key]
    )

    return playersArray[index]
  }

  public updatePaddlePosition(normalizedPos: number, userId: string) {
    const paddle = this.gameState.players[userId].paddle
    paddle.position.lerpVectors(
      new Vector3(
        -this.metrics.fieldWidth / 2 +
          (this.metrics.paddleRatio * this.metrics.fieldWidth) / 2,
        paddle.position.y,
        paddle.position.z
      ),
      new Vector3(
        this.metrics.fieldWidth / 2 -
          (this.metrics.paddleRatio * this.metrics.fieldWidth) / 2,
        paddle.position.y,
        paddle.position.z
      ),
      normalizedPos
    )
    if (this.gameState.players['bot'].paddle !== undefined)
      this.gameState.players['bot'].paddle.position.x = paddle.position.x
  }
}
