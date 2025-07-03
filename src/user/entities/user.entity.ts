import { BaseEntity } from 'shared/entities/base.entity';
import { RegisterType } from 'shared/interfaces';
import { Column, Entity } from 'typeorm';

@Entity('user')
export class UserEntity extends BaseEntity {
  @Column({
    name: 'nick_name',
    nullable: true,
    comment: 'nick name',
    length: 50,
  })
  nikeName?: string;

  @Column({
    name: 'mobile_phone',
    nullable: true,
    comment: 'mobile phone number',
    length: 50,
  })
  mobilePhone?: string;

  @Column({
    name: 'email',
    nullable: true,
    comment: 'email',
    length: 100,
  })
  email?: string;

  @Column({
    name: 'password',
    nullable: true,
    comment: 'password',
    length: 255,
  })
  password?: string;

  @Column({
    name: 'avatar',
    nullable: true,
    comment: 'avatar',
    length: 255,
  })
  avatar?: string;

  @Column({
    name: 'gender',
    comment: 'gender',
    width: 1,
    type: 'tinyint',
    default: 1,
    nullable: true,
  })
  gender?: number;

  @Column({
    name: 'remark',
    nullable: true,
    comment: 'remark',
    length: 255,
  })
  remark?: string;

  @Column('timestamp', {
    name: 'last_login_time',
    nullable: true,
    comment: 'updated time',
  })
  lastLoginTime?: Date;

  @Column({
    name: 'locale',
    nullable: true,
    comment: 'locale',
    length: 50,
  })
  locale?: string;

  @Column({
    name: 'github_id',
    nullable: true,
  })
  githubId?: string;

  @Column({
    nullable: true,
    type: 'tinyint',
    width: 1,
    comment: '注册方式，0-邮箱密码, 1-google 2-github',
  })
  registerType?: RegisterType;
}
