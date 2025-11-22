import { FriendService } from './../services/friend.service';
import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { User, VoResponse } from 'shared/decorator';
import { CreateFriendReqDto } from 'user/dtos/create.friend.req.dto';
import { GetFriendReqDto } from 'user/dtos/get.friend.req.dto';
import { HandleFriendReqDto } from 'user/dtos/handle.friend.req.dto';
import { FriendVo } from 'user/vos/Friend.vo';

@Controller('friend')
export class FriendController {
  constructor(private readonly friendService: FriendService) {}

  // 发送好友请求
  @Post('request')
  createFriendReq(@User('id') userId: string, @Body() dto: CreateFriendReqDto) {
    return this.friendService.createFriendReq(userId, dto);
  }

  // 查看好友请求
  @Get('request')
  getFriendReqList(@User('id') userId: string, @Query() dto: GetFriendReqDto) {
    return this.friendService.getFriendRelationList(userId, dto);
  }

  //处理好友请求
  @Put('/request/:id/handle')
  handleFriendReq(@Param('id') id: string, @Body() dto: HandleFriendReqDto) {
    return this.friendService.handleFriendReq(id, dto);
  }

  //获取好友列表
  @Get('/')
  @VoResponse(FriendVo)
  getFriendList(@User('id') userId: string) {
    return this.friendService.getFriendList(userId);
  }

  //查询在线状态
  @Get('/status/:id')
  getFriendStatus() {}
}
