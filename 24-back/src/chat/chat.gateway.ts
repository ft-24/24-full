import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { ChatService } from './chat.service';


@WebSocketGateway({
  namespace: '24',
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private chatService: ChatService,
    private jwtService: JwtService
  ) {}

  @WebSocketServer() nsp: Namespace;
  private logger = new Logger(ChatGateway.name);

  async handleConnection(@ConnectedSocket() socket: Socket, @MessageBody() msg: any) {
    try {
      const sessionID = socket.handshake.auth.sessionID;
      if (sessionID && sessionID != "null" && sessionID != "undefined") {
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
      socket.emit("session", { sessionID: socket.data.sessionID, userID: socket.data.room });
      socket.join(socket.data.room);
      this.chatService.userOnline(socket.data.user_id)
    } catch (e) {
      this.logger.log(`Error occured! ${e}`)
    }
  }

  handleDisconnect(@ConnectedSocket() socket: Socket) {
    this.chatService.userOffline(socket.data.user_id)
  }

  @SubscribeMessage('dm-message')
  async handleDM(@ConnectedSocket() socket: Socket, @MessageBody() msg) {
    if (msg.msg && msg.receiver) {
      const insertedMSG = await this.chatService.saveDM(socket, msg);
      const to = await this.chatService.findRoom(msg.receiver);
      socket.to(socket.data.room).emit("dm-message", insertedMSG)
      if (!await this.chatService.isBlockedByNickname(msg.receiver, socket.data.user_id)) {
        socket.to(to).emit('dm-message', insertedMSG)
      }
    }
  }

  @SubscribeMessage('message')
  async handleMessage(@ConnectedSocket() socket: Socket, @MessageBody() msg) {
    if (await this.chatService.checkBan(socket, msg.receiver)) { return };
    if (await this.chatService.checkMute(socket, msg.receiver)) { return };
    if (msg.msg && msg.receiver) {
      const insertedMSG = await this.chatService.saveChat(socket, msg);
      const clients = await this.nsp.in(msg.receiver).fetchSockets();
      for (const c of clients) {
        if (c.data.room != socket.data.room && !await this.chatService.isBlocked(c.data.user_id, socket.data.user_id)) {
          c.emit('message', insertedMSG);
        }
      }
    }
  }

  @SubscribeMessage('dm-create-room')
  async createDM(@ConnectedSocket() socket: Socket, @MessageBody() msg) {
    const dmStatus = await this.chatService.createDM(socket, msg.intra_id);
    return dmStatus;
  }

  @SubscribeMessage('create-room')
  async createRoom(@ConnectedSocket() socket: Socket, @MessageBody() msg) {
    const roomStatus = await this.chatService.createNewRoom(socket, msg);
    if (roomStatus == ``) {
      socket.join(msg.name);
    }
    return roomStatus;
  }

  @SubscribeMessage('edit-room')
  async editRoom(@ConnectedSocket() socket: Socket, @MessageBody() msg) {
    const roomStatus = await this.chatService.updateNewRoom(socket, msg);
    socket.emit('fetch')
    socket.to(msg.name).emit('fetch')
    return (roomStatus);
  }

  @SubscribeMessage('join-room')
  async joinRoom(@ConnectedSocket() socket: Socket, @MessageBody() msg) {
    if (msg == undefined) {
      return ;
    }
    await this.chatService.joinChat(socket.data.user_id, msg.name);
    const messages = await this.chatService.getChat(socket, msg.name);
    socket.emit('messages', messages);
    socket.to(msg.name).emit('fetch');
    socket.join(msg.name);
  }

  @SubscribeMessage('dm-join-room')
  async dmJoinRoom(@ConnectedSocket() socket: Socket, @MessageBody() msg) {
    const to = await this.chatService.findTo(msg.intra);
    const messages = await this.chatService.getDM(socket, msg.intra);
    if (to) {
      socket.to(socket.data.room).emit("dm-messages", messages)
      if (!await this.chatService.isBlockedByIntra(msg.intra, socket.data.user_id)) {
        socket.to(to).emit('dm-messages', messages)
      }
    }
  }

  @SubscribeMessage('leave-room')
  async leaveRoom(@ConnectedSocket() socket:Socket, @MessageBody() msg) {
    socket.to(msg.name).emit('fetch');
    socket.leave(msg.name)
  }

  @SubscribeMessage('quit-room')
  async quitRoom(@ConnectedSocket() socket:Socket, @MessageBody() msg) {
    if (socket.data.user_id && msg.name) {
      await this.chatService.quitRoom(socket.data.user_id, msg.name);
    }
  }

  @SubscribeMessage('kick')
  async kick(@ConnectedSocket() socket:Socket, @MessageBody() msg) {
    const kickedUser = await this.chatService.getUserByIntra(msg.intra_id);
    const kickedUserRoom = await this.chatService.findRoomByIntra(msg.intra_id);
    if (kickedUser && kickedUserRoom) {
      await this.chatService.quitRoom(kickedUser.id, msg.name);
    }
    socket.to(kickedUserRoom).emit('kick', msg.name);
    socket.to(msg.name).emit('fetch');
  }

  @SubscribeMessage('admin')
  async adminUser(@ConnectedSocket() socket: Socket, @MessageBody() msg) {
    if (!msg.room_name || !msg.intra_id || msg.is_admin === undefined) {
      return false;
    }
    let ret: boolean;
    if (msg.is_admin) {
      ret = await this.chatService.removeAdminUser(msg.room_name, socket.data.user_id, msg.intra_id);
    } else {
      ret = await this.chatService.adminUser(msg.room_name, socket.data.user_id, msg.intra_id);
    }
    const to = await this.chatService.findRoomByIntra(msg.intra_id);
    socket.to(msg.room_name).emit('fetch');
    return ret;
  }
}
