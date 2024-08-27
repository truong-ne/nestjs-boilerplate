import { EGender } from '@lib/core/databases/postgres/enums/entity.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';

export class UserProfileDto {
  @IsOptional()
  @ApiProperty({ example: 'user/avatar' })
  avatar?: string;

  @IsString()
  @ApiProperty({ example: 'name' })
  name: string;

  @IsOptional()
  @ApiProperty({ example: '0914729382' })
  phone?: string;

  @IsEnum(EGender)
  @ApiProperty({ example: EGender.Male })
  gender: string;

  @IsOptional()
  @ApiProperty({ example: '12-02-2012' })
  birthday?: string;

  @IsBoolean()
  @ApiProperty({ example: true })
  notifications?: boolean;
}

export class ChangePasswordDto {
  @IsString()
  @ApiProperty({ example: 'currentPassword' })
  currentPassword: string;

  @IsString()
  @ApiProperty({ example: 'newPassword' })
  newPassword: string;
}

export class AddressDto {
  @IsString()
  @ApiProperty({ example: 'Nguyễn Văn A' })
  name: string;

  @IsString()
  @ApiProperty({ example: 'Số 1, Võ Văn Ngân, Thủ Đức, Hồ Chí Minh' })
  address: string;

  @IsString()
  @ApiProperty({ example: '0914729382' })
  phone: string;
}
