import { Controller, Get, Headers, Logger, Param, Res } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  private logger = new Logger(UserController.name)

  @Get()
  testing(){
    return 'hi';
  }

  @Get(':id/:prop')
  async getUserInfo(@Headers() headers: any, @Res() res, @Param('id') pa, @Param('prop') pr) {
    // this.logger.log(pa, pr);
    const ret = await this.userService.getUserInfo(headers, res);
    this.logger.log(ret[pr])
    const data = ret[pr];
    return res.status(200).send({
      data: data
    });
  }

}