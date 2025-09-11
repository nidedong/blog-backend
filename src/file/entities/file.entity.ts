import { FileStatus } from 'file/interfaces/file.interface';
import { BaseEntity } from 'shared/entities/base.entity';
import { BooleanType } from 'shared/interfaces';
import { Column, Entity } from 'typeorm';

@Entity()
export class FileEntity extends BaseEntity {
  @Column({
    type: 'tinyint',
    width: 1,
    default: FileStatus.pending,
  })
  status: FileStatus;

  @Column({
    comment: '原始文件名',
    type: 'tinytext',
    name: 'origin_name',
  })
  originalName: string;

  @Column({
    comment: '存储桶名',
    type: 'tinytext',
    name: 'bucket_name',
  })
  bucketName: string;

  @Column({
    comment: 'OSS中的路径',
    type: 'tinytext',
    name: 'object_name',
  })
  objectName: string;

  @Column({
    comment: '签名地址，给用户进行访问',
    type: 'tinytext',
    name: 'sign_url',
    nullable: true,
  })
  signUrl?: string;

  @Column({
    comment: '是否为公共文件',
    type: 'tinyint',
    name: 'is_public',
    width: 1,
  })
  isPublic?: BooleanType;

  @Column({
    comment: '文件大小',
    type: 'int',
    nullable: true,
  })
  size?: number;

  @Column({
    comment: '文件类型',
    type: 'tinytext',
    name: 'mine_type',
    nullable: true,
  })
  mimeType?: string;

  @Column({
    type: 'varchar',
    width: 36,
    comment: '上传用户id',
    name: 'uploader_id',
  })
  uploaderId: string;

  @Column({
    type: 'text',
    comment: '自定义元数据',
    name: 'meta_data',
    nullable: true,
  })
  metaData?: string;

  @Column({
    type: 'tinyint',
    comment: '签名地址过期时间',
    name: 'expire_at',
    nullable: true,
  })
  expireAt?: number;
}
