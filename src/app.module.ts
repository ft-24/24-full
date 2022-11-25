import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import configuration from './config/configuration';
import { UserModule } from './user/user.module';

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
    TypeOrmModule.forRoot({
        type: "postgres",
        host: "localhost",
        port: 5432,
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_DATABASE,
        entities: ["dist/**/*.entity{.ts,.js}"],
        synchronize: true,
    }),
    AuthModule,
  	UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
