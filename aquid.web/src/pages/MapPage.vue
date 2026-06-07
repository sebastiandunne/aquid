<template>
  <div class="map-ui-wrap h-full w-full">
    <MapBoxMap search-enabled />

    <SelectionInfoWidget
      :has-data="hasData"
      :is-fetching="isFetching"
    >
      <UvOverview
        :is-fetching-uv="isFetchingUv"
        :uv-data="uvData"
      />
    </SelectionInfoWidget>
  </div>

  <MapDebugGui v-if="showDebugUi" />
</template>

<script lang="ts" setup>
  import { useQuery } from '@tanstack/vue-query'
  import { useRouteQuery } from '@vueuse/router'
  import { storeToRefs } from 'pinia'
  import { computed } from 'vue'
  import SelectionInfoWidget from '@/components/SelectionInfoWidget.vue'
  import UvOverview from '@/components/UvOverview.vue'
  import { useAirQualityLocationMeasurements, useLocationStore } from '@/entities/air-quality'
  import {
    useMapStore,
    useRouteSyncedCoords,
  } from '@/entities/map'
  import { uvQueries } from '@/entities/uv'
  import { routeTransformBoolean } from '@/shared/route-transformers'
  import MapBoxMap from '@/widgets/MapBoxMap.vue'
  import MapDebugGui from '@/widgets/MapDebugGui.vue'

  const showDebugUi = useRouteQuery('debug', 'false', routeTransformBoolean())

  useRouteSyncedCoords()

  const { lastClicked } = storeToRefs(useMapStore())
  const { data: uvData, isFetching: isFetchingUv } = useQuery(uvQueries.getForecast(lastClicked))

  const { selectedLocation } = storeToRefs(useLocationStore())
  const { data: aqData, isFetching: isFetchingAq } = useAirQualityLocationMeasurements({
    location: selectedLocation,
  })

  const hasData = computed(() => !!uvData.value /* || !!aqData.value */)
  const isFetching = computed(() => isFetchingUv.value /* || isFetchingAq.value */)

</script>
