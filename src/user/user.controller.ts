import { Controller, Get, Headers, Res } from '@nestjs/common';
import { UserService } from './user.service';

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  getUserInfo(@Headers() headers: any, @Res() res) {
	console.log('1')
    return this.userService.getUserInfo(headers, res);
  }
}