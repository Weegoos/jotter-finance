<template>
  <section>
    <div class="grid grid-cols-3 gap-6">
      <q-card
        class="q-ma-md q-pa-sm"
        v-for="(item, index) in userAccounts.data"
        :key="index"
        style="border-radius: 10px"
      >
        <q-card-section class="grid grid-cols-2 grid-rows-1 items-start">
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
        <q-card-section class="grid grid-cols-2 grid-rows-1 items-center">
          <div>
            <span class="text-subtitle1"> Balance: {{ item.balance }} {{ item.currency }}</span>
          </div>
          <div>
            <span
              class="text-subtitle1 p-[8px]"
              style="border: solid #000 1px; border-radius: 48px"
              >{{ item.active === true ? 'Активен' : 'Неактивен' }}</span
            >
          </div>
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
    <Pagination :variableName="Object(userAccounts)" @pagination="pagination" />
    <div class="q-ma-md q-pa-sm grid justify-end">
      <Button
        class="text-black"
        rounded
        icon="mdi-plus"
        @emit-click="isCreateAccountDialog = true"
      ></Button>
      <Dialog :modelValue="isCreateAccountDialog">
        <template #content>
          <Close :sectionName="'Добавьте счет'" @emitClick="isCreateAccountDialog = false" />
          <q-select
            dense
            outlined
            v-model="selectedBank"
            use-input
            option-value="id"
            option-label="name"
            emit-value
            map-options
            input-debounce="0"
            label="Выберите банк"
            :options="createAccountBankOptions"
            @filter="filterFn"
            @update:model-value="onBankSelect"
            class="q-mb-sm"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> No results </q-item-section>
              </q-item>
            </template>
          </q-select>
          <Input
            class="q-mb-sm"
            :label="'Укажите баланс'"
            :type="'number'"
            v-model="accountBalance"
          >
            <template v-slot:append>
              <q-icon name="mdi-currency-eur" />
            </template>
          </Input>
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
import { accountLimit, financeServerURL } from 'src/boot/config'
import { Button, Input } from 'src/components/atoms'
import { Close, Dialog, Dropdown, Pagination } from 'src/components/molecules'
import { deleteMethod } from 'src/composables/api-method/delete'
// import { patchMethod } from 'src/composables/api-method/patch'
import { postMethod } from 'src/composables/api-method/post'
import { putMethod } from 'src/composables/api-method/put'
import { useSocketEvents } from 'src/composables/javascript/useSocketEvents'
import { accountsApiStore } from 'src/stores/accounts-api'
import { bankApiStore } from 'src/stores/bank-api'
import { computed, onMounted, ref } from 'vue'

// global variables
const accountApi = accountsApiStore()
const bankApi = bankApiStore()
const $q = useQuasar()

const userAccounts = ref([])

const current = ref(1)
// account
const getUserAccounts = async (page) => {
  await accountApi.getAllAccounts($q, accountLimit, page)
  userAccounts.value = accountApi.accounts
}

const pagination = (page) => {
  current.value = page
  getUserAccounts(current.value)
}

const messages = ref([])
useSocketEvents({
  accountUpdated: () => {
    getUserAccounts(current.value)
  },
  newMessage: (msg) => messages.value.push(msg),
})

const openEditAccountDialog = ref(false)
const accountStatus = ref(null)
const accountButtons = computed(() => [
  {
    label: 'Изменить статус',
    icon: 'mdi-credit-card-chip',
    action: (account) => {
      accountStatus.value = !account.active
      const payload = {
        active: accountStatus.value,
      }

      putMethod(financeServerURL, `accounts/${account.id}`, payload, $q, {})
    },
  },
  {
    label: 'Редактировать',
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
    label: 'Удалить',
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

const accountBalance = ref('')

const selectedBank = ref(null)

function onBankSelect(bankId) {
  const bank = allBanks.value.find((b) => b.id === bankId)
  if (bank) {
    selectedBank.value = bank
  }
}

const createAccount = async () => {
  const payload = {
    name: selectedBank.value.name,
    type: selectedBank.value.type,
    currency: selectedBank.value.currency,
    balance: accountBalance.value,
    active: false,
    bankId: selectedBank.value.id,
  }
  console.log(payload)

  await postMethod(financeServerURL, 'accounts', payload, $q, 'Счет успешно создан')
}

const isCreateAccountDialog = ref(false)

// bank
const allBanks = ref([])
const createAccountBankOptions = ref([])

const getAllBanks = async () => {
  await bankApi.getAllBanks($q)
  allBanks.value = bankApi.bank
  createAccountBankOptions.value = allBanks.value.map((bank) => ({
    id: bank.id,
    name: bank.name.trim(),
    type: bank.type,
  }))
}

function filterFn(val, update) {
  const needle = val.toLowerCase().trim()
  update(() => {
    createAccountBankOptions.value =
      needle === ''
        ? allBanks.value.map((bank) => ({ id: bank.id, name: bank.name.trim() }))
        : allBanks.value
            .map((bank) => ({ id: bank.id, name: bank.name.trim() }))
            .filter((bank) => bank.name.toLowerCase().includes(needle))
  })
}

onMounted(() => {
  getUserAccounts(current.value)
  getAllBanks()
})
</script>
