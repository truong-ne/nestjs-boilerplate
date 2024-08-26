export const config = {
  requestLimit: {
    time: process.env.LIMIT_REQUEST_PER_SECOND || 60,
    limit: process.env.LIMIT_REQUEST || 100,
  },
  db: {
    postgres: {
      type: 'postgres',
      synchronize: false,
      logging: process.env.NODE_ENV !== 'develop' ? true : false,
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 5432,
      username: process.env.DB_USER || 'username',
      password: process.env.DB_PWD || 'password',
      database: process.env.DB_NAME || 'db_name',
      extra: {
        connectionLimit: 10,
      },
      autoLoadEntities: true,
    },
  },
  cache: {
    password: process.env.REDIS_PWD || 'password',
    socket: {
      port: process.env.REDIS_PORT || 6379,
      host: process.env.REDIS_HOST || '127.0.0.1',
    },
  },
  jwt: {
    jwtSecretExpirePeriod: process.env.JWT_SECRET_EXPIRE_PERIOD || 1,
    jwtRefreshSecretExpirePeriod:
      process.env.JWT_REFRESH_SECRET_EXPIRE_PERIOD || 7,
  },
  generalInfo: {
    termId: process.env.TERM_ID || 'term_id',
    licenseId: process.env.LICENSE_ID || 'license_id',
  },
};
