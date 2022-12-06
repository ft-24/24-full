import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/entity/user.entity';
import { GameResultEntity } from './entities/gameResult.entity';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, GameResultEntity])
  ],
  controllers: [],
  providers: [GameGateway, GameService],
})
export class GameModule {}
