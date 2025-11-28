<template>
  <q-layout view="hHh Lpr fFf">
    <q-header elevated class="bg-black h-[80px] flex items-center">
      <q-toolbar class="grid grid-cols-2">
        <div class="flex items-center justify-end gap-14">
          <div class="flex-none fixed-left cursor-pointer">
            <Icon @click="$router.push('/')"></Icon>
          </div>
          <div class="flex-2 row q-gutter-sm" v-if="role">
            <Button
              class="text-subtitle1 text-balance"
              :label="'Dashboard'"
              unelevated
              rounded
              @emit-click="$router.push('/dashboard')"
            >
            </Button>
            <Button
              class="text-subtitle1 text-balance"
              :label="'Account'"
              unelevated
              rounded
              @emit-click="$router.push('/accounts')"
            >
            </Button>
            <Button
              class="text-subtitle1 text-balance"
              :label="'Budget'"
              unelevated
              rounded
              @emit-click="$router.push('/budget')"
            >
            </Button>
            <Button class="text-subtitle1 text-balance" :label="'About Us'" unelevated rounded>
            </Button>
            <Button class="text-subtitle1 text-balance" :label="'Blog'" unelevated rounded>
            </Button>
          </div>
        </div>
        <div class="flex items-center justify-end gap-4" v-if="!role">
          <Button
            class="text-subtitle1 text-balance"
            :label="'Login'"
            unelevated
            rounded
            @emit-click="$router.push('/login')"
          >
          </Button>
          <Button
            :label="'Sign up'"
            class="bg-white text-black text-subtitle1 text-balance"
            unelevated
            rounded
            @emit-click="$router.push('/register')"
          >
          </Button>
        </div>
      </q-toolbar>
    </q-header>
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
      <q-expansion-item label="MANAGEMENT" default-opened>
        <q-card>
          <q-card-section>
            <Button
              :label="'Accounts'"
              color="white"
              class="text-black w-full"
              align="left"
              icon="mdi-credit-card"
              @emit-click="$router.push('/accounts')"
              flat
            />
            <Button
              :label="'Budget'"
              color="white"
              class="text-black w-full"
              align="left"
              icon="mdi-card-text-outline"
              @emit-click="$router.push('/budget')"
              flat
            />
          </q-card-section>
        </q-card>
      </q-expansion-item>
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
import { Button, DottedSeparator, Icon } from 'src/components/atoms'
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
    // drawerLeft.value = true;
  } else {
    drawerLeft.value = false
  }
}

onMounted(() => {
  getCurrentUserInfo()
})
</script>

<style></style>
