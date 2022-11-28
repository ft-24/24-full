import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatEntity } from './entity/chat.entity';
import { ChatRoomEntity } from './entity/chatRoom.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRoomEntity)
    private chatRoomRepository: Repository<ChatRoomEntity>,
    @InjectRepository(ChatEntity)
    private chatRepository: Repository<ChatEntity>,
  ){}
  private logger = new Logger(ChatService.name);

  
}
