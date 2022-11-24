import { Headers, Injectable, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OauthTokenEntity } from 'src/auth/entity/oauthToken.entity';
import { Repository } from 'typeorm';
import { UserInfoDto } from './dto/userInfo.dto';
import { UserEntity } from './entity/user.entity';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity) private usersRepository: Repository<UserEntity>,
		@InjectRepository(OauthTokenEntity) private tokenRepository: Repository<OauthTokenEntity>,
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

  async findByUser(access_token: string) {
	const userId = (await this.tokenRepository.findOneBy({ access_token: access_token })).user_id;
	return this.usersRepository.findOneBy({id: userId});
  }
}