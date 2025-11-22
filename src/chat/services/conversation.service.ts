import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConversationMemberEntity } from 'chat/entities/conversation_member.entity';
import { ConversationEntity } from 'chat/entities/conversation.entity';
import { MessageEntity } from 'chat/entities/message.entity';
import { Like, Repository } from 'typeorm';
import { UserEntity } from 'user/entities/user.entity';
import { ApiException } from 'shared/exception';
import { GetConversationListDto } from 'chat/dtos/get.conversation.list.dto';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(ConversationMemberEntity)
    private readonly conversationMemberRepo: Repository<ConversationMemberEntity>,
    @InjectRepository(ConversationEntity)
    private readonly conversationRepo: Repository<ConversationEntity>,
    @InjectRepository(MessageEntity)
    private readonly messageRepo: Repository<MessageEntity>,
    @InjectRepository(UserEntity)
    private readonly uerRepo: Repository<UserEntity>,
  ) {}

  async getList(userId: string, filter: GetConversationListDto) {
    const exist = await this.uerRepo.existsBy({
      id: userId,
    });

    if (!exist) {
      ApiException.tipError('user.user_not_exist');
    }

    const { start, end, order, keywrod } = filter;

    const where: Record<string, any> = {};

    if (keywrod) {
      where.title = Like(`%${keywrod}%`);
    }

    const [list, total] = await this.conversationMemberRepo.findAndCount({
      // select: [
      //   'id',
      //   ''
      //   'createdAt',
      // ],
      skip: start,
      take: end - start,
      order: {
        createdAt: order,
      },
      where,
    });

    return {
      list,
      total,
    };
  }
}
