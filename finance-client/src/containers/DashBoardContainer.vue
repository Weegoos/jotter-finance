<template>
  <section>
    <div class="search grid grid-cols-2 grid-rows-1 q-gutter-md">
      <div class="items-center">
        <Input class="q-mt-sm" :label="'Search'" rounded />
      </div>
      <div class="row q-gutter-sm items-center">
        <Input :label="'Dates'" rounded />
        <Button class="text-black" outline rounded :label="'Export CSV'" />
        <q-avatar size="36px" class="flex justify-end items-end">
          <img src="https://cdn.quasar.dev/img/avatar.png" />
        </q-avatar>
      </div>
    </div>

    <Balance
      @submit="createTransaction"
      :activeAccounts="activeAccounts.data"
      :categories="categories"
      @createCategory="createCategory"
      @deleteCategory="deleteCategory"
      :balance="totalBalance"
    />

    <div class="payment grid grid-cols-2 grid-rows-1 q-gutter-md q-mt-md">
      <q-card class="my-card">
        <q-card-section>
          <div class="text-h6">Payment Types</div>
        </q-card-section>
      </q-card>
      <q-card class="my-card">
        <q-card-section>
          <div class="text-h6">Goals</div>
        </q-card-section>
      </q-card>
    </div>

    <div class="account q-mt-md">
      <q-card class="grid grid-cols-2 grid-rows-1">
        <q-card-section class="">
          <div class="text-h6">Graphs</div>
        </q-card-section>
        <q-card-section class="col">
          <div v-if="activeAccounts.data?.length > 0">
            <div v-for="(items, index) in activeAccounts.data" :key="index">
              <p>{{ items.name }}</p>

              <p class="q-mb-md">{{ items.balance }} {{ items.currency }}</p>
            </div>
            <Pagination :variableName="Object(activeAccounts)" @pagination="pagination" />
          </div>
          <div v-else>Пока нету активных счетов</div>
        </q-card-section>
      </q-card>
    </div>
    <TransactionOverview
      :data="transactions"
      @deleteTransaction="deleteTransaction"
      @updateTransaction="updateTransaction"
    ></TransactionOverview>
  </section>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { accountLimit, financeServerURL, viewLimitedTransaction } from 'src/boot/config'
import { Button, Input } from 'src/components/atoms'
import { Pagination } from 'src/components/molecules'
import { Balance, TransactionOverview } from 'src/components/organisms'
import { deleteMethod } from 'src/composables/api-method/delete'
import { postMethod } from 'src/composables/api-method/post'
import { putMethod } from 'src/composables/api-method/put'
import { useSocketEvents, useTotalBalance } from 'src/composables/javascript/useSocketEvents'
import { accountsApiStore } from 'src/stores/accounts-api'
import { categoryApiStore } from 'src/stores/category-api'
// import { statsApiStore } from 'src/stores/stats-api'
import { transactionApiStore } from 'src/stores/transaction-api'
import { onMounted, ref } from 'vue'

// globalVariables
const accountStore = accountsApiStore()
const categoryStore = categoryApiStore()
const transactionStore = transactionApiStore()
// const statStore = statsApiStore()
const $q = useQuasar()

const activeAccounts = ref([])
const current = ref(1)
const getAccountByStatus = async (page) => {
  await accountStore.getAccountsByStatus($q, true, accountLimit, page)
  activeAccounts.value = accountStore.accountsByStatus
}

const pagination = (page) => {
  current.value = page
  getAccountByStatus(current.value)
  getTransactions()
}
// categories
const categories = ref([])
const getCategories = async () => {
  await categoryStore.getAllCategory($q)
  categories.value = categoryStore.category
}

const createCategory = async (payload) => {
  await postMethod(financeServerURL, 'categories', payload, $q, 'Категория успешно создана')
}

const deleteCategory = async (item) => {
  await deleteMethod(financeServerURL, 'categories', item.id)
}

// transaction
const transactions = ref([])
const getTransactions = async () => {
  await transactionStore.getAllTransaction($q, viewLimitedTransaction, 1)
  transactions.value = transactionStore.transaction
}

const createTransaction = async (payload) => {
  await postMethod(financeServerURL, 'transactions', payload, $q, 'Транзакция создана успешно')
}

const deleteTransaction = async (row) => {
  await deleteMethod(financeServerURL, 'transactions', row.id)
}

const updateTransaction = async (payload, transactionID) => {
  await putMethod(financeServerURL, `transactions/${transactionID}`, payload, $q, {})
}

// stats
const { totalBalance, fetchTotalBalance } = useTotalBalance($q)
const refreshBalance = async () => {
  await fetchTotalBalance()
  console.log('Обновлённый баланс:', totalBalance.value)
}

const messages = ref([])
useSocketEvents({
  accountUpdated: () => {
    getAccountByStatus(current.value)
  },
  transactionUpdated: () => {
    getTransactions()
  },
  categoryUpdated: () => {
    getCategories()
  },
  newMessage: (msg) => messages.value.push(msg),
})

onMounted(() => {
  getAccountByStatus(current.value)
  getTransactions()
  getCategories()
  refreshBalance()
})
</script>
