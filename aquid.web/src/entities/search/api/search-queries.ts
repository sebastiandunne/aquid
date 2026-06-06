import type { MapboxSuggestResponse } from '../model/search'
import type { SearchService } from './search-service'
import { type QueryKey, queryOptions, type UseQueryOptions } from '@tanstack/vue-query'
import { type MaybeRefOrGetter, toValue } from 'vue'
import { QueryFactory } from '@/shared/services/base-query-factory'
import { aquidServices } from '../../_global/aquid-services'

const MIN_QUERY_LENGTH = 2

export class SearchQueries extends QueryFactory<SearchService> {
  readonly all = ['search']

  constructor (service: SearchService) {
    super(service)
  }

  suggest (
    query: MaybeRefOrGetter<string>,
    sessionToken: MaybeRefOrGetter<string>,
    limit?: number,
  ): UseQueryOptions<MapboxSuggestResponse> {
    return queryOptions({
      queryKey: [...this.all, 'suggest', query] as QueryKey,
      queryFn: async () => {
        const q = toValue(query)
        const token = toValue(sessionToken)
        if (q.length < MIN_QUERY_LENGTH) {
          throw new Error('Query must be at least 2 characters')
        }
        return this.service.suggest(q, token, limit)
      },
      enabled: () => toValue(query).length >= MIN_QUERY_LENGTH,
    })
  }
}

export const searchQueries = new SearchQueries(aquidServices.search)
