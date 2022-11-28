import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import configuration from './config/configuration';
import { UserModule } from './user/user.module';

@Module({
  imports: [
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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
