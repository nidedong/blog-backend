import { UserService } from './../services/user.service';
import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { IsPublic, User } from 'shared/decorator';
import { StrategyEnum } from 'shared/enums';
import { EnvironmentVariable } from 'shared/interfaces';
import { ChangePasswordDto } from 'user/dtos/changepassord.dto';
import { CreateUserDto } from 'user/dtos/create.user.dto';
import { ForgetPasswordDto } from 'user/dtos/forgetpassword.dto';
import { LoginByCaptchaDto } from 'user/dtos/login.captcha.dto';
import { UpdateUserDto } from 'user/dtos/update.user.dto';
import { LocalAuthGuard } from 'user/guards/local.auth.guard';
import { ProfileService } from 'user/services/profile.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly profileService: ProfileService,
    private readonly configService: ConfigService<EnvironmentVariable>,
  ) {}

  @IsPublic()
  @Post('/register')
  register(@Body() user: CreateUserDto) {
    return this.userService.createUserByEmail(user);
  }

  @IsPublic()
  @Put('/forgetpassword')
  forgetpassword(@Body() dto: ForgetPasswordDto) {
    return this.userService.forgetpassword(dto);
  }

  @IsPublic()
  @UseGuards(LocalAuthGuard)
  @Post('/login/email')
  async loginByEmail(@Req() request: Request) {
    const accessToken = await this.userService.createToken(request.user);
    return {
      accessToken,
    };
  }

  @IsPublic()
  @Post('/login/captcha')
  async loginByCaptcha(@Body() dto: LoginByCaptchaDto) {
    const user = await this.userService.validateByCaptcha(dto);
    const accessToken = await this.userService.createToken(user);
    return {
      accessToken,
    };
  }

  @IsPublic()
  @UseGuards(AuthGuard(StrategyEnum.Google))
  @Get('/login/google')
  loginByGoogle() {}

  @IsPublic()
  @UseGuards(AuthGuard(StrategyEnum.Google))
  @Get('/login/callback/google')
  googleAuthRedirect(@Req() request: Request) {
    // Failed to obtain access token 报错暂时未处理
    // todo 根据信息生成token、拿到邮箱注册账号、设置响应头、重定向到系统
    console.log(
      '🚀 ~ UserController ~ googleAuthRedirect ~ request.user:',
      request.user,
    );
    return request.user;
  }

  @IsPublic()
  @UseGuards(AuthGuard(StrategyEnum.Github))
  @Get('/login/github')
  loginByGithub() {}

  @IsPublic()
  @UseGuards(AuthGuard(StrategyEnum.Github))
  @Get('/login/callback/github')
  async githubAuthRedirect(@Req() request: Request, @Res() response: Response) {
    const accessToken = await this.userService.createToken(request.user);

    const clientHomePage = this.configService.get('client', {
      infer: true,
    }).clientHomePage;

    const redirectUrl = new URL(clientHomePage);
    redirectUrl.searchParams.append('access_token', accessToken);

    return response.redirect(redirectUrl.toString());
  }

  @Put('/logout')
  logout(@Req() request: Request) {
    return this.userService.logout(request.user.id);
  }

  @Get('/profile')
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
}
