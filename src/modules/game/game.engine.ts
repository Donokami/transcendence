import { Logger } from '@nestjs/common'
import { Object3D, Vector3 } from 'three'
import { GameGateway } from './game.gateway'
import { Room, RoomStatus } from './room'
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
    userId: string
    paddle: SimObject3D
    score: number
  }[]
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
    const additionalPlayer =
      this.roomState.players.length > 1
        ? [
            {
              userId: this.roomState.players[1].id,
              paddle: new Object3D() as SimObject3D,
              score: 0
            }
          ]
        : []

    this.gameState = {
      deltaTime: 0,
      ball: new Object3D() as SimObject3D,
      players: [
        {
          userId: this.roomState.players[0].id,
          paddle: new Object3D() as SimObject3D,
          score: 0
        },
        ...additionalPlayer
      ],
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
    // this.gameGateway.server
    //   .to(this.roomState.id)
    //   .emit('game:ball', { ...this.gameState.ball.position })
    // this.gameGateway.server
    //   .to(this.roomState.id)
    //   .emit('game:remainingTime', (this.gameState.endTime - Date.now()) / 1000)
    // this.gameGateway.server
    //   .to(this.roomState.id)
    //   .emit(`game:player1`, [
    //     { ...this.gameState.players[0].paddle.position },
    //     this.gameState.players[0].score
    //   ])
    // this.gameGateway.server
    //   .to(this.roomState.id)
    //   .emit(`game:player2`, [
    //     { ...this.gameState.players[1].paddle.position },
    //     this.gameState.players[1].score
    //   ])
    this.gameGateway.server.to(this.roomState.id).emit(`game:state`, {
      ballPos: this.gameState.ball.position,
      players: [
        {
          userId: this.gameState.players[0].userId,
          paddlePos: this.gameState.players[0].paddle.position,
          score: this.gameState.players[0].score
        },
        {
          userId: this.gameState.players[1].userId,
          paddlePos: this.gameState.players[1].paddle.position,
          score: this.gameState.players[1].score
        }
      ],
      remainingTime: (this.gameState.endTime - Date.now()) / 1000
    })
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

  public updatePaddlePosition(normalizedPos: number, userId: string) {
    const paddle = this.gameState.players.find(
      (player) => player.userId === userId
    ).paddle
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
  }
}
