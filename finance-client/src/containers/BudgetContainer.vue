<template>
  <div>
    <ViewBudget
      :data="budgets"
      @deleteBudget="deleteBudget"
      :categories="userCategories"
      @createBudget="createBudget"
      @editBudget="editBudget"
      :stats="stats"
    ></ViewBudget>
  </div>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { financeServerURL } from 'src/boot/config'
import { ViewBudget } from 'src/components/organisms'
import { deleteMethod } from 'src/composables/api-method/delete'
import { postMethod } from 'src/composables/api-method/post'
import { putMethod } from 'src/composables/api-method/put'
import { useSocketEvents } from 'src/composables/javascript/useSocketEvents'
import { budgetApiStore } from 'src/stores/budget-api'
import { categoryApiStore } from 'src/stores/category-api'
import { onMounted, ref } from 'vue'

// global variables
const $q = useQuasar()
const budgetStore = budgetApiStore()
const categoryStore = categoryApiStore()

// -------------- category ------------
const userCategories = ref([])
const getAllCategories = async () => {
  await categoryStore.getAllCategory($q)
  userCategories.value = categoryStore.category
}

// -------------- budget --------------
const budgets = ref([])
const stats = ref(null)
const getAllBudgets = async () => {
  await budgetStore.getAllBudget($q)
  budgets.value = budgetStore.budget

  await budgetStore.getStats($q)
  stats.value = budgetStore.stats
}

const deleteBudget = async (payload) => {
  await deleteMethod(financeServerURL, 'budget', payload.id)
}

const createBudget = async (payload) => {
  await postMethod(financeServerURL, 'budget', payload, $q, 'Бюджет успешно создан')
}

const editBudget = async (payload, id) => {
  console.log(payload, id)

  await putMethod(financeServerURL, `budget/${id}`, payload, $q, {})
}

// ------- output ------------
const main = () => {
  getAllBudgets()
  getAllCategories()
}

onMounted(() => {
  main()
})

const messages = ref([])
useSocketEvents({
  budgetUpdated: () => {
    main()
  },
  newMessage: (msg) => messages.value.push(msg),
})
</script>

<style></style>
