export enum EventNames {
  SYSTEM_BROADCAST = 'system.broadcast',
  SOCKET_CONNECTED = 'socket.connect',
  SOCKET_DISCONNECTED = 'socket.disconnect',
  FRIEND_REQUEST = 'friend.req',
  FRIEND_STATUS = 'friend.status',
  NEW_CONV = 'conv.create',
  CONV_READ_UPDATED = 'conv.read.updated',
  CONV_UNREAD_UPDATED = 'conv.unread.updated',
  USER_UNREAD_UPDATED = 'user.unread.updated',
  MSG_INDEX_BATCH_REBUILD = 'conv.msg_index_batch_rebuild',
  NEW_MESSAGE = 'msg.create',
  MESSAGE_READ = 'msg.read',
}
