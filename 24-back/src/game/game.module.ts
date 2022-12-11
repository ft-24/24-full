import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FriendListEntity } from 'src/user/entity/friendList.entity';
import { MatchHistoryEntity } from 'src/user/entity/matchHistory.entity';
import { UserEntity } from 'src/user/entity/user.entity';
import { UserStatsEntity } from 'src/user/entity/userStats.entity';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserStatsEntity, FriendListEntity, MatchHistoryEntity])
  ],
  controllers: [],
  providers: [GameGateway, GameService],
})
export class GameModule {}
