const SESSION_KEY = 'morocco-scholar-tracker.session'

export function loadSession() {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.localStorage.getItem(SESSION_KEY)

  if (!raw) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch (error) {
    window.localStorage.removeItem(SESSION_KEY)
    return null
  }
}

export function saveSession(session) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(SESSION_KEY)
}
