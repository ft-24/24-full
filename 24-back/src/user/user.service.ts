import { Headers, Injectable, Logger, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserInfoDto } from './dto/userInfo.dto';
import { BlockedUserEntity } from './entity/blockedUser.entity';
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
		@InjectRepository(FriendListEntity) private friendRepository: Repository<FriendListEntity>,
		@InjectRepository(BlockedUserEntity) private blockedUserRepository: Repository<BlockedUserEntity>,
		private readonly configService: ConfigService,
	) {}
	private logger = new Logger(UserService.name);

	async getInfo(user) {
		if (user == undefined) {
			return ;
		}
		const foundUserStats = await this.userStatsRepository.findOneBy({ user_id: user.id });
		const matchHistory = await this.getUserMatchHistory(user);
		if (!user || !foundUserStats)
		{
			return null;
		}
		return {
			intra_id: user.intra_id,
			nickname: user.nickname,
			profile_url: user.profile_url,
			stats: {
				wins: foundUserStats.wins,
				loses: foundUserStats.loses,
				ladder_score: foundUserStats.ladder_score,
				arcade_score: foundUserStats.arcade_score,
			},
			matching_history: matchHistory,
		}
	}

	async getUserInfo(user) {
		const foundUser = await this.userRepository.findOneBy({ id: user.user_id })
		if (foundUser) {
			return await this.getInfo(foundUser);
		}
  }

	async getUsersInfo(user) {
		const foundUsers = await this.userRepository.find()
		const friends = await this.friendRepository.findBy({ user_id: user.user_id })
		let users = [];
		for (const u of foundUsers) {
			if (user.user_id != u.id) {
				users.push({
					intra_id: u.intra_id,
					nickname: u.nickname,
					is_friend: friends.find((f) => { if (f.target_user_id == u.id) { return true; } }) != undefined ? true : false,
				})
			}
		}
		return (users);
  }

	async getUserMatchHistory(user) {
		const matching_history = [];
		const matchList = await this.matchHistoryRepository.findBy({ user_id: user.id });
		for (let m in matchList) {
			let opponent = await this.userRepository.findOneBy({ id: matchList[m].opponent_id })
			matching_history.push({
				opponent_nickname: opponent.nickname,
				opponent_url: opponent.profile_url,
				win: matchList[m].win,
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
			if (friend) {
				ret.push({
					intra_id: friend.intra_id,
					nickname: friend.nickname,
					online: friend.online,
				})
			}
		}
		return ret;
  }

  async getFriendsProfile(user, id) {
		const foundUser = await this.userRepository.findOneBy({ intra_id: id });
		if (!foundUser) {
			return null;
		}
		const info = await this.getInfo(foundUser);
		const friend = await this.friendRepository.findOneBy({ user_id: user.user_id, target_user_id: foundUser.id })
		const block = await this.blockedUserRepository.findOneBy({ user_id: user.user_id, target_user_id: foundUser.id })
		if (info != undefined) {
			return ({
				intra_id: info.intra_id,
				nickname: info.nickname,
				profile_url: info.profile_url,
				stats: info.stats,
				matching_history: info.matching_history,
				is_my_friend: friend ? true : false,
				is_blocked: block ? true : false,
			});
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

	async changeUserArcade(user, arcade: string) {
		const foundUserStats = await this.userStatsRepository.findOneBy({ user_id: user.user_id })
		if (foundUserStats) {
			if (parseFloat(arcade) >= foundUserStats.arcade_score) {
				await this.userStatsRepository.update(foundUserStats, { arcade_score: parseFloat(arcade) });
			}
		}
	}

	async changeUserProfilePic(user, file) {
		const foundUser = await this.userRepository.findOneBy({ id: user.user_id })
		if (foundUser) {
			await this.userRepository.update(foundUser, { profile_url: `${this.configService.get('url')}/${file.path}` });
		}
	}

	async addUserFriend(user, friend) {
		const foundUser = await this.userRepository.findOneBy({ id: user.user_id })
		const foundFriend = await this.userRepository.findOneBy({ intra_id: friend })
		if (foundUser && foundFriend) {
			this.friendRepository.insert({
				user_id: foundUser.id,
				target_user_id: foundFriend.id,
			});
		}
	}

	async removeUserFriend(user, friend) {
		const foundFriend = await this.userRepository.findOneBy({ intra_id: friend });
		if (foundFriend) {
			const foundFriendList = await this.friendRepository.findOneBy({ user_id: user.user_id, target_user_id: foundFriend.id });
			await this.friendRepository.delete(foundFriendList)
		}
	}

	async blockUser(user, intra_id, is_blocked) {
		const foundUser = await this.userRepository.findOneBy({ id: user.user_id });
		const foundTarget = await this.userRepository.findOneBy({ intra_id: intra_id });
		if (foundUser && foundTarget) {
			if (is_blocked == false) {
				const foundBlock = await this.blockedUserRepository.findOneBy({ user_id: foundUser.id, target_user_id: foundTarget.id })
				if (!foundBlock) {
					await this.blockedUserRepository.insert({ user_id: foundUser.id, target_user_id: foundTarget.id });
				}
				return false;
			} else if (is_blocked == true) {
				const foundBlock = await this.blockedUserRepository.findOneBy({ user_id: foundUser.id, target_user_id: foundTarget.id })
				if (foundBlock) {
					await this.blockedUserRepository.delete(foundBlock);
				}
				return true;
			}
		}

	}

}