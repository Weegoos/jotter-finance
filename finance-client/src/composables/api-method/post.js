import axios from 'axios'
import { Cookies } from 'quasar'
import { successMessage } from '../notify/successMessage'
import { errorMessage } from '../notify/errorMessage'

export async function postMethod(serverURL, url, variableRef, $q, successMsg) {
  try {
    // const data = variableRef?.value ?? undefined;
    const response = await axios.post(`${serverURL}${url}`, variableRef, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${Cookies.get('access_token')}`,
      },
    })
    successMessage($q, successMsg)
    return response.data
  } catch (error) {
    if (error.response) {
      console.error('Ошибка:', error.response.data)
    } else {
      console.error('Ошибка:', error.message)
    }
    errorMessage($q, `Ошибка: ${error.response.data.message || error}`)
  } finally {
    $q.loading.hide()
  }
}
