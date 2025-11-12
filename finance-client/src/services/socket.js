import { io } from 'socket.io-client'
import { financeServerURL } from 'src/boot/config'

const socket = io(financeServerURL, { autoConnect: false })

export default socket
