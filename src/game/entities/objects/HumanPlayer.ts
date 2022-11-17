import Utils from "../lib/Utils";
import Player from "./Player"
import { Direction } from "../lib/Directions";

export namespace Pong {
  export class HumanPlayer extends Player {

    private handleKeydown = (evt: KeyboardEvent) => {
      switch (evt.key) {
        case Utils.KeyCode.UP_ARROW:
          this.direction = Direction.UP;
          break;
        case Utils.KeyCode.DOWN_ARROW:
          this.direction = Direction.DOWN;
          break;
        default:
          this.direction = Direction.NONE;
      }
    };

    private handleKeyup = (_: KeyboardEvent) => {
      this.direction = Direction.NONE;
    };
  }
}

export default Pong.HumanPlayer;
