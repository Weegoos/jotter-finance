<template>
  <div class="w-[100%]">
    <apexchart type="bar" :options="chartOptions" :series="series" height="350" />
  </div>
</template>

<script setup>
// import ApexCharts from "vue3-apexcharts";
import { ref, watch } from 'vue'

const props = defineProps({
  seriesData: Object,
  categories: Object,
})
const series = ref([])

watch(
  () => props.seriesData,
  (value) => {
    console.log(value)

    if (value && Array.isArray(value)) {
      // умножаем на 100
      const data = value.map((v) => Number((v * 100).toFixed(2)))

      series.value = [
        {
          name: 'Goal Progress',
          data: data,
        },
      ]
      console.log(series.value)
    } else {
      series.value = []
    }
  },
  { immediate: true },
)

const chartOptions = ref({
  chart: {
    type: 'bar',
    height: 350,
  },
  plotOptions: {
    bar: {
      borderRadius: 10,
      dataLabels: {
        position: 'top',
      },
    },
  },
  dataLabels: {
    enabled: true,
    formatter: function (val) {
      return val + '%'
    },
    offsetY: -20,
    style: {
      fontSize: '12px',
      colors: ['#304758'],
    },
  },
  xaxis: {
    categories: props.categories,
    position: 'top',
    axisBorder: { show: false },
    axisTicks: { show: false },
    crosshairs: {
      fill: {
        type: 'gradient',
        gradient: {
          colorFrom: '#D8E3F0',
          colorTo: '#BED1E6',
          stops: [0, 100],
          opacityFrom: 0.4,
          opacityTo: 0.5,
        },
      },
    },
    tooltip: { enabled: true },
  },
  yaxis: {
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: { show: false, formatter: (val) => val + '%' },
  },
  title: {
    text: 'Goals',
    floating: true,
    offsetY: 330,
    align: 'center',
    style: { color: '#444' },
  },
})
</script>
