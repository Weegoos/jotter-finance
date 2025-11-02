import axios from 'axios'
import { Cookies } from 'quasar'
import { errorMessage } from '../notify/errorMessage'

export async function getMethod(serverURL, url, $q) {
  try {
    const response = await axios.get(`${serverURL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${Cookies.get('access_token')}`,
      },
      withCredentials: true,
    })

    return response.data
  } catch (error) {
    const status = error.response?.status
    const message = error.response?.data?.message || 'Неизвестная ошибка'
    // console.log(status)

    if (status === 401) {
      console.warn('Пользователь не авторизован.')
      Cookies.remove('access_token')
      return null
    } else {
      console.error('Ошибка:', message)
      errorMessage($q, `Ошибка: ${message}`)
    }
  } finally {
    $q.loading.hide()
  }
}
