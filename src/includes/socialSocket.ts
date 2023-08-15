import { Socket, io } from 'socket.io-client'

export const socialSocket: Socket = io(
  `${import.meta.env.VITE_SOCKET_URL}/social`,
  {
    withCredentials: true,
    autoConnect: false,
    transports: ['websocket']
  }
)
