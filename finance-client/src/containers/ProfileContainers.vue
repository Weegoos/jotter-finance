<template>
  <div>
    <q-img
      src="../assets/profile/line.jpg"
      :ratio="16 / 9"
      style="height: 140px; max-width: 100vw"
    />
    <q-card class="grid grid-rows-1 grid-cols-2">
      <q-card-section>
        <div class="row justify-start items-center">
          <p class="text-bold text-xl q-mr-sm">{{ userInfo.firstName }} {{ userInfo.lastName }}</p>
          <q-avatar style="width: 8px; height: 8px" color="green" text-color="white" />
        </div>
        <p class="q-mr-sm">{{ userInfo.email }}</p>
      </q-card-section>
      <q-card-section class="row justify-center">
        <Button label="Edit Profile" flat />
      </q-card-section>
    </q-card>
    <div class="grid grid-rows-1 grid-cols-2 q-gutter-md">
      <q-card style="background-color: #f5f5f5" class="q-m-2 q-pa-md"> Something </q-card>
      <q-card class="bg-grey-2 q-m-2 q-pa-md">
        <q-card-section>
          <p>User Settings</p>
          <Button
            :label="userInfo.settings?.general?.theme"
            rounded
            outline
            class="q-mr-sm text-capitalize"
          />
          <Button
            :label="userInfo.settings?.general?.language"
            rounded
            outline
            class="q-mr-sm text-capitalize"
          />
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { userServerURL } from 'src/boot/config'
import { Button } from 'src/components/atoms'
import { useApiStore } from 'src/stores/user-api'
import { onMounted, ref } from 'vue'

// global variables
const userInfo = ref([])
const userApi = useApiStore()
const $q = useQuasar()

const getCurrentUserInfo = async () => {
  await userApi.getUserInfo(userServerURL, $q)
  userInfo.value = userApi.userData
}

onMounted(() => {
  getCurrentUserInfo()
})
</script>

<style></style>
