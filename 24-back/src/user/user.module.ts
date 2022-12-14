import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockedUserEntity } from './entity/blockedUser.entity';
import { FriendListEntity } from './entity/friendList.entity';
import { MatchHistoryEntity } from './entity/matchHistory.entity';
import { UserEntity } from './entity/user.entity';
import { UserStatsEntity } from './entity/userStats.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
	  TypeOrmModule.forFeature([UserEntity, UserStatsEntity, MatchHistoryEntity, FriendListEntity, BlockedUserEntity]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
