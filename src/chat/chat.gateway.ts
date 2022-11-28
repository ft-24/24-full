import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { ChatService } from './chat.service';


@WebSocketGateway({
  namespace: 'chat',
})
export class ChatGateway {
  constructor(
    private chatService: ChatService
  ) {}

  @WebSocketServer() nsp: Namespace;
  private logger = new Logger(ChatGateway.name);

  @SubscribeMessage('message')
  handleMessage(@ConnectedSocket() socket: Socket, @MessageBody() msg: any): string {
    return 'Hello world!';
  }

  @SubscribeMessage('create-room')
  createRoom() {
    this.chatService.createNewRoom(undefined);
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
