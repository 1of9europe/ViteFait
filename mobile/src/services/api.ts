import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '@/config/environment';
import {
  ApiResponse,
  PaginatedResponse,
  LoginCredentials,
  SignupData,
  User,
  Mission,
  Payment,
  ChatMessage,
  Notification,
  MissionFilters,
  CreateMissionData,
  UpdateMissionData
} from '@/types';

// Types d'erreur standardisés
export interface ApiError {
  status: number;
  message: string;
  details?: string[];
  code?: string;
}

// Classe ApiService
class ApiService {
  private api: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: config.API_BASE_URL,
      timeout: config.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  // Configuration des intercepteurs
  private setupInterceptors(): void {
    // Intercepteur pour ajouter le token d'authentification
    this.api.interceptors.request.use(
      async (config) => {
        if (!this.token) {
          this.token = await AsyncStorage.getItem('auth_token');
        }
        
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Intercepteur pour gérer les réponses et erreurs
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expiré, essayer de le rafraîchir
          const refreshed = await this.refreshToken();
          if (refreshed && error.config) {
            // Retenter la requête avec le nouveau token
            return this.api.request(error.config);
          }
        }
        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  // Gestion standardisée des erreurs
  private handleApiError(error: AxiosError): ApiError {
    if (error.response) {
      const { status, data } = error.response;
      const responseData = data as any;
      
      return {
        status,
        message: responseData?.message || responseData?.error || 'Erreur serveur',
        details: responseData?.details || [],
        code: responseData?.code,
      };
    } else if (error.request) {
      return {
        status: 0,
        message: 'Erreur de connexion réseau',
        details: ['Vérifiez votre connexion internet'],
      };
    } else {
      return {
        status: 0,
        message: error.message || 'Erreur inconnue',
        details: [],
      };
    }
  }

  // Méthodes d'authentification
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await this.api.post('/auth/login', credentials);
      const { user, token } = response.data;
      
      // Sauvegarder le token
      this.token = token;
      await AsyncStorage.setItem('auth_token', token);
      
      return { data: { user, token } };
    } catch (error) {
      throw this.handleApiError(error as AxiosError);
    }
  }

  async signup(userData: SignupData): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await this.api.post('/auth/signup', userData);
      const { user, token } = response.data;
      
      // Sauvegarder le token
      this.token = token;
      await AsyncStorage.setItem('auth_token', token);
      
