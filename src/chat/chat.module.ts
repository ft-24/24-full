import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entity/user.entity';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatEntity } from './entity/chat.entity';
import { ChatRoomEntity } from './entity/chatRoom.entity';
import { DMEntity } from './entity/dm.entity';
import { DmChannelEntity } from './entity/dmChannel.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, ChatEntity, ChatRoomEntity, DMEntity, DmChannelEntity]),
  ],
  controllers: [],
  providers: [ChatGateway, ChatService, JwtService],
})
export class ChatModule {}

