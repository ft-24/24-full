import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import Pong from './entities/Constants';
import { Direction } from './entities/lib/Directions';
import GameEngine from './entities/lib/GameEngine';

let game = new GameEngine();
let players: Socket[] = [];
let player1: Socket = undefined;
let player2: Socket = undefined;

@WebSocketGateway({
  namespace: 'game',
})
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() nsp: Namespace;
    private logger = new Logger(GameGateway.name);

    afterInit(server: any) {
      let startTime: number = Date.now();
      let timestamp: number = startTime;
      this.logger.log('successfully initialized!')

      setInterval(() => {
        let deltaTime = (startTime - timestamp) * 0.06;
        game.update(deltaTime);
        // this.logger.log(game.draw());
        
        if (players) {
          players.forEach( s => {
            s.emit('draw', game.draw());
          })
        }
       
        timestamp = startTime;
        startTime = Date.now();
      }, 1000/Pong.Game.FPS);
    }

    handleConnection(@ConnectedSocket() socket: Socket, ...args: any[]) {
      players.push(socket);
      this.logger.log(`Someone has joined as ${socket.id}`);
      if (player1 == undefined) {
        this.logger.log('Someone has defined to player 1!');
        player1 = socket;
      } else if (player2 == undefined) {
        this.logger.log('Someone has defined to player 2!');
        player2 = socket;
      }
    }

    handleDisconnect(@ConnectedSocket() socket: Socket) {
      if (player1 == socket)
        player1 = undefined;
      if (player2 == socket)
        player2 = undefined;
    }

    @SubscribeMessage('move')
    movePlayer(@ConnectedSocket() socket: Socket, @MessageBody() dir: Direction) {
      if (socket == player1) {
        this.logger.log('Moving p1 to somewhere')
        game.getInput(1, dir);
      } else if (socket == player2) {
        this.logger.log('Moving p2 to somewhere')
        game.getInput(2, dir);
      }
    }
}