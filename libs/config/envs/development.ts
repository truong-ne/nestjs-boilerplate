export const config = {
  rootApi: {
    admin: process.env.ADMIN_API_PATH,
    user: process.env.USER_API_PATH,
  },
  requestLimit: {
    time: process.env.LIMIT_REQUEST_PER_SECOND || 60,
    limit: process.env.LIMIT_REQUEST || 100,
  },
  db: {
    postgres: {
      type: 'postgres',
      synchronize: true,
      logging: process.env.NODE_ENV === 'develop' ? true : false,
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 5432,
      username: process.env.DB_USER || 'username',
      password: process.env.DB_PWD || 'password',
      database: process.env.DB_NAME || 'db_name',
      ssl: process.env.NODE_ENV === 'develop' ? null : true,
      extra: {
        ssl: {
          rejectUnauthorized: process.env.NODE_ENV === 'develop' ? true : false,
          ca: process.env.NODE_ENV === 'develop' ? null : process.env.DB_CA,
        },
      },
      autoLoadEntities: true,
    },
    // mongodb: {
    //   uri: `mongodb://${process.env.DB_MONGO_USER || 'root'}:${
    //     process.env.DB_MONGO_PWD || 'password'
    //   }@${process.env.DB_MONGO_HOST || 'localhost'}:${
    //     process.env.DB_MONGO_PORT || 27017
    //   }?directConnection=true`,
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    // },
  },
  cache: {
    username: process.env.REDIS_USER || 'username',
    password: process.env.REDIS_PWD || 'password',
    socket: {
      port: process.env.REDIS_PORT || 6379,
      host: process.env.REDIS_HOST || '127.0.0.1',
    },
  },
  amqp: {
    user: process.env.RMQ_USER || 'admin',
    port: process.env.RMQ_PORT || 5672,
    host: process.env.RMQ_HOST || '127.0.0.1',
    password: process.env.RMQ_PWD || 'dev',
  },
  jwt: {
    userSecretKey: process.env.USER_SECRET || 'user_secret_dbchanger',
    staffSecretKey: process.env.STAFF_SECRET || 'staff_secret_dbchanger',
    adminSecretKey: process.env.ADMIN_SECRET || 'admin_secret_dbchanger',
    jwtSecretExpirePeriod: process.env.JWT_SECRET_EXPIRE_PERIOD || 1,
    jwtRefreshSecretExpirePeriod:
      process.env.JWT_REFRESH_SECRET_EXPIRE_PERIOD || 7,
  },
  aws: {
    accessKey: process.env.ACCESS_KEY_ID || 'accessKey',
    secretKey: process.env.SECRET_ACCESS_KEY || 'secretKey',
    region: process.env.REGION || 'region',
    bucket: process.env.BUCKET || 'bucket',
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || 'projectId',
    projectEmail: process.env.FIREBASE_PROJECT_EMAIL || 'projectEmail',
    privateKey: process.env.FIREBASE_PRIVATE_KEY || 'privateKey',
  },
};
