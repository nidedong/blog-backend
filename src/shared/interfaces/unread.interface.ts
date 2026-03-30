export interface IMessageUnreadService {
  getUnreadCount(
    userId: string,
    cids: string[],
  ): Promise<Record<string, number>>;
}

export interface INotificationUnreadService {
  getUnreadCount(
    userId: string,
    cids: string[],
  ): Promise<Record<string, number>>;
}
