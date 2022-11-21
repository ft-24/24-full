import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
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
  cors: {
    origin: ['http://10.15.8.6:5713'],
  },
})
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection {
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
      if (player1 == undefined) {
        player1 = socket;
      } else if (player2 == undefined) {
        player2 = socket;
      }
    }

    @SubscribeMessage('move')
    movePlayer(@ConnectedSocket() socket: Socket, @MessageBody() dir: Direction) {
      // if (socket == player1) {
        this.logger.log('Got an movement request!')
        game.getInput(1, dir);
      // } else if (socket == player2) {
      //   this.logger.log('Moving p2 to somewhere')
      //   game.getInput(2, dir);
      // }
    }
}