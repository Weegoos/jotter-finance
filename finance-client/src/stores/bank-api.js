import { defineStore } from 'pinia'
import { financeServerURL } from 'src/boot/config'
import { getMethod } from 'src/composables/api-method/get'

export const bankApiStore = defineStore('bank-api', {
  state: () => ({
    bank: null,
  }),
  actions: {
    async getAllBanks($q) {
      try {
        this.bank = await getMethod(financeServerURL, 'bank', $q)
      } catch (error) {
        console.error(error)
      }
    },
  },
})
