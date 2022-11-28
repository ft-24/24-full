import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatEntity } from './entity/chat.entity';
import { ChatRoomEntity } from './entity/chatRoom.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRoomEntity)
    private chatRoomRepository: Repository<ChatRoomEntity>,
    @InjectRepository(ChatEntity)
    private chatRepository: Repository<ChatEntity>,
  ){}
  private logger = new Logger(ChatService.name);

  async createNewRoom(room) {
    try {
      const foundRoom = await this.chatRoomRepository.findOneBy({ name: room.name });
      if (!foundRoom) {

        const salt = await bcrypt.genSalt();
        const hash = await bcrypt.hash(room.password, salt);
        const newRoom = {
          owner_id: room.owner_id,
          name: room.name,
          access_modifier: room.access_modifier,
          password: hash,
          create_data: Date.now(),
          update_data: Date.now(),
        }
        const insertedRoom = await this.chatRoomRepository.insert(newRoom);
        return insertedRoom.raw[0];
      }
      return foundRoom;
    } catch(e) {

    }
  }
}
