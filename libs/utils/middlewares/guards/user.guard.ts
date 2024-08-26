import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserJwtStrategy } from '../strategy';
import { IUserJwtPayload } from '@lib/common/interfaces';
import { Reflector } from '@nestjs/core';
import { ERole } from '@lib/core/databases/postgres/enums/entity.enum';

@Injectable()
export class UserAuthGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private readonly userJwtStrategy: UserJwtStrategy,
  ) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Thông tin xác thực thất bại');
    }

    const token: string = authHeader.split(' ')[1];
    const user: IUserJwtPayload = await this.userJwtStrategy.execute(
      token,
      request,
    );

    if (!user) {
      throw new UnauthorizedException('Thông tin xác thực thất bại');
    }
    request.user = user;

    this.handleRequest(null, user, null, context);

    return true;
  }

  handleRequest<TUser = any>(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): TUser {
    const roles = this.reflector.getAllAndOverride<ERole[]>(
      process.env.PERMISSION_SECRET,
      [context.getHandler(), context.getClass()],
    );
    if (!user)
      throw new UnauthorizedException('Thông tin xác thực không hợp lệ');

    if (roles?.some((role) => user.role.includes(role)) || !roles) return user;

    throw new ForbiddenException('Không có quyền truy cập');
  }
}
