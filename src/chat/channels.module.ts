import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChannelsController } from "./channels.controller";
import { ChannelService } from "./channels.service";
import { ChatEntity } from "./entity/chat.entity";
import { ChatRoomEntity } from "./entity/chatRoom.entity";
import { DMEntity } from "./entity/dm.entity";
import { RoomUserInfoEntity } from "./entity/RoomUserInfo.entity";
import { UserEntity } from "src/user/entity/user.entity";
import { OauthTokenEntity } from "src/auth/entity/oauthToken.entity";
import { FriendListEntity } from "src/user/entity/friendList.entity";
import { UserStatsEntity } from "src/user/entity/userStats.entity";

@Module({
	imports: [
	  TypeOrmModule.forFeature([ChatRoomEntity, ChatEntity, DMEntity, RoomUserInfoEntity]),
	],
	controllers: [ChannelsController],
	providers: [ChannelService],
})
export class ChannelModule {}