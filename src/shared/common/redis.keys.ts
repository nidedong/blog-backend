// 原先都使用RedisPrefix手动拼接，后续调整为封装方法

/**
 * 
 * | Key                        | 内容                            | 说明             |
| -------------------------- | ----------------------------- | -------------- |
| conv:type:{cid}            | p2p / group                   | 会话类型           |
| conv:members:{cid}         | [uid...]                      | 会话成员           |
| conv:info:{cid}            | 群信息                           | 群名、头像等         |
| conv:last_msg:{cid}        | {id, senderId, content, time} | 最新消息           |
| unread:{cid}:{uid}         | number                        | 私聊未读数（INCR 模式） |
| group:last_msg_id:{cid}    | number                        | 群聊最新消息 id      |
| user:last_read:{cid}:{uid} | number                        | 用户已读消息 id（群聊）  |
| user:convs:{uid}           | ZSET(cid → last_msg_time)     | 会话列表排序         |
| user:profile:{uid}           | {}     | 用户信息         |
 */

export const RedisKeys = {
  /**
   * 会话类型
   */
  convType: (cid: string) => `conv:type:${cid}`,
  /**
   * 会话成员
   */
  convMembers: (cid: string) => `conv:members:${cid}`,
  /**
   * 会话信息
   */
  convInfo: (cid: string) => `conv:info:${cid}`,
  /**
   * 最新消息
   */
  lastMsg: (cid: string) => `conv:last_msg:${cid}`,
  /**
   * 消息列表，限制1w条
   */
  msgIdx: (cid: string) => `conv:msg_index:${cid}`,
  /**
   * 消息列表重建锁
   */
  msgIdxRebuildLock: (cid: string) => `lock:msg_index_rebuild:${cid}`,
  /**
   * 消息序号
   */
  msgSeq: (cid: string) => `conv:msg_seq:${cid}`,
  /**
   * 用户最后已读消息seq
   */
  userLastReadSeq: (cid: string, uid: string) =>
    `user:last_read_seq:${cid}:${uid}`,
  /**
   * 用户会话列表
   */
  userConvs: (uid: string) => `user:convs:${uid}`,
  /**
   * 用户信息
   */
  userProfile: (uid: string) => `user:profile:${uid}`,
  /**
   * 在线用户列表
   */
  onlineUsers: () => 'user:online',
  /**
   * 用户socket
   */
  userSockets: (userId: string, nsp: string, insId: string) =>
    `user:sockets:${userId}:${nsp}:${insId}`,
};
