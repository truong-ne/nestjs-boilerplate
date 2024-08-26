import { ValidationError } from '@nestjs/common';

export function parseWithSymbolMetadata(str: string, symbol: string): string[] {
  return str.split(symbol);
}

export function parseJwtHeader(authHeader: string) {
  let jwt: string = authHeader;
  const authHeaderParts = (authHeader as string).split(' ');
  if (authHeaderParts.length == 2) {
    const [, jwtParse] = authHeaderParts;
    jwt = jwtParse;
  }
  return jwt;
}

export function errorFormatter(
  errors: ValidationError[],
  errMessage?: any,
  parentFields?: string,
): any {
  const message = errMessage || {};
  let errorField = '';

  errors.forEach((error) => {
    errorField = parentFields
      ? `${parentFields}.${error.property}`
      : error?.property;

    if (!error?.constraints && error?.children?.length) {
      errorFormatter(error.children, message, errorField);
    } else {
      const [[key, validationMessage]] = Object.entries(error?.constraints);
      message[errorField] = {
        validateType: key,
        message: validationMessage || `Invalid value!`,
        // field: error.property,
      };
    }
  });
  return message;
}
