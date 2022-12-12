import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatGateway } from './chat/chat.gateway';
import configuration from './config/configuration';
import { GameModule } from './game/game.module';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { ChatService } from './chat/chat.service';
import { ChannelModule } from './chat/channels.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'upload'),
      serveRoot: '/upload/',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'postgres',
          host: config.get('db.hostname'),
          port: config.get('db.port'),
          username: "chanhuil",
          password: "postgres",
          database: "postgres",
          entities: ["dist/**/*.entity{.ts,.js}"],
          synchronize: true,
        }
      },
    }),
    AuthModule,
  	UserModule,
  	ChatModule,
    ChannelModule,
    GameModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
