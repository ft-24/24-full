import { Headers, Injectable, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OauthTokenEntity } from 'src/auth/entity/oauthToken.entity';
import { Repository } from 'typeorm';
import { UserInfoDto } from './dto/userInfo.dto';
import { FriendListEntity } from './entity/friendList.entity';
import { UserEntity } from './entity/user.entity';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity) private usersRepository: Repository<UserEntity>,
		@InjectRepository(OauthTokenEntity) private tokenRepository: Repository<OauthTokenEntity>,
		@InjectRepository(FriendListEntity) private friendRepository: Repository<FriendListEntity>,
		
	) {}

	async getUserInfo(user) {
		const foundUser = await this.usersRepository.findOneBy({ id: user.user_id })
		if (!foundUser)
		{
			return {};
		}
		return {
			intra_id: foundUser.intra_id,
			nickname: foundUser.nickname,
			profile_url: foundUser.profile_url,
			stats: [],
			matching_history: []
		}
  }

  async getUserFriends(user) {
		const friendList = await this.friendRepository.findBy({ user_id: user.user_id });
		const ret = [];
		for(let ind in friendList) {
			let friend = await this.usersRepository.findOneBy({ id: friendList[ind].target_user_id })
			ret.push({
				nickname: friend.nickname,
				online: true,
			})
		}
		return ret;
  }

  async getFriendsProfile(id) {
		const user = await this.usersRepository.findOneBy({ intra_id: id });
		return {
			intra_id: user.intra_id,
			image: user.profile_url,
			nickname: user.nickname,
			stats: [],
			matching_history: []
		}
  }

	async changeUserNickname(user, nickname) {
		const foundUser = await this.usersRepository.findOneBy({ id: user.user_id })
		if (foundUser) {
			await this.usersRepository.update(foundUser, { nickname: nickname });
			return name;
		}
	}

	async changeUserTFA(user, two_auth) {
		const foundUser = await this.usersRepository.findOneBy({ id: user.user_id })
		if (foundUser) {
			await this.usersRepository.update(foundUser, { two_factor_Auth: two_auth });
			return two_auth;
		}
	}
}