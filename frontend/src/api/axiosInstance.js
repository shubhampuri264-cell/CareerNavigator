import axios from 'axios'

const isProd = import.meta.env.PROD

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || (isProd ? '' : 'http://localhost:8000'),
  headers: { 'Content-Type': 'application/json' },
  timeout: 20000,  // AI recommendations can take a moment
})

export default api

