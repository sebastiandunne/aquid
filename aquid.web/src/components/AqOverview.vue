<template>
  <!-- loading overlay -->
  <div
    v-if="props.isFetching"
    class="absolute inset-0 bg-gray-200/50 dark:bg-gray-700/50 z-10"
  />

  <div v-if="props.aqData" class="h-full w-full px-4 overflow-auto">
    <h3 class="text-lg font-semibold mb-2">UV Index Forecast</h3>

    <template
      v-if="!!props.aqData"
    >
      <div v-for="(datum, index) in props.aqData" :key="index">
        <p>{{ datum.results.map(r => r.value).join(',') }}</p>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
  import type { components } from '@/types/aquid-schema'

  const props = defineProps<{
    aqData?: components['schemas']['AirQualityMeasurementsResponse'][]
    isFetching?: boolean
  }>()
</script>
