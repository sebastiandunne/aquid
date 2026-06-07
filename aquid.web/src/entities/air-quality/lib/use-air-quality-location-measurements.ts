import type { AirQualityLocation } from '../model/location'
import { useQueries } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter, toValue } from 'vue'
import { airQualityQueries } from '../api/air-quality-queries'

export function useAirQualityLocationMeasurements ({
  location,
}: {
  location: MaybeRefOrGetter<AirQualityLocation | undefined | null>
}) {
  const locationRef = computed(() => toValue(location))
  const sensors = computed(() => locationRef.value?.sensors ?? [])
  const sensorIds = computed(() => sensors.value.map(sensor => sensor.id) ?? [])

  const queries = useQueries({
    queries: computed(() => sensorIds.value.map(sensorId => airQualityQueries.getDailyMeasurements(sensorId))),
    combine: queries => {
      const isPending = queries.some(query => query.isPending)
      const isFetching = queries.some(query => query.isFetching)
      const isError = queries.some(query => query.isError)
      const error = queries.find(query => query.isError)?.error

      const data = queries.every(query => query.data)
        ? queries.map(query => query.data!)
        : undefined

      return {
        isPending,
        isFetching,
        isError,
        error,
        data,
      }
    },
  })

  return {
    isPending: computed(() => queries.value.isPending),
    isFetching: computed(() => queries.value.isFetching),
    error: computed(() => queries.value.error),
    isError: computed(() => queries.value.isError),
    data: computed(() => queries.value.data),
    sensors,
    sensorIds,
  }
}
