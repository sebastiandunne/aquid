import type { MapboxClient } from '../../../shared/client/mapbox-client'
import type { MapboxRetrieveResponse, MapboxSuggestResponse } from '../model/search'
import { BaseService } from '@/shared/services/base-service'

export class SearchService extends BaseService<MapboxClient> {
  async suggest (query: string, sessionToken: string, limit = 5): Promise<MapboxSuggestResponse> {
    return this.client.suggest(query, sessionToken, limit)
  }

  async retrieve (id: string, sessionToken: string): Promise<MapboxRetrieveResponse> {
    return this.client.retrieve(id, sessionToken)
  }
}
