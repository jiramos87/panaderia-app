import axios from 'axios'

// Determinar la URL base del API dinámicamente
const getApiBaseUrl = () => {
  // En desarrollo local, usar localhost
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3001/api'
  }
  
  // En producción, usar la variable de entorno si existe
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL
  }
  
  // Fallback para desarrollo con Docker Compose
  return '/api'
}

const API_BASE_URL = getApiBaseUrl()

console.log('API Base URL:', API_BASE_URL)

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export const productService = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`)
}

export const orderService = {
  create: (orderData) => api.post('/orders', orderData),
  getById: (id) => api.get(`/orders/${id}`)
}

export default api
