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

    <OrganismDashboardBalance @submit="createTransaction" :activeAccounts="activeAccounts" :categories="categories"/>

    <div class="payment grid grid-cols-2 grid-rows-1 q-gutter-md q-mt-md">
      <q-card class="my-card">
        <q-card-section>
          <div class="text-h6">Payment Types</div>
        </q-card-section>
      </q-card>
      <q-card class="my-card">
        <q-card-section>
          <div class="text-h6">Provider Breakdown</div>
        </q-card-section>
      </q-card>
    </div>

    <div class="account q-mt-md">
      <q-card class="grid grid-cols-2 grid-rows-1">
        <q-card-section class="">
          <div class="text-h6">Graphs</div>
        </q-card-section>
        <q-card-section class="col">
          <div v-if="activeAccounts.length > 0">
            <div v-for="(items, index) in activeAccounts" :key="index">
              <p>{{ items.name }}</p>

              <p class="q-mb-md">{{ items.balance }} {{ items.currency }}</p>
              <q-separator />
            </div>
          </div>
          <div v-else>Пока нету активных счетов</div>
        </q-card-section>
      </q-card>
    </div>

    <div class="transaction-overview q-mt-md">
      <q-card class="my-card">
        <q-card-section>
          <div class="text-h6">Transaction Overview</div>
          <div class="text-subtitle2">by John Doe</div>
        </q-card-section>
        <q-card-section>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit
        </q-card-section>
      </q-card>
    </div>
  </section>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { financeServerURL } from 'src/boot/config'
import { Button, Input } from 'src/components/atoms'
import OrganismDashboardBalance from 'src/components/organisms/dashboard/OrganismDashboardBalance.vue'
import { postMethod } from 'src/composables/api-method/post'
import { useSocketEvents } from 'src/composables/javascript/useSocketEvents'
import { accountsApiStore } from 'src/stores/accounts-api'
import { categoryApiStore } from 'src/stores/category-api'
import { onMounted, ref } from 'vue'
// globalVariables
const accountStore = accountsApiStore()
const categoryStore = categoryApiStore()
const $q = useQuasar()

const activeAccounts = ref([])
const getAccountByStatus = async () => {
  await accountStore.getAccountsByStatus($q, true)
  activeAccounts.value = accountStore.accountsByStatus
}

const categories = ref([])
const getCategories = async () => {
  await categoryStore.getAllCategory($q)
  categories.value = categoryStore.category
}

const messages = ref([])
useSocketEvents({
  accountUpdated: () => {
    getAccountByStatus()
  },
  newMessage: (msg) => messages.value.push(msg),
})

const createTransaction = async (payload) => {
  await postMethod(financeServerURL, 'transactions', payload, $q, 'Транзакция создана успешно')
}

onMounted(() => {
  getAccountByStatus()
  getCategories()
})
</script>

<style></style>
