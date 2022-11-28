import { Body, Controller, Get, Logger, Param, Post, Query, Redirect, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TFACodeEntity } from './entity/TFACode.entity';
import { ftOAuthGuard } from './guard/ftOAuth.guard';
import { JwtAuthGuard } from './guard/jwt.guard';
import { User } from './user.decorator';

@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService){}
    private logger = new Logger(AuthController.name);
    
    @Get('login')
    @UseGuards(ftOAuthGuard)
    login(){
        this.logger.log('log-in function');
    }

    @Get('login/callback')
    @UseGuards(ftOAuthGuard)
    @Redirect()
    async loggedin(@User() user) {
        this.logger.log('Logged in succesfully!');

        const userData = await this.authService.signup(user);

        if (userData.two_factor_Auth) {
            const tfa = await this.authService.generate2FA(userData);
            return { url: 'http://localhost:5173/tfa?id=' + tfa };
        }

        const token = await this.authService.getToken(userData);
        return { url: 'http://localhost:5173/auth?token=' + token.access_token };
    }

    @Post('login/tfa')
    async tfaValidation(@Body() body) {
        const { id, code } = body;
        const res_id = await this.authService.validate2FA(id, code);
        if (res_id) {
            return { success: true, token: await this.authService.getToken({ user_id: res_id }) }
        } else {
            return { success: false, token: undefined }
        }
    }

    @Get('logout')
    logout(){
    }

    // @Get('login/token')
    // @UseGuards(JwtAuthGuard)
    // issueToken(@User() user) {
    //     return 'token authorized!';
    //     return this.authService.issueAccessToken(user);
    // }
}
