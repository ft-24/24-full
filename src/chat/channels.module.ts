import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChannelsController } from "./channels.controller";
import { ChannelService } from "./channels.service";
import { ChatRoomsEntity } from "./entity/chat-rooms.entity";
import { ChatEntity } from "./entity/chat.entity";
import { DMEntity } from "./entity/dm.entity";

@Module({
	imports: [
	  TypeOrmModule.forFeature([ChatRoomsEntity, ChatEntity, DMEntity]),
	],
	controllers: [ChannelsController],
	providers: [ChannelService],
  })
  export class ChannelModule {}