// import axios from 'axios'

// const api = axios.create({ baseURL: '/api' })

// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token')
//   if (token) config.headers.Authorization = `Bearer ${token}`
//   return config
// })

// export const authApi = {
//   login: (email, password) =>
//     api.post('/auth/login', new URLSearchParams({ username: email, password })),
//   addUser: (email, password, role = 'viewer') =>
//     api.post('/auth/users', { email, password, role })
// }

// export const serverApi = {
//   list: () => api.get('/servers/'),
//   create: (name, url) => api.post('/servers/', { name, url }),
//   update: (id, data) => api.put(`/servers/${id}`, data),
//   delete: (id) => api.delete(`/servers/${id}`)
// }

// export const logApi = {
//   list: (params) => api.get('/logs/', { params }),
//   byServer: (serverId) => api.get(`/logs/server/${serverId}`)
// }

// export const reportApi = {
//   download: (period, format) =>
//     api.get('/reports/download', { params: { period, format }, responseType: 'blob' })
// }

// export default api
import axios from 'axios'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')

// Backend URL (FastAPI)
const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: Add token to requests that need auth
api.interceptors.request.use(
  (config) => {
    // Only skip token for login endpoint
    const isLogin = config.url?.includes('/auth/login')
    
    // For all other endpoints, add token if available
    if (!isLogin) {
      const token = localStorage.getItem('token')
      console.log('Request interceptor:', {
        url: config.url,
        method: config.method,
        hasToken: !!token,
        isLogin: isLogin
      })
      
      if (token) {
        // ALWAYS add token - backend will validate it
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
        console.log('Token attached to request:', config.method?.toUpperCase(), config.url)
        console.log('Authorization header set:', config.headers.Authorization?.substring(0, 30) + '...')
        console.log('Full headers:', JSON.stringify(config.headers, null, 2))
      } else {
        // No token but trying to access protected endpoint
        console.error('No token found in localStorage for protected request:', config.method?.toUpperCase(), config.url)
        console.error('Tip: Make sure you are logged in. Token should be in localStorage.')
        console.error('Current localStorage:', {
          token: localStorage.getItem('token'),
          user: localStorage.getItem('user')
        })
      }
    }
    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor: Handle 401 errors (token expired/invalid)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginPage = window.location.pathname === '/login'
      const isPublicGet = (error.config?.url?.includes('/servers/') && error.config?.method === 'get') ||
                          (error.config?.url?.includes('/logs/') && error.config?.method === 'get')
      
      // Check if it's a form submission (POST/PUT/DELETE to /servers/)
      const isFormSubmission = error.config?.url?.includes('/servers/') && 
                               ['post', 'put', 'delete'].includes(error.config?.method?.toLowerCase())
      
      const errorDetail = error.response?.data?.detail || 'Unauthorized'
      
      console.error('401 Unauthorized:', {
        url: error.config?.url,
        method: error.config?.method,
        detail: errorDetail,
        currentPath: window.location.pathname,
        isFormSubmission: isFormSubmission,
        hasToken: !!localStorage.getItem('token')
      })
      
      // IMPORTANT: For form submissions, NEVER redirect automatically
      // Let the component handle the error and show message to user
      if (isFormSubmission) {
        console.warn('Form submission got 401 - Component will handle error display')
        console.warn('NOT redirecting - letting form show error message')
        // Just reject - component will show error message
        return Promise.reject(error)
      }
      
      // Only redirect for non-form 401s on protected routes
      const isProtectedRoute = ['/dashboard', '/reports'].includes(window.location.pathname)
      if (!isLoginPage && !isPublicGet && isProtectedRoute && !isFormSubmission) {
        console.error('Will redirect to login in 3 seconds (not a form submission)')
        // Don't clear token immediately - let user see the error first
        setTimeout(() => {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }, 3000)
      }
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: (email, password) => {
    // OAuth2PasswordRequestForm expects form-urlencoded
    const params = new URLSearchParams()
    params.append('username', email)
    params.append('password', password)
    return api.post('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
  },
  addUser: (email, password, role = 'viewer') =>
    api.post('/auth/users', { email, password, role }),
}

// Server API
export const serverApi = {
  list: () => api.get('/servers/'),
  create: (name, url) => api.post('/servers/', { name, url }),
  update: (id, data) => api.put(`/servers/${id}`, data),
  delete: (id) => api.delete(`/servers/${id}`),
}

// Logs API
export const logApi = {
  list: (params) => api.get('/logs/', { params }),
  byServer: (serverId) => api.get(`/logs/server/${serverId}`),
}

// Reports API
export const reportApi = {
  download: (period, format) =>
    api.get('/reports/download', {
      params: { period, format },
      responseType: 'blob',
    }),
}

export default api
