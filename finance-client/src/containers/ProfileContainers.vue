<template>
  <div>
    <FixedImagesForSettings />
    <q-card class="grid grid-rows-1 grid-cols-2">
      <q-card-section>
        <div class="row justify-start items-center">
          <p class="text-bold text-xl q-mr-sm">{{ userInfo.firstName }} {{ userInfo.lastName }}</p>
          <q-avatar style="width: 8px; height: 8px" color="green" text-color="white" />
        </div>
        <p class="q-mr-sm">{{ userInfo.email }}</p>
      </q-card-section>
      <q-card-section class="row justify-center">
        <Dropdown
          dropdown-icon="mdi-dots-horizontal"
          :data="profileButtons"
          @onItemClick="handleClick"
        >
        </Dropdown>
        <Dialog :modelValue="editPersonaInformation">
          <template #content>
            <div class="grid grid-cols-2 grid-rows-1 q-mb-md">
              <div class="text-2xl">
                <p>Данные профиля</p>
              </div>
              <div class="flex justify-end items-end">
                <Button
                  label="X"
                  rounded
                  flat
                  @emit-click="editPersonaInformation = false"
                ></Button>
              </div>
            </div>
            <div class="grid grid-cols-2 grid-rows-1">
              <q-avatar size="150px">
                <img
                  src="https://www.shutterstock.com/image-vector/avatar-gender-neutral-silhouette-vector-600nw-2470054311.jpg"
                />
              </q-avatar>

              <section>
                <Input label="First name" v-model="firstName" class="q-mb-sm" />
                <Input label="Last name" v-model="lastName" class="q-mb-sm" />
                <Input label="Email" v-model="email" class="q-mb-sm" />
              </section>
            </div>
          </template>
          <template #actions>
            <Button
              label="Edit"
              rounded
              class="text-black"
              @emit-click="editUserInformation"
            ></Button>
          </template>
        </Dialog>
      </q-card-section>
    </q-card>
    <q-card style="background-color: #f5f5f5" class="q-m-2 q-pa-md"> Здесь пока пусто </q-card>
  </div>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { userServerURL } from 'src/boot/config'
import { Button, FixedImagesForSettings, Input } from 'src/components/atoms'
import { Dialog, Dropdown } from 'src/components/molecules'
import { patchMethod } from 'src/composables/api-method/patch'
import { useApiStore } from 'src/stores/user-api'
import { computed, onMounted, ref } from 'vue'
// global variables
const userInfo = ref([])
const userApi = useApiStore()
const $q = useQuasar()

const firstName = ref('')
const lastName = ref('')
const email = ref('')
const userId = ref('')
const getCurrentUserInfo = async () => {
  await userApi.getUserInfo(userServerURL, $q)
  userInfo.value = userApi.userData
  firstName.value = userApi.userData.firstName
  lastName.value = userApi.userData.lastName
  email.value = userApi.userData.email
  userId.value = userApi.userData.id
}

const editPersonaInformation = ref(false)
const profileButtons = computed(() => [
  {
    label: 'Edit',
    icon: 'mdi-pencil',
    action: () => {
      editPersonaInformation.value = true
    },
  },
  {
    label: 'Copy link',
    icon: 'mdi-link',
    action: () => {
      console.log('Копирование ссылки')
    },
  },
])

function handleClick(item) {
  if (item.action) item.action()
}

const editUserInformation = async () => {
  const payload = {
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value,
  }
  await patchMethod(userServerURL, `users/user/${userId.value}`, payload, $q, {})
}

onMounted(() => {
  getCurrentUserInfo()
})
</script>

<style></style>
