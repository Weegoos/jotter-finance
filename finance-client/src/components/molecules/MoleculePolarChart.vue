<template>
  <div>
    <div v-if="!hasData" class="text-center text-gray-500 py-10">
      Совершите свою первую транзакцию
    </div>
    <apexchart v-else type="polarArea" width="500" :options="chartOptions" :series="series" />
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  seriesData: {
    type: Object,
    default: () => ({ array: [] }),
  },
})

const series = ref([])

watch(
  () => props.seriesData,
  (val) => {
    series.value = val.types
  },
)

const chartOptions = ref({
  labels: ['Expense', 'Income'],
  stroke: {
    colors: ['#fff'],
  },
  fill: {
    opacity: 0.8,
  },
  chart: {
    toolbar: {
      show: true,
      tools: {
        download: true, // кнопка скачать PNG/SVG
        selection: false,
        zoom: false,
        zoomin: false,
        zoomout: false,
        pan: false,
        reset: true,
      },
      export: {
        csv: { filename: 'polar-chart-data' }, // можно CSV включить
        svg: { filename: 'polar-chart' },
        png: { filename: 'polar-chart' },
      },
    },
  },
  responsive: [
    {
      breakpoint: 480,
      options: {
        chart: {
          width: 200,
        },
        legend: {
          position: 'bottom',
        },
      },
    },
  ],
})

const hasData = computed(() => {
  return Array.isArray(props.seriesData) && props.seriesData.length > 0
})
</script>
