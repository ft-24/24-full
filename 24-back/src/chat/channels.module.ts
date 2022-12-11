import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChannelsController } from "./channels.controller";
import { ChannelService } from "./channels.service";
import { ChatEntity } from "./entity/chat.entity";
import { ChatRoomEntity } from "./entity/chatRoom.entity";
import { DMEntity } from "./entity/dm.entity";
import { ChatInfoEntity } from "./entity/chatInfo.entity";
import { UserEntity } from "src/user/entity/user.entity";
import { FriendListEntity } from "src/user/entity/friendList.entity";
import { UserStatsEntity } from "src/user/entity/userStats.entity";
import { DmListEntity } from "./entity/dmList.entity";

@Module({
	imports: [
	  TypeOrmModule.forFeature([UserEntity, ChatEntity, ChatRoomEntity, ChatInfoEntity, DMEntity, DmListEntity]),
	],
	controllers: [ChannelsController],
	providers: [ChannelService],
})
export class ChannelModule {}