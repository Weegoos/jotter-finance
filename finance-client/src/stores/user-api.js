import { defineStore } from 'pinia'
import { getMethod } from 'src/composables/api-method/get'

export const useApiStore = defineStore('user-api', {
  state: () => ({
    userData: null,
    role: null,
  }),
  actions: {
    async getUserInfo(userServerURL, $q) {
      try {
        this.userData = await getMethod(
          userServerURL,
          'users/me',
          $q,
          'Информация о пользователе успешно получена',
        )
        console.log(this.userData)

        this.role = this.userData.role
      } catch (error) {
        console.error(error)
      }
    },
  },
})
