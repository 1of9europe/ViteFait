import apiService from './api';
import { Mission, CreateMissionData, UpdateMissionData, MissionFilters, PaginatedResponse } from '@/types';

export const missionsService = {
  // Obtenir toutes les missions
  async getMissions(filters?: MissionFilters): Promise<PaginatedResponse<Mission>> {
    return await apiService.get<PaginatedResponse<Mission>>('/missions', filters);
  },

  // Obtenir une mission par ID
  async getMission(id: string): Promise<Mission> {
    return await apiService.get<Mission>(`/missions/${id}`);
  },

  // Créer une nouvelle mission
  async createMission(data: CreateMissionData): Promise<Mission> {
    return await apiService.post<Mission>('/missions', data);
  },

  // Mettre à jour une mission
  async updateMission(id: string, data: UpdateMissionData): Promise<Mission> {
    return await apiService.put<Mission>(`/missions/${id}`, data);
  },

  // Supprimer une mission
  async deleteMission(id: string): Promise<void> {
    await apiService.delete(`/missions/${id}`);
  },

  // Accepter une mission (pour les concierges)
  async acceptMission(id: string): Promise<Mission> {
    return await apiService.post<Mission>(`/missions/${id}/accept`);
  },

  // Commencer une mission
  async startMission(id: string): Promise<Mission> {
    return await apiService.post<Mission>(`/missions/${id}/start`);
  },

  // Terminer une mission
  async completeMission(id: string): Promise<Mission> {
    return await apiService.post<Mission>(`/missions/${id}/complete`);
  },

  // Annuler une mission
  async cancelMission(id: string, reason?: string): Promise<Mission> {
    return await apiService.post<Mission>(`/missions/${id}/cancel`, { reason });
  },

  // Obtenir les missions par statut
  async getMissionsByStatus(status: string): Promise<Mission[]> {
    return await apiService.get<Mission[]>(`/missions/status/${status}`);
  },

  // Obtenir les missions par catégorie
  async getMissionsByCategory(category: string): Promise<Mission[]> {
    return await apiService.get<Mission[]>(`/missions/category/${category}`);
  },

  // Rechercher des missions
  async searchMissions(query: string): Promise<Mission[]> {
    return await apiService.get<Mission[]>('/missions/search', { q: query });
  },

  // Obtenir les statistiques des missions
  async getMissionStats(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
  }> {
    return await apiService.get('/missions/stats');
  },
}; 