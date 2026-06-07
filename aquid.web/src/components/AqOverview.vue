<template>
  <div v-if="hasData" class="h-full w-full flex flex-col justify-between">
    <div class="h-full w-full flex flex-col">
      <h3 class="text-lg font-semibold mb-2">Air Quality Metrics</h3>

      <div v-if="currentDataset" class="flex-1 min-h-0 overflow-auto pr-1">
        <div v-if="latestMeasurements.length > 0" class="space-y-1">
          <div
            v-for="metric in latestMeasurements"
            :key="metric.key"
            class="grid grid-cols-[minmax(0,1.2fr)_auto_auto_auto] gap-x-2 items-baseline text-xs leading-4 py-1 border-b border-gray-200/70"
          >
            <p class="font-medium truncate" :title="metric.label">Metric: {{ metric.label }}</p>
            <p class="tabular-nums whitespace-nowrap">{{ metric.value }}</p>
            <p class="text-gray-600 whitespace-nowrap">{{ metric.time }}</p>
            <p class="text-gray-500 whitespace-nowrap">{{ metric.coverage }}</p>
          </div>
        </div>

        <p v-else class="text-xs text-gray-500 py-2">
          No measurements found for this dataset.
        </p>
      </div>
    </div>

    <v-pagination
      v-if="(props.aqData?.length ?? 0) > 1"
      v-model="currentPage"
      active-color="primary"
      density="compact"
      :length="totalPages"
      :total-visible="4"
    />
  </div>

  <div v-if="!props.isFetching && !hasData" class="flex items-center justify-center">
    <p class="text-sm text-gray-500">No air quality data available</p>
  </div>
</template>

<script lang="ts" setup>
  import type { components } from '@/types/aquid-schema'
  import dayjs from 'dayjs'
  import { computed, ref, watch } from 'vue'
  import { formatDate } from '@/entities/_global/config/format-date'

  type AirQualityResponse = components['schemas']['AirQualityMeasurementsResponse']
  type AirQualityResult = AirQualityResponse['results'][number]

  interface LatestMetric {
    key: string
    label: string
    value: string
    time: string
    coverage: string
  }

  const props = defineProps<{
    aqData?: AirQualityResponse[]
    isFetching?: boolean
  }>()

  const currentPage = ref(1)

  const hasData = computed(() => !!props.aqData?.length)
  const totalPages = computed(() => Math.max(props.aqData?.length ?? 0, 1))

  const currentDataset = computed(() => {
    if (!props.aqData?.length) {
      return
    }

    return props.aqData[currentPage.value - 1]
  })

  const latestMeasurements = computed<LatestMetric[]>(() => {
    const latestResults = pickLatestMeasurements(currentDataset.value?.results ?? [])

    return latestResults.map(result => ({
      key: getResultKey(result),
      label: getMetricLabel(result),
      value: formatMetricValue(result),
      time: formatMeasurementTime(result),
      coverage: formatCoverage(result),
    }))
  })

  watch(
    () => props.aqData,
    () => {
      currentPage.value = 1
    },
  )

  watch(totalPages, pages => {
    if (currentPage.value > pages) {
      currentPage.value = pages
    }
  })

  function pickLatestMeasurements (results: AirQualityResult[]): AirQualityResult[] {
    const latestByMetric = new Map<string, AirQualityResult>()

    for (const result of results) {
      const key = getResultKey(result)
      const existing = latestByMetric.get(key)

      if (!existing || getMeasurementTimestamp(result) > getMeasurementTimestamp(existing)) {
        latestByMetric.set(key, result)
      }
    }

    const ordered: AirQualityResult[] = []

    for (const result of latestByMetric.values()) {
      const insertAt = ordered.findIndex(item => getMetricLabel(item).localeCompare(getMetricLabel(result)) > 0)
      if (insertAt === -1) {
        ordered.push(result)
        continue
      }

      ordered.splice(insertAt, 0, result)
    }

    return ordered
  }

  function getResultKey (result: AirQualityResult): string {
    const id = result.parameter.id
    return id ? `metric-${id}` : `metric-${result.parameter.name}`
  }

  function getMetricLabel (result: AirQualityResult): string {
    return result.parameter.displayName || result.parameter.name
  }

  function formatMetricValue (result: AirQualityResult): string {
    if (result.value == null) {
      return 'No reading'
    }

    return result.parameter.units ? `${result.value} ${result.parameter.units}` : `${result.value}`
  }

  function formatMeasurementTime (result: AirQualityResult): string {
    const utcTime = result.period.dateTimeTo.utc || result.period.dateTimeFrom.utc
    if (!utcTime) {
      return '--'
    }

    return formatDate(utcTime)
  }

  function formatCoverage (result: AirQualityResult): string {
    if (!result.coverage) {
      return '--'
    }

    return `${result.coverage.percentCoverage}%`
  }

  function getMeasurementTimestamp (result: AirQualityResult): number {
    const toTime = toTimestamp(result.period.dateTimeTo.utc)
    const fromTime = toTimestamp(result.period.dateTimeFrom.utc)
    return Math.max(toTime, fromTime)
  }

  function toTimestamp (value: string | undefined): number {
    if (!value) {
      return 0
    }

    const timestamp = Date.parse(value)
    return Number.isFinite(timestamp) ? timestamp : 0
  }
</script>
