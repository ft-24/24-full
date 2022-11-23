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
        // this.logger.log(`${user.intra_id} is intra_id, ${user.email} is email.`);

        const userData = await this.authService.signup(user);
        this.authService.storeOauthTokens(user);

        if (!userData.two_factor_Auth) {
            const tfa = await this.authService.generate2FA(userData);
            return { url: 'http://localhost:5173/tfa?id=' + tfa };
        }

        const token = await this.authService.getToken(user);
        return { url: 'http://localhost:5173/auth?token=' + token.access_token };
    }

    @Get('logout')
    logout(){
    }

    @Post('login/tfa')
    async tfaValidation(@Body() body) {
        const { id, code } = body;

        // this.logger.log(`${id} as id, ${code} as code`);
        if (await this.authService.validate2FA(id, code)) {
            // this.logger.log(`Validation success!`);
            return {
                token: await this.authService.getToken({
                    user_id: 'chanhuil',
                }),
                success: true,
            }
        } else {
            // this.logger.log(`Validation failed!`);
            return {
                token: undefined,
                success: false,
            }
        }
    }
}
