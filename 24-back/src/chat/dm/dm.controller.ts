import { Controller, Get, Res, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guard/jwt.guard";
import { User } from "src/auth/user.decorator";
import { DMService } from "./dm.service";

@Controller('dm-list')
export class DMController {
	constructor(private readonly dmService: DMService) {}

	@Get()
	@UseGuards(JwtAuthGuard)
	async getDmList(@Res() res, @User() user) {
		return res.status(200).send(this.dmService.getDMList(user));
	}
}