import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChatEntity } from './entity/chat.entity';
import { ChatRoomEntity } from './entity/chatRoom.entity';
import * as bcrypt from 'bcrypt';
import { DmChannelEntity } from './entity/dmChannel.entity';
import { v4 as uuid } from 'uuid';
import { DMEntity } from './entity/dm.entity';
import { UserEntity } from 'src/user/entity/user.entity';
import { Socket } from 'socket.io';
import { ChatInfoEntity } from './entity/chatInfo.entity';
import { BlockedUserEntity } from 'src/user/entity/blockedUser.entity';
import { DmListEntity } from './entity/dmList.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(ChatRoomEntity)
    private chatRoomRepository: Repository<ChatRoomEntity>,
    @InjectRepository(ChatEntity)
    private chatRepository: Repository<ChatEntity>,
    @InjectRepository(DMEntity)
    private dmRepository: Repository<DMEntity>,
    @InjectRepository(DmChannelEntity)
    private dmChannelRepository: Repository<DmChannelEntity>,
    @InjectRepository(DmListEntity)
    private dmListRepository: Repository<DmListEntity>,
    @InjectRepository(ChatInfoEntity)
    private chatInfoRepository: Repository<ChatInfoEntity>,
    @InjectRepository(BlockedUserEntity)
    private blockedUserRepository: Repository<BlockedUserEntity>,
  ){}
  private logger = new Logger(ChatService.name);

  async createNewRoom(socket: Socket, room) {
    try {
      const foundRoom = await this.chatRoomRepository.findOneBy({ name: room.name });
      const foundOwner = await this.userRepository.findOneBy({ id: socket.data.user_id })
      if (!foundRoom) {
        let hash = "";
        if (room.password) {
          const salt = await bcrypt.genSalt();
          hash = await bcrypt.hash(room.password, salt);
        }
        const insertedRoom = await this.chatRoomRepository.insert({
          owner_id: foundOwner.id,
          name: room.name,
          access_modifier: room.access_modifier,
          password: hash,
          create_date: new Date(),
          update_date: new Date(),
        });
        return ``;
      }
      return `Room named ${room.name} is already exists!`;
    } catch(e) {

    }
  }

  async createDM(socket: Socket, intra) {
    try {
      const foundOther = await this.userRepository.findOneBy({ intra_id: intra })
      const foundDM = await this.dmListRepository.findOneBy({ user1_id: socket.data.user_id, user2_id: foundOther.id });
      if (!foundDM) {
        await this.dmListRepository.insert({
          user1_id: socket.data.user_id,
          user2_id: foundOther.id,
        });
        await this.dmListRepository.insert({
          user1_id: foundOther.id,
          user2_id: socket.data.user_id,
        });
        return ``;
      }
      return `DM is already exists!`;
    } catch(e) {

    }
  }

  async updateNewRoom(socket: Socket, room) {
    try {
      const foundRoom = await this.chatRoomRepository.findOneBy({ name: room.name });
      if (foundRoom && socket.data.user_id == foundRoom.owner_id) {
        let hash = "";
        if (room.password) {
          const salt = await bcrypt.genSalt();
          hash = await bcrypt.hash(room.password, salt);
        } else {
          hash = foundRoom.password;
        }
        await this.chatRoomRepository.update(foundRoom, {
          name: room.name,
          access_modifier: room.access_modifier,
          password: hash,
          update_date: new Date(),
        })
        return ``;
      }
      return `Room named ${room.name} doesn't exist!`;
    } catch(e) {

    }
  }

  async saveUser(user_id) {
    const foundUser = await this.dmChannelRepository.findOneBy({ user_id: user_id })
    if (!foundUser) {
      const newUser = {
        room: `${uuid()}`,
        user_id: user_id,
      }
      await this.dmChannelRepository.insert(newUser);
      const insertedUser = await this.dmChannelRepository.findOneBy({ user_id: user_id });
      return insertedUser;
    }
    return foundUser
  }

  async findUser(id) {
    const foundUser = await this.dmChannelRepository.findOneBy({ id: id });
    if (foundUser) {
      return foundUser;
    }
  }

  async userOnline(user) {
    await this.userRepository.update({ id: user }, { online: true })
  }

  async userOffline(user) {
    await this.userRepository.update({ id: user }, { online: false })
  }

  async saveDM(socket, msg) {
    const sender = await this.userRepository.findOneBy({ id: socket.data.user_id })
    const receiver = await this.userRepository.findOneBy({ intra_id: msg.receiver })
    if (sender && receiver) {
      const insertedDM = await this.dmRepository.insert({
        sender: sender.id,
        receiver: receiver.id,
        chat: msg.msg,
        time: new Date(),
      });
    }
    return ({
      intra_id: sender.intra_id,
      profile_url: sender.profile_url,
      nickname: sender.nickname,
      chat: msg.msg,
      time: (new Date()).toString(),
    });
  }

  async saveChat(socket, msg) {
    const sender = await this.userRepository.findOneBy({ id: socket.data.user_id });
    const room = await this.chatRoomRepository.findOneBy({ name: msg.receiver })
    if (room && sender) {
      const insertedChat = await this.chatRepository.insert({
        room_id: room.id,
        sender: sender.id,
        chat: msg.msg,
        time: new Date(),
      });
    }
    return ({
      intra_id: sender.intra_id,
      profile_url: sender.profile_url,
      nickname: sender.nickname,
      chat: msg.msg,
      time: (new Date()).toString(),
    })
  }

  async getChat(socket, room) {
    let chats = [];
    const foundRoom = await this.chatRoomRepository.findOneBy({ name: room })
    if (foundRoom) {
      const foundChats = await this.chatRepository.findBy({ room_id: foundRoom.id })
      for (const c of foundChats) {
        const foundSender = await this.userRepository.findOneBy({ id: c.sender })
        if (!await this.isBlocked(socket.data.user_id, foundSender.id)) {
          chats.push({
            intra_id: foundSender.intra_id,
            profile_url: foundSender.profile_url,
            nickname: foundSender.nickname,
            chat: c.chat,
            time: (c.time).toString(),
          })
        }
      }
    }
    return chats;
  }

  async getDM(socket, intra) {
    let dms = [];
    const foundSender = await this.userRepository.findOneBy({ intra_id: intra })
    if (foundSender && !await this.isBlocked(socket.data.user_id, foundSender.id)) {
      const foundDMs = await this.dmRepository.find({
        where: [
          { sender: socket.data.user_id, receiver: foundSender.id },
          { sender: foundSender.id, receiver: socket.data.user_id }
        ], 
      })
      for (const dm of foundDMs) {
        dms.push({
          intra_id: foundSender.intra_id,
          profile_url: foundSender.profile_url,
          nickname: foundSender.nickname,
          chat: dm.chat,
          time: (dm.time).toString(),
        })
      }
    }
    return dms;
  }

  async joinChat(user, room) {
    const foundUser = await this.userRepository.findOneBy({ id: user })
    const foundRoom = await this.chatRoomRepository.findOneBy({ name: room })
    if (foundUser && foundRoom) {
      const foundInfo = await this.chatInfoRepository.findOneBy({ user_id: foundUser.id, room_id: foundRoom.id })
      if (!foundInfo) {
        await this.chatInfoRepository.insert({
          user_id: foundUser.id,
          room_id: foundRoom.id,
        })
      }
    }
  }

  async findRoom(intra) {
    const foundUser = (await this.userRepository.findOneBy({ intra_id: intra }));
    if (foundUser) {
      return (await this.dmChannelRepository.findOneBy({ user_id: foundUser.id })).room;
    }
  }

  async findRoomByIntra(intra_id) {
    const foundUser = (await this.userRepository.findOneBy({ intra_id: intra_id }));
    if (foundUser) {
      return (await this.dmChannelRepository.findOneBy({ user_id: foundUser.id })).room;
    }
  }

  async getUserByIntra(intra_id) {
    const foundUser = (await this.userRepository.findOneBy({ intra_id: intra_id }));
    if (foundUser) {
      return foundUser;
    }
  }

  async getUserBySocket(socket: Socket) {
    if (socket.data.intra_id) {
      const foundUser = await this.userRepository.findOneBy({ id: socket.data.intra_id });
      if (foundUser) {
        return foundUser
      }
    }
    return undefined;
  }

  async isBlocked(user: number, target: number) {
    const foundBlock = await this.blockedUserRepository.findOneBy({ user_id: user, target_user_id: target});
    if (foundBlock) {
      return true;
    } else {
      return false;
    }
  }

  async isBlockedByNickname(user: string, target: number) {
    const foundUser = await this.userRepository.findOneBy({ nickname: user });
    if (foundUser) {
      const foundBlock = await this.blockedUserRepository.findOneBy({ user_id: foundUser.id, target_user_id: target});
      if (foundBlock) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

  async isBlockedByIntra(user: string, target: number) {
    const foundUser = await this.userRepository.findOneBy({ intra_id: user });
    if (foundUser) {
      const foundBlock = await this.blockedUserRepository.findOneBy({ user_id: foundUser.id, target_user_id: target});
      if (foundBlock) {
        return true;
      } else {
        return false;
      }
    }
    return false;
  }

  async findTo(intra) {
    const foundUser = await this.userRepository.findOneBy({ intra_id: intra });
    if (foundUser) {
      const foundDMch = await this.dmChannelRepository.findOneBy({ user_id: foundUser.id });
      if (foundDMch) {
        return foundDMch.room;
      }
    }
    return undefined;
  }

  async checkBan(socket, room) {
    const foundRoom = await this.chatRoomRepository.findOneBy({ name: room })
    if (foundRoom) {
      const ban = await this.chatInfoRepository.findOneBy({ user_id: socket.data.user_id, room_id: foundRoom.id});
      if (ban && ban.ban == true) {
        return true;
      }
    }
    return false;
  }

  async checkMute(socket, room) {
    const foundRoom = await this.chatRoomRepository.findOneBy({ name: room })
    if (foundRoom) {
      const mute = await this.chatInfoRepository.findOneBy({ user_id: socket.data.user_id, room_id: foundRoom.id});
      if (mute && mute.mute) {
        const endingTime: Date = new Date(mute.mute);
        endingTime.setMinutes(endingTime.getMinutes() + 1);
        if (endingTime.getTime() > new Date().getTime()) {
          return true;
        }
      }
    }
    return false;
  }

	async adminUser(room, user, target) {
		const foundRoom = await this.chatRoomRepository.findOneBy({ name: room });
		const foundTarget = await this.userRepository.findOneBy({ intra_id: target });
		if (!foundRoom || !foundTarget) {
			return false;
		}
		if (foundRoom.owner_id == user) {
			await this.chatInfoRepository.update({ room_id: foundRoom.id, user_id: foundTarget.id }, { admin: true });
			return true;
		}
		return false;
	}

	async removeAdminUser(room, user, target) {
		const foundRoom = await this.chatRoomRepository.findOneBy({ name: room });
		const foundTarget = await this.userRepository.findOneBy({ intra_id: target });
		if (!foundRoom || !foundTarget) {
			return true;
		}
		if (foundRoom.owner_id == user) {
			await this.chatInfoRepository.update({ room_id: foundRoom.id, user_id: foundTarget.id }, { admin: false });
			return false;
		}
		return true;
	}

  async quitRoom(id, name) {
    const foundRoom = await this.chatRoomRepository.findOneBy({ name: name });
    if (foundRoom) {
      if (foundRoom.owner_id == id) {
        await this.chatRoomRepository.update(foundRoom, { owner_id: null })
      }
      const foundInfo = await this.chatInfoRepository.findOneBy({ user_id: id, room_id: foundRoom.id });
      if (foundInfo) {
        await this.chatInfoRepository.remove(foundInfo);
      }
      const shouldDeleteRoom = await this.chatInfoRepository.findBy({ room_id: foundRoom.id })
      if (shouldDeleteRoom && shouldDeleteRoom.length == 0 ) {
        await this.chatRoomRepository.remove(foundRoom);
        const foundChats = await this.chatRepository.findBy({ room_id: foundRoom.id });
        if (foundChats) {
          await this.chatRepository.remove(foundChats);
        }
      }
    }
  }
}
