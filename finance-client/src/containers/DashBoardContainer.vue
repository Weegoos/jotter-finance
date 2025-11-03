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

    <div class="total_balance q-mt-md">
      <q-card class="my-card">
        <q-card-section>
          <div class="text-h6">Total Balance</div>
          <div class="text-subtitle2">$ 3200</div>
        </q-card-section>
      </q-card>
    </div>

    <div class="payment grid grid-cols-2 grid-rows-1 q-gutter-md q-mt-md">
      <q-card class="my-card">
        <q-card-section>
          <div class="text-h6">Payment Types</div>
          <!-- <div class="text-subtitle2">$ 3200</div> -->
        </q-card-section>
      </q-card>
      <q-card class="my-card">
        <q-card-section>
          <div class="text-h6">Provider Breakdown</div>
          <!-- <div class="text-subtitle2">$ 3200</div> -->
        </q-card-section>
      </q-card>
    </div>

    <div class="account q-mt-md">
      <q-card class="grid grid-cols-2 grid-rows-1">
        <q-card-section class="">
          <div class="text-h6">Graphs</div>
          <!-- <div class="text-subtitle2">$ 3200</div> -->
        </q-card-section>
        <!-- {{ activeAccounts }} -->
        <q-card-section class="col">
          <div v-for="(items, index) in activeAccounts" :key="index">
            <div v-if="activeAccounts.length > 0" class="q-pa-md">
              <p>{{ items.name }}</p>

              <p class="q-mb-md">{{ items.balance }} {{ items.currency }}</p>
              <q-separator />
            </div>
            <div v-else>Ничего нету</div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </section>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { Button, Input } from 'src/components/atoms'
import { accountsApiStore } from 'src/stores/accounts-api'
import { onMounted, ref } from 'vue'
// globalVariables
const accountStore = accountsApiStore()
const $q = useQuasar()

const activeAccounts = ref([])
const getAccountByStatus = async () => {
  await accountStore.getAccountsByStatus($q, true)
  activeAccounts.value = accountStore.accountsByStatus
  console.log(activeAccounts.value)
}

onMounted(() => {
  getAccountByStatus()
})
</script>

<style></style>
