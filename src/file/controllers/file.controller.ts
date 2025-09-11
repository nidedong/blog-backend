import { Controller, Get, Body, Delete, Query, Put } from '@nestjs/common';
import { FileService } from '../services/file.service';
import { PresignedUploadUrlDto } from 'file/dtos/presigned.upload.url.dto';
import { User } from 'shared/decorator';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Get('/presigned-upload-url')
  presignedPutObject(
    @Query() dto: PresignedUploadUrlDto,
    @User('id') userId: string,
  ) {
    return this.fileService.presignedPutObject(userId!, dto);
  }

  @Put('/uploading/finished')
  finishUpload(@Body('id') fileId: string) {
    return this.fileService.finishUpload(fileId);
  }

  @Get('/presigned-download-url')
  presignedGetObject(@Query('name') objectName: string) {
    return this.fileService.presignedGetObject(objectName);
  }

  @Delete('/remove-file')
  removeFile() {}
}
