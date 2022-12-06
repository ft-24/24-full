import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { GameService } from './game.service';
import { Direction } from './lib/lib/Directions';
import GameEngine from './lib/lib/GameEngine';

let Games: GameEngine[] = [];
let LadderGames: GameEngine[] = [];

@WebSocketGateway({
  // namespace: 'game',
})
export class GameGateway
  implements OnGatewayDisconnect {
    constructor (private gameService: GameService)
    {}
    @WebSocketServer() nsp: Namespace;
    private logger = new Logger(GameGateway.name);

    @SubscribeMessage('refresh')
    sendBackRoomList(@ConnectedSocket() socket: Socket, @MessageBody() msg) {
      // 방 리스트 리턴
    }

    @SubscribeMessage('queue')
    queuePlayer(@ConnectedSocket() socket: Socket, @MessageBody() msg) {
      // LadderGames 에 현재 대기 중인 게임이 있는지 확인, 있다면 join 후 enter-room emit
      // 대기 중인 게임이 없다면 LadderGames에 새로운 방 생성 후 join
    }

    @SubscribeMessage('make-room')
    makeRoom(@ConnectedSocket() socket: Socket, @MessageBody() msg) {
      // msg에 포함된 name과 임의로 생성한 id로 새로운 게임 생성, 그 후 join
      // room이 새로 생겼으므로 모든 소켓에게 새로운 방이 생성되었음을 emit, id & name
    }

    @SubscribeMessage('join')
    joinPlayer(@ConnectedSocket() socket: Socket, @MessageBody() msg) {
      // 주어진 id에 해당하는 게임이 있는지 확인, 존재한다면 join 후 enter-room emit
      // 먼저 방에 존재했던 socket에게도 enter-room emit
    }

    @SubscribeMessage('leave')
    removePlayer(@ConnectedSocket() socket: Socket, @MessageBody() msg) {
      // socket이 join 되어있는 게임을 받고, 해당 게임의 disconnect 함수를 호출
      // 필요하다면 소켓에게 leave-room emit
    }

    @SubscribeMessage('ready')
    playerReady(@ConnectedSocket() socket: Socket, @MessageBody() msg) {
      // socket이 join 되어있는 게임을 받고, 해당 게임의 ready 함수를 소켓과 상태를 파라미터로 호출
    }

    @SubscribeMessage('move')
    movePlayer(@ConnectedSocket() socket: Socket, @MessageBody() dir: Direction) {
      // socket이 join 되어있는 게임을 받고, 해당 게임의 move 함수를 소켓과 방향을 파라미터로 호출
    }

    handleDisconnect(@ConnectedSocket() socket: Socket) {
      // socket이 join 되어있던 게임을 받고, 해당 게임의 disconnect 함수를 호출
    }
}