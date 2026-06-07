<template>
  <div v-if="props.uvData" class="h-full w-full overflow-auto">
    <h3 class="text-lg font-semibold mb-2">UV Index Forecast</h3>

    <div class="flex items-center mb-2">
      <p class="text-sm mb-1">Max. UV index:</p>
      <UvIndexIndicator :uv-index="props.uvData.meta.max?.uv" />
    </div>

    <p class="text-sm mb-1">Risk level: {{ props.uvData.meta.max?.uv_time.at(0) }}</p>
    <p class="text-sm mb-1">Forecast time: {{ dayjs(props.uvData.meta.max?.uv_time).toLocaleString() }}</p>
  </div>

  <div v-else-if="!props.isFetching" class="h-full w-full flex items-center justify-center">
    <p class="text-sm text-gray-500">No UV index data available</p>
  </div>
</template>

<script lang="ts" setup>
  import type { components } from '@/types/aquid-schema'
  import dayjs from 'dayjs'
  import UvIndexIndicator from '@/components/UvIndexIndicator.vue'

  const props = defineProps<{
    uvData?: components['schemas']['UltravioletForecastMetaResponse']
    isFetching?: boolean
  }>()
</script>
