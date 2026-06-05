import type { AirQualityService } from './air-quality-service'
import type { components } from '@/types/aquid-schema'
import { type QueryKey, queryOptions, type UseQueryOptions } from '@tanstack/vue-query'
import { type MaybeRefOrGetter, toValue } from 'vue'
import { QueryFactory } from '@/shared/services/base-query-factory'
import { aquidServices } from '../_global/aquid-services'

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
}

export const airQualityQueries = new AirQualityQueries(aquidServices.airQuality)
