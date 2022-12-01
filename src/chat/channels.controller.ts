import { Controller, Get, Headers, Param, Res, UseGuards } from "@nestjs/common";
import { userInfo } from "os";
import { JwtAuthGuard } from "src/auth/guard/jwt.guard";
import { User } from "src/auth/user.decorator";
import { ChannelService } from "./channels.service";

@Controller('channels')
export class ChannelsController {
	constructor(private readonly channelService: ChannelService) {}

	@Get()
	@UseGuards(JwtAuthGuard)
	async getAllChannels(@Res() res, @User() user) {
		return res.status(200).send({rooms: this.channelService.getAllChannels(user)});
	}

	@Get(':intra_id')
	@UseGuards(JwtAuthGuard)
	async getParticipateChannels(@Res() res, @User() user, @Param('intra_id') intra_id) {
		return res.status(200).send({rooms: this.channelService.getParticipateChannels(user, intra_id)})
	}
}