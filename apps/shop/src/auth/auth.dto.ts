import { EGender } from '@lib/core/databases/postgres/enums/entity.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

export class UserRegisterDto {
  @IsOptional()
  @ApiProperty({ example: 'user/avatar' })
  avatar: string;

  @IsString()
  @ApiProperty({ example: 'name' })
  name: string;

  @IsEmail()
  @ApiProperty({ example: 'podstreet@gmail.com' })
  email: string;

  @IsOptional()
  @ApiProperty({ example: '0917039039' })
  phone: string;

  @IsString()
  @ApiProperty({ example: 'password' })
  password: string;

  @IsEnum(EGender)
  @ApiProperty({ example: EGender.Male })
  gender: EGender;

  @IsOptional()
  @ApiProperty({ example: '25-09-2012' })
  birthday: string;
}

export class LoginDto {
  @IsEmail()
  @ApiProperty({ example: 'podstreet@gmail.com' })
  email: string;

  @IsString()
  @ApiProperty({ example: 'password' })
  password: string;
}
