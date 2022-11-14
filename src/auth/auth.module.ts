import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { OauthTokenEntity } from './entity/oauthToken.entity';
import { ftOAuthStrategy } from './strategy/ftOAuth.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';

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
    TypeOrmModule.forFeature([OauthTokenEntity]),
  ],
  controllers: [AuthController],
  providers: [AuthService, ftOAuthStrategy, JwtStrategy]
})
export class AuthModule {}
