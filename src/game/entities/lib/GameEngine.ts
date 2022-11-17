import Utils from './Utils';
import Scene from './Scene';
import MainScene from '../scene/Mainscene';

namespace Pong {

  export class GameEngine {

    private scene!: Scene;

    constructor() {
      let menu = new MainScene();
      this.loadScene(menu);
    }

    draw() {
      return this.scene.draw();
    }

    update(deltaTime: number) {
      this.scene.update(deltaTime);
    }

    getInput() {
      this.scene.getInput();
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
  }

}

export default Pong.GameEngine;
