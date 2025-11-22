import { Optional } from '@nestjs/common';
import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { NotificationType } from 'notify/interfaces';
import { getI18nPath } from 'shared/common';

export class BroadCastMessageDto {
  @IsNotEmpty({
    message: getI18nPath('tip.api_param_property_not_empty'),
  })
  title: string;

  @IsNotEmpty({
    message: getI18nPath('tip.api_param_property_not_empty'),
  })
  content: string;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  senderId?: string;

  metadata?: Record<string, any>;
}

export class GetNotifyListParamsDto {
  @Optional()
  @Transform(({ value }) => value === 'true')
  isRead?: boolean;
}

export class ReadNotificationParamsDto {
  @Optional()
  notifyId?: string;

  @IsNotEmpty({
    message: getI18nPath('tip.api_param_property_not_empty'),
  })
  broadcastId: string;
}
