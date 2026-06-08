<template>
  <div v-if="hasData" class="h-full w-full flex flex-col justify-between">
    <div class="h-full w-full flex flex-col">
      <div class="flex items-start justify-between mb-2">
        <h3 class="text-lg font-semibold">UV Index Forecast</h3>
        <UvIndexIndicator :uv-index="maxUv" />
      </div>

      <div class="flex-1 min-h-0 overflow-auto pr-1">
        <div class="space-y-1">
          <div class="grid grid-cols-[minmax(0,1.2fr)_auto] gap-x-2 items-center text-xs leading-4 py-1 border-b border-gray-200/70">
            <p class="font-medium truncate" title="Max UV index">Max UV index</p>
            <p class="tabular-nums whitespace-nowrap">{{ maxUvText }}</p>
          </div>

          <!-- <div class="grid grid-cols-[minmax(0,1.2fr)_auto] gap-x-2 items-center text-xs leading-4 py-1 border-b border-gray-200/70">
            <p class="font-medium truncate" title="Time to burn (minutes)">Time to burn (minutes)</p>
            <UvRiskLevelIndicator :minutes="timeToBurnMinutes" />
          </div> -->

          <div class="grid grid-cols-[minmax(0,1.2fr)_auto] gap-x-2 items-baseline text-xs leading-4 py-1 border-b border-gray-200/70">
            <p class="font-medium truncate" title="Peak forecast time">Peak forecast time</p>
            <p class="text-gray-600 whitespace-nowrap">{{ peakForecastTime }}</p>
          </div>

          <div class="grid grid-cols-[minmax(0,1.2fr)_auto] gap-x-2 items-baseline text-xs leading-4 py-1 border-b border-gray-200/70">
            <p class="font-medium truncate" title="Sun altitude">Sun altitude</p>
            <p class="tabular-nums whitespace-nowrap">{{ sunAltitudeText }}</p>
          </div>

          <div class="grid grid-cols-[minmax(0,1.2fr)_auto] gap-x-2 items-baseline text-xs leading-4 py-1 border-b border-gray-200/70">
            <p class="font-medium truncate" title="Sun azimuth">Sun azimuth</p>
            <p class="tabular-nums whitespace-nowrap">{{ sunAzimuthText }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-if="!props.isFetching && !hasData" class="h-full w-full flex items-center justify-center">
    <p class="text-sm text-gray-500">No UV index data available</p>
  </div>
</template>

<script lang="ts" setup>
  import type { components } from '@/types/aquid-schema'
  import dayjs from 'dayjs'
  import { computed } from 'vue'
  import UvIndexIndicator from '@/components/UvIndexIndicator.vue'
  import UvRiskLevelIndicator from '@/components/UvRiskLevelIndicator.vue'
  import { formatDate } from '@/entities/_global/config/format-date'

  type UltravioletForecastResponse = components['schemas']['UltravioletForecastMetaResponse']
  type UltravioletForecastResult = components['schemas']['UltravioletForecastResult']

  const props = defineProps<{
    uvData?: UltravioletForecastResponse
    isFetching?: boolean
  }>()

  const hasData = computed(() => !!props.uvData?.meta.max)
  const maxResult = computed(() => props.uvData?.meta.max ?? undefined)

  const maxUv = computed(() => maxResult.value?.uv)
  const maxUvText = computed(() => maxUv.value === undefined ? '--' : maxUv.value.toFixed(1))

  const timeToBurnMinutes = computed(() => getTimeToBurnMinutes(maxResult.value))

  const peakForecastTime = computed(() => {
    const value = maxResult.value?.uv_time

    return formatDate(value)
  })

  const sunAltitudeText = computed(() => formatAngle(maxResult.value?.sun_position.altitude))
  const sunAzimuthText = computed(() => formatAngle(maxResult.value?.sun_position.azimuth))

  function formatAngle (value: number | undefined): string {
    if (value == null || !Number.isFinite(value)) {
      return '--'
    }

    return `${value.toFixed(1)}°`
  }

  function getTimeToBurnMinutes (result: UltravioletForecastResult | undefined): number | undefined {
    if (!result) {
      return
    }

    const unknownResult = result as unknown as Record<string, unknown>

    const directMinutes = firstFiniteNumber(
      unknownResult.time_to_burn,
      unknownResult.timeToBurn,
      unknownResult.burn_time,
      unknownResult.burnTime,
    )
    if (directMinutes !== undefined) {
      return directMinutes
    }

    const safeExposure = firstObject(
      unknownResult.safe_exposure_time,
      unknownResult.safeExposureTime,
    )
    if (!safeExposure) {
      return
    }

    return firstFiniteNumber(
      safeExposure.st3,
      safeExposure.st2,
      safeExposure.st1,
      safeExposure.st4,
      safeExposure.st5,
      safeExposure.st6,
    )
  }

  function firstFiniteNumber (...values: unknown[]): number | undefined {
    for (const value of values) {
      const normalized = toFiniteNumber(value)
      if (normalized !== undefined) {
        return normalized
      }
    }
  }

  function toFiniteNumber (value: unknown): number | undefined {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }

    if (typeof value === 'string') {
      const parsed = Number.parseFloat(value)
      return Number.isFinite(parsed) ? parsed : undefined
    }

    return
  }

  function firstObject (...values: unknown[]): Record<string, unknown> | undefined {
    for (const value of values) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return value as Record<string, unknown>
      }
    }
  }
</script>
