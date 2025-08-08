// Types d'API
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Types d'authentification
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'client' | 'admin' | 'concierge';
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Types de missions
export interface Mission {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  pickupAddress: string;
  dropAddress?: string;
  scheduledDate: string;
  scheduledTime: string;
  durationMin: number;
  durationMax: number;
  priority: 'normal' | 'urgent';
  price: number;
  clientId: string;
  conciergeId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMissionData {
  title: string;
  description: string;
  category: string;
  pickupAddress: string;
  dropAddress?: string;
  scheduledDate: string;
  scheduledTime: string;
  durationMin: number;
  durationMax: number;
  priority: 'normal' | 'urgent';
  meetingLocation?: string;
  meetingDatetime?: string;
}

export interface UpdateMissionData {
  title?: string;
  description?: string;
  category?: string;
  pickupAddress?: string;
  dropAddress?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  durationMin?: number;
  durationMax?: number;
  priority?: 'normal' | 'urgent';
}

export interface MissionFilters {
  status?: string;
  category?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

// Types de paiements
export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  method: 'card' | 'bank_transfer' | 'cash';
  missionId: string;
  clientId: string;
  createdAt: string;
  updatedAt: string;
}

// Types de chat
export interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  conversationId: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

// Types de notifications
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  userId: string;
  relatedId?: string;
  createdAt: string;
}

// Types de géolocalisation
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

// Types de navigation
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Login: undefined;
  Signup: undefined;
  Home: undefined;
  Missions: undefined;
  MissionDetails: { missionId: string };
  NewMission: undefined;
  Profile: undefined;
  Settings: undefined;
  Chat: { conversationId: string };
  Notifications: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Missions: undefined;
  Chat: undefined;
  Profile: undefined;
}; 