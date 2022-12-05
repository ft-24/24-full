import Scene from "../lib/Scene";
import Player from "../objects/Player";

export namespace Pong {

  export class EndScene extends Scene {

    private winner: Player;

    constructor(winner: Player) {
      super();
      this.winner = winner;
    }

    // Bounds 'this' to the class
    private handleClick = (evt: Event) => {
    }

    draw() {
      // TODO : return result of game to clients;
    }

    update() {
    }

    getInput() {
    }

    load(params: any) {

    }

    unload() {

    }
  }
}

export default Pong.EndScene;
