export async function successMessage($q, message) {
  $q.notify({
    color: 'green-4',
    textColor: 'white',
    icon: 'cloud_done',
    message: message,
  })
}
