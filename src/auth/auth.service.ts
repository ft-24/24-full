import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import { OauthTokenEntity } from './entity/oauthToken.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(OauthTokenEntity)
    private oauthTokenRepository: Repository<OauthTokenEntity>,
    private jwtService: JwtService,
    private mailerService: MailerService,
    ){}
  private logger = new Logger(AuthService.name);

  async getToken(user) {
    const payload = { user_id: user.user_id };
    return {
      access_token: this.jwtService.sign(payload),
    }
  }

  async storeOauthTokens(user) {
    const getUserId = await (await this.userRepository.findOneBy({ intraID: user.intra_id })).id
    if (getUserId) {
      const foundUser = await this.oauthTokenRepository.findOneBy({ user_id: getUserId })
      if (!foundUser) {
        this.oauthTokenRepository.insert({
          user_id: getUserId,
          access_token: user.access_token,
          refresh_token: user.refresh_token,
        });
      }
    }
  }

  async destroyOauthTokens(token) {
    const decoded = this.jwtService.decode(token);
    const foundUser = await this.oauthTokenRepository.findOneBy({ user_id: decoded['user_id'] })
    if (foundUser) {
      this.oauthTokenRepository.delete(foundUser);
    }
  }

  async signup(user) {
    try {
      const foundUser = await this.userRepository.findOneBy({ intraID: user.intra_id });
      if (!foundUser) {
        const newUser = {
          intraID: user.intra_id,
          nickname: user.intra_id,
          email: user.email,
          profileURL: "",
        }
        await this.userRepository.insert(newUser);
      }
      return true;
    } catch(e) {
      this.logger.log(`${e} signup error`);
      return new HttpException(e, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
