import { Body, Controller, Get, Logger, Param, Query, Redirect, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
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

        this.authService.signup(user);
        this.authService.storeOauthTokens(user);

        const token = await this.authService.getToken(user);
        return { url: 'http://localhost:5173/auth?token=' + token.access_token };
    }

    @Get('logout')
    logout(){
    }
}
