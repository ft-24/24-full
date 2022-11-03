import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class ftOAuthGuard extends AuthGuard('42-oauth') {}