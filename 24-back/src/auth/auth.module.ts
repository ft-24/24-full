import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { UserEntity } from 'src/user/entity/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ftOAuthStrategy } from './strategy/ftOAuth.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { TFACodeEntity } from './entity/TFACode.entity';
import { UserStatsEntity } from 'src/user/entity/userStats.entity';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({  
        secret: config.get('jwt.secret'),
        signOptions: {
          expiresIn: config.get('jwt.expiresin'),
        },
      }),
    }),
    TypeOrmModule.forFeature([UserEntity, UserStatsEntity, TFACodeEntity]),
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          transport: {
            service: "gmail",
            auth: {
              user: config.get('mailer.email'),
              pass: config.get('mailer.password'),
            },
          },
          defaults: {
            from: `"No Reply" <${config.get('mailer.email')}>`,
          },
          template: {
            dir: join(__dirname, "../../email-templates"),
            adapter: new HandlebarsAdapter(),
            options: {
              strict: true,
            },
          },
        }
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, ftOAuthStrategy, JwtStrategy]
})
export class AuthModule {}
