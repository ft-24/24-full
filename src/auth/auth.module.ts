import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { UserEntity } from 'src/user/entity/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OauthTokenEntity } from './entity/oauthToken.entity';
import { ftOAuthStrategy } from './strategy/ftOAuth.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({  
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '60s',
        },
      }),
    }),
    TypeOrmModule.forFeature([UserEntity, OauthTokenEntity]),
    MailerModule.forRoot({
      transport: {
        service: "gmail",
        auth: {
          user: 'chanhuildummy@gmail.com',
          pass: 'fuimxswykjawkuib',
        },
      },
      defaults: {
        from: '"No Reply" <chanhuildummy@gmail.com>',
      },
      template: {
        dir: join(__dirname, "../views/email-templates"),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, ftOAuthStrategy, JwtStrategy]
})
export class AuthModule {}
