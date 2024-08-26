import { ERole } from '@lib/core/databases/postgres/enums/entity.enum';
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: ERole[]) =>
  SetMetadata(process.env.PERMISSION_SECRET, roles);
