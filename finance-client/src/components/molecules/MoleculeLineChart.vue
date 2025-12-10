<template>
  <div>
    <div v-if="!hasData" class="flex justify-self-center text-gray-500 py-10">
      Совершите свою первую транзакцию
    </div>
    <apexchart v-else type="area" :options="chartOptions" :series="series" height="350" />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  seriesData: Object, // { series: [], categories: [] }
})

const series = ref([])
const chartOptions = ref({
  chart: {
    type: 'area',
    height: 350,
    zoom: { enabled: false },
    toolbar: {
      show: true,
      tools: {
        download: true,
        selection: true,
        zoom: true,
        zoomin: true,
        zoomout: true,
        pan: true,
        reset: true,
      },
    },
  },
  dataLabels: { enabled: false },
  stroke: { curve: 'straight' },
  title: { text: 'Fundamental Analysis of Stocks', align: 'left' },
  subtitle: { text: 'Price Movements', align: 'left' },
  xaxis: { type: 'datetime', categories: [] }, // <- пустой по дефолту
  yaxis: { opposite: true },
  legend: { horizontalAlign: 'left' },
})

// Слежение за props.seriesData
watch(
  () => props.seriesData,
  (val) => {
    if (val) {
      series.value = val.series || []
      // Обновляем категории прямо в chartOptions
      chartOptions.value = {
        ...chartOptions.value,
        xaxis: {
          ...chartOptions.value.xaxis,
          categories: val.categories || [],
        },
      }
    }
  },
  { immediate: true },
)

const hasData = computed(() => {
  return Array.isArray(series.value) && series.value.length > 0
})
</script>
