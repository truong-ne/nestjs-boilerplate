import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class ServiceRequestInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    const userAgent = request.headers['user-agent'];
    const ipRequest = request.ip || request.socket.remoteAddress;
    const deviceType = request.header['platform'] ?? 'P';
    const domain = null;

    const formatRequest = {
      userAgent,
      ipRequest,
      deviceType,
      requestTime: new Date(),
      domain,
    };

    request.customRequest = formatRequest;

    return next.handle();
  }
}
