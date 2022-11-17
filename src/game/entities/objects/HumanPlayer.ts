import Utils from "../lib/Utils";
import Player from "./Player"
import { Direction } from "../lib/Directions";

export namespace Pong {
  export class HumanPlayer extends Player {

    public handleMove = (input: Direction) => {
      this.direction = input;
    }
  }
}

export default Pong.HumanPlayer;
