<template>
  <div class="payment grid grid-cols-2 grid-rows-1 q-gutter-md q-mt-md">
    <q-card class="my-card">
      <q-card-section>
        <div class="text-h6">Payment Types</div>
      </q-card-section>
    </q-card>
    <q-card class="my-card">
      <div class="text-h6 q-mt-md q-ml-md">Goal Progress</div>
      <q-card-section v-for="(item, index) in goal.budgets" :key="index" class="q-mb-md">
        <span class="text-sm font-medium text-gray-700">
          Budget {{ index + 1 }} - Category: {{ item.category.name }}
        </span>

        <!-- Прогрессбар -->
        <LinearProgress
          :track_color="'grey'"
          :progress="item.progress"
          :size="'25px'"
          class="rounded-full relative overflow-hidden"
          :color="'green'"
        >
          <div class="absolute-full flex items-center justify-center">
            <Badge
              :color="'white'"
              :label="`${(item.progress * 100).toFixed(0)}%`"
              :text_color="'black'"
            />
          </div>
        </LinearProgress>

        <!-- Сумма бюджета -->
        <div class="text-xs text-gray-500">Goal amount: {{ item.goal_amount }}</div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { Badge, LinearProgress } from 'src/components/atoms'
import { ref, watch } from 'vue'

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

// const progressLabel1 = computed(() => (progress1.value * 100).toFixed(2) + '%')
</script>

<style></style>
