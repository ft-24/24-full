import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ChatRoomEntity } from "./entity/chatRoom.entity";
import { ChatInfoEntity } from "./entity/chatInfo.entity";
import { UserEntity } from "src/user/entity/user.entity";
import * as bcrypt from 'bcrypt';
import { DmListEntity } from "./entity/dmList.entity";

@Injectable()
export class ChannelService {
	constructor(
		@InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
		@InjectRepository(DmListEntity) private dmListRepository: Repository<DmListEntity>,
		@InjectRepository(ChatRoomEntity) private chatRoomsRepository: Repository<ChatRoomEntity>,
		@InjectRepository(ChatInfoEntity) private chatInfoRepository: Repository<ChatInfoEntity>,
	) {}

	private logger = new Logger(ChannelService.name);

	async getAllChannels(user) {
		const channels = ( await this.chatRoomsRepository.find() );
		const ret = []
		for (let ch in channels) {
			ret.push({
				room_id: channels[ch].id,
				name: channels[ch].name,
				access_modifier: channels[ch].access_modifier
			})
		}
		return ret;
	}

	async getParticipateChannels(user) {
		const rooms = (await this.chatInfoRepository.findBy({ user_id: user.user_id }));
		const ret = []
		for (const i of rooms) {
			let room = await this.chatRoomsRepository.findOneBy({ id: i.room_id });
			if (room) {
				ret.push({
					room_id: room.id,
					name: room.name,
					access_modifier: room.access_modifier
				});
			}
		}
		return ret;
	}

	async getChannel(name) {
		const room = (await this.chatRoomsRepository.findOneBy({ name: name }));
		if (room) {
			return ({
				room_id: room.id,
				name: room.name,
				access_modifier: room.access_modifier,
			})
		}
	}

	async getParticipators(room) {
		const foundRoom = await this.chatRoomsRepository.findOneBy({ name: room })
		const ret = []
		if (foundRoom) {
			const rooms = await this.chatInfoRepository.findBy({ room_id: foundRoom.id });
			for (const i of rooms) {
				const user = await this.userRepository.findOneBy({ id: i.user_id });
				ret.push({
					intra_id: user.intra_id,
					nickname: user.nickname,
					profiles_url: user.profile_url,
					role: (foundRoom.owner_id == user.id) ? 'owner' : ((i.admin) ? 'admin' : 'user') 
				});
			}
		}
		return ret;
	}

	async passwordAuthorize(room, pass) {
		const foundRoom = await this.chatRoomsRepository.findOneBy({ name: room })
		if (!foundRoom) {
			return false;
		}
		if (pass) {
			if (await bcrypt.compare(pass, foundRoom.password)) {
				return true;
			}
			return false;
		} else {
			return false;
		}
	}

	async banUser(room, user, target) {
		const foundRoom = await this.chatRoomsRepository.findOneBy({ name: room });
		const foundTarget = await this.userRepository.findOneBy({ intra_id: target });
		if (!foundRoom || !foundTarget) {
			return ;
		}
		if (foundRoom.owner_id == user.user_id && foundTarget.id != user.user_id) {
			await this.chatInfoRepository.update({ room_id: foundRoom.id, user_id: foundTarget.id }, { ban: true });
		}
		else {
			const foundAdmin = await this.chatInfoRepository.findOneBy({ room_id: foundRoom.id, user_id: user.user_id });
			if (foundAdmin && foundAdmin.admin) {
				await this.chatInfoRepository.update({ room_id: foundRoom.id, user_id: foundTarget.id }, { ban: true });
			}
		}
	}

	async muteUser(room, user, target) {
		const foundRoom = await this.chatRoomsRepository.findOneBy({ name: room });
		const foundTarget = await this.userRepository.findOneBy({ intra_id: target });
		if (!foundRoom || !foundTarget) {
			return ;
		}
		if (foundRoom.owner_id == user.user_id) {
			await this.chatInfoRepository.update({ room_id: foundRoom.id, user_id: foundTarget.id }, { mute: new Date() });
		}
		else {
			const foundAdmin = await this.chatInfoRepository.findOneBy({ room_id: foundRoom.id, user_id: user.user_id });
			if (foundAdmin && foundAdmin.admin) {
				await this.chatInfoRepository.update({ room_id: foundRoom.id, user_id: foundTarget.id }, { mute: new Date() });
			}
		}
	}

	async getDMs(user) {
		const rooms = (await this.dmListRepository.findBy({ user1_id: user.user_id }));
		const ret = []
		for (const i of rooms) {
			let user = await this.userRepository.findOneBy({ id: i.user2_id });
			if (user) {
				ret.push({
					intra_id: user.intra_id,
					nickname: user.nickname,
				});
			}
		}
		return ret;
	}
}