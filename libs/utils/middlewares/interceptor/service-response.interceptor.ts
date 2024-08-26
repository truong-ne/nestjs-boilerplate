import {
  CallHandler,
  ExecutionContext,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ServiceResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const { errors = null, status = HttpStatus.OK } = data || {};

        const response = {
          status: context.switchToHttp().getResponse().statusCode || status,
          data: !errors ? data : null,
          errors: errors || null,
          message: null,
        };

        return response;
      }),
    );
  }
}
