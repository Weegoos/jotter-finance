import { QSpinnerGears } from 'quasar'

export async function loadingMessage($q, message) {
  $q.notify({
    spinner: QSpinnerGears,
    message: message,
    messageColor: 'white',
    backgroundColor: 'black',
  })
}
