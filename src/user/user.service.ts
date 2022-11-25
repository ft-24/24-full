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

	async getUserInfo(@Headers() headers: any) {
		// access token 으로 user id 찾기
		const user = await this.findByUser(headers.authorization);
		console.log('user:', user)
		// const user = await this.usersRepository.findOneBy({id: 2})
		if (!user)
		{
			return {
				intra_id: 'chanhuil',
				nickname: 'chanhui',
				profile_url: 'https://pbs.twimg.com/media/Fdh4hiDXkAAlK7H.jpg',
				stats: [],
				matching_history: [],
			};
		}
		return {
			intra_id: user.intra_id,
			nickname: user.nickname,
			profile_url: user.profile_url,
			stats: [],
			matching_history: []
		}
  }

  async getUserFriends(@Headers() headers: any) {
	const userId = (await this.tokenRepository.findOneBy({ access_token: headers.authorization })).user_id;
	const friendList = await this.friendRepository.findBy({user_id: userId});
	console.log(friendList)
	const ret = []
	for(let ind in friendList) {
		let friend = friendList[ind];
		ret.push(await this.usersRepository.findOneBy({id: friend.target_user_id}))
	}
	return ret;
  }

  async getFriendsProfile(@Headers() headers: any, friend: number) {
	if (!this.findByUser(headers.authorization)) {
		return null;
	}
	const user = await this.usersRepository.findOneBy({id: friend});
	return {
		intra_id: user.intra_id,
		image: user.profile_url,
		nickname: user.nickname,
		stats: [],
		matching_history: []
	}
  }

  async findByUser(access_token: string) {
	const userId = (await this.tokenRepository.findOneBy({ access_token: access_token })).user_id;
	return this.usersRepository.findOneBy({id: userId});
  }
}