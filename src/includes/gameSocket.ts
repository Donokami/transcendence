import { Socket, io } from 'socket.io-client'
import type { Room } from '@/types/Room'
import type { Game } from '@/types/Game'
import { reactive } from 'vue'
import { Vector3 } from 'three'

export const socket: Socket = io('http://localhost:3001/game', {
  withCredentials: true,
  autoConnect: false,
  transports: ['websocket']
})

export const room: Room = reactive({
  id: '',
  name: '',
  players: [],
  observers: [],
  invited: [],
  owner: null,
  isPrivate: false,
  status: '',
  maxPlayers: 0
})

export const game: Game = reactive({
  paddle1Pos: new Vector3(0, 0, 0),
  paddle2Pos: new Vector3(0, 0, 0),
  testBallPos: new Vector3(0, 0, 0),
  score1: 0,
  score2: 0,
  isUserPaddle1: true,
  remainingTime: 0
})

socket.on('connect', () => {
  console.log('connected to the /game socket')
})

socket.on('disconnect', async () => {
  console.log('disconnected from the /game socket')
})

socket.on('error', (error) => {
  console.error('error on the /game socket', error)
})

socket.on('room:update', (data: Room) => {
  console.log(data)
  Object.assign(room, data)
})

socket.on('game:testBall', ({ x, y, z }) => {
  game.testBallPos = new Vector3(x, y, z)
})

socket.on('game:paddle1', ({ x, y, z }) => {
  game.paddle1Pos = new Vector3(x, y, z)
})

socket.on('game:remainingTime', (remainingTime: number) => {
  game.remainingTime = remainingTime
})
