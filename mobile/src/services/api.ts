import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '@/config/environment';

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

  // Rafraîchir le token
  private async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (!refreshToken) {
        return false;
      }

      const response = await axios.post(`${config.API_BASE_URL}/auth/refresh`, {
        refreshToken,
      });

      const { token } = response.data;
      await AsyncStorage.setItem('auth_token', token);
      this.token = token;
      return true;
    } catch (error) {
      // Supprimer les tokens invalides
      await AsyncStorage.multiRemove(['auth_token', 'refresh_token']);
      this.token = null;
      return false;
    }
  }

  // Méthodes publiques pour les appels API
  public async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.api.get<T>(url, { params });
    return response.data;
  }

  public async post<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.post<T>(url, data);
    return response.data;
  }

  public async put<T>(url: string, data?: any): Promise<T> {
    const response = await this.api.put<T>(url, data);
    return response.data;
  }

  public async delete<T>(url: string): Promise<T> {
    const response = await this.api.delete<T>(url);
    return response.data;
  }

  // Définir le token manuellement
  public setToken(token: string): void {
    this.token = token;
    AsyncStorage.setItem('auth_token', token);
  }

  // Supprimer le token
  public async clearToken(): Promise<void> {
    this.token = null;
    await AsyncStorage.multiRemove(['auth_token', 'refresh_token']);
  }
}

// Instance singleton
export const apiService = new ApiService();
export default apiService; 