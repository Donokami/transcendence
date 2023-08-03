import { Socket, io } from 'socket.io-client'
import type { Room, Game } from '@/types'
import { reactive } from 'vue'
import { Vector3 } from 'three'
import { useToast } from 'vue-toastification'
import router from '@/router'

const toast = useToast()

export const socket: Socket = io('http://localhost:3001/game', {
  withCredentials: true,
  autoConnect: false,
  transports: ['websocket']
})

export const room: Room = reactive({
  id: '',
  name: '',
  players: [],
  owner: null,
  isPrivate: false,
  paddleRatio: 0.3,
  ballSpeed: 1,
  gameDuration: 1.5,
  status: 'open'
})

export const game: Game = reactive({
  ballPos: new Vector3(0, 0, 0),
  players: [
    {
      userId: '',
      paddlePos: new Vector3(0, 0, 0),
      score: 0
    },
    {
      userId: '',
      paddlePos: new Vector3(0, 0, 0),
      score: 0
    }
  ],
  remainingTime: 0,
  fps: 0,
  started: false,
  ended: false
})

export function resetGame(): void {
  game.ballPos = new Vector3(0, 0, 0)
  game.players = [
    {
      userId: '',
      paddlePos: new Vector3(0, 0, 0),
      score: 0
    },
    {
      userId: '',
      paddlePos: new Vector3(0, 0, 0),
      score: 0
    }
  ]
  game.remainingTime = 0
  game.started = false
  game.ended = false
}

socket.on('connect', () => {
  console.log('connected to the /game socket')
})

socket.on('disconnect', async () => {
  resetGame()
  console.log('disconnected from the /game socket')
})

socket.on(
  'error',
  async ({
    code,
    type,
    message
  }: {
    code: number
    type: string
    message: string
  }) => {
    toast.error(message)
    await router.push({ name: 'home' })
  }
)

socket.on('room:update', (data: Room) => {
  Object.assign(room, data)
})

socket.on('game:state', (remoteGameState) => {
  game.ballPos = new Vector3(
    remoteGameState.ballPos.x,
    remoteGameState.ballPos.y,
    remoteGameState.ballPos.z
  )
  game.players = [
    {
      userId: remoteGameState.players[0].userId,
      paddlePos: new Vector3(
        remoteGameState.players[0].paddlePos.x,
        remoteGameState.players[0].paddlePos.y,
        remoteGameState.players[0].paddlePos.z
      ),
      score: remoteGameState.players[0].score
    },
    {
      userId: remoteGameState.players[1].userId,
      paddlePos: new Vector3(
        remoteGameState.players[1].paddlePos.x,
        remoteGameState.players[1].paddlePos.y,
        remoteGameState.players[1].paddlePos.z
      ),
      score: remoteGameState.players[1].score
    }
  ]
  game.remainingTime = remoteGameState.remainingTime
  game.started = true
  // game.paddle2Pos = new Vector3(...gameState.players[1].paddlePos)
})

socket.on('game:end', () => {
  game.ended = true

  setTimeout(() => {
    resetGame()
  }, 5000)
})
