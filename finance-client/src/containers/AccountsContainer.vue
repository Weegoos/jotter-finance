<template>
  <section>
    <div class="grid grid-cols-3 gap-6">
      <q-card
        class="q-ma-md q-pa-sm"
        v-for="(item, index) in userAccounts"
        :key="index"
        style="border-radius: 10px"
      >
        <q-card-section>
          <div class="text-h6">
            <p class="text-capitalize">{{ item.name }} / {{ item.type }}</p>
          </div>
        </q-card-section>
        <q-card-section>
          <span class="text-subtitle1"> Balance: {{ item.balance }} {{ item.currency }}</span>
        </q-card-section>
      </q-card>
    </div>
  </section>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { accountsApiStore } from 'src/stores/accounts-api'
import { onMounted, ref } from 'vue'

// global variables
const accountApi = accountsApiStore()
const $q = useQuasar()

const userAccounts = ref([])
const getUserAccounts = async () => {
  await accountApi.getAllAccounts($q)
  userAccounts.value = accountApi.accounts
}

onMounted(() => {
  getUserAccounts()
})
</script>

<style></style>
