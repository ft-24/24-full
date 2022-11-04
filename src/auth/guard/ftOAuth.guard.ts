import { ExecutionContext, Injectable, InternalServerErrorException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class ftOAuthGuard extends AuthGuard('42-oauth') {
  handleRequest<TUser = any>(err: any, user: any, info: any, context: ExecutionContext, status?: any) {
    if (err) {
      throw new InternalServerErrorException({
        msg: '42 인증 에러 (원인 : Oauth 토큰 만료 등)',
        err,
        info,
      });
      return user;
    }
  }
}