import { Controller, Get, Headers, Param, Res } from "@nestjs/common";
import { ChannelService } from "./channels.service";

@Controller('channels')
export class ChannelsController {
	constructor(private readonly channelService: ChannelService) {}

	@Get()
	async getAllChannels(@Headers() headers: any, @Res() res) {
		
		return res.status(200).send({rooms: this.channelService.getAllChannels(headers)});
	}

	@Get(':intra_id')
	async getParticipateChannels(@Headers() headers: any, @Res() res, @Param('intra_id') intra_id) {
		return res.status(200).send({rooms: this.channelService.getParticipateChannels(headers, intra_id)})
	}
}