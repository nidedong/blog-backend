import { Expose } from 'class-transformer';
import { NotificationType } from 'notify/interfaces';

export class NotifyItemVo {
  @Expose()
  id: string;
  @Expose()
  broadcastId: string;
  @Expose()
  userId: string;
  @Expose()
  isRead: boolean;
  @Expose()
  readAt: Date;
  @Expose()
  delivered: boolean;
  @Expose()
  title: string;
  @Expose()
  content: string;
  @Expose()
  type: NotificationType;
  @Expose()
  metadata?: Record<string, any>;
  @Expose()
  senderId?: string;
}
