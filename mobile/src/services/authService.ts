import apiService from './api';
import { LoginCredentials, SignupData, AuthResponse, User } from '@/types';

export const authService = {
  // Connexion
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/login', credentials);
    apiService.setToken(response.token);
    return response;
  },

  // Inscription
  async signup(data: SignupData): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/signup', data);
    apiService.setToken(response.token);
    return response;
  },

  // Déconnexion
  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      // Ignorer les erreurs lors de la déconnexion
    } finally {
      await apiService.clearToken();
    }
  },

  // Rafraîchir le token
  async refreshToken(refreshToken: string): Promise<{ token: string }> {
    const response = await apiService.post<{ token: string }>('/auth/refresh', {
      refreshToken,
    });
    apiService.setToken(response.token);
    return response;
  },

  // Obtenir le profil utilisateur
  async getProfile(): Promise<User> {
    return await apiService.get<User>('/auth/profile');
  },

  // Mettre à jour le profil
  async updateProfile(profileData: Partial<User>): Promise<User> {
    return await apiService.put<User>('/auth/profile', profileData);
  },

  // Changer le mot de passe
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiService.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  },

  // Demander une réinitialisation de mot de passe
  async forgotPassword(email: string): Promise<void> {
    await apiService.post('/auth/forgot-password', { email });
  },

  // Réinitialiser le mot de passe
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiService.post('/auth/reset-password', {
      token,
      newPassword,
    });
  },
}; 