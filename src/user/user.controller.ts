import { Controller, Get, Headers, Res } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  testing(){
    return 'hi';
  }

  @Get('me')
  getUserInfo(@Headers() headers: any, @Res() res) {
    return this.userService.getUserInfo(headers, res);
  }
}