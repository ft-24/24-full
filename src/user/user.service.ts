import { Headers, Injectable, Res } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserInfoDto } from './dto/userInfo.dto';
import { UserEntity } from './entity/user.entity';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(UserEntity) private usersRepository: Repository<UserEntity>,
	) {}
  async getUserInfo(@Headers() headers: any, @Res() res) {
	// access token 으로 user id 찾기
	// const userId = this.findUserId(headers.authorization);
	const user = await this.usersRepository.findOneBy({id: 2})
	return res.status(200).send(new UserInfoDto(user))
  }

//   async findUserId(access_token: string): number {
	// return this.tokenRepository.findOneBy({access_token: access_token}).user_id;
//   }
}