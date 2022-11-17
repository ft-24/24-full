import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import Pong from './entities/Constants';
import GameEngine from './entities/lib/GameEngine';

let players: Socket[] = [];

@WebSocketGateway({
  namespace: 'game',
  cors: {
    origin: ['http://localhost:5713'],
  },
})
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection {
    @WebSocketServer() nsp: Namespace;
    private logger = new Logger(GameGateway.name);

    afterInit(server: any) {
      let game = new GameEngine();
      let startTime: number = Date.now();
      let timestamp: number = startTime;
      this.logger.log('successfully initialized!')

      setInterval(() => {
        let deltaTime = (startTime - timestamp) * 0.06;
        game.getInput();
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
      // this.logger.log(players);
    }

    @SubscribeMessage('move')
    movePlayer(@ConnectedSocket() socket: Socket, @MessageBody() roomnname: string) {
      // this.logger.log(roomnname)
    }
}