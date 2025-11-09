import { defineStore } from 'pinia'
import { financeServerURL } from 'src/boot/config'
import { getMethod } from 'src/composables/api-method/get'

export const transactionApiStore = defineStore('transaction-api', {
  state: () => ({
    transaction: null,
  }),
  actions: {
    async getAllTransaction($q, limit, page) {
      try {
        this.transaction = await getMethod(
          financeServerURL,
          `transactions?limit=${limit}&page=${page}`,
          $q,
        )
      } catch (error) {
        console.error(error)
      }
    },
  },
})
