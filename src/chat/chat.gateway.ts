import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { ChatService } from './chat.service';


@WebSocketGateway({
  namespace: 'session',
})
export class ChatGateway
  implements OnGatewayConnection {
  constructor(
    private chatService: ChatService,
    private jwtService: JwtService
  ) {}

  @WebSocketServer() nsp: Namespace;
  private logger = new Logger(ChatGateway.name);

  async handleConnection(@ConnectedSocket() socket: Socket, @MessageBody() msg: any) {

    this.logger.log('connected!');
    
    const sessionID = socket.handshake.auth.sessionID;
    this.logger.log(sessionID);
    if (sessionID) {
      this.logger.log('handshaken!');
      const session = await this.chatService.findUser(sessionID);
      if (session) {
        socket.data.sessionID = sessionID;
        socket.data.room = session.room;
        socket.data.user_id = session.user_id;
      }
    } else {
      const decoded = this.jwtService.decode(socket.handshake.query.token as string);
      const newUser = await this.chatService.saveUser(decoded['user_id']);
      socket.data.sessionID = newUser.id;
      socket.data.room = newUser.room;
      socket.data.user_id = newUser.user_id;
    }

    this.logger.log(socket.data.sessionID);

    socket.emit("session", { sessionID: socket.data.sessionID, userID: socket.data.room });

    socket.join(socket.data.room);
  }

  @SubscribeMessage('dm-message')
  async handleDM(@ConnectedSocket() socket: Socket, @MessageBody() msg) {
    const insertedMSG = await this.chatService.saveDM(socket, msg.msg);
    const to = await this.chatService.findRoom(msg.nickname);
    socket.to(socket.data.room).to(to).emit("dm-message", insertedMSG)
  }

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
