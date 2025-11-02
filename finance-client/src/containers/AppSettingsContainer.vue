<template>
  <div>
    <FixedImagesForSettings />
    <q-card class="grid justify-center items-start">
      <q-card-section>
        <div class="text-h4 text-bold q-mb-md">Настройки</div>
        <div class="q-mb-md">
          <p class="text-bold">Язык</p>
          <div class="grid grid-cols-2 grid-rows-1 gap-6 items-center">
            <p>Выбери язык. Изменения вступят в силу после перезапуска приложения.</p>
            <Input :label="userInfo?.settings?.general?.language" class="text-capitalize" />
          </div>
        </div>
        <div>
          <p class="text-bold">Вид</p>
          <div class="grid grid-cols-2 grid-rows-1 gap-6 items-center">
            <p>
              Выбери тему интерфейса для комфортной работы. Изменения вступят в силу после
              перезапуска приложения.
            </p>

            <Input :label="userInfo?.settings?.general?.theme" class="text-capitalize" />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { userServerURL } from 'src/boot/config'
import { FixedImagesForSettings, Input } from 'src/components/atoms'
import { useApiStore } from 'src/stores/user-api'
import { onMounted, ref } from 'vue'

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
