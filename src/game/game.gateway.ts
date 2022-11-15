import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';

interface MessagePayload {
  roomName: string;
  message: string;
}

let createdRooms: string[] = [];

@WebSocketGateway({
  namespace: 'game',
  cors: {
    origin: ['http://localhost:5713'],
  },
})
export class GameGateway
  implements OnGatewayInit {
    private logger = new Logger(GameGateway.name);
    @WebSocketServer() nsp: Namespace;


    afterInit(server: any) {
      this.nsp.adapter.on('delete-room', (room) => {
        const deletedRoom = createdRooms.find(
          (createdRoom) => createdRoom === room,
        );
        if (!deletedRoom) return ;
        this.nsp.emit('delete-room', deletedRoom);
        createdRooms = createdRooms.filter(
          (createdRoom) => createdRoom !== deletedRoom,
        );
      })

      this.logger.log('웹소켓 서버 초기화 ✅');
    }

    @SubscribeMessage('message')
    handleMessage(@ConnectedSocket() socket: Socket, @MessageBody() { roomName, message }: MessagePayload) {
      socket.broadcast.to(roomName).emit('message', { username: socket.id, message });
      return { username: socket.id, message };
    }

    @SubscribeMessage('room-list')
    handleRoomList() {
      return createdRooms;
    }

    @SubscribeMessage('create-room')
    handleCreateRoom(@ConnectedSocket() socket: Socket, @MessageBody() roomName: string ) {
      const exists = createdRooms.find((createdRoom) => createdRoom === roomName);
      if (exists) {
        return { success: false, payload: `${roomName} 방이 이미 존재합니다.` }
      }

      socket.join(roomName);
      createdRooms.push(roomName);
      this.nsp.emit('create-room', roomName);

      return { success: true, payload: roomName };
    }
}