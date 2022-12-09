import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entity/user.entity';
import { UserStatsEntity } from 'src/user/entity/userStats.entity';
import { Repository } from 'typeorm';
import { OauthTokenEntity } from './entity/oauthToken.entity';
import { TFACodeEntity } from './entity/TFACode.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(UserStatsEntity)
    private userStatsRepository: Repository<UserStatsEntity>,
    @InjectRepository(OauthTokenEntity)
    private oauthTokenRepository: Repository<OauthTokenEntity>,
    @InjectRepository(TFACodeEntity)
    private tfaCodeRepository: Repository<TFACodeEntity>,
    private jwtService: JwtService,
    private mailerService: MailerService,
		private readonly configService: ConfigService,
    ){}
  private logger = new Logger(AuthService.name);

  async getToken(user) {
    const payload = { user_id: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    }
  }

  async sendConfirmationEmail(user: UserEntity, code: string) {
    const { email, nickname } = await user;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to Splapong! Please Confirm Email',
      template: 'confirm',
      context: {
        nickname,
        code: code
      },
    });
  }

  async issueAccessToken(user) {
    const getUserId = await (await this.userRepository.findOneBy({ id: user.user_id }));
    if (getUserId) {
      const foundUser = await this.oauthTokenRepository.findOneBy({ user_id: getUserId.id })
      if (foundUser) {
        this.oauthTokenRepository.delete(foundUser);
      }
      const access_token = this.jwtService.sign({}, {
        expiresIn: `3d`,
      });

      this.oauthTokenRepository.insert({
        user_id: getUserId.id,
        access_token: access_token,
      });

      return (access_token);
    }
  }

  // async destroyOauthTokens(token) {
  //   const decoded = this.jwtService.decode(token);
  //   const foundUser = await this.oauthTokenRepository.findOneBy({ user_id: decoded['user_id'] })
  //   if (foundUser) {
  //     this.oauthTokenRepository.delete(foundUser);
  //   }
  // }

  async signup(user): Promise<UserEntity> {
    try {
      const foundUser = await this.userRepository.findOneBy({ intra_id: user.intra_id });
      if (!foundUser) {
        const newUser = {
          intra_id: user.int1ra_id,
          nickname: user.intra_id,
          email: user.email,
          profile_url: `${this.configService.get('url')}/upload/default.png`,
        }
        const insertedUser = await this.userRepository.insert(newUser);
        const newUserStats = {
          user_id: insertedUser.raw[0].id,
        }
        await this.userStatsRepository.insert(newUserStats);
        return insertedUser.raw[0];
      }
      const foundUserStats = await this.userStatsRepository.findOneBy({ user_id: foundUser.id });
      if (!foundUserStats) {
        const newUserStats = {
          user_id: foundUser.id,
        }
        await this.userStatsRepository.insert(newUserStats);
      }
      return foundUser;
    } catch(e) {
      this.logger.log(`${e} signup error`);
    }
  }

  async generate2FA(user: UserEntity): Promise<number> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    this.sendConfirmationEmail(user, code);
    const tfaCode = {
      user_id: user.id,
      code: code,
    }
    const rt = await this.tfaCodeRepository.insert(tfaCode);
    return rt.identifiers[0].id;
  }

  async validate2FA(id, code): Promise<number> {
    const findId = await this.tfaCodeRepository.findOneBy({ id: id });
    if (findId && findId.code == code)
    {
      return findId.user_id;
    }
    return undefined;
  }
}
