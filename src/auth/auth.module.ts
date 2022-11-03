import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ftOAuthStrategy } from './strategy/ftOAuth.strategy';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, ftOAuthStrategy]
})
export class AuthModule {}
