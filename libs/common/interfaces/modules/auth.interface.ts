import { ERole } from '@lib/core/databases/postgres/enums/entity.enum';

export interface IOtpConfig {
  activeExpireSecond: number;
  activeCDSecond: number;
  resetExpireSecond: number;
  resetCDSecond: number;
  checkPassExpireSecond: number;
  checkPassCDSecond: number;
}

export interface IJwtPayload {
  jwtSecretExpirePeriod: string,
  jwtRefreshSecretExpirePeriod: string
}

export interface IAuthJwtPayload {
  iat?: number;
  exp?: number;
}

export interface IAuthSocialPayload {
  email: string;
  name: string;
}

export interface IUserJwtPayload extends IAuthJwtPayload {
  id: string;
  name: string;
  role: ERole;
}

export interface ISession {
  userAgent: string;
  ip: string;
}
