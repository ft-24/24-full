import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { Direction } from './entities/lib/Directions';
import GameEngine from './entities/lib/GameEngine';

let game;

@WebSocketGateway({
  namespace: 'game',
})
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() nsp: Namespace;
    private logger = new Logger(GameGateway.name);

    afterInit(server: any) {
      game = new GameEngine();
    }

    handleConnection(@ConnectedSocket() socket: Socket, ...args: any[]) {
      game.addPlayer(socket);
    }

    handleDisconnect(@ConnectedSocket() socket: Socket) {
      game.delPlayer(socket);
    }

    @SubscribeMessage('move')
    movePlayer(@ConnectedSocket() socket: Socket, @MessageBody() dir: Direction) {
      game.movePlayer(socket, dir);
    }
}