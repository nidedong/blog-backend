import { SetMetadata } from '@nestjs/common';
import { ENABLE_VISIT_NOT_LOGIN } from 'shared/common';

/**
 * 不需要登录就可以访问的接口
 */
export const IsPublic = () => SetMetadata(ENABLE_VISIT_NOT_LOGIN, true);
