import axios from 'axios'
import { loadSession } from './session'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
})

api.interceptors.request.use((config) => {
  const session = loadSession()

  if (session?.token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${session.token}`
  }

  return config
})

export default api
