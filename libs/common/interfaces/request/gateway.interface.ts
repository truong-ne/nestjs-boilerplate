import { LanguageError } from '@lib/utils/middlewares';
import { HttpStatus } from '@nestjs/common';

export interface IGatewayResponse {
  statusCode: HttpStatus;
  data: Array<unknown> | unknown;
  message: string;
  errors: Array<unknown> | unknown;
}

export interface IGatewayError {
  errorCode: number;
  errorMessage: string | string[] | LanguageError;
  data: unknown;
}

export interface IMetadata {
  roles: string;
  isPublic: string;
  skipJwt: string;
}

export interface IRoleInit {
  admin: string;
  member: string;
}

export interface IRequestLimit {
  time: number;
  limit: number;
}

export interface IJwtResponse {
  accessToken: string;
  refreshToken: string;
  accessExpiredAt: number;
  refreshExpiredAt: number;
}

export interface IRefreshTokenPayload {
  refreshToken: string;
  deviceId: string;
  validateRoles: string[];
}

export interface IValidationError {
  validateType: string;
  message: string;
  field?: string;
}
