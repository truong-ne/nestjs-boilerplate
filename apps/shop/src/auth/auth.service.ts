import { BaseRepository } from '@lib/core/base';
import { CryptoService, LoggerService } from '@lib/modules';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LoginDto, UserRegisterDto } from './auth.dto';
import { Session, User } from '@lib/core/databases/postgres';
import { ERole } from '@lib/core/databases/postgres/enums/entity.enum';
import { JwtStrategy } from '@lib/utils/middlewares/strategy';
import {
  IAuthSocialPayload,
  IJwtPayload,
  ISession,
  IUserJwtPayload,
} from '@lib/common/interfaces';
import { DateDigit } from '@lib/common/enums';
import { CacheService } from '@lib/modules/caching';

@Injectable()
export class AuthService extends BaseRepository {
  private readonly serviceName: string = AuthService.name;
  private readonly logger: LoggerService;
  private readonly jwtService: JwtStrategy = new JwtStrategy(1, DateDigit.Day);

  constructor(
    @InjectDataSource() private readonly dataSourcePostgres: DataSource,
    private readonly cryptoService: CryptoService,
    private readonly cacheService: CacheService,
    logger: LoggerService,
  ) {
    super();
    this.logger = logger;
    this.logger.setContext(this.serviceName);
  }

  async userRegister(payload: UserRegisterDto): Promise<Boolean> {
    await this.existedUser(payload.email, payload.phone);

    const password = this.cryptoService.computeSHA1OfMD5(payload.password);
    Object.assign(payload, { role: ERole.User, password });

    const user = this.createInstance(this.dataSourcePostgres, User, payload);
    await this.create(this.dataSourcePostgres, User, user);

    return true;
  }

  async socialLogin(dto: IAuthSocialPayload, req: ISession) {
    let user = await this.getOne(this.dataSourcePostgres, User, {
      where: { email: dto.email },
    });

    if (!user) {
      const password = this.cryptoService.computeSHA1OfMD5(
        new Date().getTime().toString(),
      );

      Object.assign(dto, { password });
      const newUser = this.createInstance(this.dataSourcePostgres, User, dto);
      user = await this.create(this.dataSourcePostgres, User, newUser);
    }
    // generate session
    const [session, payload]: [Session, IUserJwtPayload] = [
      await this.generateSession(req, user.id),
      { id: user.id, name: user.name, role: user.role },
    ];

    const { refreshToken } = session;
    // generate token
    const accessToken = this.jwtService.generate(payload, session.secretKey);

    return { user: payload, accessToken, refreshToken };
  }

  async login(dto: LoginDto, req: ISession) {
    const user = await this.getOne(this.dataSourcePostgres, User, {
      where: { email: dto.email },
    });

    if (!user || !this.cryptoService.verify(dto.password, user?.password))
      throw new UnauthorizedException('Thông tin xác thực thất bại');

    // generate session
    const [session, payload]: [Session, IUserJwtPayload] = [
      await this.generateSession(req, user.id),
      { id: user.id, name: user.name, role: user.role },
    ];

    const { refreshToken } = session;
    // generate token
    const accessToken = this.jwtService.generate(payload, session.secretKey);

    return { user: payload, accessToken, refreshToken };
  }

  async refreshToken(
    session: ISession,
    refreshToken: string,
    user: IUserJwtPayload,
  ) {
    await this.delete(this.dataSourcePostgres, Session, {
      refreshToken,
      user: { id: user },
    });

    const [newSession, payload]: [Session, IUserJwtPayload] = [
      await this.generateSession(session, user.id),
      { id: user.id, name: user.name, role: user.role },
    ];

    const accessToken = this.jwtService.generate(payload, newSession.secretKey);
    return { accessToken, refreshToken: newSession.refreshToken };
  }

  async logout(session: ISession, user: string) {
    Object.assign(session, { user: { id: user } });

    this.cacheService.delete(
      `login:${user}:${session.userAgent}-${session.ip}`,
    );

    return await this.delete(this.dataSourcePostgres, Session, session);
  }

  async terminateSession(session: string, user: string): Promise<boolean> {
    await this.delete(this.dataSourcePostgres, Session, {
      id: session,
      user: { id: user },
    });

    return true;
  }

  async terminateAllSessions(user: string): Promise<boolean> {
    await this.delete(this.dataSourcePostgres, Session, { user: { id: user } });

    return true;
  }

  private async generateSession(
    payload: ISession,
    user: string,
  ): Promise<Session> {
    Object.assign(payload, { user: { id: user } });

    const createSession = this.createInstance(
      this.dataSourcePostgres,
      Session,
      payload,
    );
    const session = await this.create(
      this.dataSourcePostgres,
      Session,
      createSession,
    );
    // cache secretKey
    this.cacheService.set(
      `login:${user}:${payload.userAgent}-${payload.ip}`,
      session.secretKey,
      24 * 60 * 60,
    );

    return session;
  }

  private async existedUser(email: string, phone: string): Promise<void> {
    // email existed ?
    const accountExisted = await this.getOne(this.dataSourcePostgres, User, {
      where: [{ email: email }, { phone: phone }],
    });
    if (accountExisted?.email === email)
      throw new ConflictException(`Email ${email} đã được đăng kí`);
    if (accountExisted?.phone === phone)
      throw new ConflictException(`Số điện thoại ${phone} đã được đăng kí`);
  }
}
