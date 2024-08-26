import { IMetadata } from '../interfaces';

export enum GatewaysName {
  ADMIN_GATEWAY = 'adminGateway',
  USER_GATEWAY = 'userGateway',
  WEB_GATEWAY = 'webGateway',
}

export const localIp = '127.0.0.1';

export const metaData: IMetadata = {
  roles: 'ROLES',
  isPublic: 'PUBLIC',
  skipJwt: 'SKIPJWT',
} as const;

export const formatDate = 'YYYY-MM-DD';
export const regexTime = /^(?:[01]\d|2[0-3]):[0-5]\d|24:00$/;
export const regexDate = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/;

export const validateDateMessage = `Wrong format ${formatDate}`;
export const validateTimeMessage = `'Input must match the format xx:xx'`;

export const defaultLang = 'en';
