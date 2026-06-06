<template>
  <div class="h-full w-full">
    <MapBoxMap search-enabled />
  </div>

  <MapDebugGui />
</template>

<script lang="ts" setup>
  // import { useQuery } from '@tanstack/vue-query'
  // import { storeToRefs } from 'pinia'
  // import { watch } from 'vue'
  import {
    // useMapStore,
    useRouteSyncedCoords,
  } from '@/entities/map'
  // import { uvQueries } from '@/entities/uv'
  import MapBoxMap from '@/widgets/MapBoxMap.vue'
  import MapDebugGui from '@/widgets/MapDebugGui.vue'

  useRouteSyncedCoords()

  // const { lastClicked } = storeToRefs(useMapStore())
  // const { data, isFetching } = useQuery(uvQueries.getForecast(lastClicked))
</script>
