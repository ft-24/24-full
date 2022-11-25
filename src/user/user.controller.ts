import { Controller, Get, Head, Headers, Logger, Param, Put, Req, Res, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { User } from 'src/auth/user.decorator';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  private logger = new Logger(UserController.name)

  @Get()
  testing(){
    return 'hi';
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getUserInfo(@Res() res, @User() user) {
    return res.status(200).send(
      await this.userService.getUserInfo(user)
    );
  }

  @Get('profile/:intra_id')
  @UseGuards(JwtAuthGuard)
  async getFriendsProfile(@Res() res, @Param('intra_id') id) {
    return res.stats(200).send(
      await this.userService.getFriendsProfile(id)
    );
  }

  @Get('friends')
  @UseGuards(JwtAuthGuard)
  async getUserFriends(@Res() res, @User() user) {
    return res.status(200).send(
      await this.userService.getUserFriends(user)
    );
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async userProfileEdit(@Req() req, @User() user) {
    
  }
}