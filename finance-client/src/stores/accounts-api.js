import { defineStore } from 'pinia'
import { financeServerURL } from 'src/boot/config'
import { getMethod } from 'src/composables/api-method/get'

export const accountsApiStore = defineStore('account-api', {
  state: () => ({
    accounts: null,
  }),
  actions: {
    async getAllAccounts($q) {
      try {
        this.accounts = await getMethod(
          financeServerURL,
          'accounts',
          $q,
          'Информация об счетах получено',
        )
      } catch (error) {
        console.error(error)
      }
    },
  },
})
