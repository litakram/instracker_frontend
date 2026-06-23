export function extractApiError(error, fallback = 'Something went wrong.') {
  return error?.response?.data?.message || fallback
}

export function formatDate(dateValue) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
  }).format(new Date(dateValue))
}

export function formatDateTime(dateValue) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(dateValue))
}

export function toDateInputValue(dateValue) {
  const date = new Date(dateValue)
  const year = date.getUTCFullYear()
  const month = `${date.getUTCMonth() + 1}`.padStart(2, '0')
  const day = `${date.getUTCDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function toDeadlineIso(dateInput) {
  return `${dateInput}T23:59:59.999Z`
}
