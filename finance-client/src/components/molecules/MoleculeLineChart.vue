<template>
  <apexchart type="area" :options="chartOptions" :series="series" height="350" />
</template>

<script setup>
import { ref, watch } from 'vue'

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
</script>
