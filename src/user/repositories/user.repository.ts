import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { BasePaginatedParamsDto } from 'shared/dtos/base.paginated.params.dto';

export class UserRepository extends Repository<UserEntity> {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    super(UserEntity, userRepository.manager, userRepository.queryRunner);
  }

  async insertByEntity(entity: UserEntity) {
    return this.insert(entity);
  }

  async saveByEntity(entity: UserEntity) {
    return this.save(entity);
  }

  async selectUserInfoByEmail(email: string) {
    return this.findOne({
      where: {
        email,
      },
    });
  }

  /**
   * 查询用户基础信息
   */
  async selectUserBaseInfoById(
    userId: string,
  ): Promise<UserEntity | undefined> {
    return this.findOne({
      where: {
        id: userId,
      },
      select: [
        'id',
        'nickName',
        'avatar',
        'locale',
        'email',
        'mobilePhone',
        'gender',
        'remark',
      ],
    });
  }

  async selectUserByPagination(pageInfo: BasePaginatedParamsDto) {
    const { start, end, order } = pageInfo;

    const [list, total] = await this.findAndCount({
      select: [
        'id',
        'nickName',
        'avatar',
        'locale',
        'email',
        'mobilePhone',
        'gender',
        'remark',
        'createdAt',
      ],
      skip: start,
      take: end - start,
      order: {
        createdAt: order,
      },
    });

    return {
      list,
      total,
    };
  }
}
