import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { ChatEntity } from './entity/chat.entity';
import { ChatRoomEntity } from './entity/chatRoom.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatEntity, ChatRoomEntity]),
  ],
  controllers: [],
  providers: [ChatGateway, ChatService],
})
export class ChatModule {}

