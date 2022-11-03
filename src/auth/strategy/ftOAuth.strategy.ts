import { Injectable } from "@nestjs/common";
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
    })
  }
 
  async validate(req, at,rt, profile, cb) {

  }
}