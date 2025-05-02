import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { MatchService } from './match.service';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  @Post()
  create(@Body() dto: CreateMatchDto, @Req() req) {
    return this.matchService.create(dto, req.user);
  }

  @Get()
  findAll() {
    return this.matchService.findAll();
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.matchService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateMatchDto: UpdateMatchDto) {
  //   return this.matchService.update(+id, updateMatchDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.matchService.remove(+id);
  // }
}
