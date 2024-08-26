import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { JwtStrategy } from '../strategy';

@Injectable()
export class SocketRequestInterceptor implements NestInterceptor {
  private limit: number;
  private time: number;
  private readonly tokens: Map<string, { count: number; lastRefill: number }>;
  private configService: ConfigService;

  constructor() {
    this.tokens = new Map();
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // const ip = client.conn.remoteAddress;
    const client = context.switchToWs().getClient();
    const accessToken = client.handshake.headers?.authorization;
    const { id } = JwtStrategy.decode(accessToken);

    client.handshake.auth.userId = id;

    return next.handle();
  }
}
