import { Socket, io } from 'socket.io-client'

export const chatSocket: Socket = io(
  `${import.meta.env.VITE_SOCKET_URL}/chat`,
  {
    withCredentials: true,
    autoConnect: false,
    transports: ['websocket']
  }
)
