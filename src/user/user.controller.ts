import { Body, Controller, Get, Head, Headers, Logger, Param, Put, Req, Res, UseGuards } from '@nestjs/common';
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
    return res.status(200).send(
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

  @Put('profile/:prop')
  @UseGuards(JwtAuthGuard)
  async userProfileEdit(@Res() res, @Body() body, @Param('prop') prop, @User() user) {
    const { nickname, two_auth, arcade } = body;
    if (nickname) {
      await this.userService.changeUserNickname(user, nickname)
    }
    if (two_auth) {
      await this.userService.changeUserTFA(user, two_auth)
    }
    if (arcade) {
      await this.userService.changeUserArcade(user, arcade)
    }
    return res.status(200).send(
      await this.userService.getUserInfo(user)
    );
  }
}