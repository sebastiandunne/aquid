<template>
  <div class="map-ui-wrap h-full w-full">
    <MapBoxMap search-enabled />

    <SelectionInfoWidget
      :has-data="hasData"
      :is-fetching="isFetching"
    >
      <UvOverview
        v-if="selectedPanel === 'uv'"
        :is-fetching="isFetchingUv"
        :uv-data="uvData"
      />

      <AqOverview
        v-else-if="selectedPanel === 'aq'"
        :aq-data="aqData"
        :is-fetching="isFetchingAq"
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
  import AqOverview from '@/components/AqOverview.vue'
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
  const lastClickedLocation = computed(() => lastClicked.value?.location)
  const { data: uvData, isFetching: isFetchingUv } = useQuery(uvQueries.getForecast(lastClickedLocation))

  const { selectedLocation } = storeToRefs(useLocationStore())
  const selectedLocationData = computed(() => selectedLocation.value?.data)
  const { data: aqData, isFetching: isFetchingAq } = useAirQualityLocationMeasurements({
    location: selectedLocationData,
  })

  const lastClickedTime = computed(() => lastClicked.value?.time)
  const locationTime = computed(() => selectedLocation.value?.time)

  const selectedPanel = computed((): 'uv' | 'aq' | undefined => {
    if (!lastClickedTime.value && !locationTime.value) {
      return
    }
    if (!lastClickedTime.value) {
      return 'aq'
    }
    if (!locationTime.value) {
      return 'uv'
    }

    return lastClickedTime.value > locationTime.value ? 'uv' : 'aq'
  })

  const hasData = computed(() => !!uvData.value /* || !!aqData.value */)
  const isFetching = computed(() => isFetchingUv.value /* || isFetchingAq.value */)

</script>
