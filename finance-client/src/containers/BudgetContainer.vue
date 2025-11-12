<template>
  <div>
    <ViewBudget :data="budgets" @deleteBudget="deleteBudget"></ViewBudget>
  </div>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { financeServerURL } from 'src/boot/config'
import { ViewBudget } from 'src/components/organisms'
import { deleteMethod } from 'src/composables/api-method/delete'
import { budgetApiStore } from 'src/stores/budget-api'
import { onMounted, ref } from 'vue'

// global variables
const $q = useQuasar()
const budgetStore = budgetApiStore()

const budgets = ref([])
// -------------- budget --------------
const getAllBudgets = async () => {
  await budgetStore.getAllBudget($q)
  budgets.value = budgetStore.budget
  console.log(budgets.value)
}

const deleteBudget = async (payload) => {
  console.log(payload)
  await deleteMethod(financeServerURL, 'budget', payload.id)
}

// ------- output ------------
const main = () => {
  getAllBudgets()
}

onMounted(() => {
  main()
})
</script>

<style></style>
