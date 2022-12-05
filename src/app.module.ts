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
          host: "localhost",
          port: 5432,
          username: config.get('db.username'),
          password: config.get('db.password'),
          database: config.get('db.database'),
          entities: ["dist/**/*.entity{.ts,.js}"],
          synchronize: true,
        }
      },
    }),
    AuthModule,
  	UserModule,
  	ChatModule,
    ChannelModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
