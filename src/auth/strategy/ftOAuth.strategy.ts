import { Injectable, Logger, Redirect } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-42";


@Injectable()
export class ftOAuthStrategy extends PassportStrategy(Strategy, '42-oauth') {
  constructor(private readonly configService: ConfigService){
    super({
      clientID: configService.get('ftAuth.cliendid'),
      clientSecret: configService.get('ftAuth.secret'),
      callbackURL: configService.get('ftAuth.callbackurl'),
      passReqToCallback: true,
    })
  }
 
  async validate(req, at, rt, profile, cb) {
    const logger = new Logger(ftOAuthStrategy.name);
    const user = {
      access_token: at,
      refresh_token: rt,
    }
    cb(null, user);
  }
}