import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BillService } from './bill.service';
import { Roles, UserDecorator } from '@lib/common/decorators';
import { IUserJwtPayload } from '@lib/common/interfaces';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BillDto, BillQuery, ChangeBillStatusDto } from './bill.dto';
import { UserAuthGuard } from '@lib/utils/middlewares/guards';
import { ERole } from '@lib/core/databases/postgres/enums/entity.enum';

@ApiTags('BILL')
@Controller('bill')
export class BillController {
  constructor(private readonly billService: BillService) {}

  @ApiOperation({ summary: 'Admin List Bills' })
  @UseGuards(UserAuthGuard)
  @Roles(ERole.Admin)
  @ApiBearerAuth()
  @Get('list')
  async listAllBills(@Query() query: BillQuery) {
    return await this.billService.listBills(query);
  }

  @ApiOperation({ summary: 'User List Bills' })
  @UseGuards(UserAuthGuard)
  @Roles(ERole.User)
  @ApiBearerAuth()
  @Get()
  async listBills(
    @Query() query: BillQuery,
    @UserDecorator() user: IUserJwtPayload,
  ) {
    return await this.billService.listBills(query, user.id);
  }

  @ApiOperation({ summary: 'User Get Detail Bill' })
  @UseGuards(UserAuthGuard)
  @Roles(ERole.User)
  @ApiBearerAuth()
  @Get(':id')
  async detailBill(
    @Param('id') id: string,
    @UserDecorator() user: IUserJwtPayload,
  ) {
    return await this.billService.detailBill(id, user.id);
  }

  @ApiOperation({ summary: 'User Create Bill' })
  @UseGuards(UserAuthGuard)
  @Roles(ERole.User)
  @ApiBearerAuth()
  @Post()
  async createBill(
    @Body() dto: BillDto,
    @UserDecorator() user: IUserJwtPayload,
  ) {
    return await this.billService.createBill(dto, user.id);
  }

  @ApiOperation({ summary: 'User Cancel Bill' })
  @UseGuards(UserAuthGuard)
  @Roles(ERole.User)
  @ApiBearerAuth()
  @Patch(':id/cancel')
  async cancelBill(
    @Param('id') id: string,
    @UserDecorator() user: IUserJwtPayload,
  ) {
    return await this.billService.cancelBill(id, user.id);
  }

  @ApiOperation({ summary: 'Admin Change Bill Status' })
  @UseGuards(UserAuthGuard)
  @Roles(ERole.Admin)
  @ApiBearerAuth()
  @Patch(':id/status')
  async changeBillStatus(
    @Param('id') id: string,
    @Body() dto: ChangeBillStatusDto,
  ) {
    return await this.billService.changeBillStatus(id, dto);
  }
}
