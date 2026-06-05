import type { BaseService } from './base-service'

export abstract class QueryFactory<T extends BaseService> {
  protected readonly service: T
  abstract all: string[]

  constructor (service: T) {
    this.service = service
  }
}
