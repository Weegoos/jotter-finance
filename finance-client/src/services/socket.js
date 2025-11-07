import { io } from 'socket.io-client'
import { financeServerURL } from 'src/boot/config'

const socket = io(financeServerURL)

export default socket
