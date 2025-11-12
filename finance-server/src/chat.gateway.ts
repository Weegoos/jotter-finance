import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<number, string[]>();

  afterInit(server: Server) {
    console.log('WebSocket initialized');
  }

  handleConnection(client: Socket) {
    const userId = Number(client.handshake.query.userId); // <-- получаем userId из query

    if (userId) {
      const sockets = this.userSockets.get(userId) || [];
      sockets.push(client.id);
      this.userSockets.set(userId, sockets);
      console.log(`👤 User ${userId} connected with socket ${client.id}`);
    } else {
      console.warn(`⚠️ Client ${client.id} connected without userId`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() message: string): void {
    console.log('Received message:', message);
    this.server.emit('message', message);
  }

  sendBalanceUpdate(userId: number, total_balance: number) {
    const sockets = this.userSockets.get(userId);
    if (sockets && sockets.length > 0) {
      for (const socketId of sockets) {
        this.server.to(socketId).emit('balance_update', { total_balance });
      }
      console.log(`📢 Sent balance update to user ${userId}: ${total_balance}`);
    } else {
      console.log(`⚠️ No active sockets for user ${userId}`);
    }
  }
}
