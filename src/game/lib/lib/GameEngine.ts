import Utils from './Utils';
import Scene from './Scene';
import MainScene from '../scene/Mainscene';
import { Direction } from './Directions';
import { Socket } from 'socket.io';
import { GameService } from 'src/game/game.service';
import EndScene from '../scene/EndScene';

namespace Pong {

  export class GameEngine {

    private scene!: Scene;
    private players: Socket[] = [];
    private player1: Socket = undefined;
    private player2: Socket = undefined;
    private ended: boolean = false;

    constructor(private gameService: GameService) {
      let menu = new MainScene(gameService, this);
      let startTime: number = Date.now();
      let timestamp: number = startTime;

      this.loadScene(menu);

      setInterval(() => {
        if (!this.ended) {
          let deltaTime = (startTime - timestamp) * 0.06;
          this.update(deltaTime);
          
          const draw = this.draw();
          if (this.players && draw['ball']) {
            this.players.forEach( s => {
              s.emit('draw', draw);
            })
          }
         
          timestamp = startTime;
          startTime = Date.now();
        }
      }, 1000 / 60); // 60 == FPS
    }

    draw() {
      return this.scene.draw();
    }

    update(deltaTime: number) {
      this.scene.update(deltaTime);
    }

    loadScene(newScene: Scene, params?: object) {
      // If a scene has been loaded already, unload it
      if (this.scene) {
        this.scene.unload();
      }
      this.scene = newScene;
      this.scene.setGameContext(this);

      if (params === undefined) {
        params = {};
      }
      this.scene.load(params);
    }


    addPlayer(socket: Socket) {
      this.players.push(socket);
      if (this.player1 == undefined) {
        this.player1 = socket;
      } else if (this.player2 == undefined) {
        this.player2 = socket;
      }
    }

    delPlayer(socket: Socket) {
      if (this.player1 == socket)
        this.player1 = undefined;
      if (this.player2 == socket)
        this.player2 = undefined;
    }

    movePlayer(socket: Socket, dir: Direction) {
      if (socket == this.player1) {
        this.scene.getInput(1, dir);
      } else if (socket == this.player2) {
        this.scene.getInput(2, dir);
      }
    }

    gameResult(result) {
      // console.log(result);
      
      this.players.forEach( s => {
        s.emit('result', result);
      })
      this.ended = true;
    }

    getPlayer1() {
      if (this.player1) {
        return this.player1.id;
      }
    }

    getPlayer2() {
      if (this.player2) {
        return this.player2.id;
      }
    }

  }
}

export default Pong.GameEngine;
