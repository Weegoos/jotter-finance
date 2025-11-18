<template>
  <div class="payment grid grid-cols-2 grid-rows-1 q-gutter-md q-mt-md w-[101%]">
    <q-card class="my-card">
      <q-card-section>
        <div class="text-h6">Payment Types</div>
        <PolarChart :series-data="props.paymentData"></PolarChart>
      </q-card-section>
    </q-card>
    <q-card class="my-card">
      <div class="text-h6 q-mt-md q-ml-md">Goal Progress</div>
      <BarChart :categories="props.categories" :series-data="props.data"></BarChart>
    </q-card>
  </div>
</template>

<script setup>
// import { Badge, LinearProgress } from "src/components/atoms";
import { BarChart, PolarChart } from "src/components/molecules";
import { ref, watch } from "vue";
const props = defineProps({
  goal: Object,
  categories: Object,
  data: Object,
  paymentData: Object,
});

const progress1 = ref(props.goal.progress);

watch(
  () => props.goal.progress,
  (newVal) => {
    progress1.value = newVal;
  }
);

// const progressLabel1 = computed(() => (progress1.value * 100).toFixed(2) + '%')
</script>

<style></style>
