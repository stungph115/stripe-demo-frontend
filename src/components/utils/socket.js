import { io } from 'socket.io-client'
import { env } from '../../env'
const socket = io(env.URL_SOCKET, {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
})
export default socket