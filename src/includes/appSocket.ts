import { Socket, io } from 'socket.io-client'

export const appSocket: Socket = io('http://localhost:3001/app', {
  withCredentials: true,
  autoConnect: false,
  transports: ['websocket']
})
