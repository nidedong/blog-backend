import { UserService } from './../services/user.service';
import { Body, Controller, Get, Put, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { User, VoPageResponse, VoResponse } from 'shared/decorator';
import { ChangePasswordDto } from 'user/dtos/changepassord.dto';
import { SearchUserParamsDto } from 'user/dtos/search.user.dto';
import { UpdateUserDto } from 'user/dtos/update.user.dto';
import { ProfileService } from 'user/services/profile.service';
import { ProfileVo } from 'user/vos/profile.vo';
import { UserVo } from 'user/vos/user.vo';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly profileService: ProfileService,
  ) {}

  @VoPageResponse(UserVo)
  @Get('search')
  searchUsers(@User('id') userId: string, @Query() dto: SearchUserParamsDto) {
    return this.userService.searchUsers(userId, dto);
  }

  @VoPageResponse(UserVo)
  @Get('search/norelation')
  searchNoRelationUsers(
    @User('id') userId: string,
    @Query() dto: SearchUserParamsDto,
  ) {
    return this.userService.searchNoRelationUsers(userId, dto);
  }

  @Get('/profile')
  @VoResponse(ProfileVo)
  getProfile(@Req() request: Request) {
    return this.profileService.getProfile(request.user.id);
  }

  @Put('/profile')
  updateProfile(@User('id') userId: string, @Body() dto: UpdateUserDto) {
    return this.profileService.updateProfile(userId, dto);
  }

  @Put('/changepassword')
  changePasswrod(@Body() dto: ChangePasswordDto, @Req() request: Request) {
    return this.profileService.changePasswrod(request.user.id, dto);
  }

  @Get('/')
  createTestData() {
    return this.userService.createTestData();
  }
}
