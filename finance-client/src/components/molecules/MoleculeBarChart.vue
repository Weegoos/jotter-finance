<template>
  <div class="w-[90%]">
    <apexchart
      v-if="ready"
      type="bar"
      :options="chartOptions"
      :series="series"
      height="350"
    />
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  seriesData: Array,
  categories: Array,
});

const series = ref([]);
const ready = ref(false);

watch(
  () => props.seriesData,
  (value) => {
    if (Array.isArray(value) && value.length > 0) {
      const data = value.map((v) => Number((v * 100).toFixed(2)));

      series.value = [
        {
          name: "Goal Progress",
          data,
        },
      ];

      ready.value = false;
      requestAnimationFrame(() => (ready.value = true));
    }
  },
  { immediate: true }
);

const chartOptions = ref({
  chart: { type: "bar", height: 350 },
  plotOptions: {
    bar: { borderRadius: 10, dataLabels: { position: "top" } },
  },
  dataLabels: {
    enabled: true,
    formatter: (val) => val + "%",
    offsetY: -20,
    style: { fontSize: "12px", colors: ["#304758"] },
  },
  xaxis: {
    categories: [],
    position: "top",
    axisBorder: { show: false },
    axisTicks: { show: false },
    tooltip: { enabled: true },
  },
  yaxis: {
    labels: { show: false, formatter: (val) => val + "%" },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  title: {
    text: "Goals",
    floating: true,
    offsetY: 330,
    align: "center",
    style: { color: "#444" },
  },
});

watch(
  () => props.categories,
  (value) => {
    if (Array.isArray(value) && value.length > 0) {
      chartOptions.value.xaxis.categories = value;

      ready.value = false;
      requestAnimationFrame(() => (ready.value = true));
    }
  },
  { immediate: true }
);
</script>
