import {
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', {
    name: 'create_by',
    comment: 'user ID of creator',
    nullable: true,
  })
  createBy: string;

  @Column('uuid', {
    name: 'update_by',
    comment: 'ID of use who last updated id',
    nullable: true,
  })
  updateBy: string;

  @CreateDateColumn({
    name: 'create_at',
    comment: 'created time',
  })
  createdAt: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    nullable: true,
    comment: 'updated time',
  })
  updatedAt?: Date;

  // @Column({
  //   name: 'is_deleted',
  //   type: 'tinyint',
  //   width: 1,
  //   comment: 'wether it is deleted(0: no, 1: yes)',
  //   unsigned: true,
  //   default: false,
  // })
  // isDeleted: boolean;

  @DeleteDateColumn({
    name: 'delete_at',
    nullable: true,
    comment: 'delete time',
  })
  deleteAt?: Date;
}
