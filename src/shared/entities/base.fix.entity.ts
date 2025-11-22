import {
  PrimaryGeneratedColumn,
  CreateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export abstract class BaseFixEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({
    name: 'create_at',
    comment: 'created time',
  })
  createdAt: Date;

  @DeleteDateColumn({
    name: 'delete_at',
    nullable: true,
    comment: 'delete time',
  })
  deleteAt?: Date;
}
