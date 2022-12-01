import { Headers, Injectable, Logger, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { OauthTokenEntity } from 'src/auth/entity/oauthToken.entity';
import { Repository } from 'typeorm';
import { UserInfoDto } from './dto/userInfo.dto';
import { FriendListEntity } from './entity/friendList.entity';
import { MatchHistoryEntity } from './entity/matchHistory.entity';
import { UserEntity } from './entity/user.entity';
import { UserStatsEntity } from './entity/userStats.entity';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity) private userRepository: Repository<UserEntity>,
		@InjectRepository(UserStatsEntity) private userStatsRepository: Repository<UserStatsEntity>,
		@InjectRepository(MatchHistoryEntity) private matchHistoryRepository: Repository<MatchHistoryEntity>,
		@InjectRepository(OauthTokenEntity) private tokenRepository: Repository<OauthTokenEntity>,
		@InjectRepository(FriendListEntity) private friendRepository: Repository<FriendListEntity>,
		private readonly configService: ConfigService,
	) {}
	private logger = new Logger(UserService.name);

	async getUserInfo(user) {
		this.logger.log(user.user_id)
		const foundUser = await this.userRepository.findOneBy({ id: user.user_id })
		const foundUserStats = await this.userStatsRepository.findOneBy({ user_id: user.user_id });
		const matchHistory = await this.getUserMatchHistory(user);
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
			matching_history: matchHistory,
		}
  }

	async getUserMatchHistory(user) {
		const matching_history = [];
		const matchList = await this.matchHistoryRepository.findBy({ user_id: user.user_id });
		for (let m in matchList) {
			let opponent = await this.userRepository.findOneBy({ id: matchList[m].opponent_id })
			matching_history.push({
				opponent_nickname: opponent.nickname,
				opponent_url: opponent.profile_url,
				win: (matchList[m].user_score > matchList[m].opponent_score) ? true : false,
				score: matchList[m].user_score,
				opponent_score: matchList[m].opponent_score,
				mode: matchList[m].mode,
				played_at: matchList[m].playedAt,
			})
		}
		return matching_history;
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
		}
	}

	async changeUserProfilePic(user, file) {
		const foundUser = await this.userRepository.findOneBy({ id: user.user_id })
		if (foundUser) {
			await this.userRepository.update(foundUser, { profile_url: `${this.configService.get('url')}/${file.path}` });
		}
	}

}