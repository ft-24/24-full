import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { GameService } from './game.service';
import { Direction } from './lib/lib/Directions';
import GameEngine from './lib/lib/GameEngine';

let game;

@WebSocketGateway({
  // namespace: 'game',
})
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor (private gameService: GameService)
    {}
    @WebSocketServer() nsp: Namespace;
    private logger = new Logger(GameGateway.name);

    afterInit(server: any) {
      game = new GameEngine(this.gameService);
    }

    handleConnection(@ConnectedSocket() socket: Socket, ...args: any[]) {
      this.logger.log('Someone has joined!')
      game.addPlayer(socket);
    }

    handleDisconnect(@ConnectedSocket() socket: Socket) {
      this.logger.log('Someone has left!')
      game.delPlayer(socket);
    }

    @SubscribeMessage('move')
    movePlayer(@ConnectedSocket() socket: Socket, @MessageBody() dir: Direction) {
      game.movePlayer(socket, dir);
    }

    @SubscribeMessage('test')
    testing() {
      this.logger.log('testing!')
    }

    @SubscribeMessage('ready')
    playerReady(@ConnectedSocket() socket: Socket, @MessageBody() msg) {
      this.logger.log(msg);
    }
}