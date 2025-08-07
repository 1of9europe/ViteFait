import axios, { AxiosError, AxiosResponse } from 'axios'
import { store } from '../store/store'
import { logout, loginSuccess } from '../store/slices/authSlice'

// Configuration de base d'Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 secondes
})

// Types d'erreurs
export interface ApiError {
  message: string
  code?: string
  status?: number
}

// Mapping des erreurs user-friendly
const getErrorMessage = (error: AxiosError): string => {
  if (!error.response) {
    return 'Erreur de connexion. Vérifiez votre connexion internet.'
  }

  const status = error.response.status
  const data = error.response.data as any

  switch (status) {
    case 400:
      return data?.message || 'Données invalides'
    case 401:
      return 'Session expirée. Veuillez vous reconnecter.'
    case 403:
      return 'Accès refusé. Vous n\'avez pas les permissions nécessaires.'
    case 404:
      return 'Ressource non trouvée'
    case 409:
      return data?.message || 'Conflit avec les données existantes'
    case 422:
      return data?.message || 'Données de validation invalides'
    case 500:
      return 'Erreur serveur. Veuillez réessayer plus tard.'
    case 502:
    case 503:
    case 504:
      return 'Service temporairement indisponible'
    default:
      return data?.message || 'Une erreur inattendue s\'est produite'
  }
}

// Fonction de refresh token
const refreshToken = async (): Promise<string | null> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) return null

    const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
      refreshToken
    })

    const { token, refreshToken: newRefreshToken } = response.data
    
    // Mettre à jour le store
    store.dispatch(loginSuccess({
      user: store.getState().auth.user!,
      token,
      refreshToken: newRefreshToken
    }))

    // Mettre à jour le localStorage
    localStorage.setItem('token', token)
    localStorage.setItem('refreshToken', newRefreshToken)

    return token
  } catch (error) {
    console.error('Erreur lors du refresh token:', error)
    return null
  }
}

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any

    // Si erreur 401 et pas déjà tenté de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const newToken = await refreshToken()
      if (newToken) {
        // Rejouer la requête avec le nouveau token
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } else {
        // Refresh échoué, déconnexion
        store.dispatch(logout())
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }

    // Log des erreurs en développement
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response?.data,
        message: getErrorMessage(error)
      })
    }

    return Promise.reject({
      ...error,
      userMessage: getErrorMessage(error)
    })
  }
)

// Types partagés (à synchroniser avec le backend et le mobile)
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'client' | 'admin' | 'concierge'
  phone?: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface Mission {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  category: string
  budget: number
  durationMin: number
  durationMax: number
  pickupAddress: string
  dropAddress?: string
  scheduledDate: string
  scheduledTime: string
  meetingRequired?: boolean
  meetingLocation?: string
  meetingDatetime?: string
  clientId: string
  conciergeId?: string
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string
  missionId: string
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  method: 'card' | 'bank_transfer' | 'paypal'
  stripePaymentIntentId?: string
  createdAt: string
  updatedAt: string
}

export interface ChatMessage {
  id: string
  missionId: string
  senderId: string
  content: string
  type: 'text' | 'image' | 'file'
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: string
}

// Service d'authentification
export const authService = {
  async login(email: string, password: string): Promise<{ user: User; token: string; refreshToken: string }> {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  async register(userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone?: string
  }): Promise<{ user: User; token: string; refreshToken: string }> {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  async getProfile(): Promise<User> {
    const response = await api.get('/auth/profile')
    return response.data
  },

  async updateProfile(profileData: Partial<User>): Promise<User> {
    const response = await api.put('/auth/profile', profileData)
    return response.data
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      // Ignorer les erreurs lors de la déconnexion
    }
  }
}

// Service des missions
export const missionsService = {
  async getMissions(params?: {
    status?: string
    category?: string
    search?: string
    page?: number
    limit?: number
    dateFrom?: string
    dateTo?: string
  }): Promise<{ missions: Mission[]; total: number; page: number; totalPages: number }> {
    const response = await api.get('/missions', { params })
    return response.data
  },

  async getMission(id: string): Promise<Mission> {
    const response = await api.get(`/missions/${id}`)
    return response.data
  },

  async createMission(missionData: Partial<Mission>): Promise<Mission> {
    const response = await api.post('/missions', missionData)
    return response.data
  },

  async updateMission(id: string, missionData: Partial<Mission>): Promise<Mission> {
    const response = await api.put(`/missions/${id}`, missionData)
    return response.data
  },

  async updateMissionStatus(id: string, status: Mission['status']): Promise<Mission> {
    const response = await api.patch(`/missions/${id}/status`, { status })
    return response.data
  },

  async acceptMission(id: string): Promise<Mission> {
    const response = await api.post(`/missions/${id}/accept`)
    return response.data
  },

  async cancelMission(id: string, reason?: string): Promise<Mission> {
    const response = await api.post(`/missions/${id}/cancel`, { reason })
    return response.data
  },

  async deleteMission(id: string): Promise<void> {
    await api.delete(`/missions/${id}`)
  }
}

// Service des paiements
export const paymentsService = {
  async getPayments(params?: {
    status?: string
    page?: number
    limit?: number
  }): Promise<{ payments: Payment[]; total: number; page: number; totalPages: number }> {
    const response = await api.get('/payments', { params })
    return response.data
  },

  async getPayment(id: string): Promise<Payment> {
    const response = await api.get(`/payments/${id}`)
    return response.data
  },

  async createPaymentIntent(missionId: string, amount: number): Promise<{ clientSecret: string; paymentIntentId: string }> {
    const response = await api.post('/payments/create-intent', { missionId, amount })
    return response.data
  },

  async confirmPayment(paymentIntentId: string): Promise<Payment> {
    const response = await api.post('/payments/confirm', { paymentIntentId })
    return response.data
  },

  async getPaymentHistory(): Promise<Payment[]> {
    const response = await api.get('/payments/history')
    return response.data
  }
}

// Service des utilisateurs
export const usersService = {
  async getUsers(params?: {
    role?: string
    search?: string
    page?: number
    limit?: number
  }): Promise<{ users: User[]; total: number; page: number; totalPages: number }> {
    const response = await api.get('/users', { params })
    return response.data
  },

  async getUser(id: string): Promise<User> {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const response = await api.put(`/users/${id}`, userData)
    return response.data
  }
}

// Service de messagerie
export const chatService = {
  async getChatMessages(missionId: string): Promise<ChatMessage[]> {
    const response = await api.get(`/chat/${missionId}/messages`)
    return response.data
  },

  async sendMessage(missionId: string, content: string, type: ChatMessage['type'] = 'text'): Promise<ChatMessage> {
    const response = await api.post(`/chat/${missionId}/messages`, { content, type })
    return response.data
  },

  async markAsRead(messageId: string): Promise<void> {
    await api.patch(`/chat/messages/${messageId}/read`)
  }
}

// Service des notifications
export const notificationsService = {
  async getNotifications(params?: {
    read?: boolean
    page?: number
    limit?: number
  }): Promise<{ notifications: Notification[]; total: number; page: number; totalPages: number }> {
    const response = await api.get('/notifications', { params })
    return response.data
  },

  async markAsRead(notificationId: string): Promise<void> {
    await api.patch(`/notifications/${notificationId}/read`)
  },

  async markAllAsRead(): Promise<void> {
    await api.patch('/notifications/read-all')
  },

  async deleteNotification(notificationId: string): Promise<void> {
    await api.delete(`/notifications/${notificationId}`)
  }
}

export default api 