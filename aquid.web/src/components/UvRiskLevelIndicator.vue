<template>
  <v-progress-circular
    v-if="props.minutes === undefined"
    color="primary"
    indeterminate
  />

  <v-avatar
    v-else
    :color="getUvSkinTone(props.skinTone)"
    size="32"
  >
    <p class="text-sm font-semibold">{{ minutesText }}</p>
  </v-avatar>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { getUvSkinTone } from '@/entities/uv/config/get-uv-skin-tone'

  const { n } = useI18n()

  const props = withDefaults(defineProps<{
    minutes: number | undefined
    skinTone?: number
  }>(), {
    skinTone: 0,
  })

  const minutesText = computed(() => props.minutes === undefined
    ? ''
    : n(props.minutes, { minimumFractionDigits: 1, maximumFractionDigits: 1 }))
</script>
