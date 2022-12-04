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

    try {
      const sessionID = socket.handshake.auth.sessionID;
      this.logger.log(`Checking for sessionID : ${sessionID}`);

      if (sessionID && sessionID != "null" && sessionID != "undefined") {
        this.logger.log('handshaken!');

        const session = await this.chatService.findUser(sessionID);
        if (session) {
          socket.data.sessionID = sessionID;
          socket.data.room = session.room;
          socket.data.user_id = session.user_id;
        } else {
          throw new Error("Try again!");
        }
      } else {
        const decoded = this.jwtService.decode(socket.handshake.query.token as string);
        if (!decoded['user_id']) {
          throw new Error("Token not provided!");
        }
        const newUser = await this.chatService.saveUser(decoded['user_id']);
        socket.data.sessionID = newUser.id;
        socket.data.room = newUser.room;
        socket.data.user_id = newUser.user_id;
      }

      this.logger.log(`sessionID is now : ${socket.data.sessionID}`);
      socket.emit("session", { sessionID: socket.data.sessionID, userID: socket.data.room });
      socket.join(socket.data.room);
    } catch (e) {
      this.logger.log(`Error occured! ${e}`)
    }
  }

  @SubscribeMessage('dm-message')
  async handleDM(@ConnectedSocket() socket: Socket, @MessageBody() msg) {
    this.logger.log(msg);
    if (msg.msg && msg.nickname) {
      const insertedMSG = await this.chatService.saveDM(socket, msg);
      const to = await this.chatService.findRoom(msg.nickname);
      this.logger.log(to);
      // socket.to(socket.data.room).to(to).emit("dm-message", insertedMSG)
      socket.to(to).emit('dm-message', insertedMSG)
    //   socket.emit('dm-message', insertedMSG);
    }
  }

  @SubscribeMessage('message')
  async handleMessage(@ConnectedSocket() socket: Socket, @MessageBody() msg) {
	if (msg.msg && msg.room) {
		const insertedMSG = await this.chatService.saveChat(socket, msg);
		socket.to(msg.room).emit('message', insertedMSG);
	}
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
