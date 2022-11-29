import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OauthTokenEntity } from 'src/auth/entity/oauthToken.entity';
import { FriendListEntity } from './entity/friendList.entity';
import { UserEntity } from './entity/user.entity';
import { UserStatsEntity } from './entity/userStats.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
	TypeOrmModule.forFeature([UserEntity, UserStatsEntity, OauthTokenEntity, FriendListEntity]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
