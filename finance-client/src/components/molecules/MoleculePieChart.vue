<template>
  <apexchart width="380" type="pie" :options="chartOptions" :series="series" />
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  seriesData: {
    type: Object,
    required: true,
    default: () => ({ array: [] }),
  },
})

const series = ref([])

watch(
  () => props.seriesData,
  (value) => {
    if (value && Array.isArray(value.array)) {
      series.value = value.array
      console.log(series.value)
    } else {
      series.value = []
    }
  },
  { immediate: true },
)

const chartOptions = ref({
  labels: ['Active', 'Inactive', 'Total'],
  legend: { position: 'bottom' },
})
</script>
