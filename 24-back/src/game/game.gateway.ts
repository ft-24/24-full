import { Logger } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Namespace, Socket } from 'socket.io';
import { GameService } from './game.service';
import { Direction } from './lib/lib/Directions';
import GameEngine from './lib/lib/GameEngine';
import { v4 as uuid } from 'uuid';

let Games: GameEngine[] = [];
let PrivateGames: GameEngine[] = [];
let LadderGames: GameEngine[] = [];

@WebSocketGateway({
  namespace: '24',
})
export class GameGateway
  implements OnGatewayDisconnect {
    constructor (
      private gameService: GameService
    ){}

    @WebSocketServer() nsp: Namespace;
    private logger = new Logger(GameGateway.name);

    @SubscribeMessage('refresh')
    async sendBackRoomList(@ConnectedSocket() socket: Socket, @MessageBody() msg) {
      socket.emit('list', await this.gameService.getPublicRooms(Games, socket));
    }

    @SubscribeMessage('get')
    async getRoomInfo(@ConnectedSocket() socket: Socket, @MessageBody() msg) {
      const room = this.gameService.getGameById([...Games, ...PrivateGames, ...LadderGames], msg.id);
      if (room) {
        socket.emit('get', await this.gameService.getInfoByGame(room, socket))
      }
    }

    @SubscribeMessage('queue')
    async queuePlayer(@ConnectedSocket() socket: Socket, @MessageBody() msg) {
      const foundRoom = this.gameService.matchMaking(LadderGames);
      if (foundRoom) {
        foundRoom.join(socket);
        this.nsp.to(foundRoom.getID()).emit('enter-room', await this.gameService.getInfoByGame(foundRoom, socket))
        this.nsp.to(foundRoom.getID()).emit('get', await this.gameService.getInfoByGame(foundRoom, socket))
      } else {
        const newRoomID = uuid();
        const creadtedGame = LadderGames.push(new GameEngine(newRoomID, '', `ladder`, this.nsp));
        LadderGames[creadtedGame - 1].join(socket);
      }
    }

    @SubscribeMessage('unqueue')
    unqueuePlayer(@ConnectedSocket() socket: Socket, @MessageBody() msg) {
      const joinedGame = this.gameService.getJoinedGame(LadderGames, socket);
      if (joinedGame && joinedGame.disconnect(socket)) {
        if (LadderGames.findIndex((g)=>{return g == joinedGame}) >= 0) {
          LadderGames.splice(LadderGames.findIndex((g)=>{return g == joinedGame}), 1)
        }
      }
    }

    @SubscribeMessage('make-room')
    async makeRoom(@ConnectedSocket() socket: Socket, @MessageBody() msg) {
      if (msg.access_modifier == 'public') {
        const newRoomID = uuid();
        const creadtedGame = Games.push(new GameEngine(newRoomID, msg.name, msg.access_modifier, this.nsp));
        return newRoomID;
      } else if (msg.access_modifier == 'private') {
        const newRoomID = uuid();
        const creadtedGame = PrivateGames.push(new GameEngine(newRoomID, '', msg.access_modifier, this.nsp));
        const opponent = await this.gameService.findSocketByIntra(this.nsp, msg.name);
        if (opponent) {
          opponent.emit('invite', await this.gameService.getInfoByGame(PrivateGames[creadtedGame - 1], opponent))
        }
        return newRoomID;
      }
      // msg에 포함된 name과 임의로 생성한 id로 새로운 게임 생성, 그 후 join
      // room이 새로 생겼으므로 모든 소켓에게 새로운 방이 생성되었음을 emit, id & name
    }

    @SubscribeMessage('join')
    async joinPlayer(@ConnectedSocket() socket: Socket, @MessageBody() msg) {
      const joiningRoom = this.gameService.getGameById([...Games, ...PrivateGames, ...LadderGames], msg.id);
      if (joiningRoom) {
        joiningRoom.join(socket)
        this.nsp.to(joiningRoom.getID()).emit('enter-room', await this.gameService.getInfoByGame(joiningRoom, socket))
        this.nsp.to(joiningRoom.getID()).emit('get', await this.gameService.getInfoByGame(joiningRoom, socket))
      }
    }

    @SubscribeMessage('leave')
    async removePlayer(@ConnectedSocket() socket: Socket, @MessageBody() msg) {
      const joinedGame = this.gameService.getJoinedGame([...Games, ...PrivateGames, ...LadderGames], socket);
      if (joinedGame) {
        if (joinedGame.disconnect(socket)) {
         if (Games.findIndex((g)=>{return g == joinedGame}) >= 0) {
          Games.splice(Games.findIndex((g)=>{return g == joinedGame}), 1)
         }
         if (PrivateGames.findIndex((g)=>{return g == joinedGame}) >= 0) {
          PrivateGames.splice(PrivateGames.findIndex((g)=>{return g == joinedGame}), 1)
         }
         if (LadderGames.findIndex((g)=>{return g == joinedGame}) >= 0) {
          LadderGames.splice(LadderGames.findIndex((g)=>{return g == joinedGame}), 1)
         }
        }
        this.nsp.to(joinedGame.getID()).emit('get', await this.gameService.getInfoByGame(joinedGame, socket))
      }
    }

    @SubscribeMessage('ready')
    async playerReady(@ConnectedSocket() socket: Socket, @MessageBody() msg) {
      const joinedGame = this.gameService.getJoinedGame([...Games, ...PrivateGames, ...LadderGames], socket);
      if (joinedGame) { 
        joinedGame.ready(socket, msg.is_ready, this.gameService);
        this.nsp.to(joinedGame.getID()).emit('get', await this.gameService.getInfoByGame(joinedGame, socket))
      }
    }

    @SubscribeMessage('move')
    movePlayer(@ConnectedSocket() socket: Socket, @MessageBody() dir: Direction) {
      const joinedGame = this.gameService.getJoinedGame([...Games, ...PrivateGames, ...LadderGames], socket);
      if (joinedGame) {
        joinedGame.move(socket, dir);
      } 
    }

    async handleDisconnect(@ConnectedSocket() socket: Socket) {
      const joinedGame = this.gameService.getJoinedGameBySocket([...Games, ...PrivateGames, ...LadderGames], socket);
      if (joinedGame) {
        if (joinedGame.disconnect(socket)) {
         if (Games.findIndex((g)=>{return g == joinedGame}) >= 0) {
          Games.splice(Games.findIndex((g)=>{return g == joinedGame}), 1)
         }
         if (PrivateGames.findIndex((g)=>{return g == joinedGame}) >= 0) {
          PrivateGames.splice(PrivateGames.findIndex((g)=>{return g == joinedGame}), 1)
         }
         if (LadderGames.findIndex((g)=>{return g == joinedGame}) >= 0) {
          LadderGames.splice(LadderGames.findIndex((g)=>{return g == joinedGame}), 1)
         }
        }
        this.nsp.to(joinedGame.getID()).emit('get', await this.gameService.getInfoByGame(joinedGame, socket))
      }
    }
}