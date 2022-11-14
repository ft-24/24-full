import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OauthTokenEntity } from './entity/oauthToken.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(OauthTokenEntity)
    private oauthTokenRepository: Repository<OauthTokenEntity>,
    private jwtService: JwtService,
    ){}

  async getToken(user) {
    const payload = { username: 'chanhuil', sub: 'userID' };
    return {
      access_token: this.jwtService.sign(payload),
    }
  }

  async storeOauthTokens(user) {
    const foundUser = await this.oauthTokenRepository.findOneBy({ user_id: user.intra_id })
    if (!foundUser) {
      this.oauthTokenRepository.insert({
        user_id: user.intra_id,
        access_token: user.access_token,
        refresh_token: user.refresh_token,
      });
    }
  }
}
