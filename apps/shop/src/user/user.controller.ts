import { UserDecorator } from '@lib/common/decorators';
import {
  Body,
  Controller,
  Delete,
  Get,
  Ip,
  Param,
  Patch,
  Post,
  Req,
  Search,
  Session,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserAuthGuard } from '@lib/utils/middlewares/guards/user.guard';
import { UserService } from './user.service';
import { IUserJwtPayload } from '@lib/common/interfaces';
import { AddressDto, ChangePasswordDto, UserProfileDto } from './user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiTags('USER')
  @ApiOperation({ summary: 'Get Profile' })
  @UseGuards(UserAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  async getProfile(@UserDecorator() user: IUserJwtPayload) {
    return await this.userService.getProfile(user.id);
  }

  @ApiTags('USER')
  @ApiOperation({ summary: 'Update Profile' })
  @UseGuards(UserAuthGuard)
  @ApiBearerAuth()
  @Patch('profile')
  async updateProfile(
    @Body() dto: UserProfileDto,
    @UserDecorator() user: IUserJwtPayload,
  ) {
    return await this.userService.updateProfile(dto, user.id);
  }

  @ApiTags('USER')
  @ApiOperation({ summary: 'Change Password' })
  @UseGuards(UserAuthGuard)
  @ApiBearerAuth()
  @Patch('password')
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @UserDecorator() user: IUserJwtPayload,
  ) {
    return await this.userService.changePassword(dto, user.id);
  }

  @ApiTags('ADDRESS')
  @ApiOperation({ summary: 'Create Address' })
  @UseGuards(UserAuthGuard)
  @ApiBearerAuth()
  @Get('address')
  async listAddress(@UserDecorator() user: IUserJwtPayload) {
    return await this.userService.listAddress(user.id);
  }

  @ApiTags('ADDRESS')
  @ApiOperation({ summary: 'Create Address' })
  @UseGuards(UserAuthGuard)
  @ApiBearerAuth()
  @Post('address')
  async createAddress(
    @Body() dto: AddressDto,
    @UserDecorator() user: IUserJwtPayload,
  ) {
    return await this.userService.createAddress(dto, user.id);
  }

  @ApiTags('ADDRESS')
  @ApiOperation({ summary: 'Create Address' })
  @UseGuards(UserAuthGuard)
  @ApiBearerAuth()
  @Patch('address')
  async updateAddress(
    @Body() dto: AddressDto,
    @UserDecorator() user: IUserJwtPayload,
  ) {
    return await this.userService.updateAddress(dto, user.id);
  }

  @ApiTags('ADDRESS')
  @ApiOperation({ summary: 'Create Address' })
  @UseGuards(UserAuthGuard)
  @ApiBearerAuth()
  @Delete('address/:id')
  async deleteAddress(
    @Param('id') id: string,
    @UserDecorator() user: IUserJwtPayload,
  ) {
    return await this.userService.deleteAddress(id, user.id);
  }
}
