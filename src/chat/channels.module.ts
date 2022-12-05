import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChannelsController } from "./channels.controller";
import { ChannelService } from "./channels.service";
import { ChatEntity } from "./entity/chat.entity";
import { ChatRoomEntity } from "./entity/chatRoom.entity";
import { DMEntity } from "./entity/dm.entity";
import { RoomUserInfoEntity } from "./entity/RoomUserInfo.entity";
import { UserService } from "src/user/user.service";
import { UserEntity } from "src/user/entity/user.entity";
import { OauthTokenEntity } from "src/auth/entity/oauthToken.entity";
import { FriendListEntity } from "src/user/entity/friendList.entity";

@Module({
	imports: [
	  TypeOrmModule.forFeature([ChatRoomEntity, ChatEntity, DMEntity, RoomUserInfoEntity, UserEntity, OauthTokenEntity, FriendListEntity]),
	],
	controllers: [ChannelsController],
	providers: [ChannelService, UserService],
})
export class ChannelModule {}