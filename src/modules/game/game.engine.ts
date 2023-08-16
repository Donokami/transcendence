import { Logger } from '@nestjs/common'
import { Object3D, Vector3 } from 'three'
import { GameGateway } from './game.gateway'
import { UsersService } from '@/modules/users/users.service'
import { Room, RoomStatus } from './game.room'
import { type SimObject3D, type Metrics, PhysicsEngine } from './game.physics'
import { User } from '../users/user.entity'
import { Repository } from 'typeorm'
import { Match } from './entities/match.entity'

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
  ballSpeed: 1,
  gameDuration: 30000,
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
    private readonly gameGateway: GameGateway,
    private readonly usersService: UsersService,
    private readonly matchRepository: Repository<Match>,
    private readonly paddleRatio: number,
    private readonly gameDuration: number,
    private readonly ballSpeed: number
  ) {
    this.metrics.paddleRatio = this.paddleRatio
    this.metrics.gameDuration = this.gameDuration * 60000
    this.metrics.ballSpeed = this.ballSpeed

    this.logger.log(this.metrics)

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
    this.gameState.endTime = startTime + this.metrics.gameDuration

    while (Date.now() < this.gameState.endTime) {
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

  private async updateUserStats() {
    if (this.gameState.players[1].userId === 'bot') return
    const players = this.gameState.players
    const firstPlayer = await this.usersService.findOneByIdWithStats(
      players[0].userId
    )
    const secondPlayer = await this.usersService.findOneByIdWithStats(
      players[1].userId
    )

    const scoreDifference = players[0].score - players[1].score
    const isFirstPlayerWinner = scoreDifference > 0
    const isSecondPlayerWinner = scoreDifference < 0

    const updatedPlayerStats = (player: Partial<User>, isWinner: boolean) => ({
      ...player,
      gamesPlayed: player.gamesPlayed + 1,
      win: isWinner ? player.win + 1 : player.win,
      loss: isWinner ? player.loss : player.loss + 1,
      winRate:
        (isWinner ? player.win + 1 : player.win) / (player.gamesPlayed + 1),
      pointsScored: player.pointsScored + players[isWinner ? 0 : 1].score,
      pointsConceded: player.pointsConceded + players[isWinner ? 1 : 0].score,
      pointsDifference:
        player.pointsScored -
        player.pointsConceded +
        players[isWinner ? 0 : 1].score -
        players[isWinner ? 1 : 0].score
    })

    const updatedFirstPlayer = updatedPlayerStats(
      firstPlayer,
      isFirstPlayerWinner
    )
    const updatedSecondPlayer = updatedPlayerStats(
      secondPlayer,
      isSecondPlayerWinner
    )

    this.usersService.update(firstPlayer.id, updatedFirstPlayer)
    this.usersService.update(secondPlayer.id, updatedSecondPlayer)

    const match = new Match()
    match.players = [firstPlayer, secondPlayer]
    match.scoreA = players[0].score
    match.scoreB = players[1].score
    await this.matchRepository.save(match)
  }

  public userSurrended(userId: string) {
    // Remove all points from the user who surrended
    this.logger.log(`User ${userId} surrended`)

    const playerIndex = this.gameState.players.findIndex(
      (player) => player.userId === userId
    )
    this.gameState.players[playerIndex].score = 0
    this.gameState.endTime = Date.now() + (1000 / this.metrics.tps) * 3
  }

  public startGame() {
    this.gameLoop()
    this.logger.log('start of game!')
  }

  public async endGame() {
    this.gameState.endTime = Date.now()
    this.gameGateway.server.to(this.roomState.id).emit(`game:end`)
    await this.updateUserStats()
    // todo: to test, it may be broken
    this.roomState.update({ ...this.roomState, status: RoomStatus.OPEN })
    this.logger.log('end of game!')
  }

  public updatePaddlePosition(normalizedPos: number, userId: string) {
    const playerIndex = this.gameState.players.findIndex(
      (player) => player.userId === userId
    )
    const paddle = this.gameState.players[playerIndex].paddle
    const rotatedNormalizedPos =
      playerIndex == 1 ? 1 - normalizedPos : normalizedPos
    paddle.position.lerpVectors(
      new Vector3(
        -this.metrics.fieldWidth / 2 +
          (this.paddleRatio * this.metrics.fieldWidth) / 2,
        paddle.position.y,
        paddle.position.z
      ),
      new Vector3(
        this.metrics.fieldWidth / 2 -
          (this.paddleRatio * this.metrics.fieldWidth) / 2,
        paddle.position.y,
        paddle.position.z
      ),
      rotatedNormalizedPos
    )
  }
}
