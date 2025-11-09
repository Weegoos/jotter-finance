import { defineStore } from 'pinia'
import { financeServerURL } from 'src/boot/config'
import { getMethod } from 'src/composables/api-method/get'

export const accountsApiStore = defineStore('account-api', {
  state: () => ({
    accounts: null,
    accountsByStatus: null,
  }),
  actions: {
    async getAllAccounts($q, limit, page) {
      try {
        this.accounts = await getMethod(
          financeServerURL,
          `accounts?limit=${limit}&page=${page}`,
          $q,
          'Информация об счетах получено',
        )
      } catch (error) {
        console.error(error)
      }
    },

    async getAccountsByStatus($q, active, limit, page) {
      try {
        this.accountsByStatus = await getMethod(
          financeServerURL,
          `accounts/${active}?limit=${limit}&page=${page}`,
          $q,
        )
      } catch (error) {
        console.error(error)
      }
    },
  },
})
