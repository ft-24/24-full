import { Body, Controller, Delete, Get, Head, Headers, Logger, Param, Put, Req, Res, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { User } from 'src/auth/user.decorator';
import { multerOptions } from 'src/lib/multerOptions';
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

  @Get('profiles')
  @UseGuards(JwtAuthGuard)
  async getUsersInfo(@Res() res, @User() user) {
    return res.status(200).send(
      await this.userService.getUsersInfo(user)
    );
  }

  @Get('profile/:intra_id')
  @UseGuards(JwtAuthGuard)
  async getFriendsProfile(@Res() res, @User() user, @Param('intra_id') id) {
    return res.status(200).send(
      await this.userService.getFriendsProfile(user, id)
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
  @UseInterceptors(FileInterceptor('image', multerOptions))
  async userProfileEdit(@Res() res, @Body() body, @User() user, @UploadedFile() file) {
    const { nickname, two_auth, arcade } = body;
    if (nickname) {
      await this.userService.changeUserNickname(user, nickname)
    }
    if (two_auth !== undefined) {
      await this.userService.changeUserTFA(user, two_auth)
    }
    if (arcade) {
      await this.userService.changeUserArcade(user, arcade)
    }
    if (file) {
      await this.userService.changeUserProfilePic(user, file)
    }
    return res.status(200).send(
      await this.userService.getUserInfo(user)
    );
  }

  @Put('friends')
  @UseGuards(JwtAuthGuard)
  async updateUserFriends(@Res() res, @User() user, @Body() body) {
    const { intra_id } = body;
    return res.status(200).send(
      await this.userService.addUserFriend(user, intra_id),
    );
  }

  @Delete('friends')
  @UseGuards(JwtAuthGuard)
  async deleteUserFriends(@Res() res, @User() user, @Body() body) {
    const { intra_id } = body;
    return res.status(200).send(
      await this.userService.removeUserFriend(user, intra_id),
    );
  }


  @Put('block')
  @UseGuards(JwtAuthGuard)
  async blockUser(@Res() res, @User() user, @Body() body) {
    const { intra_id, is_blocked } = body;
    return res.status(200).send(
      await this.userService.blockUser(user, intra_id, is_blocked),
    );
  }
}