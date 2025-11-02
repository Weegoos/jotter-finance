<template>
  <q-layout view="lhh Lpr lFf">
    <q-header elevated> </q-header>
    <q-drawer
      side="left"
      v-model="drawerLeft"
      bordered
      :width="200"
      :breakpoint="500"
      content-class="bg-grey-3"
    >
      <p class="q-ma-md">Jotter Finance</p>

      <q-separator reversed />
      <Button
        :label="'Dashboard'"
        color="white"
        class="text-black w-full q-mt-sm"
        align="left"
        icon="mdi-compass-outline"
        @emitClick="$router.push('/')"
        flat
      />
      <DottedSeparator />
      <q-expansion-item label="SETTINGS" default-opened>
        <q-card>
          <q-card-section>
            <Button
              :label="'Profile Settings'"
              color="white"
              class="text-black w-full"
              align="left"
              icon="mdi-account-cog-outline"
              @emit-click="$router.push('/profile')"
              flat
            />
            <Button
              :label="'App Settings'"
              color="white"
              class="text-black w-full"
              align="left"
              icon="mdi-cog-outline"
              @emit-click="$router.push('/settings')"
              flat
            />
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { userServerURL } from 'src/boot/config'
import { Button, DottedSeparator } from 'src/components/atoms'
import { useApiStore } from 'src/stores/user-api'
import { onMounted, ref } from 'vue'

// global variables
const userApi = useApiStore()
const $q = useQuasar()

const drawerLeft = ref(false)

const role = ref('')
const getCurrentUserInfo = async () => {
  await userApi.getUserInfo(userServerURL, $q)
  role.value = userApi.role
  if (role.value) {
    drawerLeft.value = true
  } else {
    drawerLeft.value = false
  }
}

onMounted(() => {
  getCurrentUserInfo()
})
</script>

<style></style>
