import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlockedUserEntity } from 'src/user/entity/blockedUser.entity';
import { UserEntity } from 'src/user/entity/user.entity';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatEntity } from './entity/chat.entity';
import { ChatInfoEntity } from './entity/chatInfo.entity';
import { ChatRoomEntity } from './entity/chatRoom.entity';
import { DMEntity } from './entity/dm.entity';
import { DmChannelEntity } from './entity/dmChannel.entity';
import { DmListEntity } from './entity/dmList.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, ChatEntity, ChatRoomEntity, ChatInfoEntity, DMEntity, DmChannelEntity, DmListEntity, BlockedUserEntity]),
  ],
  controllers: [],
  providers: [ChatGateway, ChatService, JwtService],
})
export class ChatModule {}

