import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { FileEntity } from 'file/entities/file.entity';

export class FileRepository extends Repository<FileEntity> {
  constructor(
    @InjectRepository(FileEntity)
    private readonly userRepository: Repository<FileEntity>,
  ) {
    super(FileEntity, userRepository.manager, userRepository.queryRunner);
  }
}
