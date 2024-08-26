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
import { LoginDto, UserRegisterDto } from './auth.dto';
import { AuthService } from './auth.service';
import {
  IAuthSocialPayload,
  ISession,
  IUserJwtPayload,
} from '@lib/common/interfaces';
import { UserAuthGuard } from '@lib/utils/middlewares/guards/user.guard';

@ApiTags('AUTH')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'User Profile' })
  @UseGuards(UserAuthGuard)
  @ApiBearerAuth()
  @Get('profile')
  async get(@UserDecorator() user: IUserJwtPayload) {
    return await this.authService.userProfile(user.id);
  }

  @ApiOperation({ summary: 'User Register Account' })
  @Post('register')
  async userRegister(@Body() dto: UserRegisterDto) {
    return await this.authService.userRegister(dto);
  }

  @ApiOperation({ summary: 'User Login' })
  @Post('login')
  async login(@Body() dto: LoginDto, @Req() req, @Ip() ip: string) {
    const session: ISession = { userAgent: req.get('user-agent'), ip };

    return await this.authService.login(dto, session);
  }

  @ApiOperation({ summary: 'Google Login' })
  @UseGuards(AuthGuard('google'))
  @Get('google/callback')
  async googleLogin(@Req() req, @UserDecorator() user: IAuthSocialPayload) {
    const session: ISession = { userAgent: req.get('user-agent'), ip: req.ip };

    return await this.authService.socialLogin(user, session);
  }

  @ApiOperation({ summary: 'Generate New Access, Refresh Token' })
  @Patch('refresh')
  async generateNewToken() {
    // TODO: Generate New secretKey
    // CODE HERE
    return;
  }

  @ApiOperation({ summary: 'User Logout' })
  @Delete('logout')
  async logout() {
    // TODO: Delete Session By Refresh Token
    // CODE HERE
    return;
  }

  @ApiOperation({ summary: 'Terminate All Sessions' })
  @UseGuards(UserAuthGuard)
  @ApiBearerAuth()
  @Delete('session')
  async terminateAllSessions(@UserDecorator() user: IUserJwtPayload) {
    return await this.authService.terminateAllSessions(user.id);
  }

  @ApiOperation({ summary: 'Terminate Session' })
  @UseGuards(UserAuthGuard)
  @ApiBearerAuth()
  @Delete('session/:id')
  async terminateSession(
    @Param('id') id: string,
    @UserDecorator() user: IUserJwtPayload,
  ) {
    return await this.authService.terminateSession(id, user.id);
  }
}
