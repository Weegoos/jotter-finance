<template>
  <div class="w-[90%]">
    <apexchart type="polarArea" :options="chartOptions" :series="series" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  seriesData: {
    type: Array,
    default: () => [14, 23, 21, 17, 15],
  },
  labelsData: {
    type: Array,
    default: () => ['Food', 'Rent', 'Transport', 'Entertainment', 'Savings'],
  },
})

const series = ref(props.seriesData)

const chartOptions = ref({
  labels: props.labelsData,
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
</script>
