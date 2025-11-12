<template>
  <div class="payment grid grid-cols-2 grid-rows-1 q-gutter-md q-mt-md">
    <q-card class="my-card">
      <q-card-section>
        <div class="text-h6">Payment Types</div>
      </q-card-section>
    </q-card>
    <q-card class="my-card">
      <q-card-section>
        <div class="text-h6">Progress</div>
        <div>
          <LinearProgress
            :track_color="'white'"
            :progress="progress1"
            :size="'25px'"
            class="rounded-lg"
            :color="'green'"
          >
            <div class="absolute-full flex flex-center">
              <Badge :color="'white'" :label="progressLabel1" :text_color="'black'" />
            </div>
          </LinearProgress>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { Badge, LinearProgress } from 'src/components/atoms'
import { ref } from 'vue'

const progress1 = ref(0.8)
const progressLabel1 = ref(80)
</script>

<style></style>
