import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventNames } from 'shared/enums';

@Injectable()
export class ConvRebuildService {
  constructor(private readonly eventEmitter: EventEmitter2) {}

  msgIdx(cids: string[]) {
    this.eventEmitter.emit(EventNames.MSG_INDEX_BATCH_REBUILD, cids);
  }
}
