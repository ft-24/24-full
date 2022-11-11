import { Body, Controller, Get, Logger, Param, Query, Redirect, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ftOAuthGuard } from './guard/ftOAuth.guard';
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
    async loggedin(@Query('code') code: string, @User() user){
        this.logger.log('Logged in succesfully!');
        const token = this.authService.getToken(user);
        return { url: 'http://localhost:5173/main?token=' + (await token).access_token };
    }

    @Get('logout')
    logout(){

    }
}
