import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserService } from "src/user/user.service";
import { Repository } from "typeorm";
import { ChatRoomEntity } from "./entity/chatRoom.entity";
import { RoomUserInfoEntity } from "./entity/RoomUserInfo.entity";

@Injectable()
export class ChannelService {
	constructor(
		@InjectRepository(ChatRoomEntity) private chatRoomsRepository: Repository<ChatRoomEntity>,
		@InjectRepository(RoomUserInfoEntity) private roomUserInfoRepository: Repository<RoomUserInfoEntity>,
		private userService: UserService,
	) {}

	async getAllChannels(user) {
		/* select id, owner_id, access_modifier, name from chat-rooms cr, RoomUserInfo rinfo
		   where cr.id  */
		const channels = (await this.chatRoomsRepository.find());
		const ret = []
		for (let ch in channels) {
			let roominfo = await this.roomUserInfoRepository.findOneBy({id: channels[ch].id, user_id: user.id})
			if (roominfo.ban == true) {
				continue
			}
			ret.push({
				room_id: channels[ch].id,
				name: channels[ch].name,
				access_modifier: channels[ch].access_modifier
			})
		}
		return ret;
	}

	async getParticipateChannels(user, intra_id: string) {
		if (user.intra_id == intra_id) {
			const rooms = (await this.roomUserInfoRepository.findBy({user_id: user.id}));
			const ret = []
			for(let i in rooms) {
				if (rooms[i].ban == true) {
					continue;
				}
				let room = await this.chatRoomsRepository.findOneBy({id: rooms[i].room_id});
				ret.push({
					room_id: room.id,
					name: room.name,
					access_modifier: room.access_modifier
				});
			}
			return ret;
		}
		return null;
	}
}