import { Injectable, Logger } from '@nestjs/common';
import { RoutesMapper } from '@nestjs/core/middleware/routes-mapper';
import { InjectRepository } from '@nestjs/typeorm';
import { Namespace, Socket } from 'socket.io';
import { FriendListEntity } from 'src/user/entity/friendList.entity';
import { MatchHistoryEntity } from 'src/user/entity/matchHistory.entity';
import { UserEntity } from 'src/user/entity/user.entity';
import { UserStatsEntity } from 'src/user/entity/userStats.entity';
import { Repository } from 'typeorm';
import GameEngine from './lib/lib/GameEngine';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
    @InjectRepository(UserStatsEntity) private userStatsRepository: Repository<UserStatsEntity>,
    @InjectRepository(FriendListEntity) private friendListRepository: Repository<FriendListEntity>,
    @InjectRepository(MatchHistoryEntity) private matchHistoryRepository: Repository<MatchHistoryEntity>
  ) {}

  private logger = new Logger(GameService.name)

  async insertGameResult(result) {
    await this.matchHistoryRepository.insert({
      user_id: result.user1_id,
      opponent_id: result.user2_id,
      user_score: result.user1_score,
      opponent_score: result.user2_score,
      mode: result.mode,
      win: (result.win == 1) ? true : false,
      playedAt: new Date(),
    })
    await this.matchHistoryRepository.insert({
      user_id: result.user2_id,
      opponent_id: result.user1_id,
      user_score: result.user2_score,
      opponent_score: result.user1_score,
      mode: result.mode,
      win: (result.win == 2) ? true : false,
      playedAt: new Date(),
    })
    const user1 = await this.userRepository.findOneBy({ id: result.user1_id });
    const user2 = await this.userRepository.findOneBy({ id: result.user2_id });
    const userst1 = await this.userStatsRepository.findOneBy({ user_id: user1.id });
    const userst2 = await this.userStatsRepository.findOneBy({ user_id: user2.id });
    if (result.mode == 'ladder' && userst1 && userst2) {
      if (result.win == 1) {
        await this.userStatsRepository.update(userst1, { ladder_score: userst1.ladder_score + 10 });
        await this.userStatsRepository.update(userst2, { ladder_score: userst2.ladder_score - 10 });
      }
      else if (result.win == 2) {
        await this.userStatsRepository.update(userst1, { ladder_score: userst1.ladder_score - 10 });
        await this.userStatsRepository.update(userst2, { ladder_score: userst2.ladder_score + 10 });
      }
    }
    return ({
      p1: user1.nickname,
      p2: user2.nickname,
      win: result.win,
      p1_score: result.user1_score, 
      p2_score: result.user2_score,
    });
  }

  getGameById(g: GameEngine[], id: string) {
    let game: GameEngine = undefined;
    g.forEach(room => { if (room.getID() == id) { game = room; }})
    return game;
  }

  getJoinedGame(g: GameEngine[], player: Socket) {
    let game: GameEngine = undefined;
    for (const room of g) {
      if (player.rooms.has(room.getID())) {
        game = room;
      }
    }
    return game;
  }

  getJoinedGameBySocket(g: GameEngine[], player: Socket) {
    let game: GameEngine = undefined;
    for (const room of g) {
      if (room.getPlayer1() == player || room.getPlayer2() == player || room.getSpec().find((s)=>{return s == player}) != undefined) {
        game = room;
      }
    }
    return game;
  }

  async getInfoByGame(g: GameEngine, socket) {
    let player = [];
    let spec = [];

    for (const sp of g.getSpec()) {
      spec.push(await this.getUserInfo(socket.data.user_id, sp.data.user_id))
    }
    if (g.getPlayer1()) {
      player.push(await this.getUserInfo(socket.data.user_id, g.getPlayer1().data.user_id));
    }
    if (g.getPlayer2()) {
      player.push(await this.getUserInfo(socket.data.user_id, g.getPlayer2().data.user_id));
    }
    return ({
      id: g.getID(),
      name: g.getName(), 
      access_modifier: g.getAccess(),
      player_list: player,
      spectator_list: spec, 
      ready: g.getReady(),
      turbo: g.getTurbo(),
    })
  }

  async getPublicRooms(g: GameEngine[], socket) {
    let list = [];
    for (const room of g) {
      list.push(await this.getInfoByGame(room, socket))
    }
    return await list;
  }

  matchMaking(g: GameEngine[]): GameEngine {
    for (const room of g) {
      if (!room.getPlayer2()) {
        return room;
      }
    }
    return undefined;
  }

  async getUserInfo(user: number, user_id: number) {
    const foundUser = await this.userRepository.findOneBy({ id: user_id });
    const foundUserStats = await this.userStatsRepository.findOneBy({ user_id: user_id });
    const friend = await this.friendListRepository.findOneBy({ user_id: user, target_user_id: user_id });
    const ret = {
      intra_id: foundUser.intra_id,
      nickname: foundUser.nickname,
      profile_url: foundUser.profile_url,
      ladder_score: foundUserStats.ladder_score,
      is_my_friend: (friend) ? true : false
    }
    return (ret);
  }

  async findSocketByIntra(nsp: Namespace, name) {
    const foundUser = await this.userRepository.findOneBy({ intra_id: name });
    if (foundUser) {
      for (const s of nsp.sockets) {
        if (s[1].data.user_id && s[1].data.user_id == foundUser.id) {
          return s[1];
        } 
      }
    }
    return undefined;
  }
}
