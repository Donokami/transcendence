import { onBeforeRouteUpdate, onBeforeRouteLeave } from 'vue-router'
import { Socket, io } from 'socket.io-client'
// import { useGameStore } from '@/stores/GameStore'
import type { Room } from '@/types/Room'
import { reactive } from 'vue'

export const socket: Socket = io('http://localhost:3002/game', {
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

socket.connect()

console.log('pipi')

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
  // Assign the data to the room object
  Object.assign(room, data)
})

onBeforeRouteLeave(async () => {
  socket.disconnect()
})
