import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService){}

  async getToken(user) {
    const payload = { username: 'chanhuil', sub: 'userID' };
    return {
      access_token: this.jwtService.sign(payload),
    }
  }
}
