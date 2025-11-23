<template>
  <div class="h-[10%] w-[90%]">
    <apexchart v-if="ready" type="pie" :options="chartOptions" :series="series" />
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  seriesData: Object, // { series: [], labels: [] }
})

const ready = ref(false)
const series = ref([])
const chartOptions = ref({
  chart: {
    width: 380,
    type: 'pie',
  },
  labels: [], // <-- пустой массив по умолчанию
  colors: ['#93C3EE', '#E5C6A0', '#669DB5'],
  fill: {
    type: 'image',
    opacity: 0.85,
    image: {
      src: [
        'https://upload.wikimedia.org/wikipedia/ru/a/aa/Logo_of_Kaspi_bank.png',
        'https://yt3.googleusercontent.com/Sn_GXCGr3i0bj-nMnWWjVJek-KT06DtPIMsNseEIJYuVXAR6RFeE2R2Mw6Dmv0C-_HoUvSs1=s900-c-k-c0x00ffffff-no-rj',
        'https://play-lh.googleusercontent.com/pFDY9q0gZ3Nd783I1wH6AfCchB5DeK3F0qmgAOgWLwmwpBPr9YoiKQUNxzwMeT5nL7g',
      ],
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
      series.value = [...val.series]
      chartOptions.value.labels = [...val.labels]

      // подрезаем картинки под серии
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
