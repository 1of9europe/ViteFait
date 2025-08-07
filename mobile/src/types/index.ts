// Types pour l'API
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'client' | 'assistant';
  status: 'active' | 'inactive' | 'suspended';
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  postalCode?: string;
  profilePicture?: string;
  bio?: string;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  stripeCustomerId?: string;
  stripeConnectAccountId?: string;
  fcmToken?: string;
  lastSeen?: string;
  createdAt: string;
  updatedAt: string;
}

// Type pour les statuts de mission
export type MissionStatus = 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';

export interface Mission {
  id: string;
  title: string;
  description: string;
  pickupLatitude: number;
  pickupLongitude: number;
  pickupAddress: string;
  dropLatitude?: number;
  dropLongitude?: number;
  dropAddress?: string;
  timeWindowStart: string;
  timeWindowEnd: string;
  priceEstimate: number;
  cashAdvance: number;
  finalPrice: number;
  status: MissionStatus;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  instructions?: string;
  requirements?: string;
  requiresCar: boolean;
  requiresTools: boolean;
  category?: string;
  metadata?: Record<string, any>;
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  commissionAmount: number;
  stripePaymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
  client: User;
  assistant?: User;
}

// Types pour la création et mise à jour de missions
export interface CreateMissionData {
  title: string;
  description: string;
  pickupLatitude: number;
  pickupLongitude: number;
  pickupAddress: string;
  dropLatitude?: number;
  dropLongitude?: number;
  dropAddress?: string;
  timeWindowStart: string;
  timeWindowEnd: string;
  priceEstimate: number;
  cashAdvance: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  instructions?: string;
  requirements?: string;
  requiresCar: boolean;
  requiresTools: boolean;
  category?: string;
}

export interface UpdateMissionData {
  title?: string;
  description?: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  pickupAddress?: string;
  dropLatitude?: number;
  dropLongitude?: number;
  dropAddress?: string;
  timeWindowStart?: string;
  timeWindowEnd?: string;
  priceEstimate?: number;
  cashAdvance?: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  instructions?: string;
  requirements?: string;
  requiresCar?: boolean;
  requiresTools?: boolean;
  category?: string;
}

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  isPublic: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  missionId: string;
  reviewerId: string;
  reviewedId: string;
  reviewer: User;
  reviewed: User;
  mission: Mission;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  type: 'escrow' | 'release' | 'refund' | 'cash_advance' | 'commission';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  stripePaymentIntentId?: string;
  stripeTransferId?: string;
  stripeRefundId?: string;
  description?: string;
  metadata?: Record<string, any>;
  failureReason?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt: string;
  missionId: string;
  payerId?: string;
  payeeId?: string;
  payer?: User;
  payee?: User;
  mission: Mission;
}

// Types pour l'authentification
export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

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
  role: 'client' | 'assistant';
}

// Types pour la navigation
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  MissionDetail: { missionId: string };
  CreateMission: undefined;
  Profile: { userId?: string };
  Chat: { missionId: string };
  Payment: { missionId: string };
  Review: { missionId: string };
};

export type MainTabParamList = {
  Home: undefined;
  Missions: undefined;
  Map: undefined;
  Notifications: undefined;
  Profile: undefined;
};

// Types pour les composants
export interface MissionCardProps {
  mission: Mission;
  onPress: () => void;
  showActions?: boolean;
}

export interface UserCardProps {
  user: User;
  onPress?: () => void;
  showRating?: boolean;
}

export interface ReviewCardProps {
  review: Review;
  showMissionInfo?: boolean;
}

// Types pour les services
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  details?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    limit: number;
    offset: number;
    total: number;
  };
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface ChatMessage {
  id: string;
  missionId: string;
  senderId: string;
  senderRole: string;
  message: string;
  type: 'text' | 'image' | 'location';
  timestamp: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  timestamp: string;
  isRead: boolean;
}

// Types pour le store Redux
export interface AppState {
  auth: AuthState;
  missions: MissionState;
  user: UserState;
  notifications: NotificationState;
  chat: ChatState;
}

export interface MissionState {
  missions: Mission[];
  currentMission: Mission | null;
  isLoading: boolean;
  error: string | null;
  filters: MissionFilters;
}

export interface MissionFilters {
  status?: string;
  radius?: number;
  location?: Location;
  category?: string;
}

export interface UserState {
  profile: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

export interface ChatState {
  messages: Record<string, ChatMessage[]>;
  isLoading: boolean;
  error: string | null;
} 