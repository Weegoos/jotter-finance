<template>
  <div class="h-[10%] w-[90%]">
    <apexchart v-if="ready" type="pie" :options="chartOptions" :series="series" />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  seriesData: Object,
})

const ready = ref(false)
const series = ref([])

const chartOptions = ref({
  chart: {
    width: 380,
    type: 'pie',
  },
  labels: [],
  colors: ['#93C3EE', '#E5C6A0', '#669DB5'],
  fill: {
    type: 'image',
    opacity: 0.85,
    image: {
      src: [], // <-- будет заполняться из бэка
      width: 25,
      imagedHeight: 25,
    },
  },
  stroke: { width: 4 },
  dataLabels: {
    enabled: true,
    style: { colors: ['#111'] },
    background: { enabled: true, foreColor: '#fff', borderWidth: 0 },
  },
  responsive: [
    {
      breakpoint: 480,
      options: {
        chart: { width: 200 },
        legend: { position: 'bottom' },
      },
    },
  ],
})

watch(
  () => props.seriesData,
  (val) => {
    if (val && val.series?.length) {
      // series and labels
      series.value = [...val.series]
      chartOptions.value.labels = [...val.labels]

      // images from banks.icon_url
      if (val.banks?.length) {
        chartOptions.value.fill.image.src = val.banks.map((b) => b.icon_url)
      } else {
        chartOptions.value.fill.image.src = []
      }

      // truncate images to match series length
      chartOptions.value.fill.image.src = chartOptions.value.fill.image.src.slice(
        0,
        val.series.length,
      )

      ready.value = true
    }
  },
  { immediate: true },
)
</script>
