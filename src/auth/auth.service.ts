import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entity/user.entity';
import { Repository } from 'typeorm';
import { OauthTokenEntity } from './entity/oauthToken.entity';
import { TFACodeEntity } from './entity/TFACode.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(OauthTokenEntity)
    private oauthTokenRepository: Repository<OauthTokenEntity>,
    @InjectRepository(TFACodeEntity)
    private tfaCodeRepository: Repository<TFACodeEntity>,
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

  async signup(user): Promise<UserEntity> {
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
        const insertedUser = await this.userRepository.findOneBy({ intraID: user.intra_id });
        if (!insertedUser) {
          this.logger.log(`db error`);
        }
        return insertedUser;
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
      code: code,
    }
    const rt = await this.tfaCodeRepository.insert(tfaCode);
    this.logger.log(rt.identifiers[0].id);
    return rt.identifiers[0].id;
  }

  async validate2FA(id, code): Promise<Boolean> {
    const findId = await this.tfaCodeRepository.findOneBy({ id: id });
    if (findId && findId.code == code)
    {
      await this.tfaCodeRepository.delete(findId)
      return true;
    }
    return false;
  }
}
