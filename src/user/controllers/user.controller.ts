import { UserService } from './../services/user.service';
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { IsPublic } from 'shared/decorator';
import { BasePaginatedParamsDto } from 'shared/dtos/base.paginated.params.dto';
import { StrategyEnum } from 'shared/enums';
import { EnvironmentVariable } from 'shared/interfaces';
import { CreateUserDto } from 'user/dtos/create.user.dto';
import { LoginByEmailDto } from 'user/dtos/login.email.dto';
import { VerificationCodeDto } from 'user/dtos/verification.code.dto';
import { LocalAuthGuard } from 'user/guards/local.auth.guard';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService<EnvironmentVariable>,
  ) {}

  @IsPublic()
  @Post('/captcha')
  sendVerificationCode(@Body() verificationInfo: VerificationCodeDto) {
    return this.userService.sendVerificationCode(verificationInfo);
  }

  @IsPublic()
  @Post('/register')
  register(@Body() user: CreateUserDto) {
    return this.userService.createUserByEmail(user);
  }

  @IsPublic()
  @UseGuards(LocalAuthGuard)
  @Post('/login/email')
  async loginByEmail(@Body() _: LoginByEmailDto, @Req() request: Request) {
    const accessToken = await this.userService.createToken(request.user);
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

    response.setHeader('access_token', accessToken);

    return response.redirect(clientHomePage);
  }

  @Post('/logoff')
  logoff(@Body('id') userId: string) {
    return this.userService.logoff(userId);
  }

  @Get('/list')
  getUserList(@Query() params: BasePaginatedParamsDto) {
    return this.userService.selectUserByPagination(params);
  }
}
