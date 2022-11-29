import { Headers, Injectable, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OauthTokenEntity } from 'src/auth/entity/oauthToken.entity';
import { Repository } from 'typeorm';
import { UserInfoDto } from './dto/userInfo.dto';
import { FriendListEntity } from './entity/friendList.entity';
import { UserEntity } from './entity/user.entity';
import { UserStatsEntity } from './entity/userStats.entity';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
		@InjectRepository(UserStatsEntity) private userStatsRepository: Repository<UserStatsEntity>,
		@InjectRepository(OauthTokenEntity) private tokenRepository: Repository<OauthTokenEntity>,
		@InjectRepository(FriendListEntity) private friendRepository: Repository<FriendListEntity>,
	) {}

	async getUserInfo(user) {
		const foundUser = await this.userRepository.findOneBy({ id: user.user_id })
		const foundUserStats = await this.userStatsRepository.findOneBy({ user_id: user.user_id });
		if (!foundUser || !foundUserStats)
		{
			return {};
		}
		return {
			intra_id: foundUser.intra_id,
			nickname: foundUser.nickname,
			profile_url: foundUser.profile_url,
			stats: {
				wins: foundUserStats.wins,
				loses: foundUserStats.loses,
				ladder_score: foundUserStats.ladder_score,
				arcade_score: foundUserStats.arcade_score,
			},
			matching_history: []
		}
  }

  async getUserFriends(user) {
		const friendList = await this.friendRepository.findBy({ user_id: user.user_id });
		const ret = [];
		for(let ind in friendList) {
			let friend = await this.userRepository.findOneBy({ id: friendList[ind].target_user_id })
			ret.push({
				nickname: friend.nickname,
				online: true,
			})
		}
		return ret;
  }

  async getFriendsProfile(id) {
		const user = await this.userRepository.findOneBy({ intra_id: id });
		return {
			intra_id: user.intra_id,
			image: user.profile_url,
			nickname: user.nickname,
			stats: [],
			matching_history: []
		}
  }

	async changeUserNickname(user, nickname) {
		const foundUser = await this.userRepository.findOneBy({ id: user.user_id })
		if (foundUser) {
			await this.userRepository.update(foundUser, { nickname: nickname });
			return nickname;
		}
	}

	async changeUserTFA(user, two_auth) {
		const foundUser = await this.userRepository.findOneBy({ id: user.user_id })
		if (foundUser) {
			await this.userRepository.update(foundUser, { two_factor_Auth: two_auth });
			return two_auth;
		}
	}

	async changeUserArcade(user, arcade) {
		const foundUserStats = await this.userStatsRepository.findOneBy({ user_id: user.user_id })
		if (foundUserStats) {
			await this.userStatsRepository.update(foundUserStats, { arcade_score: arcade });
			return arcade;
		}
	}

}