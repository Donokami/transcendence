import { Vector3 } from 'three'

// export interface Game {
//   paddle1Pos: Vector3
//   paddle2Pos: Vector3
//   ballPos: Vector3
//   score1: number
//   score2: number
//   isUserPaddle1: boolean
//   remainingTime: number
//   fps: number
// }

export interface Game {
  ballPos: Vector3
  players: Array<{
    userId: string
    paddlePos: Vector3
    score: number
  }>
  remainingTime: number
  fps: number
}
