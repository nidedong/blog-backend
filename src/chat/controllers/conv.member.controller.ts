import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { DelMembersDto } from 'chat/dtos/member/del-members.dto copy';
import { InviteMembersDto } from 'chat/dtos/member/invite-members.dto';
import { ConvMembersService } from 'chat/services/conv.members.services';
import { User } from 'shared/decorator';

@Controller('conversation/:cid/members')
export class ConvMemberController {
  constructor(private readonly convMembersService: ConvMembersService) {}

  @Get('me')
  getMyInfo(@User('id') userId: string, @Query('cid') cid: string) {
    return this.convMembersService.getMemberInfo(cid, userId);
  }

  @Get(':userId')
  getMemberInfo(@Query('cid') cid: string, @Query('userId') userId: string) {
    return this.convMembersService.getMemberInfo(cid, userId);
  }

  @Get('list')
  getMembers(@Query('cid') cid: string) {
    return this.convMembersService.getMembers(cid);
  }

  @Post()
  inviteMembers(@Query('cid') cid: string, @Body() dto: InviteMembersDto) {
    return this.convMembersService.inviteMembers(cid, dto.userIds);
  }

  @Delete()
  delMembers(@Query('cid') cid: string, @Body() dto: DelMembersDto) {
    return this.convMembersService.delMembers(cid, dto.ids);
  }
}
