import Utils from './Utils';
import Scene from './Scene';
import MainScene from '../scene/Mainscene';
import { Direction } from './Directions';
import { Socket } from 'socket.io';

namespace Pong {

  export class GameEngine {

    private scene!: Scene;
    private players: Socket[] = [];
    private player1: Socket = undefined;
    private player2: Socket = undefined;

    constructor() {
      let menu = new MainScene();
      let startTime: number = Date.now();
      let timestamp: number = startTime;

      this.loadScene(menu);

      setInterval(() => {
        let deltaTime = (startTime - timestamp) * 0.06;
        this.update(deltaTime);
        
        if (this.players) {
          this.players.forEach( s => {
            s.emit('draw', this.draw());
          })
        }
       
        timestamp = startTime;
        startTime = Date.now();
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
  }

}

export default Pong.GameEngine;
