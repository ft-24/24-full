import { Body, Controller, Delete, Get, Headers, Logger, Param, Post, Put, Res, UseGuards } from "@nestjs/common";
import { userInfo } from "os";
import { JwtAuthGuard } from "src/auth/guard/jwt.guard";
import { User } from "src/auth/user.decorator";
import { ChannelService } from "./channels.service";

@Controller('channels')
export class ChannelsController {
	constructor(private readonly channelService: ChannelService) {}
	private logger = new Logger(ChannelsController.name);

	@Get()
	@UseGuards(JwtAuthGuard)
	async getAllChannels(@Res() res, @User() user) {
		return res.status(200).send({rooms: await this.channelService.getAllChannels(user)});
	}

	@Get('joined')
	@UseGuards(JwtAuthGuard)
	async getParticipateChannels(@Res() res, @User() user, @Param('intra_id') intra_id) {
		return res.status(200).send({rooms: await this.channelService.getParticipateChannels(user)})
	}

	@Get('joined/:name')
	@UseGuards(JwtAuthGuard)
	async getChannel(@Res() res, @Param('name') name) {
		return res.status(200).send(await this.channelService.getChannel(name))
	}

	@Get('dm')
	@UseGuards(JwtAuthGuard)
	async getDMs(@Res() res, @User() user) {
		return res.status(200).send(await this.channelService.getDMs(user));
	}

	@Get('users')
	@UseGuards(JwtAuthGuard)
	async getParticipators(@Res() res, @User() user, @Body() body) {
		const { room_name } = body;
		return res.status(200).send(await this.channelService.getParticipators(room_name))
	}

	@Post('pass')
	@UseGuards(JwtAuthGuard)
	async passwordAuthorize(@Res() res, @User() user, @Body() body) {
		const { name, pass } = body;
		return res.status(200).send(await this.channelService.passwordAuthorize(name, pass));
	}

	@Put('ban')
	@UseGuards(JwtAuthGuard)
	async banUser(@Res() res, @User() user, @Body() body) {
		const { roomname, intra_id } = body;
		return res.status(200).send(
			await this.channelService.banUser(roomname, user, intra_id)
		);
	}

	@Put('mute')
	@UseGuards(JwtAuthGuard)
	async muteUser(@Res() res, @User() user, @Body() body) {
		const { roomname, intra_id } = body;
		return res.status(200).send(
			await this.channelService.muteUser(roomname, user, intra_id)
		);
	}
}