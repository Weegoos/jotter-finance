<template>
  <section>
    <div class="grid grid-cols-3 gap-6">
      <q-card
        class="q-ma-md q-pa-sm"
        v-for="(item, index) in userAccounts"
        :key="index"
        style="border-radius: 10px"
      >
        <q-card-section class="grid grid-cols-2 grid-rows-1 items-center">
          <div class="text-h6">
            <p class="text-capitalize">{{ item.name }} / {{ item.type }}</p>
          </div>
          <div class="flex justify-end">
            <Dropdown
              dropdown-icon="mdi-dots-horizontal"
              :data="accountButtons"
              @onItemClick="(actionItem) => handleClick(actionItem, item)"
            />
          </div>
        </q-card-section>
        <q-card-section>
          <span class="text-subtitle1"> Balance: {{ item.balance }} {{ item.currency }}</span>
        </q-card-section>
        <Dialog :modelValue="openEditAccountDialog">
          <template #content>
            <Close :sectionName="'Изменение сведения'" @emitClick="openEditAccountDialog = false" />
            <section>
              <Input label="Название счета" v-model="name" class="q-mb-sm" />
              <Input label="Тип счета" v-model="type" class="q-mb-sm" />
              <Input label="Баланс в счете" v-model="balance" type="number" class="q-mb-sm" />
              <Input label="Валюта" v-model="currency" class="q-mb-sm" />
            </section>
          </template>
          <template #actions>
            <Button
              :label="'Обновить'"
              rounded
              @emit-click="editAccountInformation(item)"
              class="text-black"
            ></Button>
          </template>
        </Dialog>
      </q-card>
    </div>
    <div class="q-ma-md q-pa-sm">
      <Button
        class="text-black"
        rounded
        icon="mdi-plus"
        @emit-click="isCreateAccountDialog = true"
      ></Button>
      <Dialog :modelValue="isCreateAccountDialog">
        <template #content>
          <Close :sectionName="'Добавьте счет'" @emitClick="isCreateAccountDialog = false" />
          <Input class="q-mb-sm" :label="'Название счета'" v-model="accountName"></Input>
          <Input class="q-mb-sm" :label="'Тип счета'" v-model="accountType"></Input>
          <Input class="q-mb-sm" :label="'Укажите баланс'" v-model="accountBalance"></Input>
          <Select
            :label="'Выберите валюту'"
            v-model="currencyName"
            :options="currenciesArray"
          ></Select>
        </template>
        <template #actions>
          <Button
            :label="'Создать'"
            rounded
            @emit-click="createAccount()"
            class="text-black"
          ></Button>
        </template>
      </Dialog>
    </div>
  </section>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { financeServerURL } from 'src/boot/config'
import { Button, Input, Select } from 'src/components/atoms'
import { Close, Dialog, Dropdown } from 'src/components/molecules'
import { deleteMethod } from 'src/composables/api-method/delete'
import { postMethod } from 'src/composables/api-method/post'
import { putMethod } from 'src/composables/api-method/put'
import { accountsApiStore } from 'src/stores/accounts-api'
import { computed, onMounted, ref } from 'vue'
// global variables
const accountApi = accountsApiStore()
const $q = useQuasar()

const userAccounts = ref([])
const currenciesArray = ref(['USD', 'Euro'])
const getUserAccounts = async () => {
  await accountApi.getAllAccounts($q)
  userAccounts.value = accountApi.accounts
}

const openEditAccountDialog = ref(false)
const accountButtons = computed(() => [
  {
    label: 'Edit',
    icon: 'mdi-pencil',
    action: (account) => {
      openEditAccountDialog.value = true
      name.value = account.name
      type.value = account.type
      currency.value = account.currency
      balance.value = account.balance
    },
  },
  {
    label: 'Delete',
    icon: 'mdi-delete',
    action: (account) => {
      deleteAccount(account)
    },
  },
])

const handleClick = (actionItem, accountItem) => {
  if (actionItem.action) {
    actionItem.action(accountItem)
  }
}
const deleteAccount = async (data) => {
  await deleteMethod(financeServerURL, 'accounts', data.id)
}

const name = ref('')
const type = ref('')
const currency = ref('')
const balance = ref('')
const editAccountInformation = async (account) => {
  const payload = {
    name: name.value,
    type: type.value,
    currency: currency.value,
    balance: balance.value,
  }

  await putMethod(financeServerURL, `accounts/${account.id}`, payload, $q, {})
}

const accountName = ref('')
const accountType = ref('')
const accountBalance = ref('')
const currencyName = ref(null)

const createAccount = async () => {
  const payload = {
    name: accountName.value,
    type: accountType.value,
    currency: currencyName.value,
    balance: accountBalance.value,
  }
  await postMethod(financeServerURL, 'accounts', payload, $q, 'Счет успешно создан')
}

const isCreateAccountDialog = ref(false)
onMounted(() => {
  getUserAccounts()
})
</script>
