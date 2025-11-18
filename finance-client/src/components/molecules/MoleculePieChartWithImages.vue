<template>
  <div class="h-[10%] w-[90%]">
    <apexchart class="h-[10%]" type="pie" :options="chartOptions" :series="series" />
  </div>
</template>

<script setup>
import { ref } from "vue";

// Пропсы можно добавить, если нужно динамическое обновление
const series = ref([122, 44]);

const chartOptions = ref({
  chart: {
    width: 380,
    type: "pie",
  },
  labels: ["Kaspi Bank", "Halyk Bank"], // <-- Названия секторов
  colors: ["#93C3EE", "#E5C6A0"],
  fill: {
    type: "image",
    opacity: 0.85,
    image: {
      src: [
        "https://upload.wikimedia.org/wikipedia/ru/a/aa/Logo_of_Kaspi_bank.png",
        "https://yt3.googleusercontent.com/Sn_GXCGr3i0bj-nMnWWjVJek-KT06DtPIMsNseEIJYuVXAR6RFeE2R2Mw6Dmv0C-_HoUvSs1=s900-c-k-c0x00ffffff-no-rj",
      ],
      width: 25,
      imagedHeight: 25,
    },
  },
  stroke: {
    width: 4,
  },
  dataLabels: {
    enabled: true,
    style: {
      colors: ["#111"],
    },
    background: {
      enabled: true,
      foreColor: "#fff",
      borderWidth: 0,
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
          position: "bottom",
        },
      },
    },
  ],
});
</script>
