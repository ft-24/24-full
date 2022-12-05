import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import { GameResultEntity } from './entities/gameResult.entity';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
    @InjectRepository(GameResultEntity) private gameResultRepository: Repository<GameResultEntity>
  ) {}

  async insertGameResult(result) {
    const insertedResult = await (await this.gameResultRepository.insert(result)).raw[0];
    const user1 = await this.userRepository.findOneBy({ id: insertedResult.user1_id });
    const user2 = await this.userRepository.findOneBy({ id: insertedResult.user2_id });
    return ({
      p1: user1.nickname,
      p2: user2.nickname,
      win: insertedResult.win,
      p1_score: insertedResult.user1_score, 
      p2_score: insertedResult.user2_score,
    });
  }
}
