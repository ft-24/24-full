import Utils from './Utils';
import Scene from './Scene';
import MainScene from '../scene/Mainscene';
import { Direction } from './Directions';
import { Namespace, Socket } from 'socket.io';
import { GameService } from 'src/game/game.service';
import EndScene from '../scene/EndScene';

namespace Pong {

  export class GameEngine {

    private scene!: Scene;
    private id: string;
    private name: string;
    private acc: string;
    private nsp: Namespace;
    private player1: Socket = undefined;
    private player2: Socket = undefined;
    private p1_ready: boolean = false;
    private p2_ready: boolean = false;
    private spec: Map<string, Socket> = new Map();
    private turbo: boolean = false;
    private ended: boolean = true;

    constructor(id: string, name: string, acc: string, nsp: Namespace) {
      this.id = id;
      this.name = name;
      this.acc = acc;
      this.nsp = nsp;
    }
    
    start(gameService: GameService) {
      let menu = new MainScene(gameService, this);
      let startTime: number = Date.now();
      let timestamp: number = startTime;

      this.loadScene(menu);
      this.ended = false;

      const i = setInterval(() => {
        if (this.ended) {
          clearInterval(i);
        }
        let deltaTime = (startTime - timestamp) * 0.06;
        this.scene.update(deltaTime);
        if (this.turbo) {
          this.scene.update(deltaTime);
        }
          
        const draw = this.scene.draw();
        if (draw['ball']) {
          this.nsp.to(this.id).emit('draw', draw);
        }
         
        timestamp = startTime;
        startTime = Date.now();
      }, 1000 / 60); // 60 == FPS
    }

    ready(socket: Socket, ready: boolean, gs) {
      if (socket == this.player1) {
        this.p1_ready = ready;
      }
      if (socket == this.player2) {
        this.p2_ready = ready;
      }

      if (this.p1_ready && this.p2_ready) {
        this.start(gs);
      }
    }

    turboToggle(socket: Socket, turbo: boolean) {
      if (socket != this.player1 && socket != this.player2) {
        return ;
      }
      if (turbo != undefined) {
        this.turbo = turbo;
      }
    }

    disconnect(socket: Socket) {
      socket.leave(this.id)
      if (socket == this.player1) {
        if (this.ended == false) {
          this.scene.end(2);
          this.ended = true;
        }
        this.nsp.to(this.id).emit('quit', null);
        return true;
      } else if (socket == this.player2) {
        this.player2 = undefined;
        this.p2_ready = false;
        if (this.ended == false) {
          this.scene.end(1);
          this.ended = true;
        }
      } else {
        this.spec.delete(socket.data.room);
      }
      return false;
    }

    join(socket: Socket) {
      socket.join(this.id)
      if (this.player1 == undefined) {
        this.player1 = socket;
      } else if (this.player2 == undefined) {
        this.player2 = socket;
      } else {
        this.spec.set(socket.data.room, socket)
      }
    }

    move(socket: Socket, dir: Direction) {
      if (this.scene) {
        if (socket == this.player1) {
          this.scene.getInput(1, dir);
        } else if (socket == this.player2) {
          this.scene.getInput(2, dir);
        }
      }
    }

    gameResult(result) {
      this.nsp.to(this.id).emit('result', result);
      this.nsp.to(this.id).emit('reset', null);
      this.p1_ready = false;
      this.p2_ready = false;
      this.ended = true;
    }

    getPlayer1() { if (this.player1) { return this.player1; }}
    getPlayer2() { if (this.player2) { return this.player2; }}
    getSpec() {
      let s: Socket[] = [];
      for (const m of this.spec) {
        s.push(m[1]);
      }
      return s;
    }
    getID() { return this.id }
    getName() { return this.name }
    getAccess() { return this.acc }
    getReady() { return ({ p1: this.p1_ready, p2: this.p2_ready }) }
    getTurbo() { return this.turbo }

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

  }
}

export default Pong.GameEngine;
