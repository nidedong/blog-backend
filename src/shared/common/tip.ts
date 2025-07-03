import { HttpStatus } from '@nestjs/common';
import { I18nPath } from 'generated/i18n.generated';

export interface ITipConfig {
  id: string;
  code: number;
  statusCode: number;
  message: string;
}

// 特殊的提示
export const TipConfigs: Partial<Record<I18nPath, ITipConfig>> = {
  'tip.api_param_property_not_empty': {
    id: 'tip.api_param_property_not_empty',
    message: 'tip.api_param_property_not_empty',
    code: HttpStatus.BAD_REQUEST,
    statusCode: 200,
  },
};

export const getI18nPath = (path: I18nPath) => path;
