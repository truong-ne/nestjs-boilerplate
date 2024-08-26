import { IUserJwtPayload } from '@lib/common/interfaces';
import { CacheService } from '@lib/modules/caching';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class UserJwtStrategy {
  constructor(private readonly cacheService: CacheService) {}

  private decodeJwt(token: string) {
    const decodedToken = jwt.decode(token, { complete: true });
    if (!decodedToken) {
      throw new BadRequestException('Token không hợp lệ');
    }

    return decodedToken;
  }

  private async validate(
    token: string,
    userAgent: string,
    ip: string,
  ): Promise<IUserJwtPayload> {
    const decodedToken = this.decodeJwt(token);
    const payload: IUserJwtPayload = decodedToken.payload;

    const secretKey: string = await this.cacheService.get(
      `login:${payload.id}:${userAgent}-${ip}`,
    );

    jwt.verify(token, secretKey, {
      ignoreExpiration: false,
    });

    return payload;
  }

  async execute(token: string, req: any): Promise<IUserJwtPayload> {
    try {
      const user = await this.validate(token, req.get('user-agent'), req.ip);

      return user;
    } catch (err) {
      throw new UnauthorizedException('Thông tin đăng nhập không hợp lệ!');
    }
  }
}
