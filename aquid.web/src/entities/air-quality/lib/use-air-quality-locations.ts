import type { MapBounds } from '@/entities/map/@x/air-quality'
import { useQuery } from '@tanstack/vue-query'
import { computed, type MaybeRefOrGetter } from 'vue'
import { airQualityQueries } from '../api/air-quality-queries'

export function useAirQualityLocations ({
  bounds,
}: {
  bounds: MaybeRefOrGetter<MapBounds | undefined>
}) {
  const query = useQuery(airQualityQueries.getLocations(bounds))

  const { isPending, isFetching, error, isError, data } = query

  const locations = computed(() => data.value?.results ?? [])
  const sensors = computed(() => locations.value.flatMap(location => location.sensors ?? []))

  return {
    isPending,
    isFetching,
    error,
    isError,
    locations,
    sensors,
  }
}
