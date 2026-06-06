import type { UvService } from './uv-service'
import type { LngLat } from '@/entities/map/@x/global'
import type { components } from '@/types/aquid-schema'
import type { Dayjs } from 'dayjs'
import { type QueryKey, queryOptions, type UseQueryOptions } from '@tanstack/vue-query'
import dayjs from 'dayjs'
import { type MaybeRefOrGetter, toValue } from 'vue'
import { aquidServices } from '@/entities/_global/aquid-services'
import { QueryFactory } from '@/shared/services/base-query-factory'

export class UvQueries extends QueryFactory<UvService> {
  all = ['uv']

  constructor (service: UvService) {
    super(service)
  }

  getForecast (coordinates: MaybeRefOrGetter<LngLat | null>, date?: MaybeRefOrGetter<Dayjs | string>): UseQueryOptions<components['schemas']['UltravioletForecastMetaResponse']> {
    return queryOptions({
      queryKey: [...this.all, 'forecast', coordinates, date] as QueryKey,
      queryFn: async () => {
        const deRefCoordinates = toValue(coordinates)
        const deRefDate = toValue(date)
        const parsedDate = deRefDate ? dayjs(deRefDate) : undefined

        if (parsedDate && !parsedDate.isValid()) {
          throw new Error('Invalid date format. Please provide a valid date string or Dayjs object.')
        }

        if (!deRefCoordinates) {
          throw new Error('Coordinates are required to fetch UV forecast')
        }

        const response = await this.service.getForecast(deRefCoordinates, parsedDate)

        if (response.data) {
          return response.data as components['schemas']['UltravioletForecastMetaResponse']
        } else {
          throw new Error('Failed to fetch UV forecast for the given coordinates and date')
        }
      },
      enabled: () => !!toValue(coordinates),
    })
  }
}

export const uvQueries = new UvQueries(aquidServices.uv)
