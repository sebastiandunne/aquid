<template>
  <span>Input your favourite country code:</span>
  <v-text-field v-model="countryCode" label="Country Code" />
  <v-skeleton-loader v-if="isFetching" type="article" />

  <div v-else-if="error">
    <h2>Error fetching country data</h2>
    <p>{{ error.message }}</p>
  </div>

  <div v-for="country in countryData.results" v-else-if="!!countryData" :key="country.id">
    <h2>{{ country.name }}</h2>
    <p>{{ country.code }}</p>
  </div>
</template>

<script setup lang="ts">
  import { useQuery } from '@tanstack/vue-query'
  import { ref } from 'vue'
  import { airQualityQueries } from '@/entities/air-quality/air-quality-queries'
  import { useDebounced } from '@/shared/lib/debounce'

  const countryCode = ref('')

  const {
    debounced: debouncedCountryCode,
  } = useDebounced({
    valueRef: countryCode,
  })

  const { data: countryData, error, isFetching } = useQuery(airQualityQueries.getCountry(debouncedCountryCode))

</script>
