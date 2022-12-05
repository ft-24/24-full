import Scene from "../lib/Scene"
import Constants from "../Constants"
import Ball from "../objects/Ball";
import Player from "../objects/Player";
import HumanPlayer from "../objects/HumanPlayer"
import EndScene from "./EndScene";
import GraphicalElement from "../lib/GraphicalElement"
import { Logger } from "@nestjs/common";
import { Socket } from "dgram";
import { Direction } from "../lib/Directions";
import { GameService } from "src/game/game.service";

namespace Pong {
  export class MainScene extends Scene {

    private playerPadding = Constants.Game.PLAYER_PADDING;
    private ball: Ball;
    private player1: HumanPlayer;
    private player2: HumanPlayer;
    private winningScore = Constants.Game.WINNING_SCORE;

    private objectsInScene: Array<GraphicalElement> = [];

    constructor(private gameService: GameService) {
      super();
      const width = Constants.Game.CANVAS_WIDTH;
      const height = Constants.Game.CANVAS_HEIGHT;
      const centerH = width / 2;
      const centerV = height / 2;

      // Position objects
      this.ball = new Ball(centerH, centerV);
      this.player1 = new HumanPlayer(this.playerPadding,
                            centerV, this.ball);

      let player2Offset = width
                            - (this.playerPadding + this.player1.paddleWidth)
      this.player2 = new HumanPlayer(player2Offset, centerV, this.ball);

      this.objectsInScene.push(this.player1);
      this.objectsInScene.push(this.player2);
      this.objectsInScene.push(this.ball);

      this.ball.start();
    }

    getInput(player: number, input: Direction) {
      if (player == 1)
      {
        this.player1.handleMove(input);
      } else {
        this.player2.handleMove(input);
      }
    }

    draw() {
      if (this.ball) {
        return ({
          p1: this.player1.draw(),
          p2: this.player2.draw(),
          ball: this.ball.draw(),
          score: {
            p1: this.player1.getScore(),
            p2: this.player2.getScore(),
          },
        });
      }
      else {
        return ({
          p1: this.player1.draw(),
          p2: this.player2.draw(),
          ball: {
            x: 600,
            y: 300,
          },
          score: {
            p1: this.player1.getScore(),
            p2: this.player2.getScore(),
          },
        });
      }
      
    }

    load() {
    }

    unload() {
    }

    update(deltaTime: number) {
      if (this.ball.isDestroyed()) {
        if (this.ball.x <= 0) {
          this.player2.givePoint();
        } else {
          this.player1.givePoint();
        }
        this.ball.restart();
      }

      if (this.player1.getScore() >= this.winningScore || this.player2.getScore() >= this.winningScore) {
        this.gameContext.gameResult(this.gameService.insertGameResult({
          user1_id: this.gameContext.getPlayer1(),
          user2_id: this.gameContext.getPlayer2(),
          win: (this.player1.getScore() >= this.player2.getScore()) ? 1 : 2,
          user1_score: this.player1.getScore(),
          user2_score: this.player2.getScore(),
        }))
        // should delete both GameEngine & MainScene 
        delete this.gameContext;
      } else {
        // TODO : Draw remaining objects
        this.objectsInScene.forEach(object => object.update(deltaTime));
      }
    }

    restart() {
      this.player1.resetScore();
      this.player2.resetScore();
      this.ball.restart();
    }

  }
}

export default Pong.MainScene;
