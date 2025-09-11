import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';
import { PresignedUploadUrlDto } from 'file/dtos/presigned.upload.url.dto';
import { FileEntity } from 'file/entities/file.entity';
import { FileStatus } from 'file/interfaces/file.interface';
import { FileRepository } from 'file/repositories/file.repository';
import { TimeInterval } from 'shared/common';
import { ApiException } from 'shared/exception';
import { BooleanType } from 'shared/interfaces';
import { MinioService } from 'shared/services/minio/minio.service';

@Injectable()
export class FileService {
  constructor(
    private readonly minioService: MinioService,
    private readonly fileRepository: FileRepository,
  ) {}

  async presignedPutObject(userId: string, dto: PresignedUploadUrlDto) {
    let objectName = this.minioService.generateObjectPath(userId, {
      name: dto.name,
      type: dto.mimeType,
    });

    if (dto.isPublic) {
      objectName = this.minioService.withPublicUrl(objectName);
    }

    const { bucketName, uploadUrl } =
      await this.minioService.presignedPutObject(objectName);
    const fileEntity = new FileEntity();
    fileEntity.bucketName = bucketName;
    fileEntity.uploaderId = userId;
    fileEntity.isPublic = dto.isPublic;
    fileEntity.originalName = dto.name;
    fileEntity.objectName = objectName;
    fileEntity.mimeType = dto.mimeType;
    await this.fileRepository.insert(fileEntity);

    return {
      objectName,
      uploadUrl,
      id: fileEntity.id,
    };
  }

  async finishUpload(fileId: string) {
    const file = await this.fileRepository.findOneBy({ id: fileId });
    if (!file) {
      throw ApiException.tipError('file.file_not_exist');
    }

    let signUrl = null;

    const isPublic = file.isPublic === BooleanType.TRUE;

    if (isPublic) {
      signUrl = this.minioService.fillUrl(file.objectName);
    } else {
      signUrl = await this.minioService.presignedGetObject(file.objectName);
    }

    file.status = FileStatus.finished;
    file.signUrl = signUrl;
    file.expireAt = isPublic
      ? undefined
      : dayjs().valueOf() + TimeInterval.SevenDays;

    return this.fileRepository.save(file);
  }

  async presignedGetObject(fileId: string) {
    const file = await this.fileRepository.findOneBy({ id: fileId });
    if (!file) {
      throw ApiException.tipError('file.file_not_exist');
    }
    if (file.status !== FileStatus.finished) {
      throw ApiException.tipError('file.file_not_exist');
    }

    const isPublic = file.isPublic === BooleanType.TRUE;

    const signUrl = await this.minioService.presignedGetObject(file.objectName);
    await this.fileRepository.update(fileId, {
      signUrl,
      expireAt: isPublic
        ? undefined
        : dayjs().valueOf() + TimeInterval.SevenDays,
    });

    return signUrl;
  }
}
