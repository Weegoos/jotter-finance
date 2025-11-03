import { defineStore } from 'pinia'
import { financeServerURL } from 'src/boot/config'
import { getMethod } from 'src/composables/api-method/get'

export const accountsApiStore = defineStore('account-api', {
  state: () => ({
    accounts: null,
    accountsByStatus: null,
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

    async getAccountsByStatus($q, active) {
      try {
        this.accountsByStatus = await getMethod(financeServerURL, `accounts/${active}`, $q)
      } catch (error) {
        console.error(error)
      }
    },
  },
})
