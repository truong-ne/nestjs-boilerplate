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
  @UseGuards(UserAuthGuard)
  @ApiBearerAuth()
  @Patch('refresh')
  async generateNewToken(@Req() req, @UserDecorator() user: IUserJwtPayload) {
    const [refreshToken, session]: [string, ISession] = [
      req.cookies?.rf,
      { userAgent: req.get('user-agent'), ip: req.ip },
    ];

    return await this.authService.refreshToken(session, refreshToken, user);
  }

  @ApiOperation({ summary: 'User Logout' })
  @UseGuards(UserAuthGuard)
  @ApiBearerAuth()
  @Delete('logout')
  async logout(@Req() req, @UserDecorator() user: IUserJwtPayload) {
    const session: ISession = { userAgent: req.get('user-agent'), ip: req.ip };

    return await this.authService.logout(session, user.id);
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
