<template>
  <v-sheet
    class="
      selection-info-wrap
      fixed
      z-1
      left-4
      bottom-6
      h-60
      w-full
      max-w-100
      p-4
      bg-white/90
      dark:bg-gray-800/90
      border
      border-gray-300
      dark:border-gray-600
      shadow-lg
      backdrop-blur-sm
      max-[450px]:left-0
      max-[450px]:right-0
      max-[450px]:bottom-0
      max-[450px]:max-w-none
      max-[450px]:w-full
      px-0
      pt-0
    "
    elevation="2"
    rounded
  >
    <div class="h-4 w-full flex items-start justify-center m-0">
      <v-progress-linear v-if="isFetching" color="primary" indeterminate />
    </div>

    <!-- loading overlay -->
    <div
      v-if="isFetching"
      class="absolute inset-0 bg-gray-200/50 dark:bg-gray-700/50 z-10"
    />

    <div v-if="data" class="h-full w-full px-4 overflow-auto">
      <h3 class="text-lg font-semibold mb-2">UV Index Forecast</h3>

      <div class="flex items-center mb-2">
        <p class="text-sm mb-1">Max. UV index:</p>
        <UvIndexIndicator :uv-index="data.meta.max?.uv" />
      </div>

      <p class="text-sm mb-1">Risk level: {{ data.meta.max?.uv_time.at(0) }}</p>
      <p class="text-sm mb-1">Forecast time: {{ dayjs(data.meta.max?.uv_time).toLocaleString() }}</p>
    </div>

    <div v-else class="h-full w-full flex items-center justify-center">
      <p class="text-sm text-gray-500">Click or tap on the map to see data</p>
    </div>

  </v-sheet>
</template>

<script lang="ts" setup>
  import type { components } from '@/types/aquid-schema'
  import dayjs from 'dayjs'
  import UvIndexIndicator from '@/components/UvIndexIndicator.vue'

  const props = defineProps<{
    data?: components['schemas']['UltravioletForecastMetaResponse']
    isFetching: boolean
  }>()
</script>
