export async function errorMessage($q, message) {
  $q.notify({
    color: 'red-5',
    textColor: 'white',
    icon: 'error',
    message: message,
  })
}
