<template>
  <div>
    <ViewBudget
      :data="budgets"
      @deleteBudget="deleteBudget"
      :categories="userCategories"
    ></ViewBudget>
  </div>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { financeServerURL } from 'src/boot/config'
import { ViewBudget } from 'src/components/organisms'
import { deleteMethod } from 'src/composables/api-method/delete'
import { budgetApiStore } from 'src/stores/budget-api'
import { categoryApiStore } from 'src/stores/category-api'
import { onMounted, ref } from 'vue'

// global variables
const $q = useQuasar()
const budgetStore = budgetApiStore()
const categoryStore = categoryApiStore()

const budgets = ref([])
// -------------- category ------------
const userCategories = ref([])
const getAllCategories = async () => {
  await categoryStore.getAllCategory($q)
  userCategories.value = categoryStore.category
}

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
  getAllCategories()
}

onMounted(() => {
  main()
})
</script>

<style></style>
