import { MessageEntity } from 'chat/entities/message.entity';
import { ConversationType } from 'chat/interfaces';
import { Expose, Type } from 'class-transformer';

export class MemberShortInfo {
  @Expose()
  id: string;
  @Expose()
  nickName: string;
  @Expose()
  userId: string;
  @Expose()
  avatar: string;
}

export class ConversationVo {
  @Expose()
  id: string;
  @Expose()
  type?: ConversationType;
  @Expose()
  title?: string;
  @Expose()
  avatar?: string;
  @Expose()
  metadata?: Record<string, any>;
  @Expose()
  unreadCount: number;
  @Expose()
  updatedAt: Date;
  @Expose()
  lastMessage: MessageEntity | undefined;
  @Expose()
  @Type(() => MemberShortInfo)
  members: MemberShortInfo[] | string[];
}
