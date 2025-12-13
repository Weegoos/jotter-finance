import { defineStore } from 'pinia'
import { financeServerURL } from 'src/boot/config'
import { getMethod } from 'src/composables/api-method/get'

export const useMessageApiStore = defineStore('message-api', {
  state: () => ({
    message: [],
  }),
  actions: {
    async getAllMessages($q, conversationId) {
      try {
        this.message = await getMethod(financeServerURL, `message/${conversationId}`, $q)
        return this.message
      } catch (err) {
        console.error(err)
        throw err
      }
    },
  },
})
