import { BaseRepository } from '@lib/core/base';
import { CryptoService, LoggerService } from '@lib/modules';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, Not } from 'typeorm';
import { Address, User } from '@lib/core/databases/postgres';
import { AddressDto, ChangePasswordDto, UserProfileDto } from './user.dto';

@Injectable()
export class UserService extends BaseRepository {
  private readonly serviceName: string = UserService.name;
  private readonly logger: LoggerService;

  constructor(
    @InjectDataSource() private readonly dataSourcePostgres: DataSource,
    private readonly cryptoService: CryptoService,
    logger: LoggerService,
  ) {
    super();
    this.logger = logger;
    this.logger.setContext(this.serviceName);
  }

  async getProfile(id: string): Promise<User> {
    const user = await this.dataSourcePostgres
      .createQueryBuilder(User, 'user')
      .where('user.id = :id', { id })
      .select([
        'user.id',
        'user.avatar',
        'user.name',
        'user.email',
        'user.phone',
        'user.gender',
        'user.role',
        'user.birthday',
        'user.point',
        'user.notifications',
      ])
      .getOne();

    return user;
  }

  async updateProfile(dto: UserProfileDto, id: string) {
    const phoneExisted = await this.exist(this.dataSourcePostgres, User, {
      where: { id: Not(id), phone: dto.phone },
    });
    if (phoneExisted)
      throw new ConflictException(`Số điện thoại ${dto.phone} đã được đăng kí`);
  }

  async changePassword(dto: ChangePasswordDto, id: string) {
    const password = this.cryptoService.computeSHA1OfMD5(dto.newPassword);

    return await this.update(
      this.dataSourcePostgres,
      User,
      { id },
      { password },
    );
  }

  async listAddress(user: string) {
    const [results, count] = await this.dataSourcePostgres
      .createQueryBuilder(Address, 'location')
      .where('location.user = :user', { user })
      .select([
        'location.id',
        'location.name',
        'location.phone',
        'location.address',
      ])
      .getManyAndCount();

    return { results, count };
  }

  async createAddress(dto: AddressDto, user: string) {
    Object.assign(dto, { user: { id: user } });

    const address = this.createInstance(this.dataSourcePostgres, Address, dto);

    await this.create(this.dataSourcePostgres, Address, address);

    return true;
  }

  async updateAddress(dto: AddressDto, user: string) {
    await this.update(
      this.dataSourcePostgres,
      Address,
      { user: { id: user } },
      dto,
    );

    return true;
  }

  async deleteAddress(id: string, user: string) {
    await this.softDelete(this.dataSourcePostgres, Address, {
      id,
      user: { id: user },
    });

    return true;
  }
}