      return { data: { user, token } };
    } catch (error) {
      throw this.handleApiError(error as AxiosError);
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (!refreshToken) return false;

      const response = await this.api.post('/auth/refresh', { refreshToken });
      const { token } = response.data;
      
      this.token = token;
      await AsyncStorage.setItem('auth_token', token);
      
      return true;
    } catch (error) {
      // Supprimer les tokens invalides
      await AsyncStorage.multiRemove(['auth_token', 'refresh_token']);
      this.token = null;
      return false;
    }
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
      // Continuer même si la requête échoue
      // eslint-disable-next-line no-console
      console.warn('Erreur lors de la déconnexion:', error);
    } finally {
      // Supprimer les tokens locaux
      await AsyncStorage.multiRemove(['auth_token', 'refresh_token']);
      this.token = null;
    }
  }

  // Méthodes pour les missions
  async getMissions(filters?: MissionFilters): Promise<PaginatedResponse<Mission>> {
    try {
      const params: string[] = [];
      if (filters?.status) params.push(`status=${filters.status}`);
      if (filters?.radius) params.push(`radius=${filters.radius}`);
      if (filters?.category) params.push(`category=${filters.category}`);
      if (filters?.location) {
        params.push(`latitude=${filters.location.latitude}`);
        params.push(`longitude=${filters.location.longitude}`);
      }

      const queryString = params.length > 0 ? `?${params.join('&')}` : '';
      const response = await this.api.get(`/missions${queryString}`);
      return response.data;
    } catch (error) {
      throw this.handleApiError(error as AxiosError);
    }
  }

  async getMission(id: string): Promise<ApiResponse<Mission>> {
    try {
      const response = await this.api.get(`/missions/${id}`);
      return { data: response.data };
    } catch (error) {
      throw this.handleApiError(error as AxiosError);
    }
  }

  async createMission(missionData: CreateMissionData): Promise<ApiResponse<Mission>> {
    try {
      const response = await this.api.post('/missions', missionData);
      return { data: response.data };
    } catch (error) {
      throw this.handleApiError(error as AxiosError);
    }
  }

  async acceptMission(id: string): Promise<ApiResponse<Mission>> {
    try {
      const response = await this.api.patch(`/missions/${id}/accept`);
      return { data: response.data };
    } catch (error) {
      throw this.handleApiError(error as AxiosError);
    }
  }

  async updateMissionStatus(id: string, status: Mission['status'], reason?: string): Promise<ApiResponse<Mission>> {
    try {
      const response = await this.api.patch(`/missions/${id}/status`, { status, reason });
      return { data: response.data };
    } catch (error) {
      throw this.handleApiError(error as AxiosError);
    }
  }

  async updateMission(id: string, updates: UpdateMissionData): Promise<ApiResponse<Mission>> {
    try {
      const response = await this.api.patch(`/missions/${id}`, updates);
      return { data: response.data };
    } catch (error) {
      throw this.handleApiError(error as AxiosError);
    }
  }

  async cancelMission(id: string, reason: string): Promise<ApiResponse<Mission>> {
    try {
      const response = await this.api.patch(`/missions/${id}/cancel`, { reason });
      return { data: response.data };
    } catch (error) {
      throw this.handleApiError(error as AxiosError);
    }
  }

  // Méthodes pour les paiements
  async createPaymentIntent(missionId: string, amount: number): Promise<ApiResponse<Payment>> {
    try {
      const response = await this.api.post('/payments/create-intent', {
        missionId,
        amount,
      });
      return { data: response.data };
    } catch (error) {
      throw this.handleApiError(error as AxiosError);
    }
  }

  async confirmPayment(paymentIntentId: string): Promise<ApiResponse<Payment>> {
    try {
      const response = await this.api.post('/payments/confirm', {
        paymentIntentId,
      });
      return { data: response.data };
    } catch (error) {
      throw this.handleApiError(error as AxiosError);
    }
  }

  async getPaymentHistory(): Promise<PaginatedResponse<Payment>> {
    try {
      const response = await this.api.get('/payments/history');
      return response.data;
    } catch (error) {
      throw this.handleApiError(error as AxiosError);
    }
  }

  // Méthodes pour les utilisateurs
  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await this.api.get('/auth/me');
      return { data: response.data };
    } catch (error) {
      throw this.handleApiError(error as AxiosError);
    }
  }

  async updateProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await this.api.patch('/auth/profile', updates);
      return { data: response.data };
    } catch (error) {
      throw this.handleApiError(error as AxiosError);
    }
  }

  async getUser(id: string): Promise<ApiResponse<User>> {
    try {
      const response = await this.api.get(`/users/${id}`);
      return { data: response.data };
    } catch (error) {
      throw this.handleApiError(error as AxiosError);
    }
  }

  // Méthodes pour les notifications
  async getNotifications(): Promise<PaginatedResponse<Notification>> {
    try {
      const response = await this.api.get('/notifications');
      return response.data;
    } catch (error) {
      throw this.handleApiError(error as AxiosError);
    }
  }

  async markNotificationAsRead(id: string): Promise<void> {
    try {
      await this.api.patch(`/notifications/${id}/read`);
    } catch (error) {
      throw this.handleApiError(error as AxiosError);
    }
  }

  // Méthodes pour le chat
  async getChatMessages(missionId: string): Promise<ApiResponse<ChatMessage[]>> {
    try {
      const response = await this.api.get(`/missions/${missionId}/messages`);
      return { data: response.data };
    } catch (error) {
      throw this.handleApiError(error as AxiosError);
    }
  }

  async sendMessage(missionId: string, message: string): Promise<ApiResponse<ChatMessage>> {
    try {
      const response = await this.api.post(`/missions/${missionId}/messages`, {
        message,
      });
      return { data: response.data };
    } catch (error) {
      throw this.handleApiError(error as AxiosError);
    }
  }

  // Méthodes utilitaires
  setToken(token: string): void {
    this.token = token;
  }

  clearToken(): void {
    this.token = null;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

// Instance singleton
const apiService = new ApiService();

export default apiService; 