import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace } from 'socket.io';

@WebSocketGateway({
  namespace: 'game',
  cors: {
    origin: ['http://localhost:5713'],
  },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private logger = new Logger(EventsGateway.name);
    @WebSocketServer() nsp: Namespace;

    afterInit(server: any) {
      this.nsp.adapter.on('create-room', (room) => {
        this.logger.log(`"Room:${room}"이 생생성되었습니다.`);
      })
    }

    handleConnection(client: any, ...args: any[]) {
      
    }

    handleDisconnect(client: any) {
      
    }
}
