import { Cookies } from 'quasar'
import axios from 'axios'

export async function putMethod(serverURL, url, variableRefOrData, $q, params = {}) {
  try {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${Cookies.get('access_token')}`,
    }

    const config = {
      headers,
      params,
      withCredentials: true,
    }

    const response =
      variableRefOrData !== undefined
        ? await axios.put(`${serverURL}${url}`, variableRefOrData, config)
        : await axios.put(`${serverURL}${url}`, {}, config)

    console.log('Ответ сервера:', response.data)
  } catch (error) {
    console.error('Ошибка при обновлении события:', error)
    console.error('Детали ошибки:', error.response?.data)
  } finally {
    $q.loading.hide()
  }
}
