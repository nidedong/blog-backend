import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TestUserEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({
    name: 'nick_name',
    nullable: true,
    length: 50,
  })
  nickName?: string;

  @Column({
    nullable: true,
    length: 255,
  })
  avatar?: string;

  @Column({
    length: 1,
    default: '1',
  })
  gender!: string;
}
