import { Controller, Get, Logger, UseGuards } from '@nestjs/common';
import { ftOAuthGuard } from './guard/ftOAuth.guard';

@Controller()
export class AuthController {
    private logger = new Logger(AuthController.name);
    
    @Get('login')
    @UseGuards(ftOAuthGuard)
    login(){
        this.logger.log('log-in function');
    }

    @Get('login/callback')
    loggedin(){
        this.logger.log('Logged in succesfully!');
        return 'Logged In!'
    }

    @Get('logout')
    logout(){

    }
}
