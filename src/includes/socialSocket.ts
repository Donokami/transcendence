import { Socket, io } from 'socket.io-client'

export const socialSocket: Socket = io('http://localhost:3001/social', {
  withCredentials: true,
  autoConnect: false,
  transports: ['websocket']
})
