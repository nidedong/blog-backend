import { MessageType } from 'chat/interfaces';
import { IsNotEmpty } from 'class-validator';
import { getI18nPath } from 'shared/common';

export class CreateMsgDto {
  @IsNotEmpty({
    message: getI18nPath('tip.api_param_property_not_empty'),
  })
  conversationId: string;
  replyTo?: string;
  @IsNotEmpty({
    message: getI18nPath('tip.api_param_property_not_empty'),
  })
  type: MessageType;
  @IsNotEmpty({
    message: getI18nPath('tip.api_param_property_not_empty'),
  })
  clientId: string;
  content?: string;
  metedata?: Record<string, any>;
}
