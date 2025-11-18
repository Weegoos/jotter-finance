<template>
  <div class="account q-mt-md w-[100%]">
    <q-card class="grid grid-cols-2 grid-rows-1">
      <q-card-section class="">
        <div class="text-h6">Graphs</div>
        <div>
          <LineChart :seriesData="props.seriesData"></LineChart>
        </div>
      </q-card-section>
      <q-card-section class="col">
        <PieChartWithImages :seriesData="props.pieChartSeriesData"></PieChartWithImages>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { LineChart, PieChartWithImages } from 'src/components/molecules'
const props = defineProps({
  seriesData: Object,
  pieChartSeriesData: Object,
})
</script>

<style></style>
