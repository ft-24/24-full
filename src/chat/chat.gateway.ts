import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';


@WebSocketGateway({
  namespace: 'chat',
})
export class ChatGateway {
  @WebSocketServer() nsp: Namespace;
  private logger = new Logger(ChatGateway.name);

  @SubscribeMessage('message')
  handleMessage(@ConnectedSocket() socket: Socket, @MessageBody() msg: any): string {
    return 'Hello world!';
  }

  @SubscribeMessage('create-room')
  createRoom() {
  }

  @SubscribeMessage('edit-room')
  editRoom() {
  }

  @SubscribeMessage('join-room')
  joinRoom() {
  }

  @SubscribeMessage('leave-room')
  leaveRoom() {
  }
}
