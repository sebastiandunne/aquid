import type { AirQualityService } from './air-quality-service'
import type { MapBounds } from '@/entities/map/model/store'
import type { components } from '@/types/aquid-schema'
import { type QueryKey, queryOptions, type UseQueryOptions } from '@tanstack/vue-query'
import { type MaybeRefOrGetter, toValue } from 'vue'
import { QueryFactory } from '@/shared/services/base-query-factory'
import { aquidServices } from '../../_global/aquid-services'

export class AirQualityQueries extends QueryFactory<AirQualityService> {
  all = ['air-quality']

  constructor (service: AirQualityService) {
    super(service)
  }

  getCountry (countryCode: MaybeRefOrGetter<string>): UseQueryOptions<components['schemas']['AirQualityCountryResponse']> {
    return queryOptions({
      queryKey: [...this.all, 'countries', countryCode] as QueryKey,
      queryFn: async () => {
        const deRefCountryCode = toValue(countryCode)
        if (!deRefCountryCode) {
          throw new Error('Country code is required to fetch country information')
        }
        const response = await this.service.getCountry(deRefCountryCode)
        if (response.data) {
          return response.data as components['schemas']['AirQualityCountryResponse']
        } else {
          throw new Error(`Failed to fetch information for country code: ${deRefCountryCode}`)
        }
      },
      enabled: () => !!toValue(countryCode),
    })
  }

  getLocations (bounds: MaybeRefOrGetter<MapBounds | undefined>): UseQueryOptions<components['schemas']['AirQualityLocationsResponse']> {
    return queryOptions({
      queryKey: [...this.all, 'locations', bounds] as QueryKey,
      queryFn: async () => {
        console.log('fetching locations with bounds:', toValue(bounds))
        const deRefBounds = toValue(bounds)
        if (!deRefBounds) {
          throw new Error('Bounds are required to fetch locations')
        }
        const response = await this.service.getLocations(deRefBounds)
        if (response.data) {
          return response.data as components['schemas']['AirQualityLocationsResponse']
        } else {
          throw new Error('Failed to fetch locations for the given bounds')
        }
      },
      enabled: () => !!toValue(bounds),
    })
  }
}

export const airQualityQueries = new AirQualityQueries(aquidServices.airQuality)
