import { Logger } from "@nestjs/common";
import Constants from "../Constants";
import GraphicalElement from "../lib/GraphicalElement";

export namespace Pong {

  export class Ball implements GraphicalElement {

    private speed = Constants.Game.BALL_SPEED;
    private size = Constants.Game.BALL_SIZE;

    private destroyed = false;

    private startX: number;
    private startY: number;

    private colour = Constants.Colours.BALL_COLOUR;

    public dx = 0;
    public dy = 0;

    constructor(public x = 0, public y = 0) {
      this.startX = x;
      this.startY = y;

      this.start();
    }

    isDestroyed() {
      return this.destroyed;
    }

    draw() {
      if (!this.destroyed) {
        // TODO : return value to client
        return ({
          x: this.x,
          y: this.y,
        })
      }
    }

    update(deltaTime: number) {
      let maxX: number = Constants.Game.CANVAS_WIDTH;
      let maxY: number = Constants.Game.CANVAS_HEIGHT;

      // ball moving
      this.x += this.dx * this.speed * deltaTime;
      this.y += this.dy * this.speed * deltaTime;

      // ball hit wall
      if (this.x >= maxX || this.x <= 0) {
        this.destroyed = true;
        this.dx = 0;
        this.dy = 0;
      }

      if (this.y >= maxY || this.y <= 0) {
        this.dy = -this.dy;
        if (this.y >= maxY) {
          this.y = maxY;
        } else {
          this.y = 0;
        }
      }
    }

    start() {
      this.x = this.startX;
      this.y = this.startY;

      setTimeout(() => {
        this.dx = 3;
        this.dy = 2;

        // 5050 chance of direction
        if (Math.random() > 0.5) {
          this.dx = -this.dx;
        }
        if (Math.random() > 0.5) {
          this.dy = -this.dy;
        }
      }, 2000)
    }

    restart() {
      this.destroyed = false;
      this.speed = Constants.Game.BALL_SPEED;
      this.dx = 0;
      this.dy = 0;
      this.start();
    }

    hit() {
      this.dx = -this.dx;
    }
  }
}

export default Pong.Ball;
