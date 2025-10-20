<template>
  <div class="container">
    <section class="wrapper fixed-center">
      <div class="p-[16px]">
        <!-- <Icon align="center" /> -->
        <p
          class="flex justify-center text-bold font-medium p-[16px]"
          :class="$q.screen.width < mobileWidth ? 'text-xl' : 'text-2xl'"
        >
          Create your account
        </p>
      </div>
      <q-card
        class="p-[24px]"
        :class="$q.screen.width < mobileWidth ? 'w-[300px]' : 'w-[400px]'"
        bordered
      >
        <q-card-section>
          <Form
            @submit="register"
            @mainButton="register"
            @moveButton="router.push('/login')"
            mainButtonLabel="Create account"
            moveButtonLabel="Do you have an account? Log in"
            additionalButtonLabel="Create with Google Account"
            :mainButtonClass="'text-black q-mt-md q-mr-sm'"
            :moveButtonClass="'text-black q-mt-md'"
            additionalButtonClass="q-mt-sm w-[100%] text-black"
          >
            <Input
              placeholder="First Name"
              dense
              outlined
              v-model="firstName"
              class="q-mt-sm"
              type="text"
            />
            <Input
              placeholder="Last Name"
              dense
              outlined
              v-model="lastName"
              class="q-mt-sm"
              type="text"
            />
            <Input
              placeholder="Email address"
              dense
              outlined
              v-model="email"
              class="q-mt-sm"
              type="text"
            />
            <Input
              class="q-mt-sm"
              dense
              outlined
              v-model="password"
              :type="isPwd ? 'password' : 'text'"
              placeholder="Password"
            >
              <template #append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </Input>
          </Form>
        </q-card-section>
      </q-card>
    </section>
  </div>
</template>

<script setup>
import { getCurrentInstance, ref } from 'vue'
import { useQuasar } from 'quasar'
import { successMessage } from 'src/composables/notify/successMessage';
import axios from 'axios'
import { useRouter } from 'vue-router'
import { Input } from 'src/components/atoms'
import { Form } from 'src/components/molecules'

// global variables
const { proxy } = getCurrentInstance()
const mobileWidth = proxy.$mobileWidth
const userServerURL = proxy.$userServerURL
const $q = useQuasar()
const router = useRouter()

const firstName = ref('')
const lastName = ref('')
const password = ref('')
const email = ref('')
const isPwd = ref(true)

const register = async () => {
  try {
    const response = await axios.post(`${userServerURL}users/register`, {
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      password: password.value,
    })
    successMessage($q, `${response.data.user.firstName} вы успешно зарегистрированы!`);
    console.log(response.data.user.firstName)

    router.push('/')
  } catch (error) {
    console.error(error)
  }
}
</script>
