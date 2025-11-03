import { io } from 'socket.io-client'
import { financeServerURL } from 'src/boot/config'

// Подключаемся к серверу NestJS
const socket = io(financeServerURL) // поменяй на свой адрес

export default socket
