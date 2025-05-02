import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { RequestService } from './request.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('request')
@UseGuards(JwtAuthGuard)
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Post()
  create(@Body() dto: CreateRequestDto, @Req() req) {
    return this.requestService.create(dto, req.user);
  }

  @Get()
  findAll() {
    return this.requestService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requestService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRequestDto) {
    return this.requestService.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.requestService.remove(+id);
  }
}
