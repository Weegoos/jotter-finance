<template>
  <div class="payment grid grid-cols-2 grid-rows-1 q-gutter-md q-mt-md">
    <q-card class="my-card">
      <q-card-section>
        <div class="text-h6">Payment Types</div>
      </q-card-section>
    </q-card>
    <q-card class="my-card">
      <q-card-section>
        <div class="text-h6">Goal Progress</div>
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
        <p>
          You are ahead of pace and should
          <strong>reach {{ props.goal.goal_amount }} USD</strong>
        </p>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { Badge, LinearProgress } from 'src/components/atoms'
import { computed, ref, watch } from 'vue'

const props = defineProps({
  goal: Object,
})

const progress1 = ref(props.goal.progress)

watch(
  () => props.goal,
  (newVal) => {
    console.log(newVal)
  },
)

watch(
  () => props.goal.progress,
  (newVal) => {
    progress1.value = newVal
  },
)

const progressLabel1 = computed(() => (progress1.value * 100).toFixed(2) + '%')
</script>

<style></style>
