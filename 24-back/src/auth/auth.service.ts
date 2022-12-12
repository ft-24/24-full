import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entity/user.entity';
import { UserStatsEntity } from 'src/user/entity/userStats.entity';
import { Repository } from 'typeorm';
import { TFACodeEntity } from './entity/TFACode.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(UserStatsEntity)
    private userStatsRepository: Repository<UserStatsEntity>,
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

  async signup(user): Promise<any> {
    try {
      const foundUser = await this.userRepository.findOneBy({ intra_id: user.intra_id });
      if (!foundUser) {
        let nick = user.intra_id;
        while (await this.userRepository.findOneBy({ nickname: nick })) {
          nick = `${nick}_`;
        }
        const newUser = {
          intra_id: user.intra_id,
          nickname: nick,
          email: user.email,
          profile_url: `${this.configService.get('url')}/upload/default.png`,
        }
        const insertedUser = await this.userRepository.insert(newUser);
        const newUserStats = {
          user_id: insertedUser.raw[0].id,
        }
        await this.userStatsRepository.insert(newUserStats);
        return ({
			id: insertedUser.raw[0].id,
		});
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
