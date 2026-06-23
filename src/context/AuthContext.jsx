import { createContext, startTransition, useContext, useEffect, useState } from 'react'
import api from '../lib/api'
import { clearSession, loadSession, saveSession } from '../lib/session'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const initialSession = loadSession()
  const [token, setToken] = useState(initialSession?.token || null)
  const [user, setUser] = useState(initialSession?.user || null)
  const [isLoading, setIsLoading] = useState(Boolean(initialSession?.token))

  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return undefined
    }

    let isActive = true

    async function restoreSession() {
      try {
        const response = await api.get('/auth/me')

        if (!isActive) {
          return
        }

        saveSession({ token, user: response.data.user })
        startTransition(() => {
          setUser(response.data.user)
        })
      } catch (error) {
        if (!isActive) {
          return
        }

        clearSession()
        startTransition(() => {
          setToken(null)
          setUser(null)
        })
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    restoreSession()

    return () => {
      isActive = false
    }
  }, [token])

  async function completeAuth(endpoint, credentials) {
    const response = await api.post(endpoint, credentials)
    const session = {
      token: response.data.token,
      user: response.data.user,
    }

    saveSession(session)
    startTransition(() => {
      setToken(session.token)
      setUser(session.user)
    })

    return session.user
  }

  async function login(credentials) {
    return completeAuth('/auth/login', credentials)
  }

  async function register(credentials) {
    return completeAuth('/auth/register', credentials)
  }

  function logout() {
    clearSession()
    startTransition(() => {
      setToken(null)
      setUser(null)
      setIsLoading(false)
    })
  }

  const value = {
    token,
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: Boolean(token && user),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.')
  }

  return context
}
