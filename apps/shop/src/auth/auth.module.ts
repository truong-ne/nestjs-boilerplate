import { Global, Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { DatabaseHelper } from '@lib/utils/helpers';
import { IEntitiesMapMetadata } from '@lib/common/types';
import { DbName } from '@lib/common/enums';
import { GoogleStrategy } from '@lib/utils/middlewares/strategy/google.strategy';
import { CryptoModule } from '@lib/modules';
import { JwtStrategy, UserJwtStrategy } from '@lib/utils/middlewares/strategy';

const entities: IEntitiesMapMetadata = {
  [DbName.Postgres]: DatabaseHelper.getEntitiesPostgres(),
};

@Global()
@Module({
  imports: [...DatabaseHelper.mapEntities(entities), CryptoModule],
  controllers: [AuthController],
  providers: [AuthService, UserJwtStrategy, JwtStrategy, GoogleStrategy],
  exports: [UserJwtStrategy, CryptoModule],
})
export class AuthModule {}
